import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { fetchDashboardData } from "../../../admin/api/reportApi";
import { exportDashboardToExcel } from "../../../../utils/excelExport";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";
import {
  DEFAULT_DATE_RANGE,
  EMPTY_DASHBOARD_DATA,
} from "./DashboardReports.constants";

const getData = (result, fallback) =>
  result.status === "fulfilled" ? result.value?.data ?? fallback : fallback;

const getList = (result) => {
  const data = getData(result, []);
  return Array.isArray(data) ? data : [];
};

const buildDashboardData = (results) => {
  const [
    revenueYear,
    revenueToday,
    revenueMonth,
    bookingSummary,
    users,
    consultants,
    staff,
    pending,
    confirmed,
    checked,
    completed,
    services,
  ] = results;
  const pendingAppointments = getList(pending);
  const confirmedAppointments = getList(confirmed);
  const checkedAppointments = getList(checked);
  const completedAppointments = getList(completed);
  const allAppointments = [
    ...pendingAppointments,
    ...confirmedAppointments,
    ...checkedAppointments,
    ...completedAppointments,
  ].sort((first, second) => new Date(second.created_at) - new Date(first.created_at));
  const totalBookings = allAppointments.length;

  return {
    totalUsers: getList(users).length + getList(consultants).length + getList(staff).length,
    totalAppointments: totalBookings,
    totalRevenue: getData(revenueYear, 0),
    todayRevenue: getData(revenueToday, 0),
    monthRevenue: getData(revenueMonth, 0),
    completionRate: totalBookings > 0 ? (completedAppointments.length / totalBookings) * 100 : 0,
    allAppointments,
    recentAppointments: allAppointments.slice(0, 10),
    topServices: getList(services).slice(0, 5),
    userStats: {
      customers: getList(users).length,
      consultants: getList(consultants).length,
      staff: getList(staff).length,
    },
    bookingStats: getData(bookingSummary, {}),
  };
};

const getRejectedAppointmentStatuses = (results) =>
  ["PENDING", "CONFIRMED", "CHECKED", "COMPLETED"].filter(
    (_, index) => results[index + 7]?.status === "rejected"
  );

export const useDashboardReports = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);
  const [reportType, setReportType] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD_DATA);

  const loadDashboardData = useCallback(async () => {
    if (!dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    try {
      const results = await fetchDashboardData({
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      });
      const failedStatuses = getRejectedAppointmentStatuses(results);
      if (failedStatuses.length > 0) {
        message.warning(
          NOTIFICATION_MESSAGES.DASHBOARD.APPOINTMENT_PARTIAL_LOAD_FAILED(
            failedStatuses
          )
        );
      }
      setDashboardData(buildDashboardData(results));
    } catch {
      setDashboardData(EMPTY_DASHBOARD_DATA);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getFilteredAppointments = useCallback(
    () =>
      dashboardData.allAppointments
        .filter(
          (appointment) =>
            statusFilter === "ALL" || appointment.status === statusFilter
        )
        .slice(0, 10),
    [dashboardData.allAppointments, statusFilter]
  );

  const exportToExcel = useCallback(async () => {
    setExporting(true);
    try {
      await exportDashboardToExcel({
        dashboardData,
        filteredAppointments: getFilteredAppointments(),
        dateRange,
        reportType,
        statusFilter,
      });
    } finally {
      setExporting(false);
    }
  }, [dashboardData, dateRange, getFilteredAppointments, reportType, statusFilter]);

  return {
    dashboardData,
    dateRange,
    exporting,
    getFilteredAppointments,
    loadDashboardData,
    loading,
    reportType,
    setDateRange,
    setReportType,
    setStatusFilter,
    statusFilter,
    exportToExcel,
  };
};
