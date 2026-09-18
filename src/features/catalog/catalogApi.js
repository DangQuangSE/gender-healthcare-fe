import apiClient from "../../shared/api/client";

export const getServiceById = (serviceId) =>
  apiClient.get(`/v1/services/${serviceId}`);

export const getServices = (params) =>
  apiClient.get("/v1/services", { params });

export const createService = (service) =>
  apiClient.post("/v1/services", service);

export const updateService = (serviceId, service) =>
  apiClient.put(`/v1/services/${serviceId}`, service);

export const activateService = (serviceId) =>
  apiClient.put(`/v1/services/${serviceId}/activate`);

export const deactivateService = (serviceId) =>
  apiClient.put(`/v1/services/${serviceId}/deactivate`);

export const createComboService = (service) =>
  apiClient.post("/v1/services/combo", service);

export const getServiceAverageRating = (serviceId) =>
  apiClient.get(`/v1/service-feedback/services/${serviceId}/average-rating`);

export const getConsultants = (serviceId) =>
  apiClient.get("/v1/consultants", {
    params: serviceId ? { serviceId } : undefined,
  });

export const getServiceSchedule = (serviceId, from, to) =>
  apiClient.get(`/v1/schedules/services/${serviceId}/slots`, {
    params: { from, to },
  });
