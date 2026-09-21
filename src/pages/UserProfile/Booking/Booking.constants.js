export const BOOKING_TABS = Object.freeze([
  { key: "upcoming", label: "Lịch hẹn sắp đến" },
  { key: "completed", label: "Hoàn thành" },
  { key: "history", label: "Lịch sử đặt chỗ" },
  { key: "combo", label: "Gói khám" },
]);

export const APPOINTMENT_STATUS_BY_TAB = Object.freeze({
  upcoming: Object.freeze(["CONFIRMED", "PENDING", "CHECKED"]),
  completed: Object.freeze(["COMPLETED"]),
  history: Object.freeze(["CANCELED"]),
});

export const APPOINTMENT_STATUS_LABELS = Object.freeze({
  CONFIRMED: "Đã xác nhận",
  PENDING: "Chờ xác nhận",
  CHECKED: "Đã check in",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
});

export const CANCELLABLE_APPOINTMENT_STATUSES = Object.freeze([
  "CONFIRMED",
  "PENDING",
  "CHECKED",
]);

export const BOOKING_TEXT = Object.freeze({
  ROUTE: "/user/booking",
  SERVICES_ROUTE: "/services",
  PAGE_TITLE: "Lịch sử đặt chỗ",
  LOADING: "Đang tải lịch hẹn...",
  EMPTY_SUFFIX: "Không có",
  EMPTY_DESCRIPTION: "Đừng lo lắng. Bạn có thể đặt lịch khi cần",
  BOOK_NOW: "Đăng kí khám bệnh",
  CARD_TITLE: "Thông tin lịch hẹn",
  APPOINTMENT_DATE: "Ngày hẹn:",
  SERVICE: "Dịch vụ:",
  ROOM: "Phòng khám:",
  STATUS: "Trạng thái:",
  NOTE: "Ghi chú:",
  PRICE: "Giá:",
  NOT_AVAILABLE: "Không có",
  VIEW_DETAIL: "Xem chi tiết",
  CANCEL: "Hủy lịch hẹn",
  ONLINE_CONSULTATION: "Tư vấn Online",
  VIEW_RESULT: "Kết quả",
  EDIT_RATING: "Sửa đánh giá",
  RATE: "Đánh giá",
  ONLINE_TITLE: "Click để tham gia tư vấn online",
  RESULT_TITLE: "Xem kết quả khám bệnh",
  DETAIL_TITLE: "Chi tiết lịch hẹn",
  GENERAL_INFO: "Thông tin chung",
  SERVICE_DETAILS: "Chi tiết dịch vụ",
  CONSULTANT: "Bác sĩ tư vấn:",
  APPOINTMENT_TIME: "Thời gian khám:",
  UNASSIGNED: "Chưa phân công",
  UNDETERMINED: "Chưa xác định",
  SPECIALIZATION: "Chuyên khoa:",
  SERVICE_STATUS: "Trạng thái dịch vụ:",
  JOIN_ROOM: "Tham gia phòng tư vấn",
  ONLINE_LINK: "Link tư vấn online:",
  MEDICAL_RESULT: "Kết quả khám:",
  DATE_OF_APPOINTMENT: "Ngày hẹn:",
  CLOSE: "Đóng",
});
