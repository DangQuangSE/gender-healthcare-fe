export const getApiErrorMessage = (error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  (typeof error?.response?.data === "string" ? error.response.data : "") ||
  error?.message ||
  fallback;

export default getApiErrorMessage;
