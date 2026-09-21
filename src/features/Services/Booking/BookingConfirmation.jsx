"use client";
import { useLocation, useNavigate } from "react-router-dom";
import { message, Avatar, Modal } from "antd";
import "./BookingConfirmation.css";
import { useState, useEffect } from "react";
import { createBooking } from "../../../features/appointments/appointmentApi";
import { getCurrentUser } from "../../../features/profile/profileApi";
import authStorage from "../../../shared/storage/authStorage";
import bookingStorage from "../../../shared/storage/bookingStorage";
import storage from "../../../shared/storage/storage";
import { STORAGE_KEYS } from "../../../shared/constants/storageKeys";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { BOOKING_MESSAGES } from "../../../shared/constants/bookingMessages";
import {
  BOOKING_DEPOSIT_RATE,
  BOOKING_PAYMENT_COPY,
  BOOKING_PAYMENT_INTENTS,
  BOOKING_PAYMENT_METHOD,
} from "./BookingConfirmation.constants";

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
  const [paymentIntent, setPaymentIntent] = useState(BOOKING_PAYMENT_INTENTS.FULL);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const fullBooking = {
    ...(booking || {}),
    price: booking?.price,
    serviceName: booking?.serviceName,
  };

  // Debug log để kiểm tra dữ liệu

  // Fetch user data from API /api/me
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch {
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
    if (paymentIntent === BOOKING_PAYMENT_INTENTS.DEPOSIT) {
      setShowDepositModal(true);
      return;
    }

    // Continue with the PayOS booking flow.
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
      paymentMethod: BOOKING_PAYMENT_METHOD,
      consultantId: consultantId ? Number(consultantId) : null, // Thêm consultantId với fallback
    };

    try {
      const res = await createBooking(payload);

      //  In toàn bộ phản hồi từ server để kiểm tra

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
      }

      message.success(BOOKING_MESSAGES.SUCCESS);

      // Store the payment intent before opening the PayOS payment page.
      if (paymentIntent === BOOKING_PAYMENT_INTENTS.FULL) {
        bookingStorage.setPendingBooking({
            appointmentId,
            paymentMethod: BOOKING_PAYMENT_METHOD,
            paymentIntent: BOOKING_PAYMENT_INTENTS.FULL,
            amount: fullBooking.price,
            serviceName: fullBooking.serviceName,
            serviceType: booking.serviceType, // Thêm service type vào pendingBooking
        });

        // Continue the PayOS flow on the payment page.
        navigate("/payment");
      } else {
        // Thanh toán trực tiếp - chuyển về trang booking
        navigate("/user/booking");
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, BOOKING_MESSAGES.SERVER_ERROR);

      //  In lỗi đầy đủ nếu server có trả gì đó
      message.error(`${BOOKING_MESSAGES.FAILED}: ${errorMessage}`);
    }
  };

  const handleDepositConfirm = async () => {

    setShowDepositModal(false);

    // Create the appointment before starting the PayOS deposit flow.
    try {
      const consultantId =
        selectedConsultantId;

      const bookingPayload = {
        service_id: Number(booking.serviceId),
        preferredDate: booking.preferredDate,
        slot: booking.slot,
        slot_id: booking.slotId,
        note: booking.note,
        paymentMethod: BOOKING_PAYMENT_METHOD,
        consultantId: consultantId ? Number(consultantId) : null, // Thêm consultantId với fallback
      };

      const res = await createBooking(bookingPayload);


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
      }

      message.success(BOOKING_MESSAGES.SUCCESS);

      // Store the payment intent before opening the PayOS payment page.
      const pendingBookingData = {
        appointmentId,
        paymentMethod: BOOKING_PAYMENT_METHOD,
        paymentIntent: BOOKING_PAYMENT_INTENTS.DEPOSIT,
        amount: depositAmount, // 20% giá trị dịch vụ
        serviceName: fullBooking.serviceName,
        serviceType: booking.serviceType, // Thêm service type vào pendingBooking
      };

      bookingStorage.setPendingBooking(pendingBookingData);

      // Chuyển đến trang Payment để xử lý create-off
      navigate("/payment");
    } catch (error) {

      const errorMessage = getApiErrorMessage(error, BOOKING_MESSAGES.SERVER_ERROR);

      message.error(`${BOOKING_MESSAGES.FAILED}: ${errorMessage}`);
    }
  };

  const handleDepositCancel = () => {
    setShowDepositModal(false);
  };

  const depositAmount = Math.round(booking.price * BOOKING_DEPOSIT_RATE);

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
              {selectedConsultantId && selectedConsultantName
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
        <h2 className="booking-payment-title">{BOOKING_PAYMENT_COPY.TITLE}</h2>
        <div
          className={`booking-payment-method ${
            paymentIntent === BOOKING_PAYMENT_INTENTS.DEPOSIT ? "selected" : ""
          }`}
          onClick={() => setPaymentIntent(BOOKING_PAYMENT_INTENTS.DEPOSIT)}
        >
          <input
            type="radio"
            id="deposit"
            name="payment"
            value={BOOKING_PAYMENT_INTENTS.DEPOSIT}
            checked={paymentIntent === BOOKING_PAYMENT_INTENTS.DEPOSIT}
            onChange={() => setPaymentIntent(BOOKING_PAYMENT_INTENTS.DEPOSIT)}
          />
          <div className="booking-payment-info">
            <label htmlFor="deposit">{BOOKING_PAYMENT_COPY.DEPOSIT_LABEL}</label>
            <p>{BOOKING_PAYMENT_COPY.DEPOSIT_DESCRIPTION}</p>
          </div>
        </div>

        <div
          className={`booking-payment-method ${
            paymentIntent === BOOKING_PAYMENT_INTENTS.FULL ? "selected" : ""
          }`}
          onClick={() => setPaymentIntent(BOOKING_PAYMENT_INTENTS.FULL)}
        >
          <input
            type="radio"
            id="payos-full"
            name="payment"
            value={BOOKING_PAYMENT_INTENTS.FULL}
            checked={paymentIntent === BOOKING_PAYMENT_INTENTS.FULL}
            onChange={() => setPaymentIntent(BOOKING_PAYMENT_INTENTS.FULL)}
          />
          <div className="booking-payment-info">
            <label htmlFor="payos-full">{BOOKING_PAYMENT_COPY.FULL_LABEL}</label>
            <p>{BOOKING_PAYMENT_COPY.FULL_DESCRIPTION}</p>
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
