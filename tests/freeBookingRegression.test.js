import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const confirmationSource = fs.readFileSync(
  new URL("../src/features/Services/Booking/BookingConfirmation.jsx", import.meta.url),
  "utf8",
);

test("free booking bypasses PayOS and routes to the booking list", () => {
  assert.match(confirmationSource, /isFreeBooking/);
  assert.match(confirmationSource, /if \(isFreeBooking\(booking\)\)/);
  assert.match(confirmationSource, /navigate\("\/user\/booking"\)/);
  assert.match(confirmationSource, /FREE_LABEL/);
});
