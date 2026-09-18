import React, { useState, useEffect } from "react";
import {
  Modal,
  Select,
  Table,
  Button,
  Popconfirm,
  message,
  Tag,
  TimePicker,
  Form,
  Row,
  Col,
} from "antd";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchRoomConsultants,
  addConsultantToRoom,
  removeConsultantFromRoom,
} from "../../../catalog/api/roomApi";
import { fetchUsersByRole } from "../../../admin/api/userApi";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

const ConsultantRoomModal = ({ visible, onCancel, room }) => {
  const [consultants, setConsultants] = useState([]); // Danh sách tất cả consultant
  const [roomConsultants, setRoomConsultants] = useState([]); // Consultant trong phòng
  const [loading, setLoading] = useState(false);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [form] = Form.useForm();

  // Working days options
  const workingDayOptions = [
    { label: "Thứ 2", value: "MONDAY" },
    { label: "Thứ 3", value: "TUESDAY" },
    { label: "Thứ 4", value: "WEDNESDAY" },
    { label: "Thứ 5", value: "THURSDAY" },
    { label: "Thứ 6", value: "FRIDAY" },
    { label: "Thứ 7", value: "SATURDAY" },
    { label: "Chủ nhật", value: "SUNDAY" },
  ];

  // Load dữ liệu khi modal mở
  useEffect(() => {
    if (visible && room) {
      loadAllConsultants();
      loadRoomConsultants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, room]);

  // Lấy tất cả consultant
  const loadAllConsultants = async () => {
    try {
      setLoadingConsultants(true);
      const consultants = await fetchUsersByRole("CONSULTANT");
      setConsultants(consultants);
    } catch (error) {
      console.error(" Error loading consultants:", error);
      message.error(NOTIFICATION_MESSAGES.ROOM.CONSULTANTS_LOAD_FAILED);
    } finally {
      setLoadingConsultants(false);
    }
  };

  // Lấy consultant trong phòng
  const loadRoomConsultants = async () => {
    if (!room?.id) {
      console.log("⚠️ No room ID provided");
      return;
    }

    try {
      setLoading(true);
      console.log(" Loading consultants for room:", room.id, room.name);
      const data = await fetchRoomConsultants(room.id);
      console.log("Room consultants loaded:", data);
      console.log(" Total consultants in room:", data?.length || 0);
      setRoomConsultants(data || []);
    } catch (error) {
      console.error(" Error loading room consultants:", error);
      // fetchRoomConsultants đã xử lý 404, nên chỉ hiển thị error cho các lỗi khác
      message.error(NOTIFICATION_MESSAGES.ROOM.ROOM_CONSULTANTS_LOAD_FAILED);
      setRoomConsultants([]);
    } finally {
      setLoading(false);
    }
  };

  // Thêm bác sĩ vào phòng
  const handleAddConsultant = async () => {
    try {
      // Validate form
      const values = await form.validateFields();

      if (!room?.id) {
        message.warning(NOTIFICATION_MESSAGES.ROOM.ROOM_NOT_FOUND);
        return;
      }

      // Kiểm tra bác sĩ đã có trong phòng chưa
      const isAlreadyInRoom = roomConsultants.some(
        (consultant) => consultant.id === values.consultantId
      );

      if (isAlreadyInRoom) {
        message.warning(NOTIFICATION_MESSAGES.ROOM.CONSULTANT_EXISTS);
        return;
      }

      setLoading(true);

      // Chuẩn bị data theo format API yêu cầu (LocalTime format)
      const consultantData = {
        consultantId: values.consultantId,
        workingDay: values.workingDay,
        startTime: values.startTime.format("HH:mm:ss"),
        endTime: values.endTime.format("HH:mm:ss"),
      };

      console.log(" Adding consultant with data:", consultantData);
      await addConsultantToRoom(room.id, consultantData);
      message.success(NOTIFICATION_MESSAGES.ROOM.ADD_SUCCESS);

      // Reset form và reload data
      form.resetFields();
      await loadRoomConsultants();
    } catch (error) {
      if (error.errorFields) {
        // Form validation error
        message.warning(NOTIFICATION_MESSAGES.ROOM.FORM_REQUIRED);
        return;
      }

      console.error(" Error adding consultant to room:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        NOTIFICATION_MESSAGES.ROOM.ADD_FAILED;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xóa bác sĩ khỏi phòng (sử dụng assignmentId)
  const handleRemoveConsultant = async (assignmentId) => {
    if (!room?.id) return;

    try {
      setLoading(true);
      console.log(" Removing consultant assignment:", {
        roomId: room.id,
        assignmentId,
      });
      await removeConsultantFromRoom(room.id, assignmentId);
      message.success(NOTIFICATION_MESSAGES.ROOM.REMOVE_SUCCESS);
      await loadRoomConsultants();
    } catch (error) {
      console.error(" Error removing consultant from room:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        NOTIFICATION_MESSAGES.ROOM.REMOVE_FAILED;
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Lọc consultant chưa có trong phòng (so sánh với consultant.id trong roomConsultants)
  const availableConsultants = consultants.filter(
    (consultant) =>
      !roomConsultants.some((rc) => rc.consultant?.id === consultant.id)
  );

  // Columns cho table
  const columns = [
    {
      title: "Tên bác sĩ",
      key: "fullname",
      width: 200,
      render: (_, record) => record.consultant?.fullname || "N/A",
    },
    {
      title: "Email",
      key: "email",
      width: 220,
      render: (_, record) => record.consultant?.email || "N/A",
    },
    {
      title: "Số điện thoại",
      key: "phone",
      width: 140,
      render: (_, record) => record.consultant?.phone || "Chưa cung cấp",
    },
    {
      title: "Giờ làm việc",
      key: "workingTime",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Bắt đầu: <strong>{record.startTime || "N/A"}</strong>
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Kết thúc: <strong>{record.endTime || "N/A"}</strong>
          </div>
        </div>
      ),
    },
    {
      title: "Chuyên khoa",
      key: "specializations",
      width: 200,
      render: (_, record) => {
        const specializationIds = record.consultant?.specializationIds;
        if (specializationIds && specializationIds.length > 0) {
          return (
            <div>
              {specializationIds.map((specId, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                  ID: {specId}
                </Tag>
              ))}
            </div>
          );
        }
        return <span style={{ color: "#999" }}>Chưa có</span>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xóa bác sĩ khỏi phòng"
          description={`Bạn có chắc chắn muốn xóa bác sĩ "${record.consultant?.fullname}" khỏi phòng?`}
          onConfirm={() => handleRemoveConsultant(record.id)}
          okText="Có"
          cancelText="Không"
          okType="danger"
        >
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            title="Xóa khỏi phòng"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={`Quản lý bác sĩ - ${room?.name || "Phòng"}`}
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      {/* Thêm bác sĩ mới */}
      <div
        style={{
          marginBottom: 16,
          padding: 16,
          background: "#f5f5f5",
          borderRadius: 8,
        }}
      >
        <h4 style={{ marginBottom: 12 }}>Thêm bác sĩ vào phòng</h4>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            startTime: dayjs("08:00", "HH:mm"),
            endTime: dayjs("17:00", "HH:mm"),
            workingDay: "MONDAY",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="consultantId"
                label="Chọn bác sĩ"
                rules={[{ required: true, message: "Vui lòng chọn bác sĩ!" }]}
              >
                <Select
                  placeholder="Chọn bác sĩ để thêm vào phòng"
                  loading={loadingConsultants}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {availableConsultants.map((consultant) => (
                    <Select.Option key={consultant.id} value={consultant.id}>
                      {consultant.fullname} - {consultant.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="workingDay"
                label="Ngày làm việc"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày làm việc!" },
                ]}
              >
                <Select placeholder="Chọn ngày làm việc">
                  {workingDayOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Giờ bắt đầu"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ bắt đầu!" },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="Chọn giờ bắt đầu"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="Giờ kết thúc"
                rules={[
                  { required: true, message: "Vui lòng chọn giờ kết thúc!" },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="Chọn giờ kết thúc"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleAddConsultant}
              loading={loading}
            >
              Thêm bác sĩ vào phòng
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Danh sách bác sĩ trong phòng */}
      <div>
        <h4 style={{ marginBottom: 12 }}>
          Bác sĩ trong phòng ({roomConsultants.length})
        </h4>
        <Table
          columns={columns}
          dataSource={roomConsultants}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} bác sĩ`,
          }}
          locale={{
            emptyText: "Chưa có bác sĩ nào trong phòng này",
          }}
        />
      </div>
    </Modal>
  );
};

export default ConsultantRoomModal;
