import {
  CalendarOutlined,
  LineChartOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Progress, Row, Select, Space, Statistic, Table } from "antd";
import {
  APPOINTMENT_STATUS_OPTIONS,
  DASHBOARD_TEXT,
} from "./DashboardReports.constants";
import { createAppointmentColumns, createServiceColumns } from "./DashboardReports.columns";

const DashboardReportsSections = ({
  dashboardData,
  getFilteredAppointments,
  onStatusFilterChange,
  statusFilter,
}) => (
  <>
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card
          title={
            <Space>
              <CalendarOutlined />
              <span>{DASHBOARD_TEXT.RECENT_APPOINTMENTS}</span>
            </Space>
          }
          extra={
            <Select
              value={statusFilter}
              onChange={onStatusFilterChange}
              options={APPOINTMENT_STATUS_OPTIONS}
              style={{ width: 150 }}
              size="small"
            />
          }
        >
          <Table
            columns={createAppointmentColumns()}
            dataSource={getFilteredAppointments()}
            pagination={false}
            size="small"
            rowKey="id"
          />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card
          title={
            <Space>
              <TrophyOutlined />
              <span>{DASHBOARD_TEXT.TOP_SERVICES}</span>
            </Space>
          }
        >
          <Table
            columns={createServiceColumns()}
            dataSource={dashboardData.topServices}
            pagination={false}
            size="small"
            rowKey="name"
          />
        </Card>
      </Col>
    </Row>
    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <UserOutlined />
              <span>{DASHBOARD_TEXT.USER_STATS}</span>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic title={DASHBOARD_TEXT.CUSTOMER} value={dashboardData.userStats.customers} valueStyle={{ color: "#1890ff" }} />
            </Col>
            <Col span={8}>
              <Statistic title={DASHBOARD_TEXT.CONSULTANT} value={dashboardData.userStats.consultants} valueStyle={{ color: "#52c41a" }} />
            </Col>
            <Col span={8}>
              <Statistic title={DASHBOARD_TEXT.STAFF} value={dashboardData.userStats.staff} valueStyle={{ color: "#faad14" }} />
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <LineChartOutlined />
              <span>{DASHBOARD_TEXT.PERFORMANCE}</span>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <span>{DASHBOARD_TEXT.COMPLETION_RATE}</span>
              <Progress percent={dashboardData.completionRate} status="active" strokeColor="#52c41a" />
            </div>
            <div>
              <span>{DASHBOARD_TEXT.CUSTOMER_SATISFACTION}</span>
              <Progress percent={92} strokeColor="#1890ff" />
            </div>
            <div>
              <span>{DASHBOARD_TEXT.CONSULTANT_PERFORMANCE}</span>
              <Progress percent={88} strokeColor="#faad14" />
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  </>
);

export default DashboardReportsSections;
