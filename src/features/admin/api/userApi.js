import apiClient from "../../../shared/api/client";
import { USER_PATH, USER_ROLES } from "./userApi.constants";

const asArray = (data) => {
  if (!data) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
};

export const fetchUsers = async () => {
  const users = [];

  for (const role of USER_ROLES) {
    try {
      const usersWithRole = await fetchUsersByRole(role);

      users.push(...usersWithRole);
    } catch {
      // Keep the previous behavior: one unavailable role does not hide others.
    }
  }

  return users;
};

export const fetchUsersByRole = async (role) => {
  const response = await apiClient.get(USER_PATH, {
    params: { role },
  });

  return asArray(response.data).map((user) => ({
    ...user,
    role: user.role || role,
  }));
};

export const addUser = async (userData) => {
  const response = await apiClient.post(USER_PATH, userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`${USER_PATH}/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  await apiClient.delete(`${USER_PATH}/${userId}`);
};

export const fetchUserSpecializations = async (userId) => {
  const response = await apiClient.get(`${USER_PATH}/${userId}/specializations`);
  return asArray(response.data);
};

export const addUserSpecializations = (userId, specializationIds) =>
  apiClient.post(`${USER_PATH}/${userId}/specializations`, {
    specializationIds,
  });

export const removeUserSpecialization = (userId, specializationId) =>
  apiClient.delete(`${USER_PATH}/${userId}/specializations/${specializationId}`);
