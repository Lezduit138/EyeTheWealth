import crypto from "crypto";

export interface PaymentConfig {
  mode: "test" | "live";
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  minAmountInr: number;
  maxAmountInr: number;
}

export function getPaymentConfig(): PaymentConfig {
  const mode = (process.env.PAYMENTS_MODE || "test").toLowerCase() === "live" ? "live" : "test";
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const minAmountInr = parseInt(process.env.DONATION_MIN_INR || "100", 10);
  const maxAmountInr = parseInt(process.env.DONATION_MAX_INR || "100000", 10);

  if (mode === "live") {
    const liveConfirmed = process.env.LIVE_PAYMENTS_CONFIRMED === "true";
    if (!keyId || !keySecret || !webhookSecret || !liveConfirmed) {
      throw new Error(
        "LIVE payment mode refused: Missing RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, or LIVE_PAYMENTS_CONFIRMED=true checklist confirmation."
      );
    }
  }

  return {
    mode,
    keyId,
    keySecret,
    webhookSecret,
    minAmountInr,
    maxAmountInr,
  };
}

/**
 * Verify Razorpay payment signature using timing-safe comparison
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

/**
 * Verify Razorpay webhook signature on RAW body
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}
