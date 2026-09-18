import apiClient from "../../shared/api/client";

export const createVNPayPayment = (appointmentId) =>
  apiClient.post("/v1/payments/vnpay", { appointmentId });

export const createOfflinePayment = (appointmentId) =>
  apiClient.post("/v1/payments/vnpay/offline", { appointmentId });

export const verifyVNPayPayment = (parameters) =>
  apiClient.get("/v1/payments/vnpay/return", { params: parameters });
