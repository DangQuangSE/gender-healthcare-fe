import apiClient from "../../shared/api/client";

export const getCurrentUser = () => apiClient.get("/v1/me");

export const updateProfile = (profile) =>
  apiClient.put("/v1/me/profile", profile);

export const updateAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.put("/v1/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getMyCertifications = () =>
  apiClient.get("/v1/certifications/me");

export const createCertification = (formData) =>
  apiClient.post("/v1/certifications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCertification = (certificateId, formData) =>
  apiClient.put(`/v1/certifications/${certificateId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteCertification = (certificateId) =>
  apiClient.delete(`/v1/certifications/${certificateId}`);
