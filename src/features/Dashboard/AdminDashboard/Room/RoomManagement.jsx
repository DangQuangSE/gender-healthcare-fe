import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Form,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  fetchRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from "../../../catalog/api/roomApi";
import RoomModal from "./RoomModal";
import ConsultantRoomModal from "./ConsultantRoomModal";
import dayjs from "dayjs";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

const RoomManagement = () => {
  // States
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
  const [isConsultantModalVisible, setIsConsultantModalVisible] =
    useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Load rooms on mount
  useEffect(() => {
    loadRooms();
  }, []);

  // Load rooms from API
  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await fetchRooms();
      setRooms(data);
    } catch (error) {
      console.error("Error loading rooms:", error);
      message.error(NOTIFICATION_MESSAGES.ROOM.LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // Handle add room
  const handleAddRoom = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsRoomModalVisible(true);
  };

  // Handle edit room
  const handleEditRoom = (record) => {
    setEditingRoom(record);

    // Convert time strings to dayjs objects for TimePicker
    const formData = {
      ...record,
      openTime: record.openTime ? dayjs(record.openTime, "HH:mm:ss") : null,
      closeTime: record.closeTime ? dayjs(record.closeTime, "HH:mm:ss") : null,
    };

    form.setFieldsValue(formData);
    setIsRoomModalVisible(true);
  };

  // Handle delete room
  const handleDeleteRoom = async (id) => {
    try {
      await deleteRoom(id);
      message.success(NOTIFICATION_MESSAGES.ROOM.DELETE_SUCCESS);
      await loadRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      message.error(NOTIFICATION_MESSAGES.ROOM.DELETE_FAILED);
    }
  };

  // Handle modal OK (save)
  const handleRoomModalOk = async (roomData) => {
    try {
      if (editingRoom) {
        // Update existing room
        await updateRoom(editingRoom.id, roomData);
        message.success(NOTIFICATION_MESSAGES.ROOM.UPDATE_SUCCESS);
      } else {
        // Add new room
        await addRoom(roomData);
        message.success(NOTIFICATION_MESSAGES.ROOM.CREATE_SUCCESS);
      }

      // Close modal and reset form
      setIsRoomModalVisible(false);
      form.resetFields();
      setEditingRoom(null);

      // Reload data
      await loadRooms();
    } catch (error) {
      console.error("Error saving room:", error);
      message.error(NOTIFICATION_MESSAGES.ROOM.SAVE_FAILED);
    }
  };

  // Handle modal cancel
  const handleRoomModalCancel = () => {
    setIsRoomModalVisible(false);
    form.resetFields();
    setEditingRoom(null);
  };

  // Handle manage consultants
  const handleManageConsultants = (room) => {
    setSelectedRoom(room);
    setIsConsultantModalVisible(true);
  };

  // Handle consultant modal cancel
  const handleConsultantModalCancel = () => {
    setIsConsultantModalVisible(false);
    setSelectedRoom(null);
  };

  // Helper function to get specialization name (không cần thiết nữa vì API trả về object)
  // const getSpecializationName = (specializationId) => {
  //   const specialization = specializations.find(
  //     (spec) => spec.id === specializationId
  //   );
  //   return specialization ? specialization.name : `ID: ${specializationId}`;
  // };

  // Table columns definition
  const roomColumns = [
    {
      title: "Tên Phòng",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialization",
      key: "specialization",
      width: 150,
      render: (specialization) => (
        <Tag color="blue">{specialization?.name || "Chưa có"}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<UserOutlined />}
            size="small"
            onClick={() => handleManageConsultants(record)}
            title="Quản lý bác sĩ"
          >
            Bác sĩ
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditRoom(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa phòng này?"
            onConfirm={() => handleDeleteRoom(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Quản lý Phòng khám"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRoom}
          >
            Thêm Phòng
          </Button>
        }
      >
        <Table
          columns={roomColumns}
          dataSource={rooms}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} phòng`,
          }}
        />
      </Card>

      <RoomModal
        visible={isRoomModalVisible}
        onOk={handleRoomModalOk}
        onCancel={handleRoomModalCancel}
        form={form}
        editingRoom={editingRoom}
      />

      <ConsultantRoomModal
        visible={isConsultantModalVisible}
        onCancel={handleConsultantModalCancel}
        room={selectedRoom}
      />
    </>
  );
};

export default RoomManagement;
