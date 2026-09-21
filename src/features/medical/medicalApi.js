import apiClient from "../../shared/api/client";

export const getTreatmentProtocol = (protocolId) =>
  apiClient.get(`/v1/treatment-protocols/${protocolId}`);

export const getTreatmentProtocols = () =>
  apiClient.get("/v1/treatment-protocols");

export const createTreatmentProtocol = (protocol) =>
  apiClient.post("/v1/treatment-protocols", protocol);

export const updateTreatmentProtocol = (protocolId, protocol) =>
  apiClient.put(`/v1/treatment-protocols/${protocolId}`, protocol);

export const deleteTreatmentProtocol = (protocolId) =>
  apiClient.delete(`/v1/treatment-protocols/${protocolId}`);

export const updateMedicalInfo = (medicalData) =>
  apiClient.put("/v1/medical-profiles/medical-info", medicalData);
