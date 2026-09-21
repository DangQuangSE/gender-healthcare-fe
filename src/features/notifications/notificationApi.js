import apiClient from "../../shared/api/client";

export const getNotifications = () => apiClient.get("/v1/notifications");

export const createNotification = (notification) =>
  apiClient.post("/v1/notifications", notification);

export const markNotificationAsRead = (notificationId) =>
  apiClient.patch(`/v1/notifications/${notificationId}/read`);

export const deleteNotification = (notificationId) =>
  apiClient.delete(`/v1/notifications/${notificationId}`);
