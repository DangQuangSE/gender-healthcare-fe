import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const bookingSource = fs.readFileSync(
  path.resolve(here, "../src/pages/UserProfile/Booking/Booking.jsx"),
  "utf8",
);
const paymentReturnSource = fs.readFileSync(
  path.resolve(here, "../src/features/payments/paymentReturn.js"),
  "utf8",
);
const correlationSource = fs.readFileSync(
  path.resolve(here, "../src/features/payments/appointmentCorrelation.js"),
  "utf8",
);

test("payment return uses explicit appointment correlation instead of list order", () => {
  assert.match(bookingSource, /processSuccessfulPaymentReturn/);
  assert.match(correlationSource, /getCorrelatedAppointmentId/);
  assert.doesNotMatch(bookingSource, /response\.data\?\.\[response\.data\.length - 1\]/);
});

test("payment return does not create a meeting without a correlated appointment", () => {
  assert.match(bookingSource, /processSuccessfulPaymentReturn/);
  assert.match(paymentReturnSource, /if \(!appointmentId\)/);
  assert.match(paymentReturnSource, /createOnlineMeeting\(appointmentId\)/);
});
