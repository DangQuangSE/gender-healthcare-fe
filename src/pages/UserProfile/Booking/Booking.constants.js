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
