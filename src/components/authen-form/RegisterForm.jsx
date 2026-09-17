import { useState } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import GradientButton from "../common/GradientButton";
import api from "../../configs/api";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/userSlice";
import { toast } from "react-toastify";
import LoginGoogle from "../../service/LoginGoogle";

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

      const res = await api.post("/auth/request-OTP", { email: value.email });

      // Nếu không throw thì thành công
      if (res.data && res.data.includes("OTP đã được gửi")) {
        message.success("OTP đã gửi tới email!");
        setStep(2);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : "";

      if (errMsg.includes("Email đã tồn tại")) {
        message.info("Email đã tồn tại, vui lòng đăng nhập.");
      } else {
        console.error("Lỗi backend trả về:", errMsg || err);
        message.error("Có lỗi xảy ra!");
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
      const res = await api.post("/auth/verify-Otp", {
        email,
        otp: value.otp,
      });
      // Nếu trả về chuỗi thành công
      if (typeof res.data === "string" && res.data.toLowerCase()) {
        message.success("Xác thực OTP thành công!");
        setStep(3);
      } else {
        message.error("OTP không đúng hoặc đã hết hạn!");
      }
    } catch (err) {
      // Nếu backend trả về chuỗi lỗi
      const errMsg =
        err?.response?.data && typeof err.response.data === "string"
          ? err.response.data
          : "";
      if (errMsg.includes("OTP không hợp lệ") || errMsg.includes("hết hạn")) {
        message.error("OTP không hợp lệ hoặc đã hết hạn!");
      } else {
        message.error("Có lỗi xảy ra!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Tạo mật khẩu mới
  const handleCreateAccount = async (values) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/config-password", {
        email,
        password: values.password,
        confirmPassword: values.confirm,
      });

      console.log("Response đăng ký:", res.data);

      // Giả sử API chỉ trả về chuỗi thông báo thành công
      if (
        typeof res.data === "string" &&
        res.data.toLowerCase().includes("thành công")
      ) {
        // Không có user để dispatch (vì chỉ là string "Thành công!")
        message.success("Đăng ký thành công!");
        window.location.href = "/";
      }
      // Nếu API trả về object có user:
      else if (
        res.data &&
        res.data.message &&
        res.data.message.toLowerCase().includes("thành công") &&
        res.data.user
      ) {
        dispatch(login());
        message.success("Đăng ký thành công!");
        window.location.href = "/";
      } else {
        message.error("Đăng ký thất bại!");
      }
    } catch (err) {
      // Nếu chắc chắn chỉ lỗi mật khẩu không cần thông báo
      if (
        err?.response?.data &&
        typeof err.response.data === "string" &&
        err.response.data.includes("Mật khẩu")
      ) {
        console.warn("Server password validation: ", err.response.data);
      } else {
        const errMsg =
          err?.response?.data && typeof err.response.data === "string"
            ? err.response.data
            : "Đăng ký thất bại!";
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
      const res = await api.post("/auth/login", {
        email,
        password: values.password,
      });
      const token = res.data.jwt || res.data.accessToken || res.data.token;
      const user = res.data.user;
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(login({ user, jwt: token }));
        message.success("Đăng nhập thành công!");
        window.location.href = "/";
      } else {
        message.error("Sai mật khẩu hoặc tài khoản không tồn tại!");
      }
    } catch (err) {
      message.error("Lỗi đăng nhập!", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập Google thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      console.log("Google login successful");

      const { credential } = credentialResponse;
      // Gửi idToken lên backend để xác thực hoặc lấy thông tin user
      const res = await api.post(
        "/auth/google",
        {
          accessToken: credential,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const token = res.data.jwt || res.data.accessToken || res.data.token;
      const user = res.data.user;
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(login({ user, jwt: token }));
        window.location.href = "/";

        toast.success("Đăng nhập Google thành công!");
        // TODO: Đóng modal hoặc redirect, ví dụ:
      } else {
        toast.error("Đăng nhập Google thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi xác thực Google!");
      console.log(error.message);
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
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
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
              rules={[{ required: true, message: "Vui lòng nhập OTP!" }]}
            >
              <Input size="large" placeholder="Nhập mã OTP" />
            </Form.Item>
            <Form.Item>
              <GradientButton block loading={loading} onClick={handleVerifyOtp}>
                Xác nhận OTP
              </GradientButton>
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
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                {
                  pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                  message:
                    "Mật khẩu phải có ít nhất một chữ cái và một chữ số!",
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
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Mật khẩu không khớp!");
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
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
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
