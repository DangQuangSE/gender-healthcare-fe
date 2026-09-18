import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, TimePicker, message } from "antd";
import { fetchSpecializations } from "../../../catalog/api/specializationApi";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";
// import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const RoomModal = ({ visible, onOk, onCancel, form, editingRoom }) => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load specializations khi modal mở
  useEffect(() => {
    if (visible) {
      loadSpecializations();
    }
  }, [visible]);

  // Load specializations từ API
  const loadSpecializations = async () => {
    try {
      setLoading(true);
      const data = await fetchSpecializations();
      setSpecializations(data);
    } catch (error) {
      console.error("Error loading specializations:", error);
      message.error(NOTIFICATION_MESSAGES.ROOM.SPECIALIZATIONS_LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(" RoomModal form values:", values);

      // Convert time to string format
      const roomData = {
        ...values,
        openTime: values.openTime ? values.openTime.format("HH:mm:ss") : null,
        closeTime: values.closeTime
          ? values.closeTime.format("HH:mm:ss")
          : null,
      };

      console.log(" Processed room data:", roomData);
      onOk(roomData);
    } catch (error) {
      console.error(" Form validation failed:", error);
    }
  };

  return (
    <Modal
      title={editingRoom ? "Sửa Phòng" : "Thêm Phòng"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên Phòng"
          rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
        >
          <Input placeholder="Nhập tên phòng" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} placeholder="Nhập mô tả phòng" />
        </Form.Item>

        <Form.Item
          name="specializationId"
          label="Chuyên khoa"
          rules={[{ required: true, message: "Vui lòng chọn chuyên khoa!" }]}
        >
          <Select
            placeholder="Chọn chuyên khoa"
            loading={loading}
            notFoundContent={loading ? "Đang tải..." : "Không có dữ liệu"}
          >
            {specializations.map((spec) => (
              <Option key={spec.id} value={spec.id}>
                {spec.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoomModal;
