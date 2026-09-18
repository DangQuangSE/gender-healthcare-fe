export const CHAT_MESSAGES = {
  SESSIONS_LOAD_FAILED: "Không thể tải danh sách chat sessions",
  NEW_SESSION: (customerName) => `Có chat session mới từ ${customerName}`,
  GREETING_SENT: (customerName) =>
    `Đã gửi tin nhắn chào hỏi tới ${customerName}`,
  GREETING_FAILED: "Không thể gửi tin nhắn chào hỏi",
  SESSION_JOINED: (customerName) => `Đã tham gia chat với ${customerName}`,
  SESSION_JOIN_FAILED: "Không thể tham gia chat session",
  MESSAGE_SEND_FAILED: "Không thể gửi tin nhắn. Vui lòng thử lại.",
  END_SESSION_TITLE: "Kết thúc cuộc trò chuyện",
  END_SESSION_CONFIRM: (customerName) =>
    `Bạn có chắc chắn muốn kết thúc cuộc trò chuyện với ${customerName}?`,
  END_SESSION_ACTION: "Kết thúc",
  CANCEL: "Hủy",
  END_SESSION_SUCCESS: (customerName) =>
    `Đã kết thúc cuộc trò chuyện với ${customerName}`,
  END_SESSION_FAILED: "Không thể kết thúc cuộc trò chuyện. Vui lòng thử lại.",
  UNKNOWN_ERROR: "Có lỗi xảy ra. Vui lòng thử lại.",
};

export default CHAT_MESSAGES;
