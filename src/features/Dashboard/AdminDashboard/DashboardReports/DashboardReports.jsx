import { Card, Divider } from "antd";
import DashboardReportsHeader, {
  DashboardReportsTitle,
} from "./DashboardReportsHeader";
import DashboardReportsSections from "./DashboardReportsSections";
import DashboardStatistics from "./DashboardStatistics";
import { useDashboardReports } from "./useDashboardReports";
import "./DashboardReports.css";

const DashboardReports = () => {
  const {
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
  } = useDashboardReports();

  return (
    <div className="dashboard-reports">
      <Card
        title={<DashboardReportsTitle />}
        extra={
          <DashboardReportsHeader
            dateRange={dateRange}
            exporting={exporting}
            loading={loading}
            onDateRangeChange={setDateRange}
            onExport={exportToExcel}
            onRefresh={loadDashboardData}
            onReportTypeChange={setReportType}
            reportType={reportType}
          />
        }
      >
        <DashboardStatistics dashboardData={dashboardData} />
        <DashboardReportsSections
          dashboardData={dashboardData}
          getFilteredAppointments={getFilteredAppointments}
          onStatusFilterChange={setStatusFilter}
          statusFilter={statusFilter}
        />
        <Divider />
      </Card>
    </div>
  );
};

export default DashboardReports;
