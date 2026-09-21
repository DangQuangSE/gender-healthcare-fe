import apiClient from "../../../shared/api/client";
import { ROOM_PATH } from "./roomApi.constants";

const asArray = (data) => {
  if (!data) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
};

export const fetchRooms = async () => {
  const response = await apiClient.get(ROOM_PATH);
  return asArray(response.data);
};

export const fetchRoomById = async (roomId) => {
  const response = await apiClient.get(`${ROOM_PATH}/${roomId}`);
  return response.data;
};

export const addRoom = async (roomData) => {
  const response = await apiClient.post(ROOM_PATH, roomData);
  return response.data;
};

export const updateRoom = async (roomId, roomData) => {
  const response = await apiClient.put(`${ROOM_PATH}/${roomId}`, roomData);
  return response.data;
};

export const deleteRoom = async (roomId) => {
  const response = await apiClient.delete(`${ROOM_PATH}/${roomId}`);
  return response.data;
};

export const fetchRoomConsultants = async (roomId) => {
  try {
    const response = await apiClient.get(`${ROOM_PATH}/${roomId}/consultants`);
    return asArray(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

export const addConsultantToRoom = async (roomId, consultantData) => {
  const response = await apiClient.post(
    `${ROOM_PATH}/${roomId}/consultants`,
    consultantData
  );
  return response.data;
};

export const removeConsultantFromRoom = async (roomId, assignmentId) => {
  const response = await apiClient.delete(
    `${ROOM_PATH}/${roomId}/consultants/${assignmentId}`
  );
  return response.data;
};
