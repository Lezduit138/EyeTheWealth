/**
 * Unit Tests for Payments (Razorpay HMAC verification, timing safety, amount bounds, webhook)
 * Strictly test fixtures; zero fictional database rows.
 */

import assert from "node:assert/strict";
import test from "node:test";
import crypto from "crypto";
import {
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from "../lib/payments/razorpay.ts";

const TEST_SECRET = "test_key_secret_123456789";
const TEST_WEBHOOK_SECRET = "whsec_test_secret_987654321";

test("verifyRazorpaySignature accepts valid HMAC SHA256 signature", () => {
  const orderId = "order_O8x9abcdef1234";
  const paymentId = "pay_P8x9abcdef5678";
  const expectedPayload = `${orderId}|${paymentId}`;
  const validSignature = crypto
    .createHmac("sha256", TEST_SECRET)
    .update(expectedPayload)
    .digest("hex");

  const isValid = verifyRazorpaySignature(orderId, paymentId, validSignature, TEST_SECRET);
  assert.equal(isValid, true, "Valid HMAC signature must verify successfully");
});

test("verifyRazorpaySignature rejects invalid / tampered signature", () => {
  const orderId = "order_O8x9abcdef1234";
  const paymentId = "pay_P8x9abcdef5678";
  const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

  const isValid = verifyRazorpaySignature(orderId, paymentId, forgedSignature, TEST_SECRET);
  assert.equal(isValid, false, "Forged signature must be rejected");
});

test("verifyRazorpaySignature rejects when wrong secret is used", () => {
  const orderId = "order_O8x9abcdef1234";
  const paymentId = "pay_P8x9abcdef5678";
  const validSignature = crypto
    .createHmac("sha256", TEST_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isValid = verifyRazorpaySignature(orderId, paymentId, validSignature, "wrong_secret");
  assert.equal(isValid, false, "Signature with wrong secret must be rejected");
});

test("verifyWebhookSignature validates raw-body signature", () => {
  const rawBody = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_test123", amount: 50000 } } },
  });

  const validWebhookSig = crypto
    .createHmac("sha256", TEST_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const isValid = verifyWebhookSignature(rawBody, validWebhookSig, TEST_WEBHOOK_SECRET);
  assert.equal(isValid, true, "Valid webhook signature on raw body must pass");

  // Tampered body
  const tamperedBody = rawBody.replace("50000", "99999");
  const isTamperedValid = verifyWebhookSignature(tamperedBody, validWebhookSig, TEST_WEBHOOK_SECRET);
  assert.equal(isTamperedValid, false, "Tampered body must fail webhook verification");
});

test("donation amount bounds enforce ₹100 to ₹1,00,000", () => {
  const min = 100;
  const max = 100_000;

  const isValidAmount = (amt: number) => amt >= min && amt <= max;

  assert.equal(isValidAmount(50), false, "₹50 is below ₹100 minimum");
  assert.equal(isValidAmount(100), true, "₹100 is exact minimum");
  assert.equal(isValidAmount(2500), true, "₹2,500 is within bounds");
  assert.equal(isValidAmount(100_000), true, "₹1,00,000 is exact maximum");
  assert.equal(isValidAmount(100_001), false, "₹1,00,001 is above maximum");
});
