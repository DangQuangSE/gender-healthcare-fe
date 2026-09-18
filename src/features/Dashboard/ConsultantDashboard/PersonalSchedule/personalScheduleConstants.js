export const PERSONAL_SCHEDULE_STATUSES = Object.freeze([
  "CHECKED",
  "IN_PROGRESS",
  "WAITING_RESULT",
  "COMPLETED",
]);

export const PERSONAL_SCHEDULE_STATUS_BY_TAB = Object.freeze({
  checked: "CHECKED",
  in_progress: "IN_PROGRESS",
  waiting_result: "WAITING_RESULT",
  completed: "COMPLETED",
});

export const PERSONAL_SCHEDULE_CACHE_TTL_MS = 5 * 60 * 1000;

export const PERSONAL_SCHEDULE_MESSAGES = Object.freeze({
  TITLE: "Lịch tư vấn cá nhân",
  SUBTITLE: "Quản lý lịch hẹn và theo dõi tiến trình khám bệnh",
  DATE_LABEL: "Chọn ngày",
  DATE_PLACEHOLDER: "Chọn ngày",
  DATE_INFO: (date) => `Hiển thị lịch hẹn ngày ${date}`,
  TOTAL_SERVICES: (count) => `Tổng dịch vụ (${count})`,
  CHECKED: (count) => `Đã check in (${count})`,
  IN_PROGRESS: (count) => `Đang tiến hành (${count})`,
  WAITING_RESULT: (count) => `Chờ kết quả (${count})`,
  COMPLETED: (count) => `Hoàn thành (${count})`,
  PATIENT_NAME_FALLBACK: "Chưa có tên",
  PATIENT_LABEL: "Bệnh nhân",
  PATIENT_DETAILS: "Chi tiết",
  PATIENT_INFO: "Thông tin bệnh nhân",
  STATUS: "Trạng thái",
  SERVICE: "Dịch vụ khám",
  ACTIONS: "Thao tác",
  JOIN_CONSULTATION: "Tham gia phòng tư vấn",
  START_EXAMINATION: "Bắt đầu khám",
  WAIT_RESULT: "Chờ kết quả",
  ENTER_RESULT: "Nhập kết quả",
  SERVICE_TIME: "Thời gian",
  CONSULTANT: "Bác sĩ",
  CONSULTANT_FALLBACK: (id) => `Bác sĩ #${id}`,
  COMPLETED_STATUS: "Đã hoàn thành",
  UNKNOWN_STATUS: "Trạng thái không xác định",
  STATUS_IN_PROGRESS_DESCRIPTION: "Đang trong quá trình khám",
  STATUS_WAITING_RESULT_DESCRIPTION: "Chờ bác sĩ nhập kết quả",
  STATUS_PENDING_DESCRIPTION: "Chờ xác nhận",
  STATUS_CONFIRMED_DESCRIPTION: "Đã xác nhận lịch hẹn",
  STATUS_CANCELED_DESCRIPTION: "Lịch hẹn đã bị hủy",
  ONLINE_CONSULTATION: "Tư vấn trực tuyến",
  SAVE: "Lưu",
  CANCEL: "Hủy",
  PATIENT_NAME_LABEL: "Tên bệnh nhân",
  CONSULTATION_NOTES_LABEL: "Ghi chú tư vấn",
  PATIENT_NAME_REQUIRED: "Vui lòng nhập tên bệnh nhân!",
  RESULT_TITLE: (type) => `Nhập kết quả ${type === "TESTING" ? "xét nghiệm" : "khám bệnh"}`,
  TEST_RESULT: "xét nghiệm",
  CONSULTATION_RESULT: "khám bệnh",
  EMPTY: (date) => `Không có dịch vụ nào trong tab này cho ngày ${date}`,
  EMPTY_HINT: "Hãy thử chọn ngày khác hoặc kiểm tra tab khác",
  PAGINATION_TOTAL: (start, end, total) =>
    `${start}-${end} trong tổng số ${total} dịch vụ`,
  STATUS_CONFIRM_TITLE: "Xác nhận thay đổi trạng thái",
  CONFIRM: "Xác nhận",
  LOAD_FAILED: (status, detail) =>
    `Lỗi tải dữ liệu ${status}: ${detail}`,
  LOAD_ALL_SUCCESS: (successCount, total) =>
    `Đã tải ${successCount}/${total} tab thành công`,
  LOAD_ALL_FAILED: "Lỗi khi tải dữ liệu song song",
  STATUS_UPDATED: "Cập nhật trạng thái thành công!",
  STATUS_UPDATE_FAILED: "Lỗi khi cập nhật trạng thái!",
  START_CONFIRM: "Bạn có chắc chắn muốn bắt đầu khám bệnh cho dịch vụ này?",
  WAIT_CONFIRM:
    "Bạn có chắc chắn đã hoàn thành khám và chuyển sang chờ kết quả?",
  RESULT_SAVED_TEST: "Đã lưu kết quả xét nghiệm thành công!",
  RESULT_SAVED_CONSULTATION: "Đã lưu kết quả khám bệnh thành công!",
  MEDICAL_RESULT: "Kết quả khám",
});

export const PERSONAL_SCHEDULE_STATUS_LABELS = Object.freeze({
  CHECKED: "Đã kiểm tra",
  IN_PROGRESS: "Đang tiến hành",
  WAITING_RESULT: "Chờ kết quả",
  COMPLETED: "Hoàn thành",
  PENDING: "Đang chờ",
  CONFIRMED: "Đã xác nhận",
  CANCELED: "Đã hủy",
});

export default PERSONAL_SCHEDULE_MESSAGES;
