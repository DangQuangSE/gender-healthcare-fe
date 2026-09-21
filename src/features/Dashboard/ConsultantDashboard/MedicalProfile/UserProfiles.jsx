import React from 'react';
import { Card, Table, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import './UserProfiles.css';

const userProfiles = [
  {
    id: 1,
    name: "Alice Wonderland",
    age: 30,
    gender: "Nữ",
    medicalHistory: "Không",
  },
  {
    id: 2,
    name: "Bob The Builder",
    age: 45,
    gender: "Nam",
    medicalHistory: "Tăng huyết áp",
  },
];

const userProfileColumns = [
  { title: "Họ tên", dataIndex: "name", key: "name" },
  { title: "Tuổi", dataIndex: "age", key: "age" },
  { title: "Giới tính", dataIndex: "gender", key: "gender" },
  {
    title: "Tiền sử bệnh",
    dataIndex: "medicalHistory",
    key: "medicalHistory",
  },
  {
    title: "Thao tác",
    key: "action",
    render: () => (
      <Button icon={<EyeOutlined />} size="small">
        Xem chi tiết
      </Button>
    ),
  },
];

const UserProfiles = () => {
  return (
    <Card title="Thông tin người dùng">
      <Table
        columns={userProfileColumns}
        dataSource={userProfiles}
        rowKey="id"
      />
    </Card>
  );
};

export default UserProfiles;
