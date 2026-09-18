import React from "react";
import { Button, Popconfirm, Space, Tag } from "antd";
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  SERVICE_MANAGEMENT_MESSAGES,
  SERVICE_TYPE_LABELS,
} from "./serviceManagementMessages";

const formatDate = (value) => {
  if (!value) return SERVICE_MANAGEMENT_MESSAGES.ui.notAvailable;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? SERVICE_MANAGEMENT_MESSAGES.ui.notAvailable
    : date.toLocaleDateString("vi-VN");
};

export const createServiceManagementColumns = ({
  getServiceTypeColor,
  onEdit,
  onToggleStatus,
  onViewDetail,
}) => [
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.name,
    dataIndex: "name",
    key: "name",
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.description,
    dataIndex: "description",
    key: "description",
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.duration,
    dataIndex: "duration",
    key: "duration",
    render: (duration) =>
      duration
        ? Math.floor(duration)
        : SERVICE_MANAGEMENT_MESSAGES.ui.notAvailable,
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.type,
    dataIndex: "type",
    key: "type",
    render: (type) => (
      <Tag color={getServiceTypeColor(type)}>
        {SERVICE_TYPE_LABELS[type] ||
          type ||
          SERVICE_MANAGEMENT_MESSAGES.ui.notAvailable}
      </Tag>
    ),
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.specialization,
    dataIndex: "specializations",
    key: "specializations",
    render: (specializations) => (
      <div>
        {specializations?.length ? (
          specializations.map((specialization) => (
            <Tag
              key={specialization.id}
              color="blue"
              className="service-management__specialization-tag"
            >
              {specialization.name}
            </Tag>
          ))
        ) : (
          <span className="service-management__empty-value">
            {SERVICE_MANAGEMENT_MESSAGES.ui.emptySpecialization}
          </span>
        )}
      </div>
    ),
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.price,
    dataIndex: "price",
    key: "price",
    render: (price) => `${price?.toLocaleString() || 0}đ`,
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.discount,
    dataIndex: "discountPercent",
    key: "discountPercent",
    render: (discount) => `${discount || 0}%`,
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.combo,
    dataIndex: "isCombo",
    key: "isCombo",
    render: (isCombo) => (
      <Tag color={isCombo ? "orange" : "default"}>
        {isCombo
          ? SERVICE_MANAGEMENT_MESSAGES.ui.yes
          : SERVICE_MANAGEMENT_MESSAGES.ui.no}
      </Tag>
    ),
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.createdAt,
    dataIndex: "createdAt",
    key: "createdAt",
    render: formatDate,
  },
  {
    title: SERVICE_MANAGEMENT_MESSAGES.ui.actions,
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <Button icon={<EyeOutlined />} size="small" onClick={() => onViewDetail(record)}>
          {SERVICE_MANAGEMENT_MESSAGES.ui.view}
        </Button>
        <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)}>
          {SERVICE_MANAGEMENT_MESSAGES.ui.edit}
        </Button>
        <Popconfirm
          title={SERVICE_MANAGEMENT_MESSAGES.ui.statusConfirmation(record.isActive)}
          onConfirm={() => onToggleStatus(record)}
        >
          <Button
            size="small"
            danger={record.isActive}
            icon={record.isActive ? <DeleteOutlined /> : <CheckOutlined />}
            type={record.isActive ? "default" : "primary"}
          >
            {record.isActive
              ? SERVICE_MANAGEMENT_MESSAGES.ui.inactive
              : SERVICE_MANAGEMENT_MESSAGES.ui.active}
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

export default createServiceManagementColumns;
