import test from "node:test";
import assert from "node:assert/strict";

import { getCorrelatedAppointmentId } from "../src/features/payments/appointmentCorrelation.js";

test("prefers the appointment ID returned by the backend payment status", () => {
  assert.equal(
    getCorrelatedAppointmentId(
      { appointmentId: 42, orderCode: 9001 },
      { appointmentId: 7, orderCode: 9001 },
      9001,
    ),
    42,
  );
});

test("uses the pending booking only when its order code matches", () => {
  assert.equal(
    getCorrelatedAppointmentId(
      { paymentStatus: "SUCCESS", orderCode: 9001 },
      { appointmentId: 7, orderCode: 9001 },
      9001,
    ),
    7,
  );
});

test("rejects a payment status that cannot be correlated to the current order", () => {
  assert.equal(
    getCorrelatedAppointmentId(
      { paymentStatus: "SUCCESS", orderCode: 9001 },
      { appointmentId: 7, orderCode: 9002 },
      9001,
    ),
    null,
  );
});
