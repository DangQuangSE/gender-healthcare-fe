import apiClient from "../../shared/api/client";

const toFormData = (values) => {
  const formData = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => formData.append(key, value));
  return formData;
};

export const createConfig = (config) =>
  apiClient.post("/v1/config", toFormData(config), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

export const fetchAllConfigs = () => apiClient.get("/v1/config");

export const updateConfig = (configId, config) =>
  apiClient.put(`/v1/config/${configId}`, toFormData({ value: config.value }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

export const deleteConfig = (configId) =>
  apiClient.delete(`/v1/config/${configId}`);

export const fetchConfigById = (configId) =>
  apiClient.get(`/v1/config/${configId}`);
