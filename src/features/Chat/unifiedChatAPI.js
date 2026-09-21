import chatApi from "./chatApi";

/**
 * Compatibility service for customer and staff chat components.
 * Both roles use the same REST contract; authorization is handled by the API.
 */
class UnifiedChatAPIService {
  async sendMessage(sessionId, message, senderName) {
    return chatApi.sendMessage(sessionId, message, senderName);
  }

  async getSessionMessages(sessionId, isStaff = false) {
    try {
      return (await chatApi.getSessionMessages(sessionId)) || [];
    } catch (error) {
      // Customer chat can continue with an empty history when a poll fails.
      if (!isStaff) {
        return [];
      }

      throw error;
    }
  }
}

export const unifiedChatAPI = new UnifiedChatAPIService();
export default unifiedChatAPI;
