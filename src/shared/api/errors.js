import { UI_MESSAGES } from "../constants/messages.js";

const getErrorPayload = (error) =>
  typeof error === "string"
    ? error
    : error?.apiResponse ?? error?.response?.data ?? error?.data ?? null;

const getErrorBody = (payload) =>
  payload?.error && typeof payload.error === "object"
    ? payload.error
    : payload;

const getValidationMessage = (errors) => {
  if (!errors) return null;

  if (typeof errors === "string") return errors;

  if (Array.isArray(errors)) {
    const firstMessage = errors.find(
      (item) => typeof item === "string" || item?.message
    );
    return typeof firstMessage === "string"
      ? firstMessage
      : firstMessage?.message ?? null;
  }

  if (typeof errors === "object") {
    const firstMessage = Object.values(errors).find(
      (value) => typeof value === "string" || value?.message
    );
    return typeof firstMessage === "string"
      ? firstMessage
      : firstMessage?.message ?? null;
  }

  return null;
};

export const getApiErrorDetails = (error) => {
  const payload = getErrorPayload(error);
  const data = getErrorBody(payload);

  return {
    code: data?.code ?? payload?.code ?? null,
    message:
      data?.message ??
      payload?.message ??
      (typeof payload?.error === "string" ? payload.error : null) ??
      (typeof data === "string" ? data : null),
    errors: data?.errors ?? payload?.errors ?? null,
    status: data?.status ?? payload?.status ?? error?.response?.status ?? null,
    path: data?.path ?? payload?.path ?? null,
    requestId: data?.requestId ?? payload?.requestId ?? null,
  };
};

export const getApiErrorMessage = (
  error,
  fallback = UI_MESSAGES.UNKNOWN_ERROR
) => {
  const details = getApiErrorDetails(error);
  const validationMessage = getValidationMessage(details.errors);

  if (details.message) return details.message;
  if (validationMessage) return validationMessage;

  if (!error?.response) {
    if (error?.code === "ERR_NETWORK" || error?.code === "ECONNABORTED") {
      return UI_MESSAGES.NETWORK_ERROR;
    }

    if (error?.message && !/^Request failed with status code \d+$/.test(error.message)) {
      return error.message;
    }
  }

  return fallback;
};

export default getApiErrorMessage;
