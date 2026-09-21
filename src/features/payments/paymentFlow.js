export const PAYMENT_INTENTS = Object.freeze({
  FULL: "FULL",
  DEPOSIT: "DEPOSIT",
});

const PENDING_RETURN_STATUSES = new Set(["PENDING", "PROCESSING"]);
const TERMINAL_PAYMENT_STATUSES = new Set(["SUCCESS", "FAILED", "CANCELLED"]);

const parseOrderCode = (value) => {
  if (!value || !/^\d+$/.test(value)) return null;
  const orderCode = Number(value);
  return Number.isSafeInteger(orderCode) && orderCode > 0 ? orderCode : null;
};

export const getPaymentIntent = (booking = {}) =>
  booking.paymentIntent === PAYMENT_INTENTS.DEPOSIT || booking.paymentMethod === "direct"
    ? PAYMENT_INTENTS.DEPOSIT
    : PAYMENT_INTENTS.FULL;

export const parsePayOSReturn = (search = "") => {
  const params = new URLSearchParams(search);
  if (!["code", "id", "cancel", "status", "orderCode"].some((key) => params.has(key))) {
    return { kind: "none" };
  }

  const orderCode = parseOrderCode(params.get("orderCode"));
  const status = params.get("status")?.toUpperCase() || "";
  const paymentLinkId = params.get("id") || null;

  if (!orderCode) return { kind: "invalid" };
  if (params.get("cancel") === "true" || status === "CANCELLED") {
    return { kind: "cancelled", orderCode };
  }
  if (PENDING_RETURN_STATUSES.has(status)) {
    return { kind: "pending", orderCode };
  }
  if ((params.get("code") === "00" || status === "PAID") && paymentLinkId) {
    return { kind: "pending_confirmation", orderCode, paymentLinkId };
  }

  return { kind: "invalid" };
};

export const isTerminalPaymentStatus = (status) =>
  TERMINAL_PAYMENT_STATUSES.has(String(status || "").toUpperCase());
