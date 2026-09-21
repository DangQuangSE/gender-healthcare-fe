import { useState, useEffect, useRef, useCallback } from "react";
import unifiedChatAPI from "../unifiedChatAPI";
import { POLLING_INTERVALS } from "./useRealTimeMessages.constants";

// Simple UUID generator for client-side message IDs
const generateClientId = () => {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Modern Real-Time Message Sync Hook
 * Combines WebSocket + Smart REST API Polling for optimal performance
 */
export const useRealTimeMessages = (
  sessionId,
  isActive = true,
  isStaff = false
) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(null);


  // Refs for cleanup and optimization
  const pollingIntervalRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const messageIdsRef = useRef(new Set());
  const isUnmountedRef = useRef(false);

  /**
   * Transform API message to UI format
   */
  const transformMessage = useCallback((apiMessage) => {
    // Handle multiple possible timestamp field names and ensure valid date
    let timestamp =
      apiMessage.sentAt || apiMessage.timestamp || apiMessage.createdAt;

    // If timestamp is null/undefined or invalid, use current time
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      timestamp = new Date().toISOString();
    }

    return {
      id: apiMessage.id || Date.now(),
      clientId: apiMessage.clientId || null, // Support client-generated IDs
      message: apiMessage.message || "",
      senderName: apiMessage.senderName || "Unknown",
      senderType: apiMessage.senderType || "CUSTOMER",
      timestamp: timestamp,
      isRead: apiMessage.isRead || false,
      avatar: null,
    };
  }, []);

  /**
   * Fetch messages from API with deduplication
   */
  const fetchMessages = useCallback(
    async (force = false) => {
      if (!sessionId || isUnmountedRef.current) return;

      // Rate limiting - prevent too frequent calls
      const now = Date.now();
      if (!force && now - lastFetchTimeRef.current < 1000) {
        return;
      }
      lastFetchTimeRef.current = now;

      try {
        setError(null);
        // Use unified API for both staff and customer
        const apiMessages = await unifiedChatAPI.getSessionMessages(
          sessionId,
          isStaff
        );

        if (isUnmountedRef.current) return;

        // Transform messages
        const transformedMessages = apiMessages.map(transformMessage);

        // Update state with smart deduplication - only replace if there are new messages
        setMessages((prev) => {
          // Create a set of existing message IDs for fast lookup
          const existingIds = new Set();
          const existingClientIds = new Set();

          prev.forEach((msg) => {
            existingIds.add(msg.id);
            if (msg.clientId) {
              existingClientIds.add(msg.clientId);
            }
          });

          // Find truly new messages
          const newMessages = transformedMessages.filter((msg) => {
            const isDuplicateById = existingIds.has(msg.id);
            const isDuplicateByClientId =
              msg.clientId && existingClientIds.has(msg.clientId);

            if (isDuplicateById || isDuplicateByClientId) {
              return false;
            }
            return true;
          });

          // If no new messages, return previous state to avoid unnecessary re-renders
          if (
            newMessages.length === 0 &&
            prev.length === transformedMessages.length
          ) {
            return prev;
          }

          // Combine existing and new messages, then sort
          const allMessages = [...prev, ...newMessages].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );

          // Update tracking refs for new messages only
          newMessages.forEach((msg) => {
            messageIdsRef.current.add(msg.id);
            if (msg.clientId) {
              messageIdsRef.current.add(msg.clientId);
            }
          });

          // Update last message ID
          if (allMessages.length > 0) {
            setLastMessageId(allMessages[allMessages.length - 1].id);
          }

          return allMessages;
        });
      } catch (err) {
        if (!isUnmountedRef.current) {
          setError(err.message);
        }
      }
    },
    [sessionId, transformMessage, isStaff]
  );

  /**
   * Add new message optimistically (for sent messages)
   */
  const addMessage = useCallback(
    (message) => {
      const transformedMessage =
        typeof message.id !== "undefined"
          ? transformMessage(message)
          : {
              id: message.clientId || generateClientId(),
              clientId: message.clientId || generateClientId(),
              message: message.message,
              senderName: message.senderName,
              senderType: message.senderType,
              timestamp: message.timestamp || new Date().toISOString(),
              avatar: null,
            };

      // Use same deduplication logic as fetchMessages
      setMessages((prev) => {
        // Create a map of existing messages by ID and clientId for fast lookup
        const existingMap = new Map();

        prev.forEach((msg) => {
          existingMap.set(msg.id, msg);
          if (msg.clientId) {
            existingMap.set(`clientId_${msg.clientId}`, msg);
          }
        });

        // Check for duplicates by ID and clientId
        const isDuplicateById = existingMap.has(transformedMessage.id);
        const isDuplicateByClientId =
          transformedMessage.clientId &&
          existingMap.has(`clientId_${transformedMessage.clientId}`);

        if (isDuplicateById || isDuplicateByClientId) {
          return prev;
        }

        // Add new message
        existingMap.set(transformedMessage.id, transformedMessage);
        if (transformedMessage.clientId) {
          existingMap.set(
            `clientId_${transformedMessage.clientId}`,
            transformedMessage
          );
        }
        messageIdsRef.current.add(transformedMessage.id);
        if (transformedMessage.clientId) {
          messageIdsRef.current.add(transformedMessage.clientId);
        }

        // Convert back to array, filtering out clientId keys and sort by timestamp
        const allMessages = Array.from(existingMap.values())
          .filter((msg) => msg && typeof msg === "object" && msg.id)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Update last message ID
        if (allMessages.length > 0) {
          setLastMessageId(allMessages[allMessages.length - 1].id);
        }

        return allMessages;
      });
    },
    [transformMessage]
  );

  /**
   * Clear all messages (for session reset)
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    messageIdsRef.current.clear();
    setLastMessageId(null);
  }, []);

  /**
   * Smart polling based on activity and focus
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const getPollingInterval = () => {
      if (!document.hasFocus()) return POLLING_INTERVALS.BACKGROUND;
      if (isActive) return POLLING_INTERVALS.ACTIVE;
      return POLLING_INTERVALS.IDLE;
    };

    const poll = () => {
      fetchMessages();

      // Adjust interval based on current state
      const newInterval = getPollingInterval();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = setInterval(poll, newInterval);
      }
    };

    pollingIntervalRef.current = setInterval(poll, getPollingInterval());
  }, [isActive, fetchMessages]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Initial load and polling setup
  useEffect(() => {
    if (!sessionId) return;

    isUnmountedRef.current = false;

    // Initial fetch
    setLoading(true);
    fetchMessages(true).finally(() => {
      if (!isUnmountedRef.current) {
        setLoading(false);
      }
    });

    // Start polling
    if (isActive) {
      startPolling();
    }

    return () => {
      isUnmountedRef.current = true;
      stopPolling();
    };
  }, [sessionId, isActive, fetchMessages, startPolling, stopPolling]);

  // Handle visibility change for smart polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (sessionId && isActive && !document.hidden) {
        fetchMessages(); // Immediate fetch when tab becomes visible
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sessionId, isActive, fetchMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    messages,
    loading,
    error,
    lastMessageId,
    addMessage,
    clearMessages,
    refetch: () => fetchMessages(true),
  };
};
