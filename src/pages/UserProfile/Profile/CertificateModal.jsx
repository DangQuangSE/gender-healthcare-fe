import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  message,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  createCertification,
  updateCertification,
} from "../../../features/profile/profileApi";
import NOTIFICATION_MESSAGES from "../../../shared/constants/notificationMessages";

const CertificateModal = ({
  visible,
  onCancel,
  onSave,
  initialValue = [],
  loading,
  isEditing = false,
}) => {
  const [form] = Form.useForm();
  const [certificates, setCertificates] = useState(
    initialValue.length
      ? initialValue.map((cert) => ({
          ...cert,
          imageFile: null, // Reset imageFile for editing
        }))
      : [{ name: "", issuer: "", date: null, imageUrl: "", imageFile: null }]
  );

  // Reset certificates when modal opens/closes or initialValue changes
  useEffect(() => {
    if (visible) {
      if (initialValue.length) {
        setCertificates(
          initialValue.map((cert) => ({
            ...cert,
            imageFile: null,
          }))
        );
      } else {
        setCertificates([
          { name: "", issuer: "", date: null, imageUrl: "", imageFile: null },
        ]);
      }
    }
  }, [visible, initialValue]);

  const handleAddCertificate = () => {
    setCertificates([
      ...certificates,
      { name: "", issuer: "", date: null, imageUrl: "", imageFile: null },
    ]);
  };

  const handleRemoveCertificate = (index) => {
    const newCertificates = [...certificates];
    newCertificates.splice(index, 1);
    setCertificates(newCertificates);
  };

  const handleCertificateChange = (index, field, value) => {
    const newCertificates = [...certificates];
    newCertificates[index][field] = value;
    setCertificates(newCertificates);
  };

  const handleImageSelect = (file, index) => {
    // Lưu file vào state để sau này gửi lên server
    handleCertificateChange(index, "imageFile", file);

    // Tạo URL tạm thời để hiển thị preview
    const imageUrl = URL.createObjectURL(file);
    handleCertificateChange(index, "imageUrl", imageUrl);

    // Không tải lên ngay, chỉ lưu file để tải lên khi submit form
    return false; // Prevent default upload behavior
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      if (isEditing && certificates.length === 1) {
        // Chế độ chỉnh sửa - chỉ có 1 chứng chỉ
        const cert = certificates[0];

        if (!cert.name) {
          message.error(NOTIFICATION_MESSAGES.CERTIFICATE.NAME_REQUIRED);
          return;
        }

        const formData = new FormData();
        formData.append("name", cert.name);
        formData.append("description", cert.issuer || "");

        // Chỉ gửi hình ảnh mới nếu người dùng đã chọn file mới
        if (cert.imageFile) {
          formData.append("image", cert.imageFile);
        }

        try {
          const response = await updateCertification(cert.id, formData);

          message.success(NOTIFICATION_MESSAGES.CERTIFICATE.UPDATE_SUCCESS);
          onSave([response.data]);
        } catch {
          message.error(NOTIFICATION_MESSAGES.CERTIFICATE.UPDATE_FAILED);
        }
      } else {
        // Chế độ tạo mới - logic cũ
        const certificatePromises = certificates.map(async (cert, index) => {
          if (!cert.name || !cert.imageFile) {
            message.error(NOTIFICATION_MESSAGES.CERTIFICATE.ITEM_INVALID(index));
            return null;
          }

          const formData = new FormData();
          formData.append("name", cert.name);
          formData.append("description", cert.issuer || "");
          formData.append("image", cert.imageFile);

          try {
            const response = await createCertification(formData);

            return response.data;
          } catch {
            message.error(NOTIFICATION_MESSAGES.CERTIFICATE.CREATE_FAILED(index));
            return null;
          }
        });

        const results = await Promise.all(certificatePromises);
        const successfulCertificates = results.filter(
          (result) => result !== null
        );

        if (successfulCertificates.length > 0) {
          message.success(
            NOTIFICATION_MESSAGES.CERTIFICATE.CREATED_COUNT(
              successfulCertificates.length
            )
          );
          onSave(successfulCertificates);
        } else {
          message.error(NOTIFICATION_MESSAGES.CERTIFICATE.NONE_CREATED);
        }
      }
    } catch {
      // Field-level validation already displays the relevant message.
    }
  };

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa chứng chỉ" : "Quản lý chứng chỉ"}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {isEditing ? "Cập nhật" : "Lưu"}
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} layout="vertical">
        {certificates.map((cert, index) => (
          <div key={index}>
            {/* Chỉ hiển thị nút thêm/xóa khi không ở chế độ chỉnh sửa */}
            {!isEditing && index > 0 && (
              <div
                style={{ margin: "16px 0", borderTop: "1px solid #f0f0f0" }}
              ></div>
            )}
            {!isEditing && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4>Chứng chỉ #{index + 1}</h4>
                {certificates.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveCertificate(index)}
                  />
                )}
              </div>
            )}

            {/* Form fields */}
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label="Tên chứng chỉ"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên chứng chỉ" },
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: Chứng chỉ tiếng Anh IELTS"
                    value={cert.name}
                    onChange={(e) =>
                      handleCertificateChange(index, "name", e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label="Đơn vị cấp">
                  <Input
                    placeholder="Ví dụ: British Council"
                    value={cert.issuer}
                    onChange={(e) =>
                      handleCertificateChange(index, "issuer", e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label="Ngày cấp">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Chọn ngày cấp"
                    value={cert.date}
                    onChange={(date) =>
                      handleCertificateChange(index, "date", date)
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Hình ảnh chứng chỉ"
                  rules={
                    !isEditing
                      ? [
                          {
                            required: true,
                            message: "Vui lòng chọn hình ảnh chứng chỉ",
                          },
                        ]
                      : []
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Upload
                      beforeUpload={(file) => handleImageSelect(file, index)}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>
                        {isEditing ? "Thay đổi ảnh" : "Chọn ảnh"}
                      </Button>
                    </Upload>
                    {cert.imageUrl && (
                      <div style={{ marginTop: "8px" }}>
                        <img
                          src={cert.imageUrl}
                          alt="Certificate"
                          style={{
                            width: "100%",
                            maxHeight: "150px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: "1px solid #d9d9d9",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </div>
        ))}

        {/* Chỉ hiển thị nút thêm chứng chỉ khi không ở chế độ chỉnh sửa */}
        {!isEditing && (
          <Form.Item>
            <Button
              style={{ marginTop: "16px" }}
              type="dashed"
              onClick={handleAddCertificate}
              block
              icon={<PlusOutlined />}
            >
              Thêm chứng chỉ
            </Button>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CertificateModal;
