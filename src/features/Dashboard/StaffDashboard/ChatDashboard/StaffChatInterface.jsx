import React, { useState, useEffect, useRef } from "react";
import { message, Modal } from "antd";
import { useSelector } from "react-redux";
import chatAPIService from "../../../Chat/chatApi";
import unifiedChatAPI from "../../../Chat/unifiedChatAPI";
import { useChatWebSocket } from "./useChatWebSocket";
import { chatNotificationService } from "./chatNotificationService";
import CHAT_MESSAGES from "./chatMessages";
import { useRealTimeMessages } from "../../../Chat/hooks/useRealTimeMessages";
import StaffChatView from "./StaffChatView";
import "./StaffChatInterface.css";

/**
 * Staff Chat Interface for Q&A Section
 * Hiển thị chat sessions và chat interface
 */
const StaffChatInterface = ({ defaultTab = "waiting", hideTabs = false }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedSession, setSelectedSession] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [waitingSessions, setWaitingSessions] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const messagesEndRef = useRef(null);
  const markMessagesAsReadRef = useRef(null);
  const loadAllSessionsRef = useRef(null);
  const handleNewMessageRef = useRef(null);
  const handleNewSessionNotificationRef = useRef(null);

  // Real-time messages hook for selected session
  const {
    messages: realTimeMessages,
    loading: messagesLoading,
    addMessage,
    clearMessages,
    refetch: refetchMessages,
  } = useRealTimeMessages(
    selectedSession?.sessionId,
    true, // isStaff
    true // isActive
  );

  // Auto mark-read function
  const markMessagesAsRead = async (sessionId) => {
    if (!sessionId) return;

    try {
      const readerName = "Nhân viên hỗ trợ"; // Staff reader name
      await chatAPIService.markMessagesAsRead(sessionId, readerName);
      console.log(
        `[MARK READ] Messages marked as read for session: ${sessionId}`
      );

      // Refresh unread counts after marking as read
      setTimeout(() => {
        refreshUnreadCounts();
      }, 500);
    } catch (error) {
      console.error(" [MARK READ] Failed to mark messages as read:", error);
    }
  };
  markMessagesAsReadRef.current = markMessagesAsRead;
  const subscriptionRef = useRef(null); // Track subscription to prevent duplicates
  const processedSessionsRef = useRef(new Set()); // Track processed sessions
  const notificationTimeoutRef = useRef({}); // Track notification timeouts

  // Get current user from Redux
  const currentUser = useSelector((state) => state.user?.user);

  // Sử dụng WebSocket context
  const { connected: wsConnected, service: chatWebSocketService } =
    useChatWebSocket();
  const inputRef = useRef(null);

  // Auto mark-read when new messages arrive
  useEffect(() => {
    if (selectedSession?.sessionId && realTimeMessages.length > 0) {
      // Mark messages as read when user is actively viewing the chat
      markMessagesAsReadRef.current?.(selectedSession.sessionId);
    }
  }, [realTimeMessages.length, selectedSession?.sessionId]);

  // Fetch chat sessions for specific status
  const fetchChatSessionsByStatus = async (status) => {
    try {
      const response = await chatAPIService.getChatSessions(status);
      return response;
    } catch (error) {
      console.error(`Error fetching ${status} sessions:`, error);
      throw error;
    }
  };

  // Load all sessions (both WAITING and ACTIVE) - called when clicking Q&A
  const loadAllSessions = async () => {
    try {
      setLoading(true);

      // Fetch both WAITING and ACTIVE sessions in parallel
      const [waitingData, activeData] = await Promise.all([
        fetchChatSessionsByStatus("WAITING"),
        fetchChatSessionsByStatus("ACTIVE"),
      ]);

      // Fetch unread counts for both waiting and active sessions
      // For staff: use customerName as readerName to count messages from customer
      const [waitingWithUnread, activeWithUnread] = await Promise.all([
        // Don't fetch unread counts for waiting sessions - they don't have messages yet
        Promise.resolve(waitingData),
        fetchUnreadCountsForSessions(activeData, "STAFF"),
      ]);

      // Store sessions by status
      setWaitingSessions(waitingWithUnread);
      setActiveSessions(activeWithUnread);

      // Set current tab sessions
      if (activeTab === "waiting") {
        setSessions(waitingWithUnread);
      } else if (activeTab === "active") {
        setSessions(activeWithUnread);
      }
    } catch (error) {
      console.error("Error loading all sessions:", error);
      message.error(CHAT_MESSAGES.SESSIONS_LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };
  loadAllSessionsRef.current = loadAllSessions;

  // Fetch unread count for sessions
  const fetchUnreadCountsForSessions = async (sessions, readerType) => {
    try {
      console.log(
        ` [STAFF CHAT] Fetching unread counts for ${sessions.length} sessions, readerType: ${readerType}`
      );

      // Fetch unread counts for all sessions in parallel
      const unreadCountPromises = sessions.map(async (session) => {
        try {
          // For staff dashboard: we want to count messages from customers
          // So we pass "Nhân viên hỗ trợ" as readerName to exclude staff messages
          const readerName =
            readerType === "STAFF" ? "Nhân viên hỗ trợ" : session.customerName;

          console.log(
            ` [STAFF CHAT] Getting unread count for session ${session.sessionId}, reader: ${readerName}`
          );

          const unreadCount = await chatAPIService.getUnreadCount(
            session.sessionId,
            readerName
          );

          console.log(
            `[STAFF CHAT] Unread count for session ${session.sessionId}: ${unreadCount}`
          );

          return {
            sessionId: session.sessionId,
            unreadCount: unreadCount || 0,
          };
        } catch (error) {
          console.error(
            ` [STAFF CHAT] Error getting unread count for session ${session.sessionId}:`,
            error
          );
          return {
            sessionId: session.sessionId,
            unreadCount: 0,
          };
        }
      });

      const unreadCounts = await Promise.all(unreadCountPromises);

      // Map unread counts back to sessions
      const sessionsWithUnreadCount = sessions.map((session) => {
        const unreadData = unreadCounts.find(
          (uc) => uc.sessionId === session.sessionId
        );
        return {
          ...session,
          unreadCount: unreadData ? unreadData.unreadCount : 0,
        };
      });

      console.log(
        `[STAFF CHAT] Successfully fetched unread counts for ${sessionsWithUnreadCount.length} sessions`
      );

      return sessionsWithUnreadCount;
    } catch (error) {
      console.error(" [STAFF CHAT] Error fetching unread counts:", error);
      // Return sessions without unread count if error
      const fallbackSessions = sessions.map((session) => ({
        ...session,
        unreadCount: 0,
      }));
      console.warn(
        `⚠️ [STAFF CHAT] Returning ${fallbackSessions.length} sessions with 0 unread count due to error`
      );
      return fallbackSessions;
    }
  };

  // Load sessions for specific tab - called when clicking tab
  const loadSessionsForTab = async (tabKey) => {
    try {
      setLoading(true);

      let sessionsData;
      if (tabKey === "waiting") {
        sessionsData = await fetchChatSessionsByStatus("WAITING");
        // No need to fetch unread counts for waiting sessions - they don't have messages yet
        setWaitingSessions(sessionsData);
        setSessions(sessionsData);
      } else if (tabKey === "active") {
        sessionsData = await fetchChatSessionsByStatus("ACTIVE");
        // Fetch unread counts for active sessions
        sessionsData = await fetchUnreadCountsForSessions(
          sessionsData,
          "STAFF"
        );
        setActiveSessions(sessionsData);
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error("Error loading sessions for tab:", error);
      message.error(CHAT_MESSAGES.SESSIONS_LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // Note: Filtering is now done by backend via status parameter

  // No automatic API calls on component mount
  // Sessions will only be loaded when user clicks tabs

  // Mock data removed - using real API data

  // Note: Sessions are now fetched directly from API with status filter

  // Note: Sessions are now fetched via API calls, not filtered from mock data

  // Handle tab change - call API only when user clicks tab
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedSession(null); // Clear selection when switching tabs
    loadSessionsForTab(key);
  };

  // Auto scroll to bottom when messages change (only for new messages, not when switching sessions)
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  };

  // Only scroll when new messages are added, not when switching sessions
  const [previousMessagesLength, setPreviousMessagesLength] = useState(0);

  useEffect(() => {
    // Only scroll if messages were added (not replaced)
    if (
      realTimeMessages.length > previousMessagesLength &&
      previousMessagesLength > 0
    ) {
      scrollToBottom();
    }
    setPreviousMessagesLength(realTimeMessages.length);
  }, [realTimeMessages, previousMessagesLength]);

  // Handle new session notification from WebSocket with duplicate prevention
  const handleNewSessionNotification = (newSession) => {
    // Strong duplicate prevention using ref
    if (processedSessionsRef.current.has(newSession.sessionId)) {
      return;
    }

    // Mark session as processed
    processedSessionsRef.current.add(newSession.sessionId);

    // Prevent duplicate sessions in state
    const sessionExists = (sessionsList) =>
      sessionsList.some(
        (session) => session.sessionId === newSession.sessionId
      );

    // Add to appropriate sessions list based on status
    if (newSession.status === "WAITING") {
      setWaitingSessions((prev) => {
        if (sessionExists(prev)) {
          return prev;
        }
        return [newSession, ...prev];
      });

      // If currently viewing waiting tab, update sessions display
      if (activeTab === "waiting") {
        setSessions((prev) => {
          if (sessionExists(prev)) {
            return prev;
          }
          return [newSession, ...prev];
        });
      }
    } else if (newSession.status === "ACTIVE") {
      setActiveSessions((prev) => {
        if (sessionExists(prev)) {
          return prev;
        }
        return [newSession, ...prev];
      });

      // If currently viewing active tab, update sessions display
      if (activeTab === "active") {
        setSessions((prev) => {
          if (sessionExists(prev)) {
            return prev;
          }
          return [newSession, ...prev];
        });
      }
    }

    // Play notification sound immediately (no debouncing for audio)
    chatNotificationService.playNotificationSound();

    // Show text notification with debouncing to prevent spam
    const notificationKey = `chat-session-${newSession.sessionId}`;

    // Clear existing timeout for this session
    if (notificationTimeoutRef.current[newSession.sessionId]) {
      clearTimeout(notificationTimeoutRef.current[newSession.sessionId]);
    }

    // Set new timeout - only show notification if no more events in 500ms
    notificationTimeoutRef.current[newSession.sessionId] = setTimeout(() => {
      message.success({
        content: CHAT_MESSAGES.NEW_SESSION(newSession.customerName),
        key: notificationKey,
        duration: 3,
      });

      // Clean up timeout reference
      delete notificationTimeoutRef.current[newSession.sessionId];
    }, 500);
  };

  // Auto-load all sessions when component mounts (when clicking Q&A)
  handleNewSessionNotificationRef.current = handleNewSessionNotification;
  useEffect(() => {
    console.log("[STAFF CHAT] Component mounted, loading sessions...");
    loadAllSessionsRef.current?.();
    const processedSessions = processedSessionsRef.current;
    const notificationTimeouts = notificationTimeoutRef.current;

    // Cleanup on unmount
    return () => {
      console.log(
        "🧹 [STAFF CHAT] Component unmounting, clearing processed sessions..."
      );
      processedSessions.clear();

      // Clear all pending notification timeouts
      Object.values(notificationTimeouts).forEach((timeout) => {
        clearTimeout(timeout);
      });
      notificationTimeoutRef.current = {};
    };
  }, []);

  // Handle new message from WebSocket to update unread count and display message
  const handleNewMessage = (message) => {
    console.log("📨 [STAFF CHAT] New message received:", message);
    console.log(
      "📨 [STAFF CHAT] Current selected session:",
      selectedSession?.sessionId
    );
    console.log("📨 [STAFF CHAT] Message session:", message.sessionId);

    // If this is the currently selected session, add message to display immediately
    if (selectedSession?.sessionId === message.sessionId) {
      console.log(
        "📨 [STAFF CHAT] Adding message to current session:",
        message
      );

      // Double check session ID match before adding message
      if (selectedSession.sessionId === message.sessionId) {
        // Add message to current chat interface using the addMessage method
        if (addMessage && typeof addMessage === "function") {
          console.log("📨 [STAFF CHAT] Calling addMessage with:", message);
          addMessage(message);
        } else {
          console.warn("⚠️ [STAFF CHAT] addMessage function not available");
        }

        // Also trigger a refresh to ensure sync
        setTimeout(() => {
          if (refetchMessages && typeof refetchMessages === "function") {
            refetchMessages();
          }
        }, 500);
      } else {
        console.warn("⚠️ [STAFF CHAT] Session ID mismatch, not adding message");
      }
    } else {
      // Update unread count for other sessions
      console.log(
        "📨 [STAFF CHAT] Updating unread count for session:",
        message.sessionId
      );

      // Update waiting sessions
      setWaitingSessions((prev) =>
        prev.map((session) =>
          session.sessionId === message.sessionId
            ? {
                ...session,
                unreadCount: (session.unreadCount || 0) + 1,
                lastMessage: message.message,
                lastMessageTime: message.timestamp || new Date().toISOString(),
              }
            : session
        )
      );

      // Update active sessions
      setActiveSessions((prev) =>
        prev.map((session) =>
          session.sessionId === message.sessionId
            ? {
                ...session,
                unreadCount: (session.unreadCount || 0) + 1,
                lastMessage: message.message,
                lastMessageTime: message.timestamp || new Date().toISOString(),
              }
            : session
        )
      );

      // Update current sessions display
      setSessions((prev) =>
        prev.map((session) =>
          session.sessionId === message.sessionId
            ? {
                ...session,
                unreadCount: (session.unreadCount || 0) + 1,
                lastMessage: message.message,
                lastMessageTime: message.timestamp || new Date().toISOString(),
              }
            : session
        )
      );
    }
  };

  // Subscribe to new session notifications and staff messages when WebSocket is connected
  handleNewMessageRef.current = handleNewMessage;
  useEffect(() => {
    // Prevent multiple subscriptions
    if (subscriptionRef.current) {
      console.log("⚠️ [STAFF CHAT] Subscription already exists, skipping...");
      return;
    }

    if (wsConnected && chatWebSocketService) {
      console.log("🔔 [STAFF CHAT] Setting up WebSocket subscriptions...");

      // Subscribe to new session notifications
      const newSessionSubscription =
        chatWebSocketService.subscribeToNewSessions((newSession) => {
          console.log(
            "🔔 [STAFF CHAT] New session notification received:",
            newSession
          );
          handleNewSessionNotificationRef.current?.(newSession);
        });

      // Subscribe to staff messages for unread count updates
      const staffMessagesSubscription =
        chatWebSocketService.subscribeToStaffMessages((message) => {
          console.log("📨 [STAFF CHAT] Staff message received:", message);
          handleNewMessageRef.current?.(message);
        });

      if (newSessionSubscription || staffMessagesSubscription) {
        subscriptionRef.current = {
          newSession: newSessionSubscription,
          staffMessages: staffMessagesSubscription,
        };
        console.log(
          "[STAFF CHAT] Successfully subscribed to WebSocket notifications"
        );
      }
    }

    // Cleanup function to prevent multiple subscriptions
    return () => {
      if (subscriptionRef.current) {
        console.log("[STAFF CHAT] Cleaning up WebSocket subscriptions...");

        // Unsubscribe from all subscriptions
        if (subscriptionRef.current.newSession) {
          subscriptionRef.current.newSession.unsubscribe();
        }
        if (subscriptionRef.current.staffMessages) {
          subscriptionRef.current.staffMessages.unsubscribe();
        }

        subscriptionRef.current = null;
        console.log("[STAFF CHAT] WebSocket subscriptions cleaned up");
      }
    };
  }, [wsConnected, chatWebSocketService]);

  // Reset unread count when user selects a session
  const resetUnreadCountForSession = (sessionId) => {
    console.log(
      `[STAFF CHAT] Resetting unread count for session: ${sessionId}`
    );

    // Update waiting sessions
    setWaitingSessions((prev) =>
      prev.map((session) =>
        session.sessionId === sessionId
          ? { ...session, unreadCount: 0 }
          : session
      )
    );

    // Update active sessions
    setActiveSessions((prev) =>
      prev.map((session) =>
        session.sessionId === sessionId
          ? { ...session, unreadCount: 0 }
          : session
      )
    );

    // Update current sessions display
    setSessions((prev) =>
      prev.map((session) =>
        session.sessionId === sessionId
          ? { ...session, unreadCount: 0 }
          : session
      )
    );
  };

  // Refresh unread counts for current sessions
  const refreshUnreadCounts = async () => {
    try {
      if (sessions.length === 0) return;

      // Only refresh unread counts for active sessions (waiting sessions don't need it)
      if (activeTab === "active") {
        const updatedSessions = await fetchUnreadCountsForSessions(
          sessions,
          "STAFF"
        );
        setActiveSessions(updatedSessions);
        setSessions(updatedSessions);
      }
      // For waiting tab, no need to refresh unread counts
    } catch (error) {
      console.error("Error refreshing unread counts:", error);
    }
  };

  // Handle session selection
  const handleSessionSelect = async (session) => {
    // Reset unread count for the selected session
    resetUnreadCountForSession(session.sessionId);

    // Always mark messages as read when clicking on a session (even if already selected)
    await markMessagesAsRead(session.sessionId);

    try {
      // If this is a WAITING session in the waiting tab, join it first
      if (session.status === "WAITING" && activeTab === "waiting") {
        console.log("[STAFF CHAT] Joining WAITING session...");
        const joinedSession = await chatAPIService.joinSession(
          session.sessionId
        );
        console.log("[STAFF CHAT] Session joined successfully:", joinedSession);

        // Send automatic greeting message when staff joins
        try {
          const staffName = "Nhân viên hỗ trợ";
          const greetingMessage = "Xin chào, tôi có thể giúp gì cho bạn?";

          // Send greeting message via unified API
          await unifiedChatAPI.sendMessage(
            session.sessionId,
            greetingMessage,
            staffName,
            true // isStaff = true
          );

          // Show success notification
          message.success(CHAT_MESSAGES.GREETING_SENT(session.customerName));

          // Refresh unread counts after sending greeting message
          setTimeout(() => {
            refreshUnreadCounts();
          }, 1000);
        } catch (error) {
          console.error("Failed to send greeting message:", error);
          message.error(CHAT_MESSAGES.GREETING_FAILED);
        }

        // Update selected session with joined session data
        setSelectedSession(joinedSession);
        message.success(CHAT_MESSAGES.SESSION_JOINED(session.customerName));

        // Reload active tab to show the newly joined session
        setTimeout(() => {
          loadSessionsForTab("active");
        }, 500);
      } else {
        // Normal session selection - clear messages first
        console.log("[STAFF CHAT] Switching to session:", session.sessionId);

        // Clear previous messages immediately
        clearMessages();

        // Set selected session (this will trigger useRealTimeMessages to fetch new messages)
        setSelectedSession(session);
      }

      // Reset previous messages length to prevent unwanted scroll
      setPreviousMessagesLength(0);

      // On smaller screens, scroll to chat area smoothly
      setTimeout(() => {
        const chatArea = document.querySelector(".chat-card");
        if (chatArea && window.innerWidth < 768) {
          chatArea.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }

        // Focus input after selecting session (without scrolling)
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 200);
    } catch (error) {
      console.error("Error handling session selection:", error);
      message.error(CHAT_MESSAGES.SESSION_JOIN_FAILED);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSession) return;

    const messageText = inputMessage;
    const sessionId = selectedSession.sessionId;
    const staffName = currentUser?.name || "Nhân viên hỗ trợ";

    // Clear input immediately for better UX
    setInputMessage("");

    try {
      // Send message via unified API
      await unifiedChatAPI.sendMessage(
        sessionId,
        messageText,
        staffName,
        true // isStaff = true
      );

      // Trigger immediate refetch to get the sent message
      if (refetchMessages) {
        setTimeout(() => {
          refetchMessages();
        }, 500);
      }

      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);

      // Refresh unread counts after sending message
      setTimeout(() => {
        refreshUnreadCounts();
      }, 1000);

      // Update session's last message
      setSessions((prev) =>
        prev.map((session) =>
          session.sessionId === sessionId
            ? {
                ...session,
                lastMessage: messageText,
                lastMessageTime: new Date().toISOString(),
              }
            : session
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      message.error(CHAT_MESSAGES.MESSAGE_SEND_FAILED);

      // Restore input text on error
      setInputMessage(messageText);
    }
  };

  // Handle end session
  const handleEndSession = async (sessionId, customerName, event) => {
    // Prevent event bubbling to avoid triggering session selection
    event.stopPropagation();

    try {
      console.log(`🔚 [STAFF CHAT] Ending session: ${sessionId}`);

      // Show confirmation modal
      Modal.confirm({
        title: CHAT_MESSAGES.END_SESSION_TITLE,
        content: CHAT_MESSAGES.END_SESSION_CONFIRM(customerName),
        okText: CHAT_MESSAGES.END_SESSION_ACTION,
        cancelText: CHAT_MESSAGES.CANCEL,
        okType: "danger",
        onOk: async () => {
          try {
            // Call end session API
            await chatAPIService.endSession(sessionId);

            console.log(
              `[STAFF CHAT] Successfully ended session: ${sessionId}`
            );

            // Show success message
            message.success(CHAT_MESSAGES.END_SESSION_SUCCESS(customerName));

            // Remove from active sessions
            setActiveSessions((prev) =>
              prev.filter((s) => s.sessionId !== sessionId)
            );

            // Clear selected session if it was the ended one
            if (selectedSession?.sessionId === sessionId) {
              setSelectedSession(null);
              clearMessages();
            }

            // Refresh sessions
            setTimeout(() => {
              loadSessionsForTab("active");
            }, 500);
          } catch (error) {
            console.error(" [STAFF CHAT] Error ending session:", error);
            message.error(CHAT_MESSAGES.END_SESSION_FAILED);
          }
        },
      });
    } catch (error) {
      console.error(" [STAFF CHAT] Error in handleEndSession:", error);
      message.error(CHAT_MESSAGES.UNKNOWN_ERROR);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Utility functions removed - not used in current implementation

  return (
    <StaffChatView
      activeTab={activeTab}
      hideTabs={hideTabs}
      handleTabChange={handleTabChange}
      waitingSessions={waitingSessions}
      activeSessions={activeSessions}
      sessions={sessions}
      selectedSession={selectedSession}
      loading={loading}
      realTimeMessages={realTimeMessages}
      messagesLoading={messagesLoading}
      inputMessage={inputMessage}
      setInputMessage={setInputMessage}
      handleSessionSelect={handleSessionSelect}
      handleSendMessage={handleSendMessage}
      handleEndSession={handleEndSession}
      handleKeyPress={handleKeyPress}
      wsConnected={wsConnected}
      messagesEndRef={messagesEndRef}
      inputRef={inputRef}
      onReload={() => {
        setWaitingSessions([]);
        setActiveSessions([]);
        loadAllSessions();
      }}
    />
  );
};

export default StaffChatInterface;
