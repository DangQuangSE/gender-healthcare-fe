import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(here, "../src");

test("booking form navigates a complete consultant snapshot instead of relying on unmount storage", () => {
  const bookingForm = fs.readFileSync(
    path.join(sourceRoot, "features/Services/Booking/BookingForm.jsx"),
    "utf8",
  );

  assert.match(bookingForm, /buildBookingPreview/);
  assert.match(bookingForm, /consultant:/);
  assert.doesNotMatch(
    bookingForm,
    /return\s*\(\)\s*=>\s*\{[\s\S]*remove\(STORAGE_KEYS\.SELECTED_CONSULTANT_NAME\)/,
  );
});

test("confirmation page reads consultant metadata from booking state first", () => {
  const confirmation = fs.readFileSync(
    path.join(sourceRoot, "features/Services/Booking/BookingConfirmation.jsx"),
    "utf8",
  );

  assert.match(confirmation, /resolveConsultantSnapshot/);
  assert.match(confirmation, /booking\?\.consultant/);
});
