import React, { useState, useEffect } from "react";
import {
  Card,
  DatePicker,
  Button,
  Collapse,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Spin,
  message,
  Avatar,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getDoctorWorkingSchedule } from "./doctorWorkingHoursAPI";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";
import "./DoctorWorkingHours.css";

const { Panel } = Collapse;
const { Title, Text } = Typography;

const DoctorWorkingHours = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch doctor working schedules
  const fetchDoctorSchedules = async (date) => {
    setLoading(true);
    try {
      const formattedDate = date.format("YYYY-MM-DD");
      const response = await getDoctorWorkingSchedule(formattedDate);
      setDoctorSchedules(response || []);
    } catch (error) {
      console.error("Error fetching doctor schedules:", error);
      message.error(NOTIFICATION_MESSAGES.DOCTOR.WORKING_HOURS_LOAD_FAILED);
      setDoctorSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or date changes
  useEffect(() => {
    fetchDoctorSchedules(selectedDate);
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Columns for slot details table
  const slotColumns = [
    {
      title: "Thời gian",
      key: "time",
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          <Text strong>
            {record.startTime} - {record.endTime}
          </Text>
        </Space>
      ),
    },
    {
      title: "Số lượng tối đa",
      dataIndex: "maxBooking",
      key: "maxBooking",
      align: "center",
    },
    {
      title: "Đã đặt",
      dataIndex: "currentBooking",
      key: "currentBooking",
      align: "center",
      render: (current) => (
        <Tag color={current > 0 ? "orange" : "green"}>{current}</Tag>
      ),
    },
    {
      title: "Còn trống",
      dataIndex: "availableBooking",
      key: "availableBooking",
      align: "center",
      render: (available) => (
        <Tag color={available > 0 ? "green" : "red"}>{available}</Tag>
      ),
    },
  ];

  // Generate panel header for each doctor
  const generatePanelHeader = (doctorData) => {
    const { doctor, slots } = doctorData;
    const totalSlots = slots.length;

    return (
      <Row align="middle" style={{ width: "100%" }}>
        <Col flex="auto">
          <Space size="large">
            <Avatar size={40} src={doctor.imageUrl} icon={<UserOutlined />} />
            <div>
              <Title level={5} style={{ margin: 0 }}>
                {doctor.fullname || "Chưa cập nhật tên"}
              </Title>
              <Space size="middle">
                <Text type="secondary">
                  <MailOutlined /> {doctor.email}
                </Text>
                {doctor.phone && (
                  <Text type="secondary">
                    <PhoneOutlined /> {doctor.phone}
                  </Text>
                )}
              </Space>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            <Tag color="blue">{totalSlots} ca làm việc</Tag>
          </Space>
        </Col>
      </Row>
    );
  };

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined />
          <span>Quản lý Ca làm việc bác sĩ</span>
        </Space>
      }
      extra={
        <Space>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
          />
          <Button
            type="primary"
            onClick={() => fetchDoctorSchedules(selectedDate)}
            loading={loading}
          >
            Tải lại
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Hiển thị lịch làm việc của tất cả bác sĩ trong ngày{" "}
          <Text strong>{selectedDate.format("DD/MM/YYYY")}</Text>
        </Text>
      </div>

      <Spin spinning={loading}>
        {doctorSchedules.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <CalendarOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
              <Title level={4} type="secondary">
                Không có lịch làm việc nào trong ngày này
              </Title>
              <Text type="secondary">
                Vui lòng chọn ngày khác hoặc kiểm tra lại dữ liệu
              </Text>
            </div>
          </Card>
        ) : (
          <Collapse size="large" expandIconPosition="end">
            {doctorSchedules.map((doctorData, index) => (
              <Panel
                header={generatePanelHeader(doctorData)}
                key={`doctor-${doctorData.doctor.id}-${index}`}
              >
                <Table
                  columns={slotColumns}
                  dataSource={doctorData.slots}
                  rowKey="slotId"
                  pagination={false}
                  size="middle"
                  bordered
                />
              </Panel>
            ))}
          </Collapse>
        )}
      </Spin>
    </Card>
  );
};

export default DoctorWorkingHours;
