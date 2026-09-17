import api from "../../../../shared/api/client";

/**
 * Chat API Service for Staff Dashboard
 * REST API endpoints for chat functionality
 */
class ChatAPIService {
  constructor() {
    this.api = api;
  }

  /**
   * Lấy danh sách chat sessions cho staff
   * @param {string} status - Filter by status: WAITING, ACTIVE, ENDED (optional)
   */
  async getChatSessions(status = null) {
    try {
      const params = {};
      if (status) {
        params.status = status;
      }

      console.log(" [STAFF CHAT API] getChatSessions params:", params);

      const response = await this.api.get("/chat/sessions", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết một chat session
   */
  async getChatSession(sessionId) {
    try {
      const response = await this.api.get(`/chat/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching chat session:", error);
      throw error;
    }
  }

  /**
   * Lấy messages của một session
   */
  async getSessionMessages(sessionId, page = 0, size = 50) {
    try {
      const response = await this.api.get(
        `/chat/sessions/${sessionId}/messages`,
        {
          params: { page, size },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching session messages:", error);
      throw error;
    }
  }

  /**
   * Gửi message qua REST API (backup cho WebSocket)
   */
  async sendMessage(sessionId, message, senderName, senderType = "STAFF") {
    try {
      const payload = {
        sessionId,
        message,
        senderName,
        senderType,
      };

      const response = await this.api.post("/chat/messages", payload);
      return response.data;
    } catch (error) {
      console.error("Error sending message via REST:", error);
      throw error;
    }
  }

  /**
   * Send chat message via REST API - /api/chat/send endpoint
   */
  async sendChatMessage(sessionId, message, senderName) {
    try {
      const payload = {
        sessionId,
        message,
        senderName,
      };

      console.log(" [CHAT API] Sending message:", payload);
      const response = await this.api.post("/chat/send", payload);
      console.log("[CHAT API] Message sent successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(" [CHAT API] Error sending chat message:", error);
      throw error;
    }
  }

  /**
   * Tạo chat session mới (cho customer)
   */
  async createChatSession(customerName, topic = "General Support") {
    try {
      const payload = {
        customerName,
        topic,
      };

      const response = await this.api.post("/chat/sessions", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating chat session:", error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái session
   */
  async updateSessionStatus(sessionId, status) {
    try {
      const response = await this.api.patch(
        `/chat/sessions/${sessionId}/status`,
        {
          status,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating session status:", error);
      throw error;
    }
  }

  /**
   * Assign session cho staff
   */
  async assignSession(sessionId, staffId) {
    try {
      const response = await this.api.patch(
        `/chat/sessions/${sessionId}/assign`,
        {
          staffId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning session:", error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(sessionId, readerName) {
    try {
      console.log("[STAFF CHAT API] Marking messages as read:", {
        sessionId,
        readerName,
      });

      const response = await this.api.post(
        `/chat/sessions/${sessionId}/mark-read`,
        null,
        {
          params: {
            readerName: readerName,
          },
        }
      );

      console.log("[STAFF CHAT API] Messages marked as read:", response.data);
      return response.data;
    } catch (error) {
      console.error(" [STAFF CHAT API] Error marking messages as read:", error);
      throw error;
    }
  }

  /**
   * Lấy thống kê chat cho staff dashboard
   */
  async getChatStats() {
    try {
      const response = await this.api.get("/chat/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching chat stats:", error);
      throw error;
    }
  }

  /**
   * Search messages
   */
  async searchMessages(query, sessionId = null) {
    try {
      const params = { query };
      if (sessionId) {
        params.sessionId = sessionId;
      }

      const response = await this.api.get("/chat/search", { params });
      return response.data;
    } catch (error) {
      console.error("Error searching messages:", error);
      throw error;
    }
  }

  /**
   * Get chat history for a customer
   */
  async getCustomerChatHistory(customerId) {
    try {
      const response = await this.api.get(
        `/chat/customers/${customerId}/history`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer chat history:", error);
      throw error;
    }
  }

  /**
   * Join chat session (staff joins a waiting session)
   */
  async joinSession(sessionId) {
    try {
      const response = await this.api.post(`/chat/join/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error joining session:", error);
      throw error;
    }
  }

  /**
   * Close chat session
   */
  async closeSession(sessionId, reason = "Completed") {
    try {
      const response = await this.api.patch(
        `/chat/sessions/${sessionId}/close`,
        {
          reason,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error closing session:", error);
      throw error;
    }
  }

  /**
   * Lấy số lượng tin nhắn chưa đọc cho một session
   * @param {string} sessionId - ID của session
   * @param {string} readerName - Tên người đọc (staff name)
   * @returns {Promise<number>} Số lượng tin nhắn chưa đọc
   */
  async getUnreadCount(sessionId, readerName) {
    try {
      console.log(
        ` [CHAT API] Getting unread count for session ${sessionId}, reader: ${readerName}`
      );

      const response = await this.api.get(
        `/chat/sessions/${sessionId}/unread-count`,
        {
          params: { readerName },
        }
      );

      const count = response.data || 0;
      console.log(`[CHAT API] Unread count for session ${sessionId}: ${count}`);
      return count;
    } catch (error) {
      console.error(
        ` [CHAT API] Error getting unread count for session ${sessionId}:`,
        {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          data: error.response?.data,
        }
      );

      // Return 0 instead of throwing error to prevent UI issues
      console.warn(
        `⚠️ [CHAT API] Returning 0 unread count for session ${sessionId} due to error`
      );
      return 0;
    }
  }

  /**
   * Kết thúc chat session
   * @param {string} sessionId - ID của session cần kết thúc
   * @returns {Promise<void>}
   */
  async endSession(sessionId) {
    try {
      console.log(`🔚 [CHAT API] Ending chat session ${sessionId}`);

      await this.api.delete(`/chat/sessions/${sessionId}/end`);

      console.log(`[CHAT API] Successfully ended session ${sessionId}`);
    } catch (error) {
      console.error(` [CHAT API] Error ending session ${sessionId}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
      });
      throw error;
    }
  }
}

// Export singleton instance
const chatAPIService = new ChatAPIService();
export default chatAPIService;
