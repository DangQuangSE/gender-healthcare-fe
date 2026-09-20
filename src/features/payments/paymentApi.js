import apiClient from "../../shared/api/client";

const PAYOS_PAYMENT_PATH = "/v1/payments/payos";

const unwrapPaymentResponse = (response) => response?.data ?? response;

export const createPayOSFullPayment = (appointmentId) =>
  apiClient.post(PAYOS_PAYMENT_PATH, { appointmentId });

export const createPayOSDepositPayment = (appointmentId) =>
  apiClient.post(`${PAYOS_PAYMENT_PATH}/deposit`, { appointmentId });

export const getPayOSPaymentStatus = (orderCode) =>
  apiClient.get(`${PAYOS_PAYMENT_PATH}/${orderCode}`);

export const getPaymentLinkData = (response) => unwrapPaymentResponse(response);

export const getPaymentStatusData = (response) => unwrapPaymentResponse(response);
