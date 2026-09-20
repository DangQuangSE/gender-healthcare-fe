import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const bookingDir = path.resolve(here, "../src/pages/UserProfile/Booking");

test("booking page delegates appointment card and detail modal views", () => {
  for (const fileName of [
    "Booking.constants.js",
    "BookingAppointmentCard.jsx",
    "BookingDetailModal.jsx",
  ]) {
    assert.equal(fs.existsSync(path.join(bookingDir, fileName)), true, fileName);
  }

  const source = fs.readFileSync(path.join(bookingDir, "Booking.jsx"), "utf8");
  assert.equal(source.includes("<BookingAppointmentCard"), true);
  assert.equal(source.includes("<BookingDetailModal"), true);
  assert.equal(source.includes("localStorage"), false);
});
