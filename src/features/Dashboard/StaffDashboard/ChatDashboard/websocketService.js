import { createWebSocketClient } from "../../../../shared/api/websocketClient";
import { chatNotificationService } from "./chatNotificationService";

const websocketClient = createWebSocketClient();

const subscribeToDestination = (destination, callback) => {
  return websocketClient.subscribe(destination, (payload) => {
    if (destination === "/topic/staff/new-session") {
      chatNotificationService.showNewSessionNotification(payload);
    }

    callback?.(payload);
  });
};

const chatWebSocketService = {
  connect: () => websocketClient.connect(),
  disconnect: () => websocketClient.disconnect(),
  isConnected: () => websocketClient.isConnected(),
  isConnecting: () => websocketClient.isConnecting(),

  subscribe: subscribeToDestination,
  unsubscribe: (destination) => websocketClient.unsubscribe(destination),

  sendMessage: (destination, payload) =>
    websocketClient.send(destination, payload),
  sendChatMessage: (sessionId, message, senderName, senderType = "STAFF") =>
    websocketClient.send("/app/chat.send", {
      sessionId,
      message,
      senderName,
      senderType,
    }),
  joinChatSession: (sessionId) =>
    websocketClient.send("/app/chat.join", sessionId),
  markMessagesAsRead: (sessionId, readerName) =>
    websocketClient.send("/app/chat.markRead", {
      sessionId,
      readerName,
    }),

  subscribeToSession: (sessionId, callback) =>
    subscribeToDestination(`/topic/chat/${sessionId}`, callback),
  subscribeToStaffMessages: (callback) =>
    subscribeToDestination("/topic/staff/messages", callback),
  subscribeToNewSessions: (callback) =>
    subscribeToDestination("/topic/staff/new-session", callback),
};

export default chatWebSocketService;
