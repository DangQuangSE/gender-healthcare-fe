"use client";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Avatar, Modal } from "antd";
import "./BookingConfirmation.css";
import { useState, useEffect } from "react";
import api from "../../../configs/api";
import authStorage from "../../../shared/storage/authStorage";
import bookingStorage from "../../../shared/storage/bookingStorage";
import storage from "../../../shared/storage/storage";
import { STORAGE_KEYS } from "../../../shared/constants/storageKeys";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { BOOKING_MESSAGES } from "../../../shared/constants/bookingMessages";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { state: booking } = useLocation();
  const token = authStorage.getToken();
  const selectedConsultantId =
    booking?.consultantId || bookingStorage.get(STORAGE_KEYS.SELECTED_CONSULTANT_ID);
  const selectedConsultantName = bookingStorage.get(
    STORAGE_KEYS.SELECTED_CONSULTANT_NAME
  );
  const selectedConsultantSpecialization = bookingStorage.get(
    STORAGE_KEYS.SELECTED_CONSULTANT_SPECIALIZATION
  );
  const [paymentMethod, setPaymentMethod] = useState("direct");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const fullBooking = {
    ...(booking || {}),
    price: booking?.price,
    serviceName: booking?.serviceName,
  };

  // Debug log để kiểm tra dữ liệu
  console.log("[DEBUG] BookingConfirmation - booking data:", booking);
  console.log(
    "[DEBUG] BookingConfirmation - consultantId:",
    booking?.consultantId
  );
  console.log(
    "[DEBUG] BookingConfirmation - booking object keys:",
    Object.keys(booking || {})
  );
  console.log(
    "[DEBUG] BookingConfirmation - selectedConsultantName:",
    selectedConsultantName
  );
  console.log(
    "[DEBUG] BookingConfirmation - selectedConsultantSpecialization:",
    selectedConsultantSpecialization
  );
  console.log(
    "[DEBUG] BookingConfirmation - localStorage selectedConsultantId:",
    selectedConsultantId
  );

  // Fetch user data from API /api/me
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/me");
        console.log("User data from /api/me:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error(" Error fetching user data:", error);
        message.error(BOOKING_MESSAGES.USER_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  if (!token) {
    return (
      <div className="booking-confirmation-container">
        <p className="booking-no-token-message">
          {BOOKING_MESSAGES.NOT_AUTHENTICATED}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="booking-confirmation-container">
        <p className="booking-loading-message">
          {BOOKING_MESSAGES.USER_LOADING}
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-confirmation-container">
        <div className="booking-no-data">{BOOKING_MESSAGES.NO_BOOKING_DATA}</div>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    // Nếu chọn thanh toán trực tiếp, hiển thị modal cảnh báo trước
    if (paymentMethod === "direct") {
      setShowDepositModal(true);
      return;
    }

    // Tiếp tục với logic booking bình thường cho VNPay
    await processBooking();
  };

  const processBooking = async () => {
    const consultantId =
      selectedConsultantId;

    const payload = {
      // userId: user.id,
      service_id: Number(booking.serviceId),
      preferredDate: booking.preferredDate,
      slot: booking.slot,
      slot_id: booking.slotId,
      note: booking.note,
      paymentMethod,
      consultantId: consultantId ? Number(consultantId) : null, // Thêm consultantId với fallback
    };

    console.log("[DEBUG] Payload gửi trong processBooking:", payload);
    console.log("[DEBUG] Payload details:", {
      service_id: payload.service_id,
      preferredDate: payload.preferredDate,
      slot: payload.slot,
      slot_id: payload.slot_id,
      note: payload.note,
      paymentMethod: payload.paymentMethod,
      consultantId: payload.consultantId,
    });

    try {
      const res = await api.post("/booking/medicalService", payload);

      //  In toàn bộ phản hồi từ server để kiểm tra
      console.log("📥 Phản hồi từ backend khi tạo booking:", res.data);

      const appointmentId = res.data.appointmentId;
      if (!appointmentId) {
        message.error(BOOKING_MESSAGES.APPOINTMENT_ID_MISSING);
        return;
      }

      // Trigger refresh schedule data khi user quay lại booking form
      storage.set(STORAGE_KEYS.SHOULD_REFRESH_SCHEDULE, "true");
      storage.set(STORAGE_KEYS.LAST_BOOKED_SERVICE_ID, booking.serviceId);

      // Lưu service type vào localStorage
      if (booking.serviceType) {
        storage.set(STORAGE_KEYS.LAST_BOOKED_SERVICE_TYPE, booking.serviceType);
        console.log(
          "💾 [DEBUG] Saved service type to localStorage:",
          booking.serviceType
        );
      }

      message.success(BOOKING_MESSAGES.SUCCESS);

      // Nếu chọn thanh toán VNPay, lưu thông tin và chuyển đến trang Payment
      if (paymentMethod === "vnpay") {
        bookingStorage.setPendingBooking({
            appointmentId,
            paymentMethod,
            amount: fullBooking.price,
            serviceName: fullBooking.serviceName,
            serviceType: booking.serviceType, // Thêm service type vào pendingBooking
        });

        // Chuyển đến trang Payment để xử lý VNPay
        navigate("/payment");
      } else {
        // Thanh toán trực tiếp - chuyển về trang booking
        navigate("/user/booking");
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, BOOKING_MESSAGES.SERVER_ERROR);

      //  In lỗi đầy đủ nếu server có trả gì đó
      console.error(" Lỗi phản hồi từ server:", error.response?.data);
      message.error(`${BOOKING_MESSAGES.FAILED}: ${errorMessage}`);
    }
  };

  const handleDepositConfirm = async () => {
    console.log("[DEBUG] handleDepositConfirm started");
    console.log("[DEBUG] Current booking data:", booking);
    console.log("[DEBUG] Full booking data:", fullBooking);
    console.log("[DEBUG] Deposit amount:", depositAmount);

    setShowDepositModal(false);

    // Tạo appointment trước, sau đó lưu thông tin và chuyển đến Payment giống hệt VNPay
    try {
      const consultantId =
        selectedConsultantId;

      const bookingPayload = {
        service_id: Number(booking.serviceId),
        preferredDate: booking.preferredDate,
        slot: booking.slot,
        slot_id: booking.slotId,
        note: booking.note,
        paymentMethod: "direct",
        consultantId: consultantId ? Number(consultantId) : null, // Thêm consultantId với fallback
      };

      console.log(
        "[DEBUG] Sending booking payload trong handleDepositConfirm:",
        bookingPayload
      );
      console.log("[DEBUG] Booking payload details:", {
        service_id: bookingPayload.service_id,
        preferredDate: bookingPayload.preferredDate,
        slot: bookingPayload.slot,
        slot_id: bookingPayload.slot_id,
        note: bookingPayload.note,
        paymentMethod: bookingPayload.paymentMethod,
        consultantId: bookingPayload.consultantId,
      });

      const res = await api.post("/booking/medicalService", bookingPayload);

      console.log("📥 [DEBUG] Backend response:", res.data);
      console.log("📥 [DEBUG] Response status:", res.status);
      console.log("📥 [DEBUG] Full response object:", res);

      const appointmentId = res.data.appointmentId;
      console.log("🆔 [DEBUG] Extracted appointmentId:", appointmentId);

      if (!appointmentId) {
        console.error(" [DEBUG] No appointmentId in response!");
        message.error(BOOKING_MESSAGES.APPOINTMENT_ID_MISSING);
        return;
      }

      // Trigger refresh schedule data khi user quay lại booking form
      storage.set(STORAGE_KEYS.SHOULD_REFRESH_SCHEDULE, "true");
      storage.set(STORAGE_KEYS.LAST_BOOKED_SERVICE_ID, booking.serviceId);

      // Lưu service type vào localStorage
      if (booking.serviceType) {
        storage.set(STORAGE_KEYS.LAST_BOOKED_SERVICE_TYPE, booking.serviceType);
        console.log(
          "💾 [DEBUG] Saved service type to localStorage (direct payment):",
          booking.serviceType
        );
      }

      message.success(BOOKING_MESSAGES.SUCCESS);

      // Lưu thông tin và chuyển đến trang Payment để xử lý create-off giống VNPay
      const pendingBookingData = {
        appointmentId,
        paymentMethod: "direct",
        amount: depositAmount, // 20% giá trị dịch vụ
        serviceName: fullBooking.serviceName,
        serviceType: booking.serviceType, // Thêm service type vào pendingBooking
        isDirectPayment: true, // Flag để Payment.jsx biết gọi create-off
      };

      console.log("💾 [DEBUG] Saving to localStorage:", pendingBookingData);
      bookingStorage.setPendingBooking(pendingBookingData);

      console.log("[DEBUG] Navigating to /payment");
      // Chuyển đến trang Payment để xử lý create-off
      navigate("/payment");
    } catch (error) {
      console.error(" [DEBUG] Error occurred:", error);
      console.error(" [DEBUG] Error response:", error.response);
      console.error(" [DEBUG] Error response data:", error.response?.data);
      console.error(" [DEBUG] Error response status:", error.response?.status);

      const errorMessage = getApiErrorMessage(error, BOOKING_MESSAGES.SERVER_ERROR);

      console.error(" [DEBUG] Final error message:", errorMessage);
      message.error(`${BOOKING_MESSAGES.FAILED}: ${errorMessage}`);
    }
  };

  const handleDepositCancel = () => {
    setShowDepositModal(false);
  };

  const depositAmount = Math.round(booking.price * 0.2);

  return (
    <div className="booking-confirmation-container">
      <div className="booking-notification">
        <div className="booking-notification-content">
          <div className="booking-notification-icon">!</div>
          <span className="booking-notification-text">
            Vui lòng xác minh lại thông tin của bạn và xác nhận đặt lịch hẹn.
          </span>
        </div>
      </div>

      <div className="booking-main-content">
        <div className="booking-card">
          <h2 className="booking-card-title">Người sử dụng dịch vụ</h2>
          <div className="booking-user-profile">
            <Avatar
              size={48}
              src={user?.imageUrl}
              className="booking-user-avatar"
            >
              {user?.fullname?.charAt(0) || "U"}
            </Avatar>
            <div className="booking-user-info">
              <h3>{user?.fullname || "Không có tên"}</h3>
              <p>{user?.email || "Không có email"}</p>
            </div>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Email:</span>
            <span className="booking-info-value">
              {user?.email || "Chưa cung cấp"}
            </span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Ngày sinh:</span>
            <span className="booking-info-value">
              {user?.dateOfBirth || "Chưa cung cấp"}
            </span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Số điện thoại:</span>
            <span className="booking-info-value">
              {user?.phone || "Chưa cung cấp"}
            </span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Địa chỉ:</span>
            <span className="booking-info-value">
              {user?.address || "Chưa cung cấp"}
            </span>
          </div>
        </div>

        {booking.consultantId && selectedConsultantName && (
            <div className="booking-card">
              <h2 className="booking-card-title">Bác sĩ đã chọn</h2>
              <div className="booking-consultant-profile">
                <Avatar size={48} className="booking-consultant-avatar">
                  {selectedConsultantName?.charAt(0) || "BS"}
                </Avatar>
                <div className="booking-consultant-info">
                  <h3 className="booking-consultant-name">
                    {selectedConsultantName}
                  </h3>
                  <p className="booking-consultant-specialization">
                    {selectedConsultantSpecialization}
                  </p>
                </div>
              </div>
            </div>
          )}

        <div className="booking-card">
          <h2 className="booking-card-title">Lịch hẹn của bạn</h2>
          <div className="booking-info-item">
            <span className="booking-info-label">Dịch vụ:</span>
            <span className="booking-info-value booking-service-name">
              {booking.serviceName}
            </span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Thời lượng:</span>
            <span className="booking-info-value">{booking.duration} phút</span>
          </div>

          <div className="booking-info-item">
            <span className="booking-info-label">Ngày hẹn:</span>
            <span className="booking-info-value">{booking.preferredDate}</span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Khung giờ:</span>
            <span className="booking-info-value">{booking.slot}</span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Bác sĩ:</span>
            <span className="booking-info-value booking-consultant-name">
              selectedConsultantId && selectedConsultantName
                ? `${selectedConsultantName} - ${selectedConsultantSpecialization}`
                : BOOKING_MESSAGES.CONSULTANT_NOT_SELECTED}
            </span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Ghi chú:</span>
            <span className="booking-info-value">
              {booking.note || BOOKING_MESSAGES.NO_NOTE}
            </span>
          </div>
          <div className="booking-info-item">
            <span className="booking-info-label">Giá:</span>
            <span className="booking-info-value price-highlight ">
              {booking.price?.toLocaleString()} đ
            </span>
          </div>
        </div>
      </div>

      <div className="booking-card booking-payment-section">
        <h2 className="booking-payment-title">Phương thức thanh toán</h2>
        <div
          className={`booking-payment-method ${
            paymentMethod === "direct" ? "selected" : ""
          }`}
          onClick={() => setPaymentMethod("direct")}
        >
          <input
            type="radio"
            id="direct"
            name="payment"
            value="direct"
            checked={paymentMethod === "direct"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <img
            src="/cash-wallet.svg"
            alt="Thanh toán trực tiếp"
            className="booking-payment-logo"
          />
          <div className="booking-payment-info">
            <label htmlFor="direct">Thanh toán trực tiếp</label>
            <p>Thanh toán bằng tiền mặt tại quầy</p>
          </div>
        </div>

        <div
          className={`booking-payment-method ${
            paymentMethod === "vnpay" ? "selected" : ""
          }`}
          onClick={() => setPaymentMethod("vnpay")}
        >
          <input
            type="radio"
            id="vnpay"
            name="payment"
            value="vnpay"
            checked={paymentMethod === "vnpay"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <img
            src="/LOGOGVNPAY-QR.png"
            alt="VNPay"
            className="booking-payment-logo"
          />
          <div className="booking-payment-info">
            <label htmlFor="vnpay">Thanh toán qua VNPay</label>
            <p>Thẻ ATM, Visa, Mastercard, QR Code</p>
          </div>
        </div>
      </div>

      <div className="booking-confirm-section">
        <button
          className="booking-confirm-button"
          onClick={handleConfirmBooking}
        >
          Tiến hành xác nhận
        </button>
      </div>

      {/* Modal cảnh báo thanh toán trực tiếp */}
      <Modal
        title="Thông báo về thanh toán trực tiếp"
        open={showDepositModal}
        onOk={handleDepositConfirm}
        onCancel={handleDepositCancel}
        okText="Tôi đã hiểu, tiếp tục"
        cancelText="Hủy bỏ"
        width={500}
        centered
      >
        <div className="deposit-modal-content">
          <div className="deposit-warning-box">
            <div className="deposit-warning-header">
              <span className="deposit-warning-icon">⚠️</span>
              <strong className="deposit-warning-title">
                Lưu ý quan trọng
              </strong>
            </div>
            <p className="deposit-warning-text">
              Để giữ chỗ cho lịch hẹn của bạn, bạn cần thanh toán{" "}
              <strong className="deposit-price-highlight">
                20% giá trị dịch vụ ({depositAmount.toLocaleString()} đ)
              </strong>{" "}
              khi đến khám tại phòng khám.
            </p>
          </div>

          <div className="deposit-details">
            <p>
              <strong>Chi tiết:</strong>
            </p>
            <ul className="deposit-details-list">
              <li>
                Tổng giá trị dịch vụ:{" "}
                <strong>{booking.price?.toLocaleString()} đ</strong>
              </li>
              <li>
                Số tiền cần thanh toán để giữ chỗ:{" "}
                <strong className="deposit-amount-highlight">
                  {depositAmount.toLocaleString()} đ
                </strong>
              </li>
              <li>
                Số tiền còn lại thanh toán khi khám:{" "}
                <strong>
                  {(booking.price - depositAmount).toLocaleString()} đ
                </strong>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingConfirmation;
