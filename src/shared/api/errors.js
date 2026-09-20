import { UI_MESSAGES } from "../constants/messages.js";

export const getApiErrorDetails = (error) => {
  const payload = error?.response?.data;
  const data = payload?.error && typeof payload.error === "object"
    ? payload.error
    : payload;

  return {
    code: data?.code ?? null,
    message: data?.message ?? (typeof data === "string" ? data : null),
    errors: data?.errors ?? null,
    status: data?.status ?? error?.response?.status ?? null,
    path: data?.path ?? null,
    requestId: data?.requestId ?? null,
  };
};

export const getApiErrorMessage = (
  error,
  fallback = UI_MESSAGES.UNKNOWN_ERROR
) => {
  const data = error?.response?.data;
  const details = getApiErrorDetails(error);

  return (
    details.message ||
    data?.error?.message ||
    data?.error ||
    (typeof data === "string" ? data : "") ||
    error?.message ||
    fallback
  );
};

export default getApiErrorMessage;
