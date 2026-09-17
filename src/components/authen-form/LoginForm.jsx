import { useState } from "react";
import { Form, Input } from "antd";
import GradientButton from "../common/GradientButton";
import LoginGoogle from "../../api/LoginGoogle";
import api from "../../configs/api";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { login } from "../../redux/reduxStore/userSlice";
import { useNavigate } from "react-router-dom";
import { getLoginSession, saveLoginSession } from "../../shared/auth/session";
import { AUTH_MESSAGES } from "../../shared/constants/authMessages";
import "./LoginForm.css";

const LoginForm = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });
      const session = getLoginSession(res.data);

      if (!session.token || !session.user) {
        throw new Error(AUTH_MESSAGES.INVALID_USER);
      }

      saveLoginSession(res.data);
      dispatch(login(session));
      toast.success(AUTH_MESSAGES.LOGIN_SUCCESS);
      if (onClose) onClose();

      switch (session.user.role) {
        case "CUSTOMER":
          navigate("/");
          break;
        case "ADMIN":
          navigate("/dashboard");
          break;
        case "STAFF":
          navigate("/staff");
          break;
        case "CONSULTANT":
          navigate("/consultant");
          break;
        default:
          navigate("/error");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error(AUTH_MESSAGES.INVALID_CREDENTIALS);
      } else {
        toast.error(err.message || AUTH_MESSAGES.LOGIN_FAILED);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { credential } = credentialResponse;

      const res = await api.post(
        "/auth/google",
        { accessToken: credential },
        { headers: { "Content-Type": "application/json" } }
      );

      const session = getLoginSession(res.data);
      if (session.token && session.user) {
        saveLoginSession(res.data);
        dispatch(login(session));
        toast.success(AUTH_MESSAGES.GOOGLE_LOGIN_SUCCESS);
        if (onClose) onClose();
        navigate("/");
      } else {
        toast.error(AUTH_MESSAGES.LOGIN_MISSING_SESSION);
      }
    } catch (error) {
      toast.error(error.message || AUTH_MESSAGES.GOOGLE_AUTH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-wrapper">
      <Form form={form} layout="vertical" onFinish={handleLogin}>
        <div className="auth-modal-logo">
          <img src="/logostc.png" alt="Logo" />
        </div>
        <h2 className="login-title">Đăng nhập</h2>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: AUTH_MESSAGES.EMAIL_REQUIRED },
            { type: "email", message: AUTH_MESSAGES.EMAIL_INVALID },
          ]}
        >
          <Input placeholder="Nhập email" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: AUTH_MESSAGES.PASSWORD_REQUIRED }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" size="large" />
        </Form.Item>
        <div className="forgot-password">
          <span>Quên mật khẩu?</span>
          <a href="/forgot-password">Lấy lại mật khẩu</a>
        </div>
        <Form.Item className="submit-button">
          <GradientButton htmlType="submit" block loading={loading}>
            Đăng nhập
          </GradientButton>
        </Form.Item>
      </Form>

      <div className="login-divider">
        <div className="login-divider-text">Hoặc tiếp tục bằng</div>
        <div className="login-socials">
          <LoginGoogle onSuccess={handleGoogleSuccess} />
        </div>
        <div className="login-policy">
          Bằng cách đăng ký, bạn đồng ý với <a href="#">Chính sách bảo mật</a>{" "}
          và <a href="#">Điều khoản sử dụng</a>.
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
