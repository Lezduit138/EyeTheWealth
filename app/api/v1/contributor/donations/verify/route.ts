/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentConfig, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { z } from "zod";

const VerifySchema = z.object({
  donationId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment verification payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { donationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      parsed.data;
    const config = getPaymentConfig();

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { ngo: true },
    });

    if (!donation) {
      return NextResponse.json({ error: "Donation record not found" }, { status: 404 });
    }

    if (donation.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        receiptUrl: donation.receiptUrl,
      });
    }

    // Verify signature
    let signatureValid = false;
    if (config.keySecret) {
      signatureValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        config.keySecret
      );
    } else if (config.mode === "test" && razorpayOrderId.startsWith("order_test_")) {
      // Mock test payment in dev mode
      signatureValid = true;
    }

    if (!signatureValid) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: "FAILED",
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      return NextResponse.json(
        { error: "Payment verification failed: Invalid HMAC signature" },
        { status: 400 }
      );
    }

    const receiptUrl = `/contributor/donations/${donation.id}/receipt`;

    const updated = await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: "PAID",
        razorpayPaymentId,
        razorpaySignature,
        receiptUrl,
      },
    });

    return NextResponse.json({
      success: true,
      donationId: updated.id,
      status: "PAID",
      receiptUrl,
      ngoName: donation.ngo.name,
      amountInr: updated.amountPaise / 100,
      isTestMode: updated.isTestMode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
