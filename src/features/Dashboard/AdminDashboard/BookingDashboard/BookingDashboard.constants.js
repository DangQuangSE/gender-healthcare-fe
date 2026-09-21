export const APPOINTMENT_STATUSES = Object.freeze([
  { key: "ALL", label: "Tất cả", color: "default" },
  { key: "PENDING", label: "Chờ xác nhận", color: "orange" },
  { key: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
  { key: "CHECKED", label: "Đã khám", color: "green" },
  { key: "COMPLETED", label: "Hoàn thành", color: "success" },
  { key: "CANCELED", label: "Đã hủy", color: "red" },
  { key: "ABSENT", label: "Vắng mặt", color: "volcano" },
]);

export const APPOINTMENT_STATUS_KEYS = Object.freeze([
  "PENDING",
  "CONFIRMED",
  "CHECKED",
  "COMPLETED",
  "CANCELED",
  "ABSENT",
]);
