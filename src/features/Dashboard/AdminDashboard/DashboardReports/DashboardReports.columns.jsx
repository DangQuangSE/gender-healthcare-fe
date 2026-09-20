import { Statistic, Tag } from "antd";
import dayjs from "dayjs";
import {
  DASHBOARD_TEXT,
  getStatusPresentation,
} from "./DashboardReports.constants";

export const createAppointmentColumns = () => [
  { title: DASHBOARD_TEXT.TABLE.CUSTOMER, dataIndex: "customerName", key: "customerName" },
  { title: DASHBOARD_TEXT.TABLE.SERVICE, dataIndex: "serviceName", key: "serviceName" },
  {
    title: DASHBOARD_TEXT.TABLE.DATE_TIME,
    dataIndex: "appointmentDetails",
    key: "slotTime",
    render: (details) => {
      const slotTime = details?.[0]?.slotTime;
      return slotTime ? dayjs(slotTime).format("DD/MM/YYYY HH:mm") : "-";
    },
  },
  {
    title: DASHBOARD_TEXT.TABLE.STATUS,
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const statusInfo = getStatusPresentation(status);
      return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    },
  },
  {
    title: DASHBOARD_TEXT.TABLE.PRICE,
    dataIndex: "price",
    key: "price",
    render: (price) => (price ? `${price.toLocaleString()} VND` : "-"),
  },
];

export const createServiceColumns = () => [
  {
    title: DASHBOARD_TEXT.TABLE.SERVICE_NAME,
    dataIndex: "name",
    key: "name",
    width: "40%",
  },
  {
    title: DASHBOARD_TEXT.TABLE.SERVICE_TYPE,
    dataIndex: "type",
    key: "type",
    render: (type) => (
      <Tag color="blue">{DASHBOARD_TEXT.SERVICE_TYPES[type] || type}</Tag>
    ),
  },
  {
    title: DASHBOARD_TEXT.TABLE.SPECIALIZATION,
    dataIndex: "specializations",
    key: "specializations",
    render: (specializations) =>
      specializations?.length ? (
        <Tag color="green">{specializations[0].name}</Tag>
      ) : (
        "-"
      ),
  },
  {
    title: DASHBOARD_TEXT.TABLE.COST,
    dataIndex: "price",
    key: "price",
    render: (price) => (
      <Statistic
        value={price}
        suffix={DASHBOARD_TEXT.UNIT.VND}
        formatter={(value) => `${(value / 1000).toLocaleString()}K`}
      />
    ),
  },
];
