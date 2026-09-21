import React from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  ReloadOutlined,
  SendOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  getAvatarColor,
  getMessageBubbleStyle,
  getMessageColors,
} from "../../../Chat/chatColors";

const { Text } = Typography;
const { TextArea } = Input;

const StaffChatView = ({
  activeTab,
  hideTabs,
  handleTabChange,
  waitingSessions,
  activeSessions,
  sessions,
  selectedSession,
  loading,
  realTimeMessages,
  messagesLoading,
  inputMessage,
  setInputMessage,
  handleSessionSelect,
  handleSendMessage,
  handleEndSession,
  handleKeyPress,
  wsConnected,
  messagesEndRef,
  inputRef,
  onReload,
}) => {
  return (
    <div className="staff-chat-interface">
      {/* WebSocket Status Indicator */}
      <div style={{ marginBottom: "8px", textAlign: "right" }}>
        <Space>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Realtime:
          </Text>
          <Badge
            status={wsConnected ? "success" : "error"}
            text={wsConnected ? "Kết nối" : "Mất kết nối"}
            style={{ fontSize: "12px" }}
          />
        </Space>
      </div>

      {/* Tabs for Q&A Status - Only show if not hidden */}
      {!hideTabs && (
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          style={{ marginBottom: "16px" }}
          items={[
            {
              key: "waiting",
              label: (
                <Space>
                  <ClockCircleOutlined />
                  <span>Đang chờ</span>
                  <Badge
                    count={
                      waitingSessions.filter((s) => s.unreadCount > 0).length
                    }
                    size="small"
                  />
                </Space>
              ),
            },
            {
              key: "active",
              label: (
                <Space>
                  <CheckCircleOutlined />
                  <span>Đang hoạt động</span>
                  <Badge
                    count={
                      activeSessions.filter((s) => s.unreadCount > 0).length
                    }
                    size="small"
                  />
                </Space>
              ),
            },
          ]}
        />
      )}

      <Row
        gutter={16}
        style={{
          height: hideTabs ? "100%" : "calc(100% - 60px)",
          overflow: "hidden", // Prevent vertical scroll
        }}
      >
        {/* Sessions List */}
        <Col
          xs={24}
          sm={24}
          md={10}
          lg={8}
          xl={8}
          style={{
            height: "100%",
            paddingBottom: selectedSession ? "8px" : "0", // Add space when chat is active
          }}
        >
          <Card
            title={
              <Space>
                <MessageOutlined />
                <span>
                  {activeTab === "waiting"
                    ? "Đang chờ phản hồi"
                    : "Đang hoạt động"}
                </span>
                <Badge
                  count={sessions.filter((s) => s.unreadCount > 0).length}
                />
              </Space>
            }
            extra={
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={onReload}
                loading={loading}
                title="Refresh"
              />
            }
            className="sessions-card"
          >
            <div
              className="sessions-list-container"
              style={{
                maxHeight: "500px", // Giới hạn chiều cao
                overflowY: "auto", // Thêm scroll dọc
                overflowX: "hidden", // Ẩn scroll ngang
              }}
            >
              {loading ? (
                <div
                  className="loading-container"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 20px",
                    minHeight: "200px",
                  }}
                >
                  <Spin size="large" />
                  <Text style={{ marginTop: 16, color: "#8c8c8c" }}>
                    Đang tải chat sessions...
                  </Text>
                </div>
              ) : sessions.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text type="secondary">
                      {activeTab === "waiting"
                        ? "Không có cuộc trò chuyện đang chờ"
                        : "Không có cuộc trò chuyện đang hoạt động"}
                    </Text>
                  }
                  style={{ padding: "40px 20px" }}
                />
              ) : (
                <div className="sessions-list" style={{ padding: "8px 0" }}>
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className={`session-card ${
                        selectedSession?.sessionId === session.sessionId
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSessionSelect(session)}
                      style={{
                        padding: "12px 16px",
                        margin: "4px 8px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        backgroundColor:
                          selectedSession?.sessionId === session.sessionId
                            ? "#e6f7ff"
                            : "transparent",
                        border:
                          selectedSession?.sessionId === session.sessionId
                            ? "1px solid #1890ff"
                            : "1px solid transparent",
                        ":hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSession?.sessionId !== session.sessionId) {
                          e.target.style.backgroundColor = "#f5f5f5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSession?.sessionId !== session.sessionId) {
                          e.target.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {/* Session Header */}
                      <div
                        className="session-header"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <div
                          className="session-avatar-container"
                          style={{ position: "relative" }}
                        >
                          <Avatar
                            size={44}
                            style={{
                              backgroundColor:
                                session.status === "WAITING"
                                  ? "#ff7a00"
                                  : "#52c41a",
                              fontSize: "16px",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {session.customerName?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </Avatar>
                          {session.unreadCount > 0 && (
                            <Badge
                              count={session.unreadCount}
                              style={{
                                position: "absolute",
                                top: "-2px",
                                right: "-2px",
                                minWidth: "18px",
                                height: "18px",
                                lineHeight: "18px",
                                fontSize: "11px",
                              }}
                            />
                          )}
                          {/* Online status indicator */}
                          <div
                            className="status-indicator"
                            style={{
                              position: "absolute",
                              bottom: "2px",
                              right: "2px",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              backgroundColor:
                                session.status === "ACTIVE"
                                  ? "#52c41a"
                                  : "#faad14",
                              border: "2px solid white",
                              boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                            }}
                          />
                        </div>

                        <div
                          className="session-info"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <div
                            className="session-name-row"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "4px",
                            }}
                          >
                            <Text
                              strong
                              className="customer-name"
                              style={{
                                fontSize: "15px",
                                color: "#262626",
                                lineHeight: "20px",
                                fontWeight: "600",
                              }}
                            >
                              {session.customerName}
                            </Text>
                            <Text
                              type="secondary"
                              className="session-time"
                              style={{
                                fontSize: "11px",
                                color: "#8c8c8c",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {session.updatedAt
                                ? new Date(
                                    session.updatedAt
                                  ).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Mới"}
                            </Text>
                          </div>

                          <div
                            className="session-preview"
                            style={{ marginBottom: "6px" }}
                          >
                            <Text
                              type="secondary"
                              className="last-message"
                              style={{
                                fontSize: "13px",
                                color: "#595959",
                                lineHeight: "18px",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {session.lastMessage ||
                                (session.status === "WAITING"
                                  ? "Khách hàng đang chờ phản hồi..."
                                  : "Cuộc trò chuyện đang diễn ra")}
                            </Text>
                          </div>

                          <div
                            className="session-tags-and-actions"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              className="session-tags"
                              style={{
                                display: "flex",
                                gap: "4px",
                                flexWrap: "wrap",
                              }}
                            >
                              <Tag
                                color={
                                  session.status === "WAITING"
                                    ? "orange"
                                    : "green"
                                }
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  border: "none",
                                  fontWeight: "500",
                                  margin: 0,
                                }}
                              >
                                {session.status === "WAITING"
                                  ? "Chờ phản hồi"
                                  : "Đang hoạt động"}
                              </Tag>
                              {session.staffName && (
                                <Tag
                                  color="blue"
                                  style={{
                                    fontSize: "10px",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    border: "none",
                                    fontWeight: "500",
                                    margin: 0,
                                  }}
                                >
                                  {session.staffName}
                                </Tag>
                              )}
                            </div>

                            {/* End Session Button - Only show in active tab */}
                            {activeTab === "active" &&
                              session.status === "ACTIVE" && (
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<StopOutlined />}
                                  onClick={(e) =>
                                    handleEndSession(
                                      session.sessionId,
                                      session.customerName,
                                      e
                                    )
                                  }
                                  style={{
                                    fontSize: "12px",
                                    padding: "4px 8px",
                                    height: "28px",
                                    minWidth: "28px",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  title="Kết thúc cuộc trò chuyện"
                                />
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Chat Area */}
        <Col
          xs={24}
          sm={24}
          md={14}
          lg={16}
          xl={16}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedSession ? (
            <Card
              title={
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong>{selectedSession.customerName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {selectedSession.topic}
                    </Text>
                  </div>
                </Space>
              }
              className="chat-card"
            >
              {/* Messages Area */}
              <div
                className="messages-container"
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  scrollBehavior: "smooth",
                }}
              >
                {messagesLoading ? (
                  <div
                    className="loading-messages"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Spin size="small" />
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Đang tải tin nhắn...
                    </Text>
                  </div>
                ) : realTimeMessages.length === 0 ? (
                  <div
                    className="no-messages"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Text type="secondary">
                      Chưa có tin nhắn nào trong cuộc trò chuyện này
                    </Text>
                  </div>
                ) : (
                  realTimeMessages
                    .sort(
                      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                    )
                    .map((msg) => (
                      <div
                        key={`${msg.id}-${msg.senderType}`}
                        className={`message-item ${msg.senderType.toLowerCase()}`}
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
                              style={{ fontSize: "14px", color: "#333" }}
                            >
                              {msg.senderName}
                            </Text>
                            <Text
                              type="secondary"
                              style={{ fontSize: "12px", marginLeft: "8px" }}
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
                    ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* Input Area */}
              <div
                className="input-area chat-input-container"
                style={{
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: "1px solid #f0f0f0",
                  flexShrink: 0,
                }}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <TextArea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Nhập tin nhắn cho ${selectedSession.customerName}...`}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    style={{ flex: 1, marginRight: "8px" }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    style={{ height: "auto", color: "white" }}
                  ></Button>
                </Space.Compact>
              </div>
            </Card>
          ) : (
            <Card className="chat-card">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chọn một chat session để bắt đầu trò chuyện"
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default StaffChatView;
