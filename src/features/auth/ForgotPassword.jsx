import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Space, Spin } from "antd";
import "./ForgotPasswordOTP.css";
import { toast } from "react-toastify";
import {
  requestForgotPasswordOtp,
  resetPassword,
  verifyForgotPasswordOtp,
} from "./api/authApi";
import { AUTH_MESSAGES } from "../../shared/constants/authMessages";
import { getApiErrorMessage } from "../../shared/api/errors";

function ForgotPasswordOTP() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [emailForOTP, setEmailForOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (values) => {
    setLoading(true);
    try {
      const response = await requestForgotPasswordOtp(values.email.trim());
      setEmailForOTP(values.email.trim());
      setCurrentStep(1);
      toast.success(
        response.data || AUTH_MESSAGES.OTP_SENT
      ); // Lấy message từ response
      form.resetFields(["otp", "newPassword", "confirmPassword"]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, AUTH_MESSAGES.REGISTRATION_FAILED));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (values) => {
    setLoading(true);
    try {
      await verifyForgotPasswordOtp(emailForOTP, values.otp.trim());
      setCurrentStep(2);
      toast.success(AUTH_MESSAGES.OTP_VERIFICATION_SUCCESS);
      form.resetFields(["newPassword", "confirmPassword"]);
    } catch (error) {
      // Lấy thông báo lỗi cụ thể từ API (nếu có)
      toast.error(getApiErrorMessage(error, AUTH_MESSAGES.OTP_INVALID));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setLoading(true);

    if (values.newPassword !== values.confirmPassword) {
      toast.error(AUTH_MESSAGES.PASSWORD_RESET_MISMATCH);
      setLoading(false);
      return;
    }

    try {
      await resetPassword({
        email: emailForOTP,
        password: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success(AUTH_MESSAGES.PASSWORD_RESET_SUCCESS);
      navigate("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error, AUTH_MESSAGES.REGISTRATION_FAILED));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <p className="fp-otp-step-description">
              {AUTH_MESSAGES.FORGOT_EMAIL_DESCRIPTION}
            </p>
            <Form
              form={form}
              name="send_otp_form"
              onFinish={handleSendOTP}
              layout="vertical"
              className="otp-form"
            >
              <Form.Item
                label={AUTH_MESSAGES.EMAIL_LABEL}
                name="email"
                rules={[
                  { required: true, message: AUTH_MESSAGES.EMAIL_REQUIRED },
                  { type: "email", message: AUTH_MESSAGES.EMAIL_FORMAT_INVALID },
                ]}
              >
                <Input
                  className="otp-input"
                  placeholder={AUTH_MESSAGES.EMAIL_PLACEHOLDER}
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="gradient-button"
                >
                  {AUTH_MESSAGES.SEND_OTP}
                </Button>
              </Form.Item>
              <Button
                type="link"
                onClick={() => navigate("/")}
                block
                disabled={loading}
                className="fp-otp-back-link"
              >
                {AUTH_MESSAGES.BACK_HOME}
              </Button>
            </Form>
          </>
        );
      case 1:
        return (
          <>
            <p className="step-description">
              {AUTH_MESSAGES.OTP_SENT_DESCRIPTION} <strong>{emailForOTP}</strong>.
              {` ${AUTH_MESSAGES.OTP_ENTER_DESCRIPTION}`}
            </p>
            <Form
              form={form}
              name="verify_otp_form"
              onFinish={handleVerifyOTP}
              layout="vertical"
              className="fp-otp-form"
            >
              <Form.Item
                label={AUTH_MESSAGES.OTP_LABEL}
                name="otp"
                rules={[{ required: true, message: AUTH_MESSAGES.OTP_REQUIRED }]}
              >
                <Input
                  className="fp-otp-input"
                  placeholder={AUTH_MESSAGES.OTP_PLACEHOLDER}
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item>
                <Space className="form-actions-space" style={{ width: "100%" }}>
                  <Button
                    onClick={() => {
                      setCurrentStep(0);
                      form.setFieldsValue({ email: emailForOTP });
                    }}
                    disabled={loading}
                    className="secondary-button"
                  >
                    {AUTH_MESSAGES.BACK}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="gradient-button"
                  >
                    {AUTH_MESSAGES.CONFIRM_OTP}
                  </Button>
                </Space>
              </Form.Item>
              <Button
                type="link"
                onClick={() => handleSendOTP({ email: emailForOTP })}
                disabled={loading}
                className="fp-otp-resend-link"
              >
                {AUTH_MESSAGES.RESEND_OTP}
              </Button>
            </Form>
          </>
        );
      case 2:
        return (
          <>
            <p className="step-description">
              {AUTH_MESSAGES.NEW_PASSWORD_DESCRIPTION}
            </p>
            <Form
              form={form}
              name="reset_password_form"
              onFinish={handleResetPassword}
              layout="vertical"
              className="otp-form"
            >
              <Form.Item
                label={AUTH_MESSAGES.NEW_PASSWORD_LABEL}
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: AUTH_MESSAGES.PASSWORD_NEW_REQUIRED,
                  },
                  {
                    min: 6,
                    message: AUTH_MESSAGES.PASSWORD_NEW_MIN_LENGTH,
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  className="otp-input"
                  placeholder={AUTH_MESSAGES.NEW_PASSWORD_PLACEHOLDER}
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item
                label={AUTH_MESSAGES.CONFIRM_NEW_PASSWORD_LABEL}
                name="confirmPassword"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: AUTH_MESSAGES.PASSWORD_CONFIRM_NEW_REQUIRED,
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(AUTH_MESSAGES.PASSWORD_CONFIRM_MISMATCH)
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  className="otp-input"
                  placeholder={AUTH_MESSAGES.CONFIRM_NEW_PASSWORD_PLACEHOLDER}
                  disabled={loading}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="gradient-button"
                >
                  {AUTH_MESSAGES.RESET_PASSWORD}
                </Button>
              </Form.Item>
            </Form>
          </>
        );
      default:
        return <p>{AUTH_MESSAGES.RESET_INVALID_STEP}</p>;
    }
  };

  return (
    <div className="fp-otp-page">
      <Spin
        spinning={loading}
        tip={AUTH_MESSAGES.RESET_PROCESSING}
        size="large"
        fullscreen={loading}
      >
        <div className="fp-otp-card">
          <div className="fp-otp-card-header">
            {/* Logo */}
            <h2 className="fp-otp-card-title">{AUTH_MESSAGES.FORGOT_PASSWORD_TITLE}</h2>
          </div>

          <div className="fp-otp-step-content">{renderStepContent()}</div>
        </div>
      </Spin>
    </div>
  );
}

export default ForgotPasswordOTP;
