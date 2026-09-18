import React from "react";
import { Space, Typography } from "antd";
import {
  ExperimentOutlined,
  FileTextOutlined,
  HeartOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export const getTestTypeDisplay = (type) => {
  const types = {
    LAB_TEST: {
      icon: <ExperimentOutlined />,
      text: "Xét nghiệm",
      color: "#1890ff",
    },
    IMAGING: {
      icon: <RadarChartOutlined />,
      text: "Chẩn đoán hình ảnh",
      color: "#722ed1",
    },
    CONSULTATION: { icon: <HeartOutlined />, text: "Tư vấn", color: "#52c41a" },
  };

  const typeInfo = types[type] || {
    icon: <FileTextOutlined />,
    text: type,
    color: "#666",
  };

  return (
    <Space>
      <span style={{ color: typeInfo.color }}>{typeInfo.icon}</span>
      <Text style={{ color: typeInfo.color }}>{typeInfo.text}</Text>
    </Space>
  );
};
