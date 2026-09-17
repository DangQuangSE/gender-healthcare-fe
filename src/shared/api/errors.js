import { UI_MESSAGES } from "../constants/messages";

export const getApiErrorMessage = (
  error,
  fallback = UI_MESSAGES.UNKNOWN_ERROR
) => {
  const data = error?.response?.data;

  return (
    data?.message ||
    data?.error?.message ||
    data?.error ||
    (typeof data === "string" ? data : "") ||
    error?.message ||
    fallback
  );
};

export default getApiErrorMessage;
