import test from "node:test";
import assert from "node:assert/strict";
import { getApiErrorDetails, getApiErrorMessage } from "../src/shared/api/errors.js";

test("reads the backend error envelope and request metadata", () => {
  const error = {
    response: {
      status: 400,
      data: {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        errors: { email: "Email không hợp lệ" },
        path: "/api/v1/auth/register",
        requestId: "request-123",
      },
    },
  };

  assert.deepEqual(getApiErrorDetails(error), {
    code: "VALIDATION_ERROR",
    message: "Dữ liệu không hợp lệ",
    errors: { email: "Email không hợp lệ" },
    status: 400,
    path: "/api/v1/auth/register",
    requestId: "request-123",
  });
  assert.equal(getApiErrorMessage(error, "Fallback"), "Dữ liệu không hợp lệ");
});

test("uses the first backend validation detail when the envelope has no message", () => {
  const error = {
    response: {
      status: 400,
      data: { success: false, errors: { password: "Mật khẩu không hợp lệ" } },
    },
  };

  assert.equal(getApiErrorMessage(error, "Fallback"), "Mật khẩu không hợp lệ");
});

test("uses the network fallback for transport failures", () => {
  assert.equal(
    getApiErrorMessage({ code: "ERR_NETWORK", message: "Network Error" }),
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại."
  );
});

test("reads a string error field when the backend omits message", () => {
  assert.equal(
    getApiErrorMessage(
      { response: { data: { error: "Không hợp lệ" } } },
      "Fallback"
    ),
    "Không hợp lệ"
  );
});

test("keeps a string rejection readable", () => {
  assert.equal(getApiErrorMessage("Không thể xử lý", "Fallback"), "Không thể xử lý");
});
