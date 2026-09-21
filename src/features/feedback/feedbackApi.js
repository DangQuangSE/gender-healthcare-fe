import apiClient from "../../shared/api/client";

export const getServiceFeedback = (serviceId) =>
  apiClient.get(`/v1/service-feedback/services/${serviceId}`);

export const getAllServiceFeedback = () =>
  apiClient.get("/v1/service-feedback");

export const getMyConsultantFeedback = () =>
  apiClient.get("/v1/consultant-feedback/me");

export const getAppointmentFeedback = (appointmentId) =>
  apiClient.get(`/v1/service-feedback/appointments/${appointmentId}`);

export const createServiceFeedback = (feedback) =>
  apiClient.post("/v1/service-feedback", feedback);

export const updateServiceFeedback = (feedbackId, feedback) =>
  apiClient.put(`/v1/service-feedback/${feedbackId}`, feedback);

export const markAppointmentRated = (appointmentId) =>
  apiClient.post(`/v1/appointments/${appointmentId}/rating`);
