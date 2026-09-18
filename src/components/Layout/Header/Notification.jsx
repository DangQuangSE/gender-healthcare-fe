import "./Notification.css";
import { Badge, Popconfirm } from "antd";
import { BellFilled, MoreOutlined } from "@ant-design/icons";
import { formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import { NOTIFICATION_MESSAGES } from "../../../shared/constants/notificationMessages";

const { DROPDOWN } = NOTIFICATION_MESSAGES;

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return DROPDOWN.TIME_JUST_NOW;

  try {
    const date = parseISO(dateTimeString);
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } catch {
    return DROPDOWN.TIME_JUST_NOW;
  }
};

// Format notification message based on type and data
const formatNotificationMessage = (notification) => {
  if (notification.type === "APPOINTMENT" && notification.appointment) {
    const { serviceName, appointmentDate } = notification.appointment;

    if (serviceName && appointmentDate) {
      // Format date to Vietnamese format (DD/MM/YYYY)
      const formattedDate = new Date(appointmentDate).toLocaleDateString(
        "vi-VN"
      );
      return DROPDOWN.APPOINTMENT_FORMAT(serviceName, formattedDate);
    }
  }

  // Fallback to original content
  return notification.content || DROPDOWN.CONTENT_FALLBACK(notification.id);
};

const NotificationDropdown = ({
  notifications,
  loading,
  show,
  toggle,
  onClickNotification,
  onDeleteNotification,
  loadMoreNotifications,
  setNotifications, // Thêm prop để cập nhật danh sách thông báo
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(5);
  const notificationListRef = useRef(null);

  // Lọc thông báo dựa trên trạng thái active và tab đang chọn
  const activeNotifications = notifications.filter((n) => {
    return n.isActive === true;
  });

  const filteredNotifications =
    activeTab === "all"
      ? activeNotifications
      : activeNotifications.filter((n) => !n.isRead);

  // Hiển thị số lượng thông báo giới hạn
  const visibleNotifications = filteredNotifications.slice(0, visibleCount);

  // Reset số lượng hiển thị khi chuyển tab
  useEffect(() => {
    setVisibleCount(5);
  }, [activeTab]);

  // Xử lý sự kiện cuộn để tải thêm thông báo
  const handleScroll = () => {
    if (!notificationListRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      notificationListRef.current;

    // Nếu đã cuộn gần đến cuối danh sách
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      // Tăng số lượng thông báo hiển thị
      if (visibleCount < filteredNotifications.length) {
        setVisibleCount((prev) => prev + 5);
      }

      // Nếu đã hiển thị hết thông báo trong bộ nhớ, tải thêm từ server
      if (
        visibleCount >= filteredNotifications.length - 5 &&
        loadMoreNotifications
      ) {
        loadMoreNotifications();
      }
    }
  };

  // Xử lý xóa thông báo
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Ngăn không cho sự kiện click lan ra ngoài

    try {
      if (onDeleteNotification) {
        await onDeleteNotification(notificationId);
      } else if (setNotifications) {
        setNotifications((previousNotifications) =>
          previousNotifications.filter((item) => item.id !== notificationId)
        );
      }
    } catch {
      // The parent may display a global error notification when needed.
    }
  };

  return (
    <div className="notification-icon">
      <Badge
        count={activeNotifications.filter((n) => !n.isRead).length}
        size="large"
      >
        <div className="notification-circle" onClick={toggle}>
          <BellFilled />
        </div>
      </Badge>

      {show && (
        <div className="simple-notification-dropdown">
          <div className="notification-header">
            <h3>{DROPDOWN.TITLE}</h3>
          </div>

          <div className="notification-tabs">
            <button
              className={`tab-button ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              {DROPDOWN.ALL}
            </button>
            <button
              className={`tab-button ${activeTab === "unread" ? "active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              {DROPDOWN.UNREAD}
            </button>
          </div>

          {loading ? (
            <div className="notification-loading">{DROPDOWN.LOADING}</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notification-empty">
              {activeTab === "all"
                ? DROPDOWN.EMPTY
                : DROPDOWN.EMPTY_UNREAD}
            </div>
          ) : (
            <>
              <div
                className="notification-list"
                ref={notificationListRef}
                onScroll={handleScroll}
              >
                {visibleNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item-appointment ${
                      !n.isRead ? "unread" : ""
                    }`}
                  >
                    <div
                      className="notification-content"
                      onClick={() => onClickNotification(n)}
                    >
                      <h4 className="notification-title">
                        {n.title || NOTIFICATION_MESSAGES.HEADER.TITLE_FALLBACK}
                      </h4>
                      <p
                        className="notification-message"
                      >
                        {formatNotificationMessage(n)}
                      </p>
                      <span className="notification-time">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <div className="notification-actions">
                      <Popconfirm
                        title={DROPDOWN.DELETE_TITLE}
                        description={DROPDOWN.DELETE_DESCRIPTION}
                        onConfirm={(e) => handleDeleteNotification(e, n.id)}
                        okText={DROPDOWN.DELETE_CONFIRM}
                        cancelText={DROPDOWN.DELETE_CANCEL}
                      >
                        <button className="notification-action-button">
                          <MoreOutlined />
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                ))}

                {visibleCount < filteredNotifications.length && (
                  <div className="notification-load-more">
                    <button
                      className="load-more-button"
                      onClick={() => setVisibleCount((prev) => prev + 5)}
                    >
                        {DROPDOWN.VIEW_OLDER}
                    </button>
                  </div>
                )}

                {visibleCount >= filteredNotifications.length &&
                  loadMoreNotifications && (
                    <div className="notification-load-more">
                      <button
                        className="load-more-button"
                        onClick={loadMoreNotifications}
                      >
                        {DROPDOWN.LOAD_OLDER}
                      </button>
                    </div>
                  )}
              </div>

              <div className="notification-footer">
                <button
                  className="view-all-button"
                  onClick={() => (window.location.href = "/notifications")}
                >
                  <div className="notification-view-all-button">
                        {DROPDOWN.VIEW_ALL}
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
