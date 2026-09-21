import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Input,
  Avatar,
  Badge,
  Typography,
  Tooltip,
  Tag,
  Space,
  message,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  UserOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRealTimeMessages } from "./hooks/useRealTimeMessages";
import chatApi from "./chatApi";
import unifiedChatAPI from "./unifiedChatAPI";
import { CUSTOMER_CHAT_MESSAGES } from "./chatMessages";
import {
  getMessageColors,
  getAvatarColor,
  getMessageBubbleStyle,
} from "./chatColors";
import authStorage from "../../shared/storage/authStorage";
import { createWebSocketClient } from "../../shared/api/websocketClient";
import storage from "../../shared/storage/storage";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import "./CustomerChatWidget.css";

const { Text } = Typography;

const createCustomerStompClient = () => {
  const client = createWebSocketClient();

  return {
    debug: () => {},
    connect: (_, onConnect, onError) => {
      client.connect().then(() => onConnect?.({})).catch(onError);
    },
    subscribe: (destination, callback) =>
      client.subscribe(destination, (payload) =>
        callback?.({ body: JSON.stringify(payload) })
      ),
    disconnect: () => client.disconnect(),
  };
};

/**
 * Customer Chat Widget - Discord-like Interface
 */
const CustomerChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showNameForm, setShowNameForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [staffOnline, setStaffOnline] = useState(false);
  const [staffTyping, setStaffTyping] = useState(false);
  const [sessionStatus, setSessionStatus] = useState("WAITING"); // WAITING, ACTIVE, COMPLETED
  const [unreadCount, setUnreadCount] = useState(() => {
    // Load unread count from localStorage on init
    const saved = storage.get(STORAGE_KEYS.CHAT_UNREAD_COUNT);
    return saved ? parseInt(saved, 10) : 0;
  });
  // Real-time messages hook
  const {
    messages,
    clearMessages,
    refetch: refetchMessages,
  } = useRealTimeMessages(
    sessionId,
    sessionStatus === "ACTIVE", // isActive when the session is active
    false // isStaff = false for customer
  );
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const stompClientRef = useRef(null);
  const wsConnectedRef = useRef(false);
  const connectWebSocketRef = useRef(null);
  const disconnectWebSocketRef = useRef(null);

  // Auto mark-read function for customer
  const markMessagesAsRead = useCallback(async (sessionId) => {
    if (!sessionId || !customerName) return;

    try {
      const readerName = customerName; // Customer reader name
      await chatApi.markMessagesAsRead(sessionId, readerName);

      // Reset unread count after marking as read
      setUnreadCount(0);
      storage.set(STORAGE_KEYS.CHAT_UNREAD_COUNT, "0");
    } catch {
      return;
    }
  }, [customerName]);
  const navigate = useNavigate();

  // Get current user info from Redux store first, then fallback to localStorage
  const reduxUser = useSelector((state) => state.user?.user);
  const currentUser = reduxUser || authStorage.getUser() || {};
  const userRole = currentUser?.role || "CUSTOMER";

  // Auto mark-read when new messages arrive and chat is open
  useEffect(() => {
    if (sessionId && messages.length > 0 && isOpen) {
      // Mark messages as read when user is actively viewing the chat
      markMessagesAsRead(sessionId);
    }
  }, [messages.length, sessionId, isOpen, markMessagesAsRead]);

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    if (wsConnectedRef.current || !sessionId) return;

    try {
      const stompClient = createCustomerStompClient();

      // Disable debug logging
      stompClient.debug = () => {};

      stompClient.connect(
        {},
        () => {
          wsConnectedRef.current = true;
          stompClientRef.current = stompClient;

          // Subscribe to session messages
          stompClient.subscribe(`/topic/chat/${sessionId}`, (message) => {
            try {
              const data = JSON.parse(message.body);

              // Handle real-time message via WebSocket
              if (data.message) {
                // If this is the first staff message, update status to ACTIVE
                if (
                  data.senderType === "STAFF" &&
                  sessionStatus === "WAITING"
                ) {
                  setStaffOnline(true);
                  setSessionStatus("ACTIVE");

                  // Clear bot messages - let polling fetch the real message
                  clearMessages();
                }

                // Update unread count if widget is closed and message is from staff
                if (!isOpen && data.senderType === "STAFF") {
                  setUnreadCount((prev) => {
                    const newCount = prev + 1;
                    // Save to localStorage
                    storage.set(
                      STORAGE_KEYS.CHAT_UNREAD_COUNT,
                      newCount.toString()
                    );
                    return newCount;
                  });
                }

                // Trigger refetch to sync with backend (get real message from server)
                setTimeout(() => refetchMessages(), 500);
              }

              // Handle typing indicators
              if (data.type === "TYPING_START") {
                setStaffTyping(true);
              } else if (data.type === "TYPING_STOP") {
                setStaffTyping(false);
              }
            } catch {
              return;
            }
          });

          // Subscribe to session status updates
          stompClient.subscribe(
            `/topic/chat/${sessionId}/status`,
            (message) => {
              try {
                const data = JSON.parse(message.body);

                if (data.status) {
                  setSessionStatus(data.status);

                  if (data.status === "ACTIVE") {
                    setStaffOnline(true);
                  } else if (data.status === "COMPLETED") {
                    setStaffOnline(false);
                  }
                }
              } catch {
                return;
              }
            }
          );
        },
        () => {
          wsConnectedRef.current = false;

          // Retry connection after 5 seconds
          setTimeout(() => {
            if (sessionId) connectWebSocket();
          }, 5000);
        }
      );
    } catch {
      wsConnectedRef.current = false;
    }
  }, [sessionId, sessionStatus, isOpen, clearMessages, refetchMessages]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (stompClientRef.current && wsConnectedRef.current) {
      stompClientRef.current.disconnect();
      wsConnectedRef.current = false;
      stompClientRef.current = null;
    }
  }, []);

  connectWebSocketRef.current = connectWebSocket;
  disconnectWebSocketRef.current = disconnectWebSocket;

  // Start chat session API call (no auth required)
  const startChatSession = async (name) => {
    const requestBody = {
      customerName: name || CUSTOMER_CHAT_MESSAGES.DEFAULT_CUSTOMER_NAME,
    };

    const response = await chatApi.createChatSession(
      requestBody.customerName
    );

    if (response?.sessionId) {
      setSessionId(response.sessionId);
      setIsConnected(true);
      setShowNameForm(false);

      // Set initial session status to WAITING
      setSessionStatus("WAITING");
      setStaffOnline(false);

      // Connect WebSocket for real-time updates
      setTimeout(() => {
        connectWebSocket();
      }, 1000);
    }

    return response;
  };

  // Handle name form submission
  const handleNameSubmit = async () => {
    if (!customerName.trim()) {
      return;
    }

    try {
      await startChatSession(customerName);
    } catch {
      message.error(CUSTOMER_CHAT_MESSAGES.SESSION_START_FAILED);
      setShowNameForm(true);
    }
  };

  // Handle name form key press
  const handleNameKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNameSubmit();
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect WebSocket when sessionId is available
  useEffect(() => {
    if (sessionId && !wsConnectedRef.current) {
      connectWebSocketRef.current?.();
    }

    // Cleanup on unmount or sessionId change
    return () => {
      if (wsConnectedRef.current) {
        disconnectWebSocketRef.current?.();
      }
    };
  }, [sessionId]);

  // Save unread count to localStorage
  const saveUnreadCount = useCallback((count) => {
    storage.set(STORAGE_KEYS.CHAT_UNREAD_COUNT, count.toString());
  }, []);

  // Update unread count with persistence
  const updateUnreadCount = useCallback((newCount) => {
    setUnreadCount(newCount);
    saveUnreadCount(newCount);
  }, [saveUnreadCount]);

  // Fetch unread count from server
  const fetchUnreadCount = useCallback(async () => {
    if (!sessionId || !customerName) return;

    try {
      const count = await chatApi.getUnreadCount(
        sessionId,
        customerName
      );
      updateUnreadCount(count);
    } catch {
      return;
    }
  }, [sessionId, customerName, updateUnreadCount]);

  // Load unread count when session is established
  useEffect(() => {
    if (sessionId && customerName && !isOpen) {
      fetchUnreadCount();
    }
  }, [sessionId, customerName, isOpen, fetchUnreadCount]);

  // Handle new messages for unread count - track previous message count
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      // Only count messages from staff when widget is closed
      const staffMessages = messages.filter(
        (msg) => msg.senderType === "STAFF" && msg.senderName !== customerName
      );

      // Check if we have new staff messages compared to previous count
      const currentStaffCount = staffMessages.length;
      const previousStaffCount = prevMessageCountRef.current;

      if (currentStaffCount > previousStaffCount) {
        const newMessagesCount = currentStaffCount - previousStaffCount;

        // Increment unread count by the number of new messages
        setUnreadCount((prev) => {
          const newCount = prev + newMessagesCount;
          saveUnreadCount(newCount);
          return newCount;
        });
      }

      // Update the reference for next comparison
      prevMessageCountRef.current = currentStaffCount;
    }
  }, [messages, isOpen, customerName, saveUnreadCount]);

  // Reset unread count when widget opens
  useEffect(() => {
    if (isOpen) {
      updateUnreadCount(0);

      // Reset the message count reference when opening
      const staffMessages = messages.filter(
        (msg) => msg.senderType === "STAFF" && msg.senderName !== customerName
      );
      prevMessageCountRef.current = staffMessages.length;

      // Save current timestamp as last seen
      storage.set(
        STORAGE_KEYS.CHAT_LAST_SEEN_TIMESTAMP,
        new Date().toISOString()
      );

      // Mark messages as read on server if session exists
      if (sessionId && customerName) {
        markMessagesAsRead(sessionId);
      }
    }
  }, [
    isOpen,
    sessionId,
    customerName,
    messages,
    updateUnreadCount,
    markMessagesAsRead,
  ]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const messageText = inputMessage.trim();
    // Use the customerName from state (entered in name form)

    // Add message to local state immediately for better UX
    // Clear input immediately for better UX
    setInputMessage("");

    // Send message via REST API (more reliable)
    try {

      await unifiedChatAPI.sendMessage(
        sessionId,
        messageText,
        customerName,
        false // isStaff = false for customer
      );


      // Trigger immediate refetch to get the sent message
      if (refetchMessages) {
        setTimeout(() => {
          refetchMessages();
        }, 500);
      }

      // Don't send via WebSocket - REST API is sufficient
      // WebSocket will receive the message from server after API processes it
    } catch {
      setInputMessage(messageText);
      message.error(CUSTOMER_CHAT_MESSAGES.MESSAGE_SEND_FAILED);

      // Don't add error message optimistically
      // Just log the error and let user retry
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle widget or navigate to staff dashboard
  const toggleWidget = () => {

    // Check multiple role variations
    const isStaff =
      userRole === "STAFF" ||
      userRole?.toUpperCase() === "STAFF" ||
      currentUser?.role === "STAFF" ||
      reduxUser?.role === "STAFF";


    // If user is staff, navigate to Q&A Waiting page
    if (isStaff) {

      // Set selected menu item BEFORE navigation
      storage.set(STORAGE_KEYS.STAFF_SELECTED_MENU_ITEM, "qa_waiting");

      // Navigate to staff dashboard
      navigate("/staff");
      return;
    }


    // For customers, toggle chat widget
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Opening chat widget
      // Show name form if no session exists
      if (!sessionId) {
        setShowNameForm(true);
      }
      // Focus input when opening
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Mark messages as read when customer opens chat widget
      if (sessionId) {
        markMessagesAsRead(sessionId);
      }
    } else {
      // Closing chat widget - save current timestamp and fetch unread count
      storage.set(
        STORAGE_KEYS.CHAT_LAST_SEEN_TIMESTAMP,
        new Date().toISOString()
      );

      if (sessionId && customerName) {
        setTimeout(() => {
          fetchUnreadCount();
        }, 500); // Small delay to ensure any pending messages are processed
      }
    }
  };

  // Initialize connection when widget opens
  useEffect(() => {
    if (isOpen) {
      setIsConnected(true);
      // Don't add welcome message optimistically
      // Let the real chat flow handle initial messages
    }
  }, [isOpen]);

  return (
    <>
      {/* Chat Widget Button */}
      <div className="chat-widget-button" onClick={toggleWidget}>
        <Tooltip
          title={
            userRole === "STAFF"
              ? CUSTOMER_CHAT_MESSAGES.STAFF_TOOLTIP
              : CUSTOMER_CHAT_MESSAGES.CUSTOMER_TOOLTIP
          }
          placement="left"
        >
          <Badge
            count={unreadCount}
            offset={[-8, 8]}
            style={{
              backgroundColor: "#ff4d4f",
              color: "white",
              fontWeight: "bold",
              fontSize: "12px",
              minWidth: "20px",
              height: "20px",
              lineHeight: "20px",
              borderRadius: "10px",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            showZero={false}
          >
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={isOpen ? <CloseOutlined /> : <MessageOutlined />}
              className={`chat-toggle-btn ${isOpen ? "open" : ""}`}
              style={{
                position: "relative",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                transition: "all 0.3s ease",
              }}
            />
          </Badge>
        </Tooltip>
      </div>

      {/* Chat Widget Panel - Only show for customers */}
      {isOpen && userRole !== "STAFF" && (
        <div className="chat-widget-panel">
          <div className="chat-widget-container">
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-status-indicator">
                  <div
                    className={`status-dot ${
                      staffOnline
                        ? "online"
                        : isConnected
                        ? "waiting"
                        : "offline"
                    }`}
                  ></div>
                  <Text strong style={{ color: "#fff" }}>
                    Customer Support
                  </Text>
                  {sessionStatus === "ACTIVE" && (
                    <Tag color="#52c41a" size="small" style={{ marginLeft: 8 }}>
                      <CheckCircleOutlined /> Đang hỗ trợ
                    </Tag>
                  )}
                </div>
                <Space direction="vertical" size={0}>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: "12px",
                    }}
                  >
                    {staffOnline
                      ? "Nhân viên đang online"
                      : sessionStatus === "WAITING"
                      ? "Đang chờ nhân viên..."
                      : isConnected
                      ? "Đang kết nối"
                      : "Ngoại tuyến"}
                  </Text>
                  {staffTyping && (
                    <Text style={{ color: "#52c41a", fontSize: "11px" }}>
                      <LoadingOutlined /> Nhân viên đang nhập...
                    </Text>
                  )}
                </Space>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={toggleWidget}
                style={{ color: "#b9bbbe" }}
              />
            </div>

            {/* Name Form or Messages Area */}
            {showNameForm && !sessionId ? (
              <div className="chat-name-form">
                <Typography.Title level={4}>
                  Xin chào! Vui lòng nhập tên của bạn để bắt đầu cuộc trò chuyện
                </Typography.Title>
                <Input
                  placeholder="Nhập tên của bạn..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onKeyDown={handleNameKeyPress}
                  autoFocus
                />
                <Button
                  type="primary"
                  onClick={handleNameSubmit}
                  disabled={!customerName.trim()}
                  block
                >
                  Bắt đầu trò chuyện
                </Button>
              </div>
            ) : (
              <div className="chat-messages-area">
                {messages
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  .map((msg) => {
                    return (
                      <div
                        key={`${msg.id}-${msg.senderType}`}
                        className={`message-item ${
                          msg.senderType === "STAFF"
                            ? "staff-message"
                            : "customer-message"
                        }`}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "16px",
                          padding: "8px 12px",
                        }}
                      >
                        <Avatar
                          size={32}
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: getAvatarColor(msg.senderType),
                            marginRight: "12px",
                            flexShrink: 0,
                          }}
                        />
                        <div className="message-details" style={{ flex: 1 }}>
                          <div
                            className="message-header"
                            style={{ marginBottom: "4px" }}
                          >
                            <Text
                              strong
                              style={{ color: "white", fontSize: "14px" }}
                            >
                              {msg.senderName}
                            </Text>
                            <Text
                              style={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: "12px",
                                marginLeft: "8px",
                              }}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )}
                            </Text>
                          </div>
                          <div
                            className="message-bubble"
                            style={getMessageBubbleStyle(msg.senderType)}
                          >
                            <Text
                              style={{
                                color: getMessageColors(msg.senderType).text,
                                fontSize: "14px",
                              }}
                            >
                              {msg.message}
                            </Text>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {staffTyping && (
                  <div className="typing-indicator">
                    <Avatar
                      size={40}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#1890ff" }}
                    />
                    <div className="typing-content">
                      <Text style={{ color: "#dcddde" }}>
                        Support đang nhập...
                      </Text>
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area - Only show when staff is connected */}
            {sessionStatus === "ACTIVE" && staffOnline && (
              <div className="chat-input-area">
                <div className="chat-input-container">
                  <Input.TextArea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                  />
                </div>
              </div>
            )}

            {/* Waiting Status Message */}
            {sessionStatus === "WAITING" && (
              <div className="chat-waiting-area">
                <div className="waiting-message">
                  <LoadingOutlined
                    spin
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text style={{ color: "#8c8c8c", fontStyle: "italic" }}>
                    Đang chờ nhân viên hỗ trợ tham gia cuộc trò chuyện...
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerChatWidget;
