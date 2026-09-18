import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  message,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  SafetyOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "./ContactPage.css";
import Logo from "../../../assets/Logo";
import NOTIFICATION_MESSAGES from "../../../shared/constants/notificationMessages";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ContactPage() {
  const [form] = Form.useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestTypes = [
    { value: "consultation", label: "Tư vấn dịch vụ" },
    { value: "appointment", label: "Đặt lịch hẹn" },
    { value: "support", label: "Hỗ trợ kỹ thuật" },
    { value: "feedback", label: "Góp ý - Phản hồi" },
    { value: "other", label: "Khác" },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("Form submitted:", values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success(NOTIFICATION_MESSAGES.CONTACT.SEND_SUCCESS);
      setIsSubmitted(true);
      form.resetFields();

      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(NOTIFICATION_MESSAGES.CONTACT.SEND_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-page-container">
        {/* Header Section */}
        <div className="contact-header-section">
          <Space size="middle" className="contact-header-icons">
            <Logo></Logo>
          </Space>
          <Title level={1} className="contact-main-title">
            Liên Hệ Với Chúng Tôi
          </Title>
          <Paragraph className="contact-main-description">
            Chúng tôi cam kết bảo mật thông tin cá nhân và cung cấp dịch vụ chăm
            sóc sức khỏe chuyên nghiệp, tận tâm. Mọi thông tin trao đổi đều được
            mã hóa và bảo vệ nghiêm ngặt.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className="contact-content-grid">
          {/* Contact Information */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card className="contact-info-card">
                <div className="contact-card-header">
                  <Title level={3} className="contact-card-title">
                    <PhoneOutlined className="contact-title-icon" />
                    Thông Tin Liên Hệ
                  </Title>
                  <Paragraph className="contact-card-description">
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
                  </Paragraph>
                </div>

                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div className="contact-info-item">
                    <PhoneOutlined className="contact-info-icon" />
                    <div className="contact-info-details">
                      <Title level={5}>Hotline</Title>
                      <Paragraph>1900 1234 (miễn phí)</Paragraph>
                      <Paragraph>028 3456 7890</Paragraph>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <MailOutlined className="contact-info-icon" />
                    <div className="contact-info-details">
                      <Title level={5}>Email</Title>
                      <Paragraph>support@healthcare.vn</Paragraph>
                      <Paragraph>info@healthcare.vn</Paragraph>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <EnvironmentOutlined className="contact-info-icon" />
                    <div className="contact-info-details">
                      <Title level={5}>Địa chỉ</Title>
                      <Paragraph>
                        123 Đường Nguyễn Văn Cừ, Quận 1<br />
                        Thành phố Hồ Chí Minh, Việt Nam
                      </Paragraph>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <ClockCircleOutlined className="contact-info-icon" />
                    <div className="contact-info-details">
                      <Title level={5}>Giờ làm việc</Title>
                      <Paragraph>Thứ 2 - Thứ 7: 7:30 - 17:00</Paragraph>
                      <Paragraph>Chủ nhật: Đóng cửa</Paragraph>
                      <Paragraph className="contact-emergency-support">
                        Hỗ trợ khẩn cấp 24/7
                      </Paragraph>
                    </div>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>

          {/* Contact Form */}
          <Col xs={24} lg={12}>
            <Card className="contact-form-card">
              <div className="contact-card-header">
                <Title level={3} className="contact-card-title">
                  Gửi Tin Nhắn
                </Title>
                <Paragraph className="contact-card-description">
                  Điền thông tin bên dưới và chúng tôi sẽ phản hồi trong vòng
                  24h
                </Paragraph>
              </div>

              {isSubmitted ? (
                <Alert
                  message="Gửi thành công!"
                  description="Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất."
                  type="success"
                  showIcon
                  className="contact-success-alert"
                />
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  className="contact-form"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: "Email là trường bắt buộc",
                          },
                          { type: "email", message: "Email không hợp lệ" },
                        ]}
                      >
                        <Input
                          placeholder="your.email@example.com"
                          size="large"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Form.Item label="Họ và tên (tùy chọn)" name="fullName">
                        <Input placeholder="Nguyễn Văn A" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Loại yêu cầu"
                    name="requestType"
                    rules={[
                      { required: true, message: "Vui lòng chọn loại yêu cầu" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn loại yêu cầu của bạn"
                      size="large"
                    >
                      {requestTypes.map((type) => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Nội dung tin nhắn"
                    name="message"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập nội dung tin nhắn",
                      },
                    ]}
                  >
                    <TextArea
                      placeholder="Vui lòng mô tả chi tiết yêu cầu của bạn. Chúng tôi cam kết bảo mật mọi thông tin..."
                      rows={5}
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      icon={<SendOutlined />}
                      className="contact-submit-button"
                      block
                    >
                      {loading ? "Đang gửi..." : "Gửi Tin Nhắn"}
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Card>
          </Col>
        </Row>

        {/* Additional Information */}
        <div className="contact-additional-info">
          <Card className="contact-features-card">
            <Title level={3} className="contact-features-title">
              Tại Sao Chọn Chúng Tôi?
            </Title>
            <Row gutter={[24, 24]} className="contact-features-grid">
              <Col xs={24} sm={8}>
                <div className="contact-feature-item">
                  <SafetyOutlined className="contact-feature-icon" />
                  <Title level={5} className="contact-feature-title">
                    Bảo Mật Tuyệt Đối
                  </Title>
                  <Paragraph className="contact-feature-description">
                    Thông tin được mã hóa và bảo vệ nghiêm ngặt
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="contact-feature-item">
                  <HeartOutlined className="contact-feature-icon" />
                  <Title level={5} className="contact-feature-title">
                    Chăm Sóc Tận Tâm
                  </Title>
                  <Paragraph className="contact-feature-description">
                    Đội ngũ chuyên gia giàu kinh nghiệm
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="contact-feature-item">
                  <ClockCircleOutlined className="contact-feature-icon" />
                  <Title level={5} className="contact-feature-title">
                    Hỗ Trợ 24/7
                  </Title>
                  <Paragraph className="contact-feature-description">
                    Luôn sẵn sàng hỗ trợ khi bạn cần
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
}
