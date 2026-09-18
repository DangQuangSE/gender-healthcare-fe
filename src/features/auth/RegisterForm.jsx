import { useState } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import GradientButton from "../../components/common/GradientButton";
import {
  configurePassword,
  login as loginRequest,
  loginWithGoogle,
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from "./api/authApi";
import { useDispatch } from "react-redux";
import { login } from "../../redux/reduxStore/userSlice";
import { toast } from "react-toastify";
import LoginGoogle from "./GoogleLogin";
import { getLoginSession, saveLoginSession } from "../../shared/auth/session";
import { AUTH_MESSAGES } from "../../shared/constants/authMessages";
import { ROUTES } from "../../shared/constants/routes";

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const dispatch = useDispatch();

  const handleCheckEmail = async () => {
    try {
      const value = await form.validateFields(["email"]);
      setLoading(true);
      setEmail(value.email);

      const res = await requestRegistrationOtp(value.email);

      // Nếu không throw thì thành công
      if (res.data && res.data.includes("OTP đã được gửi")) {
        message.success(AUTH_MESSAGES.OTP_SENT);
        setStep(2);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : "";

      if (errMsg.includes("Email đã tồn tại")) {
        message.info(AUTH_MESSAGES.EMAIL_EXISTS);
      } else {
        message.error(errMsg || AUTH_MESSAGES.REGISTRATION_FAILED);
      }
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async () => {
    try {
      const value = await otpForm.validateFields(["otp"]);
      setLoading(true);
      // Gửi API xác thực OTP
      const res = await verifyRegistrationOtp(email, value.otp);
      // Nếu trả về chuỗi thành công
      if (typeof res.data === "string" && res.data.toLowerCase()) {
        message.success(AUTH_MESSAGES.OTP_VERIFIED);
        setStep(3);
      } else {
        message.error(AUTH_MESSAGES.OTP_INVALID);
      }
    } catch (err) {
      // Nếu backend trả về chuỗi lỗi
      const errMsg =
        err?.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : "";
      if (errMsg.includes("OTP không hợp lệ") || errMsg.includes("hết hạn")) {
        message.error(AUTH_MESSAGES.OTP_INVALID);
      } else {
        message.error(AUTH_MESSAGES.REGISTRATION_FAILED);
      }
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Tạo mật khẩu mới
  const handleCreateAccount = async (values) => {
    try {
      setLoading(true);

      const res = await configurePassword({
        email,
        password: values.password,
        confirmPassword: values.confirm,
      });

      // Giả sử API chỉ trả về chuỗi thông báo thành công
      if (
        typeof res.data === "string" &&
        res.data.toLowerCase().includes("thành công")
      ) {
        // Không có user để dispatch (vì chỉ là string "Thành công!")
        message.success(AUTH_MESSAGES.REGISTRATION_SUCCESS);
        window.location.href = ROUTES.HOME;
      }
      // Nếu API trả về object có user:
      else if (
        res.data &&
        res.data.message &&
        res.data.message.toLowerCase().includes("thành công") &&
        res.data.user
      ) {
        dispatch(login());
        message.success(AUTH_MESSAGES.REGISTRATION_SUCCESS);
        window.location.href = ROUTES.HOME;
      } else {
        message.error(AUTH_MESSAGES.REGISTRATION_FAILED);
      }
    } catch (err) {
      // Nếu chắc chắn chỉ lỗi mật khẩu không cần thông báo
      if (
        err?.response?.data &&
        typeof err.response.data === "string" &&
        err.response.data.includes("Mật khẩu")
      ) {
        message.error(err.response.data);
      } else {
        const errMsg =
          err?.response?.data && typeof err.response.data === "string"
            ? err.response.data
            : AUTH_MESSAGES.REGISTRATION_FAILED;
        message.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Bước 4: Đăng nhập nếu đã có tài khoản
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const res = await loginRequest({
        email,
        password: values.password,
      });
      const session = getLoginSession(res.data);
      if (session.token && session.user) {
        saveLoginSession(res.data);
        dispatch(login(session));
        message.success(AUTH_MESSAGES.LOGIN_SUCCESS);
        window.location.href = ROUTES.HOME;
      } else {
        message.error(AUTH_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (err) {
      message.error(err.message || AUTH_MESSAGES.LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập Google thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { credential } = credentialResponse;
      // Gửi idToken lên backend để xác thực hoặc lấy thông tin user
      const res = await loginWithGoogle(credential);
      const session = getLoginSession(res.data);
      if (session.token && session.user) {
        saveLoginSession(res.data);
        dispatch(login(session));
        window.location.href = "/";

        toast.success(AUTH_MESSAGES.GOOGLE_LOGIN_SUCCESS);
        // TODO: Đóng modal hoặc redirect, ví dụ:
      } else {
        toast.error(AUTH_MESSAGES.GOOGLE_LOGIN_FAILED);
      }
    } catch (error) {
      toast.error(error.message || AUTH_MESSAGES.GOOGLE_AUTH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      {/* Step 1: Nhập email */}
      {step === 1 && (
        <Spin spinning={loading}>
          <Form form={form} layout="vertical">
            <div className="auth-modal-logo">
              <img src="/logostc.png" alt="Logo" />
            </div>
            <h2 className="login-title">Tạo tài khoản</h2>
            <Form.Item
              name="email"
              label="Vui lòng nhập email của bạn"
              rules={[
                { required: true, message: AUTH_MESSAGES.EMAIL_REQUIRED },
                { type: "email", message: AUTH_MESSAGES.EMAIL_INVALID },
              ]}
            >
              <Input size="large" placeholder="Nhập email" />
            </Form.Item>
            <Form.Item>
              <GradientButton
                block
                loading={loading}
                onClick={handleCheckEmail}
              >
                Tiếp tục
              </GradientButton>
            </Form.Item>
            <div style={{ margin: "32px 0 0" }}>
              <div
                style={{ textAlign: "center", color: "#bbb", marginBottom: 16 }}
              >
                Hoặc tiếp tục bằng
              </div>
              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                <LoginGoogle onSuccess={handleGoogleSuccess} />
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 20 }}>
                Bằng cách đăng ký, bạn đồng ý với{" "}
                <a href="#" style={{ color: "#3870ff" }}>
                  Chính sách bảo mật
                </a>{" "}
                và{" "}
                <a href="#" style={{ color: "#3870ff" }}>
                  Điều khoản sử dụng
                </a>
                .
              </div>
            </div>
          </Form>
        </Spin>
      )}

      {/* Step 2: Nhập OTP */}
      {step === 2 && (
        <Spin spinning={loading}>
          <Form form={otpForm} layout="vertical">
            <Form.Item
              name="otp"
              rules={[{ required: true, message: AUTH_MESSAGES.OTP_REQUIRED }]}
            >
              <Input size="large" placeholder="Nhập mã OTP" />
            </Form.Item>
            <Form.Item>
              <GradientButton block loading={loading} onClick={handleVerifyOtp}>
                Xác nhận OTP
              </GradientButton>
            </Form.Item>
            <Form.Item>
              <Button
                block
                type="default"
                onClick={() => {
                  setStep(1);
                  otpForm.resetFields();
                }}
                style={{ marginTop: 8 }}
              >
                Trở lại
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      )}

      {/* Step 3: Tạo mật khẩu mới */}
      {step === 3 && (
        <Spin spinning={loading}>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleCreateAccount}
          >
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: AUTH_MESSAGES.PASSWORD_REQUIRED },
                { min: 8, message: AUTH_MESSAGES.PASSWORD_MIN_LENGTH },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                  message:
                    AUTH_MESSAGES.PASSWORD_PATTERN,
                },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(AUTH_MESSAGES.PASSWORD_MISMATCH);
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" size="large" />
            </Form.Item>
            <Form.Item>
              <GradientButton htmlType="submit" block loading={loading}>
                Tạo tài khoản mới
              </GradientButton>
            </Form.Item>
          </Form>
        </Spin>
      )}

      {/* Step 4: Đăng nhập nếu đã có tài khoản */}
      {step === 4 && (
        <Spin spinning={loading}>
          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: AUTH_MESSAGES.PASSWORD_REQUIRED }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>
            <Form.Item>
              <GradientButton htmlType="submit" block loading={loading}>
                Đăng nhập
              </GradientButton>
            </Form.Item>
          </Form>
        </Spin>
      )}
    </div>
  );
};

export default RegisterForm;
