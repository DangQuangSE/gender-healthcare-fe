import { isTerminalPaymentStatus } from "./paymentFlow.js";

export const PAYMENT_STATUS_REFRESH = Object.freeze({
  MAX_ATTEMPTS: 3,
  DELAY_MS: 1000,
});

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const refreshPayOSStatus = async (
  getStatus,
  orderCode,
  { maxAttempts = PAYMENT_STATUS_REFRESH.MAX_ATTEMPTS, delayMs = PAYMENT_STATUS_REFRESH.DELAY_MS, wait = pause } = {},
) => {
  let latest = null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    latest = await getStatus(orderCode);
    if (isTerminalPaymentStatus(latest?.paymentStatus)) return latest;
    if (attempt < maxAttempts - 1) await wait(delayMs * (attempt + 1));
  }
  return latest;
};
