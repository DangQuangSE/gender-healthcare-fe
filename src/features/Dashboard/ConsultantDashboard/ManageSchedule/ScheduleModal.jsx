import React, { useState } from "react";
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Button,
  Space,
  Card,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { registerSchedule } from "../../../scheduling/scheduleApi";
import "./ScheduleModal.css";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

const { Title, Text } = Typography;

const ScheduleModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([
    { id: 1, date: null, startTime: null, endTime: null },
  ]);

  // Add new schedule item
  const addScheduleItem = () => {
    const newId = Math.max(...scheduleItems.map((item) => item.id)) + 1;
    setScheduleItems([
      ...scheduleItems,
      { id: newId, date: null, startTime: null, endTime: null },
    ]);
  };

  // Remove schedule item
  const removeScheduleItem = (id) => {
    if (scheduleItems.length > 1) {
      setScheduleItems(scheduleItems.filter((item) => item.id !== id));
    }
  };

  // Update schedule item
  const updateScheduleItem = (id, field, value) => {
    setScheduleItems(
      scheduleItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate all schedule items
      const validItems = scheduleItems.filter(
        (item) => item.date && item.startTime && item.endTime
      );

      if (validItems.length === 0) {
        toast.error(NOTIFICATION_MESSAGES.SCHEDULE.SLOT_REQUIRED);
        return;
      }

      // Check time validation
      for (const item of validItems) {
        if (
          item.startTime.isAfter(item.endTime) ||
          item.startTime.isSame(item.endTime)
        ) {
        toast.error(NOTIFICATION_MESSAGES.SCHEDULE.INVALID_TIME_RANGE);
          return;
        }
      }

      // Prepare request body according to API specification
      const requestBody = {
        scheduleItems: validItems.map((item) => ({
          workDate: item.date.format("YYYY-MM-DD"),
          timeSlotDTO: {
            startTime: item.startTime.format("HH:mm"),
            endTime: item.endTime.format("HH:mm"),
          },
        })),
      };

      console.log("Sending schedule data:", requestBody);

      const response = await registerSchedule(requestBody);
      console.log("Schedule registration response:", response);

      // Handle successful response
      if (response.data) {
        const { consultant_id, schedules } = response.data;
        console.log(
          `Registered schedules for consultant ${consultant_id}:`,
          schedules
        );

        const scheduleCount = schedules?.length || validItems.length;
      toast.success(NOTIFICATION_MESSAGES.SCHEDULE.REGISTERED(scheduleCount));
      } else {
      toast.success(NOTIFICATION_MESSAGES.SCHEDULE.REGISTERED_SINGLE);
      }

      // Reset form and close modal
      form.resetFields();
      setScheduleItems([{ id: 1, date: null, startTime: null, endTime: null }]);
      onSuccess();
      onCancel();
    } catch (error) {
      console.error("Error registering schedule:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Đăng ký lịch làm việc thất bại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    form.resetFields();
    setScheduleItems([{ id: 1, date: null, startTime: null, endTime: null }]);
    onCancel();
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          Thêm lịch làm việc
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      className="schedule-modal"
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Đăng ký lịch làm việc
        </Button>,
      ]}
    >
      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <Text type="secondary">
          Thêm các ca làm việc mới. Bạn có thể thêm nhiều ca trong cùng một lần.
        </Text>

        <Divider />

        {scheduleItems.map((item, index) => (
          <Card
            key={item.id}
            size="small"
            style={{ marginBottom: 16 }}
            title={`Ca làm việc ${index + 1}`}
            extra={
              scheduleItems.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeScheduleItem(item.id)}
                  size="small"
                >
                  Xóa
                </Button>
              )
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Ngày làm việc *</Text>
                </div>
                <DatePicker
                  placeholder="Chọn ngày"
                  style={{ width: "100%" }}
                  value={item.date}
                  onChange={(date) => updateScheduleItem(item.id, "date", date)}
                  disabledDate={disabledDate}
                  format="DD/MM/YYYY"
                />
              </Col>

              <Col span={8}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Giờ bắt đầu *</Text>
                </div>
                <TimePicker
                  placeholder="Giờ bắt đầu"
                  style={{ width: "100%" }}
                  value={item.startTime}
                  onChange={(time) =>
                    updateScheduleItem(item.id, "startTime", time)
                  }
                  format="HH:mm"
                  minuteStep={30}
                />
              </Col>

              <Col span={8}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Giờ kết thúc *</Text>
                </div>
                <TimePicker
                  placeholder="Giờ kết thúc"
                  style={{ width: "100%" }}
                  value={item.endTime}
                  onChange={(time) =>
                    updateScheduleItem(item.id, "endTime", time)
                  }
                  format="HH:mm"
                  minuteStep={30}
                />
              </Col>
            </Row>
          </Card>
        ))}

        <Button
          type="dashed"
          onClick={addScheduleItem}
          icon={<PlusOutlined />}
          style={{ width: "100%", marginTop: 8 }}
        >
          Thêm ca làm việc khác
        </Button>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
