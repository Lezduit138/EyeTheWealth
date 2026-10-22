/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentConfig } from "@/lib/payments/razorpay";
import { z } from "zod";

const DonationCreateSchema = z.object({
  ngoId: z.string().min(1),
  amountInr: z.number().int().positive(),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional(),
  isAnonymous: z.boolean().default(false),
  idempotencyKey: z.string().optional(),
  termsAccepted: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DonationCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid donation request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { ngoId, amountInr, donorName, donorEmail, isAnonymous, idempotencyKey } =
      parsed.data;
    const config = getPaymentConfig();

    if (amountInr < config.minAmountInr || amountInr > config.maxAmountInr) {
      return NextResponse.json(
        {
          error: `Amount must be between ₹${config.minAmountInr} and ₹${config.maxAmountInr}`,
        },
        { status: 400 }
      );
    }

    const ngo = await prisma.ngo.findUnique({ where: { id: ngoId } });
    if (!ngo) {
      return NextResponse.json({ error: "NGO not found" }, { status: 404 });
    }

    // Gate: in live mode, NGO must be Verified and paymentEnabled with consent
    const isTestMode = config.mode === "test";
    if (!isTestMode) {
      if (
        !ngo.paymentEnabled ||
        ngo.verificationStatus !== "Verified" ||
        !ngo.consentDocumentUrl
      ) {
        return NextResponse.json(
          {
            error:
              "This NGO has not enabled platform collections or is awaiting formal verification and consent documentation.",
          },
          { status: 403 }
        );
      }
    }

    const amountPaise = amountInr * 100;
    const effectiveIdempotencyKey =
      idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Check if idempotent donation already exists
    const existing = await prisma.donation.findUnique({
      where: { idempotencyKey: effectiveIdempotencyKey },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        donationId: existing.id,
        orderId: existing.razorpayOrderId,
        amountPaise: existing.amountPaise,
        currency: existing.currency,
        keyId: config.keyId,
        isTestMode: existing.isTestMode,
      });
    }

    // Create Razorpay Order
    let razorpayOrderId: string;
    if (config.keyId && config.keySecret) {
      const authHeader = Buffer.from(
        `${config.keyId}:${config.keySecret}`
      ).toString("base64");
      const rzRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now().toString().substring(4)}`,
          notes: {
            ngoId: ngo.id,
            ngoName: ngo.name,
            isAnonymous: isAnonymous ? "true" : "false",
          },
        }),
      });

      if (!rzRes.ok) {
        const errData = await rzRes.json();
        return NextResponse.json(
          { error: "Payment gateway error creating order", details: errData },
          { status: 502 }
        );
      }

      const rzOrder = await rzRes.json();
      razorpayOrderId = rzOrder.id;
    } else {
      // Dev/mock order id if keys not yet configured in local test mode
      razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    const currentYear = new Date().getFullYear();
    const nextYearSuffix = String(currentYear + 1).slice(-2);
    const financialYear = `${currentYear}-${nextYearSuffix}`;

    const donation = await prisma.donation.create({
      data: {
        ngoId: ngo.id,
        amountPaise,
        currency: "INR",
        donorName: isAnonymous ? null : donorName || null,
        donorEmail: isAnonymous ? null : donorEmail || null,
        isAnonymous,
        isTestMode,
        razorpayOrderId,
        idempotencyKey: effectiveIdempotencyKey,
        financialYear,
        status: "CREATED",
      },
    });

    return NextResponse.json({
      success: true,
      donationId: donation.id,
      orderId: razorpayOrderId,
      amountPaise,
      currency: "INR",
      keyId: config.keyId,
      isTestMode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
