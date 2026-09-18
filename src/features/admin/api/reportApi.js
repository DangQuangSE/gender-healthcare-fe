import apiClient from "../../../shared/api/client";

const getFinancialReport = (period) =>
  apiClient.get(`/v1/reports/financial/${period}`);

const getAppointmentsByStatus = (status) =>
  apiClient.get("/v1/appointments", { params: { status } });

const getUsersByRole = (role) =>
  apiClient.get("/v1/admin/users", { params: { role } });

export const fetchDashboardData = ({ startDate, endDate }) =>
  Promise.allSettled([
    getFinancialReport("year"),
    getFinancialReport("today"),
    getFinancialReport("month"),
    apiClient.get("/v1/reports/bookings/summary", {
      params: { start_date: startDate, end_date: endDate },
    }),
    getUsersByRole("CUSTOMER"),
    getUsersByRole("CONSULTANT"),
    getUsersByRole("STAFF"),
    getAppointmentsByStatus("PENDING"),
    getAppointmentsByStatus("CONFIRMED"),
    getAppointmentsByStatus("CHECKED"),
    getAppointmentsByStatus("COMPLETED"),
    apiClient.get("/v1/services"),
  ]);
