import test from "node:test";
import assert from "node:assert/strict";

import { normalizeApiResponse } from "../src/shared/api/response.js";
import { getApiErrorDetails } from "../src/shared/api/errors.js";

test("normalizes the server envelope without losing metadata", () => {
  const normalized = normalizeApiResponse({
    success: true,
    status: 200,
    code: "REQUEST_SUCCESS",
    message: "ok",
    data: { id: 1 },
    meta: { page: 0 },
    requestId: "req-1",
  });

  assert.deepEqual(normalized.data, { id: 1 });
  assert.deepEqual(normalized.meta, { page: 0 });
  assert.equal(normalized.code, "REQUEST_SUCCESS");
  assert.equal(normalized.requestId, "req-1");
});

test("extracts canonical error details and field errors", () => {
  const details = getApiErrorDetails({
    response: {
      data: {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        errors: { email: "Email is required" },
        requestId: "req-2",
      },
    },
  });

  assert.equal(details.code, "VALIDATION_ERROR");
  assert.equal(details.message, "Invalid request");
  assert.deepEqual(details.errors, { email: "Email is required" });
  assert.equal(details.requestId, "req-2");
});
