import apiClient from "../../shared/api/client";

export const cancelSchedule = (schedule) =>
  apiClient.post("/v1/schedules/cancellations", schedule);

export const registerSchedule = (schedule) =>
  apiClient.post("/v1/schedules", schedule);

export const getConsultantSchedules = (consultantId, from, to) =>
  apiClient.get(`/v1/schedules/consultants/${consultantId}`, {
    params: { consultant_id: consultantId, from, to },
  });

export const getMySchedule = (date, status) =>
  apiClient.get("/v1/appointments/consultant-schedule", {
    params: { date, status },
  });

export const updateAppointmentDetailStatus = (appointmentDetailId, status) =>
  apiClient.patch(
    `/v1/appointments/details/${appointmentDetailId}/status`,
    { status }
  );
