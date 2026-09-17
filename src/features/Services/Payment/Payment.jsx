import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Result, Button, Spin, message } from "antd";
import api from "../../../configs/api";
import bookingStorage from "../../../shared/storage/bookingStorage";
import { PAYMENT_MESSAGES } from "../../../shared/constants/paymentMessages";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const booking = bookingStorage.getPendingBooking();

  // Check VNPay return parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const vnpResponseCode = urlParams.get("vnp_ResponseCode");

    if (vnpResponseCode) {
      // User quay lại từ VNPay
      if (vnpResponseCode === "00") {
        // Thanh toán thành công
        bookingStorage.removePendingBooking();
        message.success(PAYMENT_MESSAGES.SUCCESS);
        setPaymentSuccess(true);
        setLoading(false);

        setTimeout(() => {
          navigate("/user/booking");
        }, 2000);
      } else {
        // Thanh toán thất bại
        message.error(PAYMENT_MESSAGES.FAILED_OR_CANCELLED);
        setLoading(false);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
      return; // Không chạy createPayment nếu đã có VNPay response
    }
  }, [location.search, navigate, booking]);

  useEffect(() => {
    // Chỉ tạo payment nếu không có VNPay response trong URL
    const urlParams = new URLSearchParams(location.search);
    const vnpResponseCode = urlParams.get("vnp_ResponseCode");

    if (vnpResponseCode) {
      return; // Đã xử lý VNPay response ở useEffect trên
    }

    const createPayment = async () => {
      if (!booking || !booking.amount || !booking.serviceName) {
        // message.error("Thiếu thông tin thanh toán hoặc lịch hẹn.");
        setLoading(false);
        return;
      }

      // Xử lý thanh toán trực tiếp - gọi create-off giống hệt VNPay
      if (booking.isDirectPayment) {
        try {
          const res = await api.get("/payment/vnpay/create-off", {
            params: {
              appointmentId: booking.appointmentId,
              amount: booking.amount,
              serviceName: booking.serviceName,
            },
          });

          // Kiểm tra responseCode để xử lý kết quả tạo payment giống VNPay
          if (res.data.responseCode === 0 && res.data.url) {
            // Tạo payment URL thành công, chuyển hướng đến VNPay
            const payUrl = res.data.url;

            bookingStorage.removePendingBooking();
            setLoading(false); // Hiển thị trang "Đang chuyển đến cổng thanh toán..."

            // Chuyển hướng sau 5 giây
            setTimeout(() => {
              window.location.href = payUrl;
            }, 5000);
          } else if (res.data.responseCode === 0 && !res.data.url) {
            // Trường hợp đặc biệt: responseCode = 0 nhưng không có URL
            bookingStorage.removePendingBooking();
            message.success(res.data.message || PAYMENT_MESSAGES.BOOKING_SUCCESS);
            setPaymentSuccess(true);
            setLoading(false);

            setTimeout(() => {
              navigate("/user/booking");
            }, 2000);
          } else {
            // Lỗi tạo payment
            bookingStorage.removePendingBooking();
            message.error(
              res.data.message || PAYMENT_MESSAGES.CREATE_LINK_FAILED
            );
            setLoading(false);
            setTimeout(() => {
              navigate("/");
            }, 3000);
          }
        } catch {
          bookingStorage.removePendingBooking();
          message.error(PAYMENT_MESSAGES.CREATE_LINK_ERROR);
          setLoading(false);
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
        return;
      }

      // Xử lý VNPay (logic cũ)
      if (!booking.appointmentId || !booking.paymentMethod) {
        // message.error("Thiếu thông tin thanh toán hoặc lịch hẹn.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/payment/vnpay/create", {
          params: {
            appointmentId: booking.appointmentId,
            amount: booking.amount,
            serviceName: booking.serviceName,
          },
        });

        // Kiểm tra responseCode để xử lý kết quả tạo payment
        if (res.data.responseCode === 0 && res.data.url) {
          // Tạo payment URL thành công, chuyển hướng đến VNPay
          const payUrl = res.data.url;

          bookingStorage.removePendingBooking();
          setLoading(false); // Hiển thị trang "Đang chuyển đến cổng thanh toán..."

          // Chuyển hướng sau 5 giây
          setTimeout(() => {
            window.location.href = payUrl;
          }, 1500);
        } else if (res.data.responseCode === 0 && !res.data.url) {
          // Trường hợp đặc biệt: responseCode = 0 nhưng không có URL (có thể là thanh toán trực tiếp)
          bookingStorage.removePendingBooking();
          message.success(res.data.message || PAYMENT_MESSAGES.BOOKING_CREATED);
          setPaymentSuccess(true);
          setLoading(false);

          // Chuyển hướng đến trang booking sau 2 giây
          setTimeout(() => {
            navigate("/user/booking");
          }, 2000);
        } else {
          // Lỗi tạo payment
          throw new Error(
            res.data.message || PAYMENT_MESSAGES.CREATE_LINK_FAILED
          );
        }
      } catch (err) {
        const msg = err.response?.data?.message || PAYMENT_MESSAGES.INITIALIZE_FAILED;
        message.error(msg);
        setLoading(false);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    createPayment();
  }, [booking, navigate, location.search]);

  if (loading) {
    return <Spin tip={PAYMENT_MESSAGES.PAYMENT_LOADING} fullscreen />;
  }

  // Hiển thị UI dựa trên trạng thái thanh toán
  if (paymentSuccess) {
    return (
      <Result
        status="success"
        title={PAYMENT_MESSAGES.SUCCESS}
        subTitle={PAYMENT_MESSAGES.SUCCESS_SUBTITLE}
        extra={[
          <Button
            key="booking"
            type="primary"
            onClick={() => navigate("/user/booking")}
          >
            {PAYMENT_MESSAGES.VIEW_BOOKING}
          </Button>,
          <Button key="home" onClick={() => navigate("/")}>
            {PAYMENT_MESSAGES.HOME}
          </Button>,
        ]}
      />
    );
  }

  return (
    <Result
      status="info"
      title={PAYMENT_MESSAGES.REDIRECTING}
      subTitle={PAYMENT_MESSAGES.REDIRECTING_SUBTITLE}
      extra={[
        <Button key="home" onClick={() => navigate("/")}>
          {PAYMENT_MESSAGES.HOME}
        </Button>,
      ]}
    />
  );
};

export default Payment;
