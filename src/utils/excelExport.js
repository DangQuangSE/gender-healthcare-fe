import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { message } from "antd";
import NOTIFICATION_MESSAGES from "../shared/constants/notificationMessages";

/**
 * Get status text in Vietnamese
 * @param {string} status - Status code
 * @returns {string} Vietnamese status text
 */
export const getStatusText = (status) => {
  const statusMap = {
    COMPLETED: "Hoàn thành",
    CONFIRMED: "Đã xác nhận",
    CHECKED: "Đã check in",
    PENDING: "Chờ xác nhận",
    CANCELED: "Đã hủy",
    ABSENT: "Vắng mặt",
  };
  return statusMap[status] || status;
};

/**
 * Export dashboard data to Excel file
 * @param {Object} params - Export parameters
 * @param {Object} params.dashboardData - Dashboard statistics data
 * @param {Array} params.filteredAppointments - Filtered appointments list
 * @param {Array} params.dateRange - Date range [startDate, endDate]
 * @param {string} params.reportType - Report type (overview/detail)
 * @param {string} params.statusFilter - Status filter (ALL or specific status)
 * @returns {Promise<void>}
 */
export const exportDashboardToExcel = async ({
  dashboardData,
  filteredAppointments,
  dateRange,
  reportType,
  statusFilter,
}) => {
  try {
    // Prepare data for export
    const exportData = {
      // Report info
      reportInfo: [
        {
          "Thông tin": "Thời gian xuất báo cáo",
          "Giá trị": dayjs().format("DD/MM/YYYY HH:mm:ss"),
        },
        {
          "Thông tin": "Khoảng thời gian",
          "Giá trị": `${dateRange[0].format(
            "DD/MM/YYYY"
          )} - ${dateRange[1].format("DD/MM/YYYY")}`,
        },
        {
          "Thông tin": "Loại báo cáo",
          "Giá trị": reportType === "overview" ? "Tổng quan" : "Chi tiết",
        },
        {
          "Thông tin": "Bộ lọc trạng thái",
          "Giá trị":
            statusFilter === "ALL" ? "Tất cả" : getStatusText(statusFilter),
        },
      ],

      // Summary statistics
      summary: [
        {
          "Chỉ số": "Tổng số người dùng",
          "Giá trị": dashboardData.totalUsers,
        },
        {
          "Chỉ số": "Tổng số lịch hẹn",
          "Giá trị": dashboardData.totalAppointments,
        },
        {
          "Chỉ số": "Tổng doanh thu",
          "Giá trị": `${dashboardData.totalRevenue.toLocaleString()} đ`,
        },
        {
          "Chỉ số": "Doanh thu hôm nay",
          "Giá trị": `${dashboardData.todayRevenue.toLocaleString()} đ`,
        },
        {
          "Chỉ số": "Doanh thu tháng này",
          "Giá trị": `${dashboardData.monthRevenue.toLocaleString()} đ`,
        },
        {
          "Chỉ số": "Tỷ lệ hoàn thành",
          "Giá trị": `${dashboardData.completionRate}%`,
        },
      ],

      // Appointments data
      appointments: filteredAppointments.map((appointment, index) => ({
        STT: index + 1,
        "Tên khách hàng": appointment.customerName,
        "Dịch vụ": appointment.serviceName,
        "Thời gian": appointment.slotTime,
        "Trạng thái": getStatusText(appointment.status),
        "Ngày tạo": dayjs(appointment.created_at).format("DD/MM/YYYY HH:mm"),
        "Giá dịch vụ": `${appointment.servicePrice?.toLocaleString() || 0} đ`,
        "Ghi chú": appointment.note || "Không có",
      })),

      // Top services data
      topServices:
        dashboardData.topServices?.map((service, index) => ({
          STT: index + 1,
          "Tên dịch vụ": service.serviceName,
          "Số lượng đặt": service.bookingCount,
          "Doanh thu": `${service.totalRevenue?.toLocaleString() || 0} đ`,
          "Tỷ lệ": `${(
            (service.bookingCount / dashboardData.totalAppointments) *
            100
          ).toFixed(1)}%`,
        })) || [],
    };

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add report info sheet
    const reportInfoWS = XLSX.utils.json_to_sheet(exportData.reportInfo);
    XLSX.utils.book_append_sheet(wb, reportInfoWS, "Thông tin báo cáo");

    // Add summary sheet
    const summaryWS = XLSX.utils.json_to_sheet(exportData.summary);
    XLSX.utils.book_append_sheet(wb, summaryWS, "Tổng quan");

    // Add appointments sheet
    const appointmentsWS = XLSX.utils.json_to_sheet(exportData.appointments);
    XLSX.utils.book_append_sheet(wb, appointmentsWS, "Danh sách lịch hẹn");

    // Add top services sheet if data exists
    if (exportData.topServices.length > 0) {
      const servicesWS = XLSX.utils.json_to_sheet(exportData.topServices);
      XLSX.utils.book_append_sheet(wb, servicesWS, "Dịch vụ hàng đầu");
    }

    // Generate filename with current date
    const fileName = `Bao_cao_dashboard_${dayjs().format(
      "DD-MM-YYYY_HH-mm"
    )}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);

    message.success(NOTIFICATION_MESSAGES.EXPORT.REPORT_SUCCESS);
    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    message.error(NOTIFICATION_MESSAGES.EXPORT.REPORT_FAILED);
    throw error;
  }
};

/**
 * Export appointments data to Excel file
 * @param {Array} appointments - Appointments data
 * @param {string} title - File title
 * @returns {Promise<void>}
 */
export const exportAppointmentsToExcel = async (
  appointments,
  title = "Danh sách lịch hẹn"
) => {
  try {
    const exportData = appointments.map((appointment, index) => ({
      STT: index + 1,
      "Tên khách hàng": appointment.customerName,
      "Dịch vụ": appointment.serviceName,
      "Thời gian": appointment.slotTime,
      "Trạng thái": getStatusText(appointment.status),
      "Ngày tạo": dayjs(appointment.created_at).format("DD/MM/YYYY HH:mm"),
      "Giá dịch vụ": `${appointment.servicePrice?.toLocaleString() || 0} đ`,
      "Ghi chú": appointment.note || "Không có",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, title);

    const fileName = `${title}_${dayjs().format("DD-MM-YYYY_HH-mm")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(NOTIFICATION_MESSAGES.EXPORT.APPOINTMENTS_SUCCESS);
    return true;
  } catch (error) {
    console.error("Error exporting appointments to Excel:", error);
    message.error(NOTIFICATION_MESSAGES.EXPORT.LIST_FAILED);
    throw error;
  }
};

/**
 * Export services data to Excel file
 * @param {Array} services - Services data
 * @param {string} title - File title
 * @returns {Promise<void>}
 */
export const exportServicesToExcel = async (
  services,
  title = "Danh sách dịch vụ"
) => {
  try {
    const exportData = services.map((service, index) => ({
      STT: index + 1,
      "Tên dịch vụ": service.serviceName || service.name,
      "Loại dịch vụ": service.serviceType || service.type,
      Giá: `${service.price?.toLocaleString() || 0} đ`,
      "Mô tả": service.description || "Không có",
      "Trạng thái": service.isActive ? "Hoạt động" : "Không hoạt động",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, title);

    const fileName = `${title}_${dayjs().format("DD-MM-YYYY_HH-mm")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(NOTIFICATION_MESSAGES.EXPORT.SERVICES_SUCCESS);
    return true;
  } catch (error) {
    console.error("Error exporting services to Excel:", error);
    message.error(NOTIFICATION_MESSAGES.EXPORT.LIST_FAILED);
    throw error;
  }
};

/**
 * Export users data to Excel file
 * @param {Array} users - Users data
 * @param {string} title - File title
 * @returns {Promise<void>}
 */
export const exportUsersToExcel = async (
  users,
  title = "Danh sách người dùng"
) => {
  try {
    const exportData = users.map((user, index) => ({
      STT: index + 1,
      Tên: user.name || user.fullName,
      Email: user.email,
      "Số điện thoại": user.phone || "Không có",
      "Vai trò":
        user.role === "CUSTOMER"
          ? "Khách hàng"
          : user.role === "CONSULTANT"
          ? "Tư vấn viên"
          : user.role === "STAFF"
          ? "Nhân viên"
          : user.role,
      "Giới tính":
        user.gender === "MALE"
          ? "Nam"
          : user.gender === "FEMALE"
          ? "Nữ"
          : "Không xác định",
      "Ngày tạo": user.createdAt
        ? dayjs(user.createdAt).format("DD/MM/YYYY")
        : "Không có",
      "Trạng thái": user.isActive ? "Hoạt động" : "Không hoạt động",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, title);

    const fileName = `${title}_${dayjs().format("DD-MM-YYYY_HH-mm")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(NOTIFICATION_MESSAGES.EXPORT.USERS_SUCCESS);
    return true;
  } catch (error) {
    console.error("Error exporting users to Excel:", error);
    message.error(NOTIFICATION_MESSAGES.EXPORT.LIST_FAILED);
    throw error;
  }
};

/**
 * Export financial reports to Excel file
 * @param {Object} financialData - Financial data
 * @param {string} title - File title
 * @returns {Promise<void>}
 */
export const exportFinancialToExcel = async (
  financialData,
  title = "Báo cáo tài chính"
) => {
  try {
    const wb = XLSX.utils.book_new();

    // Revenue summary sheet
    if (financialData.summary) {
      const summaryData = [
        {
          "Chỉ số": "Tổng doanh thu",
          "Giá trị": `${
            financialData.summary.totalRevenue?.toLocaleString() || 0
          } đ`,
        },
        {
          "Chỉ số": "Doanh thu tháng này",
          "Giá trị": `${
            financialData.summary.monthRevenue?.toLocaleString() || 0
          } đ`,
        },
        {
          "Chỉ số": "Doanh thu hôm nay",
          "Giá trị": `${
            financialData.summary.todayRevenue?.toLocaleString() || 0
          } đ`,
        },
        {
          "Chỉ số": "Số lượng giao dịch",
          "Giá trị": financialData.summary.totalTransactions || 0,
        },
      ];
      const summaryWS = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWS, "Tổng quan");
    }

    // Monthly revenue sheet
    if (
      financialData.monthlyRevenue &&
      financialData.monthlyRevenue.length > 0
    ) {
      const monthlyData = financialData.monthlyRevenue.map((item, index) => ({
        STT: index + 1,
        Tháng: item.month,
        Năm: item.year,
        "Doanh thu": `${item.revenue?.toLocaleString() || 0} đ`,
        "Số giao dịch": item.transactionCount || 0,
      }));
      const monthlyWS = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlyWS, "Doanh thu theo tháng");
    }

    const fileName = `${title}_${dayjs().format("DD-MM-YYYY_HH-mm")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    message.success(NOTIFICATION_MESSAGES.EXPORT.FINANCE_SUCCESS);
    return true;
  } catch (error) {
    console.error("Error exporting financial data to Excel:", error);
    message.error(NOTIFICATION_MESSAGES.EXPORT.REPORT_FAILED);
    throw error;
  }
};
