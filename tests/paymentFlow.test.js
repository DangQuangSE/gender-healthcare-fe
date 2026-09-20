import test from "node:test";
import assert from "node:assert/strict";

import {
  PAYMENT_INTENTS,
  getPaymentIntent,
  isTerminalPaymentStatus,
  parsePayOSReturn,
} from "../src/features/payments/paymentFlow.js";
import { refreshPayOSStatus } from "../src/features/payments/paymentStatus.js";

test("maps the direct booking flow to the PayOS deposit intent", () => {
  assert.equal(getPaymentIntent({ paymentMethod: "direct" }), PAYMENT_INTENTS.DEPOSIT);
  assert.equal(getPaymentIntent({ paymentMethod: "payos" }), PAYMENT_INTENTS.FULL);
});

test("parses a PayOS success redirect as pending backend confirmation", () => {
  assert.deepEqual(
    parsePayOSReturn("?code=00&id=link-123&status=PAID&orderCode=123"),
    { kind: "pending_confirmation", orderCode: 123, paymentLinkId: "link-123" },
  );
});

test("parses pending, processing and cancelled redirects without claiming success", () => {
  assert.equal(parsePayOSReturn("?status=PENDING&orderCode=123").kind, "pending");
  assert.equal(parsePayOSReturn("?status=PROCESSING&orderCode=123").kind, "pending");
  assert.equal(parsePayOSReturn("?cancel=true&orderCode=123").kind, "cancelled");
  assert.equal(parsePayOSReturn("?status=CANCELLED&orderCode=123").kind, "cancelled");
});

test("rejects incomplete or untrusted success redirects", () => {
  assert.equal(parsePayOSReturn("?status=PAID").kind, "invalid");
  assert.equal(parsePayOSReturn("?code=00&orderCode=123").kind, "invalid");
  assert.equal(parsePayOSReturn("").kind, "none");
});

test("only backend terminal statuses can clear pending payment state", () => {
  assert.equal(isTerminalPaymentStatus("SUCCESS"), true);
  assert.equal(isTerminalPaymentStatus("FAILED"), true);
  assert.equal(isTerminalPaymentStatus("PENDING"), false);
  assert.equal(isTerminalPaymentStatus("PAID"), false);
});

test("status refresh is bounded and returns the latest pending state", async () => {
  let attempts = 0;
  const latest = await refreshPayOSStatus(
    async () => {
      attempts += 1;
      return { paymentStatus: "PENDING" };
    },
    123,
    { maxAttempts: 3, delayMs: 0, wait: async () => {} },
  );

  assert.equal(attempts, 3);
  assert.deepEqual(latest, { paymentStatus: "PENDING" });
});
