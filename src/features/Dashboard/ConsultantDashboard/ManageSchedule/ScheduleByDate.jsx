import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Collapse,
  Tag,
  Button,
  Space,
  Popconfirm,
  Empty,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getConsultantSchedules,
  cancelSchedule,
} from "../../../scheduling/scheduleApi";
import dayjs from "dayjs";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

const { Panel } = Collapse;

const ScheduleByDate = ({ userId, onEditSchedule }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load schedule data
  const loadScheduleData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const today = dayjs().format("YYYY-MM-DD");
      const oneMonthLater = dayjs().add(30, "day").format("YYYY-MM-DD");

      const res = await getConsultantSchedules(userId, today, oneMonthLater);
      console.log("Schedule data from API:", res.data);

      if (res.data && Array.isArray(res.data)) {
        // Sort by date
        const sortedData = res.data.sort(
          (a, b) => new Date(a.workDate) - new Date(b.workDate)
        );
        setScheduleData(sortedData);
      } else {
        setScheduleData([]);
      }
    } catch (error) {
      console.error("Error loading schedule data:", error);
      toast.error(NOTIFICATION_MESSAGES.SCHEDULE.LOAD_FAILED);
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Cancel schedule slot
  const handleCancelSlot = async (slot, workDate) => {
    try {
      const scheduleData = {
        consultant_id: userId,
        date: `${workDate}T${slot.startTime}`,
        startTime: slot.startTime.substring(0, 5),
        endTime: slot.endTime.substring(0, 5),
        reason: "Hủy lịch làm việc",
      };

      await cancelSchedule(scheduleData);
      toast.success(NOTIFICATION_MESSAGES.SCHEDULE.CANCEL_SUCCESS);
      loadScheduleData(); // Reload data
    } catch (error) {
      console.error("Error canceling schedule:", error);
      toast.error(NOTIFICATION_MESSAGES.SCHEDULE.CANCEL_FAILED);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Format date for display
  const formatDate = (dateString) => {
    return dayjs(dateString).format("dddd, DD/MM/YYYY");
  };

  // Get status info
  const getStatusInfo = (slot) => {
    if (slot.availableBooking === 0) {
      return { color: "red", text: "Đã đầy" };
    } else if (slot.currentBooking === 0) {
      return { color: "blue", text: "Chưa có đặt lịch" };
    } else {
      return { color: "green", text: "Còn chỗ" };
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
        </div>
      </Card>
    );
  }

  if (scheduleData.length === 0) {
    return (
      <Card>
        <Empty
          description="Chưa có lịch làm việc nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Lịch làm việc theo ngày
        </div>
      }
    >
      <Collapse
        defaultActiveKey={[scheduleData[0]?.workDate]}
        ghost
        size="small"
      >
        {scheduleData.map((daySchedule) => (
          <Panel
            header={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "16px" }}>
                  {formatDate(daySchedule.workDate)}
                </span>
                <Tag color="blue">
                  {daySchedule.slots?.length || 0} ca làm việc
                </Tag>
              </div>
            }
            key={daySchedule.workDate}
          >
            <div style={{ display: "grid", gap: "12px" }}>
              {daySchedule.slots && daySchedule.slots.length > 0 ? (
                daySchedule.slots
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((slot) => {
                    const statusInfo = getStatusInfo(slot);
                    return (
                      <Card
                        key={slot.slotId}
                        size="small"
                        style={{
                          border: "1px solid #f0f0f0",
                          borderRadius: "8px",
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                            }}
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <ClockCircleOutlined
                                style={{ marginRight: 4, color: "#1890ff" }}
                              />
                              <span style={{ fontWeight: 500 }}>
                                {slot.startTime.substring(0, 5)} -{" "}
                                {slot.endTime.substring(0, 5)}
                              </span>
                            </div>

                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <UserOutlined
                                style={{ marginRight: 4, color: "#52c41a" }}
                              />
                              <span>
                                {slot.currentBooking}/{slot.maxBooking} bệnh
                                nhân
                              </span>
                            </div>

                            <Tag color={statusInfo.color}>
                              {statusInfo.text}
                            </Tag>
                          </div>

                          <Space>
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() =>
                                onEditSchedule &&
                                onEditSchedule(slot, daySchedule.workDate)
                              }
                            >
                              Sửa
                            </Button>
                            <Popconfirm
                              title="Bạn chắc chắn muốn hủy ca làm việc này?"
                              description="Hành động này không thể hoàn tác"
                              onConfirm={() =>
                                handleCancelSlot(slot, daySchedule.workDate)
                              }
                              okText="Đồng ý"
                              cancelText="Hủy"
                            >
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                              >
                                Hủy
                              </Button>
                            </Popconfirm>
                          </Space>
                        </div>
                      </Card>
                    );
                  })
              ) : (
                <Empty
                  description="Không có ca làm việc nào trong ngày này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: "20px 0" }}
                />
              )}
            </div>
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
};

export default ScheduleByDate;
