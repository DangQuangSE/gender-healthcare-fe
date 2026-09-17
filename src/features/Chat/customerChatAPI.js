import api from "../../shared/api/client";

/**
 * Customer Chat API Service
 * Handles chat operations for customer side without authentication
 */
class CustomerChatAPIService {
  constructor() {
    this.api = api;
  }

  /**
   * Create new chat session
   */
  async createChatSession(customerName, topic = "General Support") {
    try {
      const payload = {
        customerName,
        topic,
      };

      console.log(" [CUSTOMER CHAT API] Creating session:", payload);
      const response = await this.api.post("/chat/start", payload);
      console.log("[CUSTOMER CHAT API] Session created:", response.data);
      return response.data;
    } catch (error) {
      console.error(" [CUSTOMER CHAT API] Error creating session:", error);
      throw error;
    }
  }

  /**
   * Send chat message
   */
  async sendMessage(sessionId, message, senderName) {
    try {
      const payload = {
        sessionId,
        message,
        senderName,
      };

      console.log(" [CUSTOMER CHAT API] Sending message:", payload);
      const response = await this.api.post("/chat/send", payload);
      console.log("[CUSTOMER CHAT API] Message sent:", response.data);
      return response.data;
    } catch (error) {
      console.error(" [CUSTOMER CHAT API] Error sending message:", error);
      throw error;
    }
  }

  /**
   * Get session messages (public endpoint for customers)
   */
  async getSessionMessages(sessionId) {
    try {
      console.log("📥 [CUSTOMER CHAT API] Fetching messages for:", sessionId);

      // Use the correct endpoint that matches backend
      const response = await this.api.get(
        `/chat/sessions/${sessionId}/messages`
      );
      console.log("[CUSTOMER CHAT API] Messages fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error(" [CUSTOMER CHAT API] Error fetching messages:", error);
      throw error;
    }
  }

  /**
   * End chat session
   */
  async endChatSession(sessionId) {
    try {
      console.log(" [CUSTOMER CHAT API] Ending session:", sessionId);
      const response = await this.api.post(`/chat/sessions/${sessionId}/end`);
      console.log("[CUSTOMER CHAT API] Session ended:", response.data);
      return response.data;
    } catch (error) {
      console.error(" [CUSTOMER CHAT API] Error ending session:", error);
      throw error;
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId) {
    try {
      console.log("📥 [CUSTOMER CHAT API] Getting session status:", sessionId);
      const response = await this.api.get(`/chat/sessions/${sessionId}/status`);
      console.log("[CUSTOMER CHAT API] Session status:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        " [CUSTOMER CHAT API] Error getting session status:",
        error
      );
      throw error;
    }
  }

  /**
   * Get unread count for customer in a session
   * @param {string} sessionId - Session ID
   * @param {string} customerName - Customer name
   * @returns {Promise<number>} Number of unread messages
   */
  async getUnreadCount(sessionId, customerName) {
    try {
      console.log(" [CUSTOMER CHAT API] Getting unread count:", {
        sessionId,
        customerName,
      });

      const response = await this.api.get(
        `/chat/sessions/${sessionId}/unread-count`,
        {
          params: { readerName: customerName },
        }
      );

      console.log("[CUSTOMER CHAT API] Unread count:", response.data);
      return response.data || 0;
    } catch (error) {
      console.error(" [CUSTOMER CHAT API] Error getting unread count:", error);
      // Return 0 if error to prevent UI issues
      return 0;
    }
  }

  /**
   * Mark messages as read for customer
   * @param {string} sessionId - Session ID
   * @param {string} customerName - Customer name (readerName)
   * @returns {Promise} API response
   */
  async markMessagesAsRead(sessionId, customerName) {
    try {
      console.log("[CUSTOMER CHAT API] Marking messages as read:", {
        sessionId,
        customerName,
      });

      const response = await this.api.post(
        `/chat/sessions/${sessionId}/mark-read`,
        null,
        {
          params: {
            readerName: customerName,
          },
        }
      );

      console.log(
        "[CUSTOMER CHAT API] Messages marked as read:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        " [CUSTOMER CHAT API] Error marking messages as read:",
        error
      );
      throw error;
    }
  }
}

// Export singleton instance
export const customerChatAPI = new CustomerChatAPIService();
export default customerChatAPI;
