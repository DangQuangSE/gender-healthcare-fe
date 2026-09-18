import apiClient from "../../shared/api/client";

export const getPatientMedicalHistory = (
  patientId,
  page = 0,
  size = 5
) =>
  apiClient.get(`/v1/medical-profiles/patients/${patientId}/history`, {
    params: { page, size },
  });
