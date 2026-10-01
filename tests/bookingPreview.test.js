import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBookingPreview,
  resolveConsultantSnapshot,
} from "../src/features/Services/Booking/bookingPreview.js";

test("builds a route-safe booking preview with the selected consultant snapshot", () => {
  const preview = buildBookingPreview({
    serviceId: "12",
    serviceName: "Tư vấn khẳng định giới",
    serviceType: "CONSULTING_ON",
    price: 450000,
    duration: 90,
    preferredDate: "2026-10-02",
    slot: "09:00",
    slotId: 99,
    note: "Cần tư vấn riêng tư",
    consultant: {
      id: 7,
      fullname: "Nguyễn Minh An",
      specialization: "Tư vấn giới",
    },
  });

  assert.deepEqual(preview.consultant, {
    id: 7,
    name: "Nguyễn Minh An",
    specialization: "Tư vấn giới",
  });
  assert.equal(preview.consultantId, 7);
  assert.equal(preview.serviceId, "12");
});

test("resolves a consultant from the route snapshot before storage fallback", () => {
  assert.deepEqual(
    resolveConsultantSnapshot(
      { id: 7, name: "Nguyễn Minh An", specialization: "Tư vấn giới" },
      { id: 8, name: "Bác sĩ cũ", specialization: "Khác" },
    ),
    { id: 7, name: "Nguyễn Minh An", specialization: "Tư vấn giới" },
  );
});
