import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(here, "../src");
const LEGACY_PROVIDER_NAME = ["vn", "pay"].join("");
const LEGACY_QUERY_PREFIX = ["vn", "p_"].join("");

const read = (relativePath) => fs.readFileSync(path.join(sourceRoot, relativePath), "utf8");

test("payment API exposes PayOS creation and owner-scoped status functions", () => {
  const source = read("features/payments/paymentApi.js");

  assert.match(source, /\/v1\/payments\/payos/);
  assert.match(source, /createPayOSFullPayment/);
  assert.match(source, /createPayOSDepositPayment/);
  assert.match(source, /getPayOSPaymentStatus/);
  assert.doesNotMatch(source, new RegExp(LEGACY_PROVIDER_NAME, "i"));
});

test("payment and booking pages do not contain legacy provider flow references", () => {
  for (const relativePath of [
    "features/Services/Payment/Payment.jsx",
    "pages/UserProfile/Booking/Booking.jsx",
    "features/Services/Booking/BookingConfirmation.jsx",
  ]) {
    assert.doesNotMatch(read(relativePath), new RegExp(`${LEGACY_PROVIDER_NAME}|${LEGACY_QUERY_PREFIX}`, "i"), relativePath);
  }
});

test("payment constants and status refresh helper are adjacent to the payment feature", () => {
  assert.equal(fs.existsSync(path.join(sourceRoot, "features/Services/Payment/Payment.constants.js")), true);
  assert.equal(fs.existsSync(path.join(sourceRoot, "features/payments/paymentFlow.js")), true);
  assert.equal(fs.existsSync(path.join(sourceRoot, "features/payments/paymentStatus.js")), true);
});
