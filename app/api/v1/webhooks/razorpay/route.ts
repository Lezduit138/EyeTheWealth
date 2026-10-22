/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentConfig, verifyWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const eventId = req.headers.get("x-razorpay-event-id");

    const config = getPaymentConfig();

    // Idempotency check by x-razorpay-event-id
    if (eventId) {
      const existingEvent = await prisma.webhookLog.findUnique({
        where: { razorpayEventId: eventId },
      });
      if (existingEvent && existingEvent.processed) {
        return NextResponse.json({ received: true, idempotent: true });
      }
    }

    // Verify webhook signature
    let signatureValid = false;
    if (config.webhookSecret && signature) {
      signatureValid = verifyWebhookSignature(rawBody, signature, config.webhookSecret);
    } else if (config.mode === "test") {
      // Allow test mode simulation if secret is not set
      signatureValid = true;
    }

    if (!signatureValid) {
      await prisma.webhookLog.create({
        data: {
          razorpayEventId: eventId,
          eventType: "unknown",
          rawBody: rawBody.slice(0, 10000),
          signatureValid: false,
          processed: false,
          processingError: "Invalid webhook signature",
        },
      });

      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const refundEntity = payload.payload?.refund?.entity;
    const orderId = paymentEntity?.order_id || refundEntity?.payment_id;

    let donationId: string | null = null;
    let donation = null;

    if (orderId) {
      donation = await prisma.donation.findFirst({
        where: {
          OR: [{ razorpayOrderId: orderId }, { razorpayPaymentId: orderId }],
        },
      });
      if (donation) {
        donationId = donation.id;
      }
    }

    // Log the webhook
    const log = await prisma.webhookLog.create({
      data: {
        razorpayEventId: eventId,
        eventType,
        donationId,
        rawBody: rawBody.slice(0, 10000),
        signatureValid: true,
        processed: false,
      },
    });

    // Process event
    if (donation) {
      if (eventType === "payment.captured") {
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: "PAID",
            razorpayPaymentId: paymentEntity?.id || donation.razorpayPaymentId,
            receiptUrl: `/contributor/donations/${donation.id}/receipt`,
          },
        });
      } else if (eventType === "payment.failed") {
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: "FAILED",
            razorpayPaymentId: paymentEntity?.id || donation.razorpayPaymentId,
          },
        });
      } else if (eventType === "refund.processed") {
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            status: "REFUNDED",
            refundedAt: new Date(),
            razorpayRefundId: refundEntity?.id || null,
          },
        });
      }

      await prisma.webhookLog.update({
        where: { id: log.id },
        data: { processed: true },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed" },
      { status: 500 }
    );
  }
}
