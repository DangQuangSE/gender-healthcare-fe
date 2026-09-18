import apiClient from "../../../../shared/api/client";
import unwrapApiResponse from "../../../../shared/api/response";

export const getMySchedule = async (date, status) => {
  const response = await apiClient.get("/v1/appointments/consultant-schedule", {
    params: { ...(date ? { date } : {}), ...(status ? { status } : {}) },
  });

  return unwrapApiResponse(response.data) || [];
};

export const updateAppointmentDetailStatus = (appointmentDetailId, status) =>
  apiClient.patch(`/v1/appointments/details/${appointmentDetailId}/status`, {
    status,
  });

export default {
  getMySchedule,
  updateAppointmentDetailStatus,
};
