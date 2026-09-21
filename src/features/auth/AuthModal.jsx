import { useState, useEffect } from "react";
import { Modal, Tabs } from "antd";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "./AuthModal.css";
import GradientButton from "../../components/common/GradientButton";

// Modal xác nhận thoát
const ConfirmExitModal = ({ open, onCancel, onOk }) => (
  <Modal
    open={open}
    onCancel={onCancel}
    footer={null}
    centered
    closable={false}
    width={380}
    className="exit-confirm-modal"
  >
    <div className="exit-content">
      {/* <div className="exit-icon-container">
        <img src="/exit-icon.png" alt="exit" className="exit-icon" />
      </div> */}
      <h2 className="exit-title">Bạn có chắc muốn thoát?</h2>
      <div className="exit-subtitle">
        Bạn chưa hoàn tất thiết lập tài khoản. Bạn có thực sự muốn thoát?
      </div>
      <div className="exit-buttons">
        <GradientButton className="btn-full exit-btn" onClick={onCancel}>
          <span className="exit">Hủy bỏ</span>
        </GradientButton>
      </div>
      <div className="exit-buttons">
        <GradientButton className="btn-full exit-ok-btn" onClick={onOk}>
          <span className="exit-ok">Thoát</span>
        </GradientButton>
      </div>
    </div>
  </Modal>
);

const AuthModal = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [registerPhone, setRegisterPhone] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!open) {
      setActiveTab("login");
      setRegisterPhone("");
      setShowConfirm(false);
    }
  }, [open]);

  const handleRequestClose = () => setShowConfirm(true);
  const handleExit = () => {
    setShowConfirm(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={handleRequestClose}
        footer={null}
        width={440}
        centered
        className="auth-modal"
        closeIcon={<span className="close-icon">&times;</span>}
        maskClosable
      >
        <div className="auth-modal-body">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: "login",
                label: <span className="auth-tab-label">Đăng nhập</span>,
                children: (
                  <div className="auth-tab-content">
                    <LoginForm
                      onRequireRegister={(phone) => {
                        setRegisterPhone(phone);
                        setActiveTab("register");
                      }}
                      onClose={onClose}
                    />
                  </div>
                ),
              },
              {
                key: "register",
                label: <span className="auth-tab-label">Tạo tài khoản</span>,
                children: (
                  <div className="auth-tab-content">
                    <RegisterForm phone={registerPhone} onClose={onClose} />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Modal>

      <ConfirmExitModal
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onOk={handleExit}
      />
    </>
  );
};

export default AuthModal;
