import React from "react";
import { notification, Avatar, Button, Space, Typography } from "antd";
import {
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

/**
 * Chat Notification Service
 * Hiển thị thông báo real-time cho staff khi có chat session mới
 */
class ChatNotificationService {
  constructor() {
    this.notificationQueue = [];
    this.isShowing = false;
  }

  /**
   * Hiển thị thông báo chat session mới
   */
  showNewSessionNotification(sessionData) {
    const {
      sessionId,
      customerName,
      status,
      createdAt,
      lastMessage,
      unreadCount = 1,
    } = sessionData;

    // Format thời gian
    const timeAgo = this.formatTimeAgo(createdAt);

    // Tạo nội dung thông báo
    const notificationContent = (
      <div style={{ padding: "8px 0" }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          {/* Header với avatar và tên customer */}
          <Space>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#1890ff",
                color: "white",
              }}
            />
            <div>
              <Text strong style={{ fontSize: "14px" }}>
                {customerName || "Khách hàng"}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {timeAgo}
              </Text>
            </div>
          </Space>

          {/* Message preview */}
          {lastMessage && (
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "8px 12px",
                borderRadius: "6px",
                marginTop: "8px",
              }}
            >
              <Text style={{ fontSize: "13px", color: "#666" }}>
                "
                {lastMessage.length > 50
                  ? lastMessage.substring(0, 50) + "..."
                  : lastMessage}
                "
              </Text>
            </div>
          )}

          {/* Status và unread count */}
          <Space style={{ marginTop: "8px" }}>
            <div
              style={{
                backgroundColor: status === "WAITING" ? "#faad14" : "#52c41a",
                color: "white",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: "500",
              }}
            >
              {status === "WAITING" ? "Đang chờ" : "Đang hoạt động"}
            </div>
            {unreadCount > 0 && (
              <div
                style={{
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  minWidth: "18px",
                  textAlign: "center",
                }}
              >
                {unreadCount}
              </div>
            )}
          </Space>
        </Space>
      </div>
    );

    // Hiển thị notification
    notification.open({
      message: (
        <Space>
          <MessageOutlined style={{ color: "#1890ff" }} />
          <Text strong>Chat mới từ khách hàng</Text>
        </Space>
      ),
      description: notificationContent,
      placement: "topRight",
      duration: 8, // Hiển thị 8 giây
      style: {
        width: 350,
        borderLeft: "4px solid #1890ff",
      },
      btn: (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => {
              this.handleAcceptChat(sessionId);
              notification.destroy();
            }}
          >
            Trả lời
          </Button>
          <Button
            size="small"
            onClick={() => {
              notification.destroy();
            }}
          >
            Đóng
          </Button>
        </Space>
      ),
      onClose: () => {
        console.log("🔔 [NOTIFICATION] Chat notification closed");
      },
    });

    // Play notification sound (optional)
    this.playNotificationSound();

    console.log("🔔 [NOTIFICATION] New chat notification displayed:", {
      sessionId,
      customerName,
      status,
      timeAgo,
    });
  }

  /**
   * Xử lý khi staff click "Trả lời"
   */
  handleAcceptChat(sessionId) {
    console.log("[NOTIFICATION] Staff accepted chat:", sessionId);

    // Có thể thêm logic:
    // 1. Navigate to chat interface
    // 2. Auto-select session
    // 3. Mark as active
    // 4. Send notification to customer

    // Trigger custom event để component khác có thể listen
    window.dispatchEvent(
      new CustomEvent("chatAccepted", {
        detail: { sessionId },
      })
    );
  }

  /**
   * Format thời gian hiển thị
   */
  formatTimeAgo(timestamp) {
    if (!timestamp) return "Vừa xong";

    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) {
      return "Vừa xong";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      return time.toLocaleDateString("vi-VN");
    }
  }

  /**
   * Play notification sound
   */
  playNotificationSound() {
    try {
      // Tạo audio context để play notification sound
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("🔊 [NOTIFICATION] Could not play sound:", error);
    }
  }

  /**
   * Hiển thị thông báo lỗi connection
   */
  showConnectionError() {
    notification.error({
      message: "Lỗi kết nối Chat",
      description: "Không thể kết nối đến hệ thống chat. Vui lòng thử lại.",
      placement: "topRight",
      duration: 5,
    });
  }

  /**
   * Hiển thị thông báo thành công
   */
  showConnectionSuccess() {
    notification.success({
      message: "Kết nối Chat thành công",
      description: "Hệ thống chat đã sẵn sàng nhận thông báo.",
      placement: "topRight",
      duration: 3,
    });
  }
}

export default ChatNotificationService;
