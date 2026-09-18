import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { fetchSpecializations } from "../../../catalog/api/specializationApi";
import dayjs from "dayjs";
import { uploadClient } from "../../../../shared/api/client";
import {
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
} from "../../../../shared/config/env";
import USER_MESSAGES from "../../../../shared/constants/userMessages";

const { Option } = Select;
const { TextArea } = Input;

const CreateUserModal = ({ visible, onOk, onCancel, form, editingUser }) => {
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Load specializations khi modal mở
  useEffect(() => {
    if (visible) {
      loadSpecializations();
    }
  }, [visible]);

  // Load specializations từ API
  const loadSpecializations = async () => {
    try {
      setLoadingSpecializations(true);
      const data = await fetchSpecializations();
      setSpecializations(data);
    } catch (error) {
      console.error("Error loading specializations:", error);
      message.error(USER_MESSAGES.SPECIALIZATIONS_LOAD_FAILED);
    } finally {
      setLoadingSpecializations(false);
    }
  };

  // Set form values khi edit user
  useEffect(() => {
    if (editingUser && visible) {
      form.setFieldsValue({
        ...editingUser,
        dateOfBirth: editingUser.dateOfBirth
          ? dayjs(editingUser.dateOfBirth)
          : null,
        specializationIds: editingUser.specializationIds || [],
      });
      setSelectedRole(editingUser.role);
      setImageUrl(editingUser.imageUrl || "");
    } else if (visible) {
      setSelectedRole(null);
      setImageUrl("");
    }
  }, [editingUser, visible, form]);

  // Handle role change
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    // Clear specialization when role is not CONSULTANT
    if (value !== "CONSULTANT") {
      form.setFieldsValue({ specializationIds: [] });
    }
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);

      if (!CLOUDINARY_UPLOAD_URL || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error(USER_MESSAGES.IMAGE_UPLOAD_NOT_CONFIGURED);
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await uploadClient.post("", formData);
      const data = response.data;

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        form.setFieldsValue({ imageUrl: data.secure_url });
        message.success(USER_MESSAGES.IMAGE_UPLOAD_SUCCESS);
      } else {
        throw new Error(USER_MESSAGES.IMAGE_UPLOAD_FAILED);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error(error.message || USER_MESSAGES.IMAGE_UPLOAD_FAILED);
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl("");
    setSelectedRole(null);
    onCancel();
  };

  return (
    <Modal
      title={editingUser ? "Sửa Người dùng" : "Thêm Người dùng"}
      open={visible}
      onOk={onOk}
      onCancel={handleCancel}
      width={600}
      okText={editingUser ? "Cập nhật" : "Thêm"}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" className="user-modal-form">
        <Form.Item
          name="role"
          label="Vai trò"
          rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
        >
          <Select placeholder="Chọn vai trò" onChange={handleRoleChange}>
            <Option value="CUSTOMER">Khách hàng</Option>
            <Option value="STAFF">Nhân viên</Option>
            <Option value="CONSULTANT">Tư vấn viên - Bác sĩ</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="fullname"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        {selectedRole === "CONSULTANT" && (
          <div className="specialization-field-container">
            <Form.Item
              name="specializationIds"
              label="Chuyên khoa"
              help="Chọn chuyên khoa cho tư vấn viên"
            >
              <Select
                mode="multiple"
                placeholder="Chọn chuyên khoa"
                loading={loadingSpecializations}
                allowClear
              >
                {specializations.map((spec) => (
                  <Option key={spec.id} value={spec.id}>
                    {spec.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}

        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Vui lòng nhập email hợp lệ!",
            },
          ]}
        >
          <Input placeholder="Nhập địa chỉ email" />
        </Form.Item>

        <Form.Item name="phone" label="Số điện thoại">
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item name="dateOfBirth" label="Ngày sinh">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày sinh"
            format="DD/MM/YYYY"
          />
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <TextArea rows={2} placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item name="gender" label="Giới tính">
          <Select placeholder="Chọn giới tính">
            <Option value="MALE">Nam</Option>
            <Option value="FEMALE">Nữ</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item name="imageUrl" label="Hình ảnh đại diện">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Upload
              beforeUpload={handleImageUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                {uploading ? "Đang tải lên..." : "Chọn ảnh"}
              </Button>
            </Upload>
            {imageUrl && (
              <div style={{ marginTop: "8px" }}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #d9d9d9",
                  }}
                />
              </div>
            )}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;
