import {
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
import { DASHBOARD_TEXT } from "./DashboardReports.constants";

const DashboardStatistics = ({ dashboardData }) => {
  const cards = [
    {
      title: DASHBOARD_TEXT.STATISTICS.USERS,
      value: dashboardData.totalUsers,
      icon: <UserOutlined />,
      color: "#1890ff",
      suffix: DASHBOARD_TEXT.UNIT.USERS,
    },
    {
      title: DASHBOARD_TEXT.STATISTICS.APPOINTMENTS,
      value: dashboardData.totalAppointments,
      icon: <CalendarOutlined />,
      color: "#52c41a",
      suffix: DASHBOARD_TEXT.UNIT.APPOINTMENTS,
    },
    {
      title: DASHBOARD_TEXT.STATISTICS.YEAR_REVENUE,
      value: dashboardData.totalRevenue,
      icon: <DollarOutlined />,
      color: "#faad14",
      suffix: DASHBOARD_TEXT.UNIT.VND,
      formatter: (value) => `${(value / 1000000).toFixed(1)}M`,
    },
    {
      title: DASHBOARD_TEXT.STATISTICS.TODAY_REVENUE,
      value: dashboardData.todayRevenue,
      icon: <DollarOutlined />,
      color: "#13c2c2",
      suffix: DASHBOARD_TEXT.UNIT.VND,
      formatter: (value) => `${(value / 1000).toLocaleString()}K`,
    },
    {
      title: DASHBOARD_TEXT.STATISTICS.MONTH_REVENUE,
      value: dashboardData.monthRevenue,
      icon: <DollarOutlined />,
      color: "#eb2f96",
      suffix: DASHBOARD_TEXT.UNIT.VND,
      formatter: (value) => `${(value / 1000000).toFixed(1)}M`,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {cards.map((card) => (
        <Col xs={24} sm={12} lg={8} xl={4} key={card.title}>
          <Card className="stat-card">
            <Statistic
              title={card.title}
              value={card.value}
              prefix={
                <span style={{ color: card.color, fontSize: 20 }}>
                  {card.icon}
                </span>
              }
              suffix={card.suffix}
              formatter={card.formatter}
              valueStyle={{ color: card.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStatistics;
