import apiClient from "../../shared/api/client";

export const createBooking = (booking) =>
  apiClient.post("/v1/bookings", booking);

export const getAppointmentsByStatus = (status) =>
  apiClient.get("/v1/appointments", { params: { status } });

export const createOnlineMeeting = (appointmentId) =>
  apiClient.post(`/v1/appointments/${appointmentId}/meeting`);

export const cancelAppointment = (appointmentId) =>
  apiClient.post(`/v1/appointments/${appointmentId}/cancel`);

export const checkInAppointment = (appointmentId) =>
  apiClient.post(`/v1/appointments/${appointmentId}/check-in`);
