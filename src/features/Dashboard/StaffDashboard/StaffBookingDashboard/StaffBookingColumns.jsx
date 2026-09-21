import React from "react";
import { Button, Popconfirm, Space, Tag } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import STAFF_BOOKING_MESSAGES from "./staffBookingMessages";

const { ui } = STAFF_BOOKING_MESSAGES;

const formatDate = (value) => {
  if (!value) return ui.fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? ui.fallback : date.toLocaleDateString("vi-VN");
};

const renderDateTime = (record) => {
  const slotTime = record.appointmentDetails?.[0]?.slotTime;
  if (slotTime) {
    const date = new Date(slotTime);
    if (!Number.isNaN(date.getTime())) {
      return (
        <div className="booking-dashboard__datetime">
          <div className="booking-dashboard__date">
            {date.toLocaleDateString("vi-VN")}
          </div>
          <div className="booking-dashboard__time">
            {date.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="booking-dashboard__datetime">
      <div className="booking-dashboard__date">
        {formatDate(record.preferredDate)}
      </div>
      <div className="booking-dashboard__time">{ui.noTime}</div>
    </div>
  );
};

export const createStaffBookingColumns = ({
  getStatusColor,
  getStatusLabel,
  onCancel,
  onCheckIn,
  onEdit,
  onViewDetail,
}) => [
  {
    title: ui.customerName,
    dataIndex: "customerName",
    key: "customerName",
    width: 70,
    render: (customerName) => (
      <div className="booking-dashboard__customer-name">
        {customerName || ui.fallback}
      </div>
    ),
  },
  {
    title: ui.service,
    dataIndex: "serviceName",
    key: "serviceName",
    width: 90,
    render: (serviceName, record) => (
      <div className="booking-dashboard__service">
        <div className="booking-dashboard__service-name">
          {serviceName || ui.fallback}
        </div>
        <div className="booking-dashboard__service-price">
          {record.price ? `${record.price.toLocaleString()} VNĐ` : ""}
        </div>
      </div>
    ),
  },
  {
    title: "Ngày & Giờ",
    key: "datetime",
    width: 50,
    render: (_, record) => renderDateTime(record),
  },
  {
    title: ui.status,
    dataIndex: "status",
    key: "status",
    width: 40,
    render: (status) => (
      <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
    ),
  },
  {
    title: ui.createdDate,
    dataIndex: "created_at",
    key: "created_at",
    width: 45,
    render: (date) => formatDate(date),
  },
  {
    title: ui.note,
    dataIndex: "note",
    key: "note",
    width: 100,
    render: (note) => note || ui.emptyNote,
  },
  {
    title: ui.actions,
    key: "actions",
    width: 180,
    fixed: "right",
    render: (_, record) => (
      <Space size="small" className="booking-dashboard__action-space">
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          className="booking-dashboard__view-btn"
          onClick={() => onViewDetail(record)}
          title={ui.viewDetails}
        >
          {ui.details}
        </Button>
        {record.status === "CONFIRMED" &&
          record.serviceType !== "CONSULTING_ON" && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => onCheckIn(record)}
              title={ui.markChecked}
              className="booking-dashboard__checkin-btn"
            >
              {ui.checkIn}
            </Button>
          )}
        <Button
          size="small"
          icon={<EditOutlined />}
          className="booking-dashboard__edit-btn"
          onClick={() => onEdit(record)}
          title={ui.updateMedicalInfo}
        >
          {ui.basicMedicalInfoButton}
        </Button>
        {["PENDING", "CONFIRMED", "CHECKED"].includes(record.status) && (
          <Popconfirm
            title={ui.cancelAppointment}
            description={ui.cancelConfirmation}
            onConfirm={() => onCancel(record)}
            okText={ui.confirm}
            cancelText={ui.reject}
            okType="danger"
          >
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              className="booking-dashboard__cancel-btn"
              title={ui.cancelAppointment}
            >
              {ui.cancel}
            </Button>
          </Popconfirm>
        )}
      </Space>
    ),
  },
];

export default createStaffBookingColumns;
