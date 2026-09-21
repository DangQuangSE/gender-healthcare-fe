import dayjs from "dayjs";

export const EMPTY_DASHBOARD_DATA = {
  totalUsers: 0,
  totalAppointments: 0,
  totalRevenue: 0,
  todayRevenue: 0,
  monthRevenue: 0,
  completionRate: 0,
  recentAppointments: [],
  allAppointments: [],
  topServices: [],
  userStats: { customers: 0, consultants: 0, staff: 0 },
  bookingStats: {},
};

export const DASHBOARD_TEXT = {
  TITLE: "Dashboard & Báo cáo",
  REPORT_TYPES: [
    { value: "overview", label: "Tổng quan" },
    { value: "revenue", label: "Doanh thu" },
    { value: "appointments", label: "Lịch hẹn" },
    { value: "users", label: "Người dùng" },
  ],
  REFRESH: "Làm mới",
  EXPORT: "Xuất báo cáo",
  EXPORTING: "Đang xuất...",
  RECENT_APPOINTMENTS: "Lịch hẹn gần đây",
  TOP_SERVICES: "Dịch vụ hàng đầu",
  ALL_STATUSES: "Tất cả trạng thái",
  STATISTICS: {
    USERS: "Tổng người dùng",
    APPOINTMENTS: "Tổng lịch hẹn",
    YEAR_REVENUE: "Doanh thu năm",
    TODAY_REVENUE: "Doanh thu hôm nay",
    MONTH_REVENUE: "Doanh thu tháng",
  },
  USER_STATS: "Thống kê người dùng",
  CUSTOMER: "Khách hàng",
  CONSULTANT: "Tư vấn viên",
  STAFF: "Nhân viên",
  PERFORMANCE: "Hiệu suất hệ thống",
  COMPLETION_RATE: "Tỷ lệ hoàn thành lịch hẹn",
  CUSTOMER_SATISFACTION: "Mức độ hài lòng khách hàng",
  CONSULTANT_PERFORMANCE: "Hiệu suất tư vấn viên",
  UNIT: { USERS: "người", APPOINTMENTS: "lịch hẹn", VND: "VND" },
  TABLE: {
    CUSTOMER: "Khách hàng",
    SERVICE: "Dịch vụ",
    DATE_TIME: "Ngày & Giờ",
    STATUS: "Trạng thái",
    PRICE: "Giá tiền",
    SERVICE_NAME: "Tên dịch vụ",
    SERVICE_TYPE: "Loại dịch vụ",
    SPECIALIZATION: "Chuyên khoa",
    COST: "Giá",
  },
  STATUS: {
    COMPLETED: "Hoàn thành",
    CONFIRMED: "Đã xác nhận",
    CHECKED: "Đã check in",
    PENDING: "Chờ xác nhận",
    CANCELED: "Đã hủy",
    ABSENT: "Vắng mặt",
  },
  SERVICE_TYPES: {
    CONSULTING: "Tư vấn",
    CONSULTING_ON: "Tư vấn trực tuyến",
    TESTING: "Xét nghiệm",
    TREATMENT: "Điều trị",
    EXAMINATION: "Khám bệnh",
    COMBO: "Gói combo",
  },
};

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "ALL", label: DASHBOARD_TEXT.ALL_STATUSES },
  { value: "PENDING", label: DASHBOARD_TEXT.STATUS.PENDING },
  { value: "CONFIRMED", label: DASHBOARD_TEXT.STATUS.CONFIRMED },
  { value: "CHECKED", label: DASHBOARD_TEXT.STATUS.CHECKED },
  { value: "COMPLETED", label: DASHBOARD_TEXT.STATUS.COMPLETED },
];

export const DEFAULT_DATE_RANGE = [dayjs().subtract(30, "day"), dayjs()];

export const getStatusPresentation = (status) => {
  const colorByStatus = {
    COMPLETED: "green",
    CONFIRMED: "blue",
    CHECKED: "cyan",
    PENDING: "orange",
    CANCELED: "red",
    ABSENT: "volcano",
  };
  return {
    color: colorByStatus[status] || "default",
    text: DASHBOARD_TEXT.STATUS[status] || status,
  };
};
