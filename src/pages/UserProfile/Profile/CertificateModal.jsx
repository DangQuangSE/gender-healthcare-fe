import { useEffect, useState } from "react";
import { Button, Col, DatePicker, Form, Input, Modal, Row, Upload, message } from "antd";
import { DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
  createCertification,
  updateCertification,
} from "../../../features/profile/profileApi";
import {
  CERTIFICATE_MESSAGES,
  CERTIFICATE_TEXT,
  createEmptyCertificate,
  normalizeCertificates,
} from "./CertificateModal.constants";

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
    normalizeCertificates(initialValue)
  );

  useEffect(() => {
    if (!visible) return;
    setCertificates(normalizeCertificates(initialValue));
  }, [initialValue, visible]);

  const updateCertificateField = (index, field, value) => {
    setCertificates((currentCertificates) =>
      currentCertificates.map((certificate, currentIndex) =>
        currentIndex === index
          ? { ...certificate, [field]: value }
          : certificate
      )
    );
  };

  const handleImageSelect = (file, index) => {
    updateCertificateField(index, "imageFile", file);
    updateCertificateField(index, "imageUrl", URL.createObjectURL(file));
    return false;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      if (isEditing && certificates.length === 1) {
        const certificate = certificates[0];
        if (!certificate.name) {
          message.error(CERTIFICATE_MESSAGES.NAME_REQUIRED);
          return;
        }

        const formData = new FormData();
        formData.append("name", certificate.name);
        formData.append("description", certificate.issuer || "");
        if (certificate.imageFile) {
          formData.append("image", certificate.imageFile);
        }

        try {
          await updateCertification(certificate.id, formData);
          message.success(CERTIFICATE_MESSAGES.UPDATE_SUCCESS);
          onSave();
        } catch {
          message.error(CERTIFICATE_MESSAGES.UPDATE_FAILED);
        }
        return;
      }

      const results = await Promise.all(
        certificates.map(async (certificate, index) => {
          if (!certificate.name || !certificate.imageFile) {
            message.error(
              !certificate.name
                ? CERTIFICATE_MESSAGES.ITEM_INVALID(index)
                : CERTIFICATE_MESSAGES.IMAGE_REQUIRED
            );
            return null;
          }

          const formData = new FormData();
          formData.append("name", certificate.name);
          formData.append("description", certificate.issuer || "");
          formData.append("image", certificate.imageFile);

          try {
            const response = await createCertification(formData);
            return response?.data ?? response;
          } catch {
            message.error(CERTIFICATE_MESSAGES.CREATE_FAILED(index));
            return null;
          }
        })
      );

      const successfulCertificates = results.filter(Boolean);
      if (successfulCertificates.length) {
        message.success(
          CERTIFICATE_MESSAGES.CREATED_COUNT(successfulCertificates.length)
        );
        onSave();
      } else {
        message.error(CERTIFICATE_MESSAGES.NONE_CREATED);
      }
    } catch {
      // Ant Design displays field-level validation errors.
    }
  };

  return (
    <Modal
      title={isEditing ? CERTIFICATE_TEXT.EDIT_TITLE : CERTIFICATE_TEXT.MANAGE_TITLE}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {CERTIFICATE_TEXT.CANCEL}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {isEditing ? CERTIFICATE_TEXT.UPDATE : CERTIFICATE_TEXT.SAVE}
        </Button>,
      ]}
      width={700}
    >
      <Form form={form} layout="vertical">
        {certificates.map((certificate, index) => (
          <div key={certificate.id || index}>
            {!isEditing && index > 0 && (
              <div style={{ margin: "16px 0", borderTop: "1px solid #f0f0f0" }} />
            )}
            {!isEditing && (
              <div className="certificate-modal-heading">
                <h4>{CERTIFICATE_TEXT.ITEM_TITLE(index)}</h4>
                {certificates.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      setCertificates((currentCertificates) =>
                        currentCertificates.filter(
                          (_, currentIndex) => currentIndex !== index
                        )
                      )
                    }
                  />
                )}
              </div>
            )}
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label={CERTIFICATE_TEXT.NAME_LABEL}
                  rules={[{ required: true, message: CERTIFICATE_MESSAGES.NAME_REQUIRED }]}
                >
                  <Input
                    placeholder={CERTIFICATE_TEXT.NAME_PLACEHOLDER}
                    value={certificate.name}
                    onChange={(event) =>
                      updateCertificateField(index, "name", event.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label={CERTIFICATE_TEXT.ISSUER_LABEL}>
                  <Input
                    placeholder={CERTIFICATE_TEXT.ISSUER_PLACEHOLDER}
                    value={certificate.issuer}
                    onChange={(event) =>
                      updateCertificateField(index, "issuer", event.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label={CERTIFICATE_TEXT.DATE_LABEL}>
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder={CERTIFICATE_TEXT.DATE_PLACEHOLDER}
                    value={certificate.date}
                    onChange={(date) => updateCertificateField(index, "date", date)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={CERTIFICATE_TEXT.IMAGE_LABEL}
                  rules={
                    !isEditing
                      ? [{ required: true, message: CERTIFICATE_MESSAGES.IMAGE_REQUIRED }]
                      : []
                  }
                >
                  <div className="certificate-modal-image-field">
                    <Upload
                      beforeUpload={(file) => handleImageSelect(file, index)}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>
                        {isEditing
                          ? CERTIFICATE_TEXT.CHANGE_IMAGE
                          : CERTIFICATE_TEXT.CHOOSE_IMAGE}
                      </Button>
                    </Upload>
                    {certificate.imageUrl && (
                      <img
                        src={certificate.imageUrl}
                        alt={CERTIFICATE_TEXT.IMAGE_ALT}
                        className="certificate-modal-image"
                      />
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </div>
        ))}
        {!isEditing && (
          <Form.Item>
            <Button
              style={{ marginTop: "16px" }}
              type="dashed"
              onClick={() =>
                setCertificates((currentCertificates) => [
                  ...currentCertificates,
                  createEmptyCertificate(),
                ])
              }
              block
              icon={<PlusOutlined />}
            >
              {CERTIFICATE_TEXT.ADD}
            </Button>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CertificateModal;
