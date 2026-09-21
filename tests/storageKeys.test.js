import test from "node:test";
import assert from "node:assert/strict";

import { STORAGE_KEYS } from "../src/shared/constants/storageKeys.js";

test("storage keys keep the pending-booking migration pair distinct", () => {
  assert.equal(STORAGE_KEYS.PENDING_BOOKING, "pendingBooking");
  assert.equal(STORAGE_KEYS.LEGACY_PENDING_BOOKING, "pendingbooking");
  assert.notEqual(
    STORAGE_KEYS.PENDING_BOOKING,
    STORAGE_KEYS.LEGACY_PENDING_BOOKING,
  );
});
