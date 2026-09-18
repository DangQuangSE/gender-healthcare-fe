import apiClient from "../../../shared/api/client";
import { SPECIALIZATION_PATH } from "./specializationApi.constants";

const asArray = (data) => {
  if (!data) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
};

export const fetchSpecializations = async () => {
  const response = await apiClient.get(SPECIALIZATION_PATH);
  return asArray(response.data);
};

export const addSpecialization = async (specialization) => {
  const response = await apiClient.post(SPECIALIZATION_PATH, specialization);
  return response.data;
};

export const updateSpecialization = async (specializationId, specialization) => {
  const response = await apiClient.put(
    `${SPECIALIZATION_PATH}/${specializationId}`,
    specialization
  );
  return response.data;
};

export const deleteSpecialization = async (specializationId) => {
  await apiClient.delete(`${SPECIALIZATION_PATH}/${specializationId}`);
};
