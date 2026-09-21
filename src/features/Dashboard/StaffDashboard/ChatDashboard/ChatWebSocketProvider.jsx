import React, { useEffect, useState } from "react";
import chatWebSocketService from "./websocketService";
import { chatNotificationService } from "./chatNotificationService";
import ChatWebSocketContext from "./ChatWebSocketContext";

/**
 * WebSocket Context Provider cho Staff Dashboard
 * Tự động kết nối WebSocket khi staff login và duy trì connection
 */
export const ChatWebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Auto-connect khi component mount
  useEffect(() => {
    const initializeWebSocket = async () => {
      if (initialized) return;

      console.log("[WEBSOCKET PROVIDER] Initializing WebSocket connection...");
      setInitialized(true);

      try {
        setConnecting(true);
        await chatWebSocketService.connect();
        setConnected(true);
        setConnecting(false);

        console.log("[WEBSOCKET PROVIDER] WebSocket connected successfully");
      } catch (error) {
        console.error(" [WEBSOCKET PROVIDER] Failed to connect:", error);
        console.error(" [WEBSOCKET PROVIDER] Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });

        setConnected(false);
        setConnecting(false);

        // Retry connection sau 10 giây (tăng thời gian để tránh spam)
        console.log(
          "[WEBSOCKET PROVIDER] Will retry connection in 10 seconds..."
        );
        setTimeout(() => {
          console.log("[WEBSOCKET PROVIDER] Retrying connection...");
          setInitialized(false);
        }, 10000);
      }
    };

    initializeWebSocket();

    // Cleanup khi component unmount
    return () => {
      console.log(
        "🔌 [WEBSOCKET PROVIDER] Cleaning up WebSocket connection..."
      );
      chatWebSocketService.disconnect();
      setConnected(false);
      setConnecting(false);
    };
  }, [initialized]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = chatWebSocketService.isConnected();
      const isConnecting = chatWebSocketService.isConnecting();

      if (connected !== isConnected) {
        setConnected(isConnected);
      }
      if (connecting !== isConnecting) {
        setConnecting(isConnecting);
      }
    };

    // Check connection status every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, [connected, connecting]);

  // Manual connect function
  const connect = async () => {
    if (connected || connecting) return;

    try {
      setConnecting(true);
      await chatWebSocketService.connect();
      setConnected(true);
      setConnecting(false);

      chatNotificationService.showConnectionSuccess();
    } catch (error) {
      console.error(" [WEBSOCKET PROVIDER] Manual connect failed:", error);
      setConnected(false);
      setConnecting(false);

      chatNotificationService.showConnectionError();
    }
  };

  // Manual disconnect function
  const disconnect = () => {
    chatWebSocketService.disconnect();
    setConnected(false);
    setConnecting(false);
  };

  const contextValue = {
    connected,
    connecting,
    connect,
    disconnect,
    service: chatWebSocketService,
  };

  return (
    <ChatWebSocketContext.Provider value={contextValue}>
      {children}
    </ChatWebSocketContext.Provider>
  );
};

export default ChatWebSocketProvider;
