// Fixed version of Booking.jsx with proper structure
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { message, Modal } from "antd";
import api from "../../../configs/api";
import authStorage from "../../../shared/storage/authStorage";
import bookingStorage from "../../../shared/storage/bookingStorage";
import RatingModal from "../../../components/RatingModal/RatingModal";
import MedicalResultModal from "./MedicalResultModal";
import "./Booking.css";

const TABS = [
  { key: "upcoming", label: "Lịch hẹn sắp đến" },
  { key: "completed", label: "Hoàn thành" },
  { key: "history", label: "Lịch sử đặt chỗ" },
  { key: "combo", label: "Gói khám" },
];

// API status mapping
const STATUS_MAP = {
  upcoming: ["CONFIRMED", "PENDING", "CHECKED"],
  completed: ["COMPLETED"],
  history: ["CANCELED"],
};

// Status display mapping (Vietnamese)
const STATUS_DISPLAY = {
  CONFIRMED: "Đã xác nhận",
  PENDING: "Chờ xác nhận",
  CHECKED: "Đã check in",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

// Function to create appointment notification
const createAppointmentNotification = async (appointmentId) => {
  try {
    const notificationData = {
      title: "Cuộc hẹn sắp tới",
      content: "Bạn có lịch hẹn",
      type: "APPOINTMENT",
      appointmentId: appointmentId,
    };

    await api.post("/notifications", notificationData);
  } catch {
    // Don't show error to user as this is not critical for booking flow
  }
};

const Booking = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();
  const { search } = useLocation();
  const token = useSelector((state) => state.user.token) || authStorage.getToken();

  // Track if payment success message has been shown
  const paymentMessageShown = useRef(false);

  // Thêm state cho modal đánh giá
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [appointmentToRate, setAppointmentToRate] = useState(null);

  // State cho modal hiển thị kết quả khám
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // // Thêm hàm xử lý hiển thị modal đánh giá
  // const handleRateService = (appointment) => {
  //   setAppointmentToRate(appointment);
  //   setRatingModalVisible(true);
  // };

  // Thêm hàm callback khi đánh giá thành công
  const handleRatingSuccess = async () => {
    // Refresh appointment data
    await fetchAppointments();

    // Cập nhật trạng thái isRated cho appointmentToRate trong state
    if (appointmentToRate && !appointmentToRate.isRated) {
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === appointmentToRate.id ? { ...apt, isRated: true } : apt
        )
      );
    }

    message.success("Cảm ơn bạn đã đánh giá!");
    setRatingModalVisible(false);
  };

  // Hàm xử lý hiển thị kết quả khám
  const handleViewResult = (appointment) => {
    // Kiểm tra kết quả khám từ appointmentDetails
    const hasAppointmentResult = appointment.appointmentDetails?.some(
      (detail) =>
        detail.medicalResult && Object.keys(detail.medicalResult).length > 0
    );

    // Lấy customerMedicalProfile trực tiếp từ appointment (theo API response)
    const medicalProfile = appointment.customerMedicalProfile;
    const hasMedicalProfile =
      medicalProfile && Object.keys(medicalProfile).length > 0;

    if (hasAppointmentResult || hasMedicalProfile) {
      setSelectedResult({
        appointment: appointment,
        medicalProfile: medicalProfile || {},
      });
      setResultModalVisible(true);
    } else {
      message.warning("Chưa có kết quả khám cho lịch hẹn này!");
    }
  };

  // Function to verify VNPay payment with backend
  const verifyVNPayPayment = useCallback(async (urlParams) => {
    try {
      await api.get("/payment/vnpay/vnpay-return", {
        params: Object.fromEntries(urlParams.entries()),
      });
    } catch {
      message.error("Có lỗi khi xác thực thanh toán với server.");
    }
  }, []);

  // Fetch appointments based on active tab
  const fetchAppointments = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const statuses = STATUS_MAP[activeTab];
      let data = [];

      if (activeTab === "upcoming") {
        const requests = statuses.map((status) =>
          api.get(`/appointment/by-status?status=${status}`)
        );
        const responses = await Promise.all(requests);
        data = responses.flatMap((res) => res.data);
      } else {
        const res = await api.get(
          `/appointment/by-status?status=${statuses[0]}`
        );
        data = res.data;
      }

      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Function to create Zoom meeting for specific appointmentId
  const createZoomMeeting = useCallback(
    async (appointmentId) => {
      try {
        await api.get(
          `/zoom/test-create-meeting?appointmentId=${appointmentId}`
        );

        message.success("Phòng tư vấn online đã được tạo!");

        // Refresh appointments để lấy joinUrl mới
        setTimeout(() => {
          fetchAppointments();
        }, 1000);
      } catch {
        // Handle error silently
      }
    },
    [fetchAppointments]
  );

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy lịch hẹn này?")) return;

    try {
      await api.delete(`/appointment/${appointmentId}/cancel`);
      message.success("Hủy lịch hẹn thành công");

      // Làm mới lại danh sách sau khi hủy
      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );
    } catch (err) {
      // Handle specific error cases
      if (err.response?.status === 500) {
        message.error(
          "Lỗi hệ thống: Không thể hủy lịch hẹn này. Vui lòng liên hệ hỗ trợ."
        );
      } else if (err.response?.status === 404) {
        message.error("Lịch hẹn không tồn tại hoặc đã được hủy.");
        setAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointmentId)
        );
      } else if (err.response?.status === 400) {
        message.error(
          "Không thể hủy lịch hẹn này. Lịch hẹn có thể đã được xác nhận hoặc đã diễn ra."
        );
      } else {
        message.error("Không thể hủy lịch hẹn. Vui lòng thử lại sau.");
      }
    }
  };

  const handleViewDetail = (appointment) => {
    // Luôn hiển thị modal chi tiết appointment
    // Nút "Kết quả" riêng biệt sẽ xử lý việc hiển thị kết quả khám
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  // Handle VNPay payment result from URL params
  useEffect(() => {
    const query = new URLSearchParams(search);
    const vnpResponseCode = query.get("vnp_ResponseCode");
    const vnpTransactionStatus = query.get("vnp_TransactionStatus");

    // Check for VNPay return parameters
    if (vnpResponseCode && !paymentMessageShown.current) {
      bookingStorage.removePendingBooking();
      paymentMessageShown.current = true;

      if (vnpResponseCode === "00" && vnpTransactionStatus === "00") {
        // Thanh toán VNPay thành công
        message.success("Thanh toán thành công! Lịch hẹn đã được xác nhận.");

        // Gọi API để verify payment với backend
        verifyVNPayPayment(query);

        // Tạo Zoom meeting cho appointment vừa thanh toán
        // Delay một chút để backend cập nhật status, sau đó lấy appointments CONFIRMED
        setTimeout(async () => {
          try {
            const response = await api.get(
              "/appointment/by-status?status=CONFIRMED"
            );
            const confirmedAppointments = response.data;

            // Tạo Zoom meeting cho appointment mới nhất (vừa được confirm)
            if (confirmedAppointments.length > 0) {
              const latestAppointment =
                confirmedAppointments[confirmedAppointments.length - 1];
              const appointmentId = latestAppointment.id;

              // Tạo notification cho appointment
              createAppointmentNotification(appointmentId);

              createZoomMeeting(appointmentId);
            }
          } catch {
            // Handle error silently
          }
        }, 2000); // Delay 2 giây để backend cập nhật
      } else if (vnpResponseCode === "24") {
        // Người dùng hủy thanh toán - cancel cuộc hẹn
        message.warning("Thanh toán đã bị hủy. Đang hủy lịch hẹn...");
        // Handle cancellation logic here...
      } else {
        // Thanh toán VNPay thất bại
        message.error("Thanh toán thất bại hoặc đã bị hủy.");
      }

      // Clean URL sau khi xử lý
      window.history.replaceState({}, document.title, "/user/booking");

      // Refresh appointments after a short delay
      const refreshAppointments = () => {
        if (token) {
          fetchAppointments();
        }
      };
      setTimeout(refreshAppointments, 500);
      return;
    }
  }, [search, verifyVNPayPayment, fetchAppointments, token, createZoomMeeting]);

  const renderAppointments = () => {
    if (loading) {
      return (
        <div className="booking-loading-profile">Đang tải lịch hẹn...</div>
      );
    }

    if (!appointments?.length) {
      const currentTab = TABS.find((t) => t.key === activeTab);

      return (
        <div className="booking-empty-profile">
          <h3>Không có {currentTab?.label.toLowerCase()}</h3>
          <p>Đừng lo lắng. Bạn có thể đặt lịch khi cần</p>
          <button onClick={() => navigate("/services")}>
            Đăng kí khám bệnh
          </button>
        </div>
      );
    }

    return appointments.map((appointment) => {
      return (
        <div className="booking-card-profile" key={appointment.id}>
          <h2>Thông tin lịch hẹn</h2>
          <div className="booking-info-profile">
            <p>
              <strong>Ngày hẹn:</strong> {appointment.preferredDate}
            </p>
            <p>
              <strong>Dịch vụ:</strong> {appointment.serviceName}
            </p>
            <p>
              <strong>Phòng khám:</strong>{" "}
              {appointment.appointmentDetails?.[0]?.room?.name || "Không có"}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span className={`status ${appointment.status.toLowerCase()}`}>
                {STATUS_DISPLAY[appointment.status] || appointment.status}
              </span>
            </p>
            <p>
              <strong>Ghi chú:</strong> {appointment.note || "Không có"}
            </p>
            <p>
              <strong>Giá:</strong> {appointment.price?.toLocaleString()} VND
            </p>

            <div className="appointment-actions">
              <button
                className="detail-button-profile"
                onClick={() => handleViewDetail(appointment)}
                style={{ display: "inline-block" }} // Force display
              >
                Xem chi tiết
              </button>

              {["CONFIRMED", "PENDING", "CHECKED"].includes(
                appointment.status
              ) && (
                <button
                  className="cancel-button-profile"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Hủy lịch hẹn
                </button>
              )}

              {/* Nút Tư vấn Online cho CONSULTING_ON services với CONFIRMED status */}
              {appointment.serviceType === "CONSULTING_ON" &&
                appointment.status === "CONFIRMED" &&
                (() => {
                  // Lấy joinUrl từ appointmentDetails
                  const joinUrl = appointment.appointmentDetails?.find(
                    (detail) => detail.joinUrl
                  )?.joinUrl;

                  if (joinUrl) {
                    return (
                      <a
                        href={joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="online-consultation-button-profile"
                        title="Click để tham gia tư vấn online"
                      >
                        Tư vấn Online
                      </a>
                    );
                  }
                })()}

              {/* Nút Kết quả cho appointments đã hoàn thành trong tab completed và history */}
              {(() => {
                // Kiểm tra kết quả khám từ appointmentDetails
                const hasAppointmentResult =
                  appointment.appointmentDetails?.some(
                    (detail) =>
                      detail.medicalResult &&
                      Object.keys(detail.medicalResult).length > 0
                  );

                return (
                  appointment.status === "COMPLETED" &&
                  (activeTab === "completed" || activeTab === "history") &&
                  hasAppointmentResult && (
                    <button
                      className="result-button-profile"
                      onClick={() => handleViewResult(appointment)}
                      title="Xem kết quả khám bệnh"
                    >
                      Kết quả
                    </button>
                  )
                );
              })()}
              {/* Thêm nút đánh giá nếu lịch hẹn đã hoàn thành */}
              {appointment.status === "COMPLETED" && (
                <button
                  className={`rate-service-btn${
                    appointment.isRated ? " rated" : ""
                  }`}
                  onClick={() => {
                    setAppointmentToRate(appointment);
                    setRatingModalVisible(true);
                  }}
                >
                  {appointment.isRated ? "Sửa đánh giá" : "Đánh giá"}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="booking-tab-wrapper-profile">
      <h2 className="booking-title-profile">Lịch sử đặt chỗ</h2>

      <div className="booking-tabs-profile">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button-profile ${
              activeTab === tab.key ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="booking-tab-content-profile">{renderAppointments()}</div>

      {/* Modal hiển thị chi tiết lịch hẹn */}
      <Modal
        title="Chi tiết lịch hẹn"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        className="appointment-detail-modal"
        centered
      >
        {selectedAppointment && (
          <div className="appointment-detail-content">
            <div className="detail-section">
              <h3>Thông tin chung</h3>

              <div className="detail-item">
                <span className="detail-label">Ngày hẹn:</span>
                <span className="detail-value">
                  {selectedAppointment.preferredDate}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Dịch vụ:</span>
                <span className="detail-value">
                  {selectedAppointment.serviceName}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phòng khám:</span>
                <span className="detail-value">
                  {selectedAppointment.appointmentDetails?.[0]?.room?.name ||
                    "Chưa phân công"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Trạng thái:</span>
                <span
                  className={`detail-value status ${selectedAppointment.status.toLowerCase()}`}
                >
                  {STATUS_DISPLAY[selectedAppointment.status] ||
                    selectedAppointment.status}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Giá:</span>
                <span className="detail-value">
                  {selectedAppointment.price?.toLocaleString()} VND
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ghi chú:</span>
                <span className="detail-value">
                  {selectedAppointment.note || "Không có"}
                </span>
              </div>
              <div className="detail-item"></div>
            </div>

            {selectedAppointment.appointmentDetails &&
              selectedAppointment.appointmentDetails.length > 0 && (
                <div className="detail-section">
                  <h3>Chi tiết dịch vụ</h3>
                  {selectedAppointment.appointmentDetails.map(
                    (detail, index) => (
                      <div
                        key={detail.id || index}
                        className="service-detail-item"
                      >
                        <div className="detail-item">
                          <span className="detail-label">Bác sĩ tư vấn:</span>
                          <span className="detail-value">
                            {detail.consultantName || "Chưa phân công"}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Thời gian khám:</span>
                          <span className="detail-value">
                            {detail.slotTime
                              ? new Date(detail.slotTime).toLocaleString()
                              : "Chưa xác định"}
                          </span>
                        </div>
                        {detail.room && (
                          <>
                            <div className="detail-item">
                              <span className="detail-label">Phòng khám:</span>
                              <span className="detail-value">
                                {detail.room.name}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Chuyên khoa:</span>
                              <span className="detail-value">
                                {detail.room.specializationName}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="detail-item">
                          <span className="detail-label">
                            Trạng thái dịch vụ:
                          </span>
                          <span
                            className={`detail-value status ${detail.status?.toLowerCase()}`}
                          >
                            {STATUS_DISPLAY[detail.status] || detail.status}
                          </span>
                        </div>
                        {detail.joinUrl && (
                          <div className="detail-item">
                            <span className="detail-label">
                              Link tư vấn online:
                            </span>
                            <span className="detail-value">
                              <a
                                href={detail.joinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="zoom-link"
                              >
                                Tham gia phòng tư vấn
                              </a>
                            </span>
                          </div>
                        )}
                        {detail.medicalResult && (
                          <div className="detail-item">
                            <span className="detail-label">Kết quả khám:</span>
                            <span
                              className="detail-value result-link"
                              onClick={() => {
                                setSelectedResult({
                                  appointment: selectedAppointment,
                                  medicalProfile:
                                    selectedAppointment.customerMedicalProfile ||
                                    {},
                                  selectedDetail: detail,
                                });
                                setResultModalVisible(true);
                              }}
                            >
                              Kết quả
                            </span>
                          </div>
                        )}
                        {index <
                          selectedAppointment.appointmentDetails.length - 1 && (
                          <hr className="service-separator" />
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Modal hiển thị kết quả khám */}
      <MedicalResultModal
        visible={resultModalVisible}
        onClose={() => {
          setResultModalVisible(false);
          setSelectedResult(null);
        }}
        selectedResult={selectedResult}
      />

      {/* Thêm modal đánh giá */}
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        appointment={appointmentToRate}
        onSuccess={handleRatingSuccess}
      />
    </div>
  );
};

export default Booking;
