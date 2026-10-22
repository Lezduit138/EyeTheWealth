/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentConfig } from "@/lib/payments/razorpay";
import { z } from "zod";

const RefundSchema = z.object({
  reason: z.string().min(5),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized: ADMIN role required to issue refunds" }, { status: 403 });
  }

  const { id } = await context.params;
  const donation = await prisma.donation.findUnique({
    where: { id },
    include: { ngo: true },
  });

  if (!donation) {
    return NextResponse.json({ error: "Donation not found" }, { status: 404 });
  }

  if (donation.status !== "PAID") {
    return NextResponse.json({ error: `Cannot refund donation with status '${donation.status}'. Only PAID donations can be refunded.` }, { status: 400 });
  }

  const body = await req.json();
  const parsed = RefundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A detailed refund reason is required (minimum 5 characters)." }, { status: 400 });
  }

  const { reason } = parsed.data;
  const config = getPaymentConfig();

  let razorpayRefundId = `rfn_test_${Date.now()}`;

  // If live keys exist, call Razorpay refund API
  if (config.keyId && config.keySecret && donation.razorpayPaymentId) {
    try {
      const authHeader = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
      const rzRes = await fetch(`https://api.razorpay.com/v1/payments/${donation.razorpayPaymentId}/refund`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: donation.amountPaise,
          notes: {
            reason,
            refundedBy: (session.user as any).email || (session.user as any).id,
          },
        }),
      });

      if (!rzRes.ok) {
        const errData = await rzRes.json();
        return NextResponse.json({ error: "Razorpay refund API call failed", details: errData }, { status: 502 });
      }

      const rzRefund = await rzRes.json();
      razorpayRefundId = rzRefund.id;
    } catch (err: any) {
      return NextResponse.json({ error: `Gateway error: ${err.message}` }, { status: 500 });
    }
  }

  // Update donation record
  const updated = await prisma.donation.update({
    where: { id: donation.id },
    data: {
      status: "REFUNDED",
      refundedAt: new Date(),
      refundedBy: (session.user as any).id,
      refundReason: reason,
      razorpayRefundId,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "REFUND",
      entityType: "Donation",
      entityId: donation.id,
      before: JSON.stringify({ status: donation.status, amountPaise: donation.amountPaise }),
      after: JSON.stringify({ status: updated.status, refundReason: reason, razorpayRefundId }),
      changes: `Refunded donation of ₹${donation.amountPaise / 100} for ${donation.ngo.name}. Reason: ${reason}`,
    },
  });

  return NextResponse.json({
    success: true,
    donationId: updated.id,
    status: "REFUNDED",
    razorpayRefundId,
  });
}
