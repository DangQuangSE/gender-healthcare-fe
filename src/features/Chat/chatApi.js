import apiClient from "../../shared/api/client";
import { CHAT_PATHS } from "./chatApi.constants";

const chatApi = {
  async getChatSessions(status) {
    const params = status ? { status } : undefined;
    const response = await apiClient.get(CHAT_PATHS.sessions, { params });
    return response.data || [];
  },

  async getChatSession(sessionId) {
    const sessions = await this.getChatSessions();
    return sessions.find((session) => session.sessionId === sessionId) || null;
  },

  async getSessionMessages(sessionId) {
    const response = await apiClient.get(
      `${CHAT_PATHS.sessions}/${sessionId}/messages`
    );
    return response.data || [];
  },

  async sendMessage(sessionId, message, senderName) {
    const response = await apiClient.post(CHAT_PATHS.messages, {
      sessionId,
      message,
      senderName,
    });
    return response.data;
  },

  async sendChatMessage(sessionId, message, senderName) {
    return this.sendMessage(sessionId, message, senderName);
  },

  async createChatSession(customerName) {
    const response = await apiClient.post(CHAT_PATHS.sessions, { customerName });
    return response.data;
  },

  async markMessagesAsRead(sessionId, readerName) {
    const response = await apiClient.post(
      `${CHAT_PATHS.sessions}/${sessionId}/read`,
      null,
      { params: { readerName } }
    );
    return response.data;
  },

  async getUnreadCount(sessionId, readerName) {
    try {
      const response = await apiClient.get(
        `${CHAT_PATHS.sessions}/${sessionId}/unread-count`,
        { params: { readerName } }
      );
      return response.data || 0;
    } catch {
      return 0;
    }
  },

  async joinSession(sessionId) {
    const response = await apiClient.post(
      `${CHAT_PATHS.sessions}/${sessionId}/join`
    );
    return response.data;
  },

  async endSession(sessionId) {
    const response = await apiClient.delete(
      `${CHAT_PATHS.sessions}/${sessionId}`
    );
    return response.data;
  },

  async endChatSession(sessionId) {
    return this.endSession(sessionId);
  },

  async getChatStats() {
    const sessions = await this.getChatSessions();
    return sessions.reduce(
      (stats, session) => {
        const status = session.status?.toLowerCase();
        if (status === "waiting") stats.waiting += 1;
        if (status === "active") stats.active += 1;
        stats.total += 1;
        return stats;
      },
      { total: 0, waiting: 0, active: 0 }
    );
  },
};

export default chatApi;
