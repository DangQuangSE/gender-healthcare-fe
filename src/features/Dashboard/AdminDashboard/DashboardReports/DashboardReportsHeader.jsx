import {
  BarChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Select, Space } from "antd";
import { DASHBOARD_TEXT } from "./DashboardReports.constants";

const { RangePicker } = DatePicker;

export const DashboardReportsTitle = () => (
  <Space>
    <BarChartOutlined />
    <span>{DASHBOARD_TEXT.TITLE}</span>
  </Space>
);

const DashboardReportsHeader = ({
  dateRange,
  exporting,
  loading,
  onDateRangeChange,
  onExport,
  onRefresh,
  onReportTypeChange,
  reportType,
}) => (
  <Space>
      <RangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        format="DD/MM/YYYY"
      />
      <Select
        value={reportType}
        onChange={onReportTypeChange}
        options={DASHBOARD_TEXT.REPORT_TYPES}
        style={{ width: 150 }}
      />
      <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
        {DASHBOARD_TEXT.REFRESH}
      </Button>
      <Button
        icon={<DownloadOutlined />}
        type="primary"
        onClick={onExport}
        loading={exporting}
      >
        {exporting ? DASHBOARD_TEXT.EXPORTING : DASHBOARD_TEXT.EXPORT}
      </Button>
  </Space>
);

export default DashboardReportsHeader;
