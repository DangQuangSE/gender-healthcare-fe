import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { message } from "antd";
import {
  getPayOSPaymentStatus,
  getPaymentStatusData,
} from "../../../features/payments/paymentApi";
import {
  isTerminalPaymentStatus,
  parsePayOSReturn,
} from "../../../features/payments/paymentFlow";
import { refreshPayOSStatus } from "../../../features/payments/paymentStatus";
import {
  cancelAppointment,
  createOnlineMeeting,
  getAppointmentsByStatus,
} from "../../../features/appointments/appointmentApi";
import { createNotification } from "../../../features/notifications/notificationApi";
import authStorage from "../../../shared/storage/authStorage";
import bookingStorage from "../../../shared/storage/bookingStorage";
import RatingModal from "../../../components/RatingModal/RatingModal";
import MedicalResultModal from "./MedicalResultModal";
import BookingAppointmentCard from "./BookingAppointmentCard";
import BookingDetailModal from "./BookingDetailModal";
import NOTIFICATION_MESSAGES from "../../../shared/constants/notificationMessages";
import { PAYMENT_MESSAGES } from "../../../shared/constants/paymentMessages";
import {
  APPOINTMENT_STATUS_BY_TAB,
  BOOKING_TABS,
  BOOKING_TEXT,
} from "./Booking.constants";
import "./Booking.css";

const createAppointmentNotification = async (appointmentId) => {
  try {
    await createNotification({
      title: NOTIFICATION_MESSAGES.BOOKING.APPOINTMENT_TITLE,
      content: NOTIFICATION_MESSAGES.BOOKING.APPOINTMENT_CONTENT,
      type: "APPOINTMENT",
      appointmentId,
    });
  } catch {
    // Notification creation is not allowed to interrupt the booking flow.
  }
};

const Booking = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [appointmentToRate, setAppointmentToRate] = useState(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const paymentMessageShown = useRef(false);
  const navigate = useNavigate();
  const { search } = useLocation();
  const token = useSelector((state) => state.user.token) || authStorage.getToken();

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statuses = APPOINTMENT_STATUS_BY_TAB[activeTab];
      if (!statuses) {
        setAppointments([]);
        return;
      }
      const responses = await Promise.all(
        statuses.map((status) => getAppointmentsByStatus(status))
      );
      const data = responses.flatMap((response) => response.data || []);
      data.sort((first, second) => new Date(second.created_at) - new Date(first.created_at));
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

  const handleRatingSuccess = async () => {
    await fetchAppointments();
    if (appointmentToRate && !appointmentToRate.isRated) {
      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === appointmentToRate.id
            ? { ...appointment, isRated: true }
            : appointment
        )
      );
    }
    message.success(NOTIFICATION_MESSAGES.BOOKING.RATING_SUCCESS);
    setRatingModalVisible(false);
  };

  const handleViewResult = (appointment) => {
    const hasAppointmentResult = appointment.appointmentDetails?.some(
      (detail) => detail.medicalResult && Object.keys(detail.medicalResult).length > 0
    );
    const medicalProfile = appointment.customerMedicalProfile;
    if (hasAppointmentResult || (medicalProfile && Object.keys(medicalProfile).length > 0)) {
      setSelectedResult({ appointment, medicalProfile: medicalProfile || {} });
      setResultModalVisible(true);
    } else {
      message.warning(NOTIFICATION_MESSAGES.BOOKING.RESULT_NOT_FOUND);
    }
  };

  const createZoomMeetingForAppointment = useCallback(
    async (appointmentId) => {
      try {
        await createOnlineMeeting(appointmentId);
        message.success(NOTIFICATION_MESSAGES.BOOKING.ONLINE_ROOM_CREATED);
        setTimeout(fetchAppointments, 1000);
      } catch {
        // Meeting creation can be retried from the appointment detail flow.
      }
    },
    [fetchAppointments]
  );

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm(NOTIFICATION_MESSAGES.BOOKING.CANCEL_CONFIRM)) return;
    try {
      await cancelAppointment(appointmentId);
      message.success(NOTIFICATION_MESSAGES.BOOKING.CANCEL_SUCCESS);
      setAppointments((previous) => previous.filter(({ id }) => id !== appointmentId));
    } catch (error) {
      const status = error.response?.status;
      if (status === 500) {
        message.error(NOTIFICATION_MESSAGES.BOOKING.CANCEL_SERVER_ERROR);
      } else if (status === 404) {
        message.error(NOTIFICATION_MESSAGES.BOOKING.CANCEL_NOT_FOUND);
        setAppointments((previous) => previous.filter(({ id }) => id !== appointmentId));
      } else if (status === 400) {
        message.error(NOTIFICATION_MESSAGES.BOOKING.CANCEL_INVALID_STATUS);
      } else {
        message.error(NOTIFICATION_MESSAGES.BOOKING.CANCEL_FAILED);
      }
    }
  };

  const handlePaymentReturn = useCallback(async () => {
    const returnState = parsePayOSReturn(search);
    if (returnState.kind === "none" || paymentMessageShown.current) return;

    paymentMessageShown.current = true;
    if (returnState.kind === "invalid") {
      message.error(PAYMENT_MESSAGES.RETURN_INVALID);
      window.history.replaceState({}, document.title, BOOKING_TEXT.ROUTE);
      return;
    }

    if (returnState.kind === "cancelled") {
      message.warning(PAYMENT_MESSAGES.RETURN_CANCELLED);
    }

    try {
      const latest = await refreshPayOSStatus(
        async (orderCode) => getPaymentStatusData(await getPayOSPaymentStatus(orderCode)),
        returnState.orderCode,
      );

      if (isTerminalPaymentStatus(latest?.paymentStatus)) {
        bookingStorage.removePendingBooking();
        if (latest.paymentStatus === "SUCCESS") {
          message.success(PAYMENT_MESSAGES.SUCCESS);
          setTimeout(async () => {
            try {
              const response = await getAppointmentsByStatus("CONFIRMED");
              const latestAppointment = response.data?.[response.data.length - 1];
              if (latestAppointment) {
                createAppointmentNotification(latestAppointment.id);
                createZoomMeetingForAppointment(latestAppointment.id);
              }
            } catch {
              // The appointment list refresh remains the source of truth.
            }
          }, 2000);
        } else {
          message.error(PAYMENT_MESSAGES.FAILED_OR_CANCELLED);
        }
      } else {
        message.info(PAYMENT_MESSAGES.PENDING);
      }
    } catch {
      message.error(PAYMENT_MESSAGES.STATUS_REFRESH_FAILED);
    }

    window.history.replaceState({}, document.title, BOOKING_TEXT.ROUTE);
    setTimeout(fetchAppointments, 500);
  }, [
    createZoomMeetingForAppointment,
    fetchAppointments,
    search,
  ]);

  useEffect(() => {
    handlePaymentReturn();
  }, [handlePaymentReturn]);

  const handleSelectResult = (result) => {
    setSelectedResult(result);
    setResultModalVisible(true);
  };

  const renderAppointments = () => {
    if (loading) return <div className="booking-loading-profile">{BOOKING_TEXT.LOADING}</div>;
    if (!appointments.length) {
      const currentTab = BOOKING_TABS.find((tab) => tab.key === activeTab);
      return (
        <div className="booking-empty-profile">
          <h3>{BOOKING_TEXT.EMPTY_SUFFIX} {currentTab?.label.toLowerCase()}</h3>
          <p>{BOOKING_TEXT.EMPTY_DESCRIPTION}</p>
          <button onClick={() => navigate(BOOKING_TEXT.SERVICES_ROUTE)}>{BOOKING_TEXT.BOOK_NOW}</button>
        </div>
      );
    }
    return appointments.map((appointment) => (
      <BookingAppointmentCard
        key={appointment.id}
        activeTab={activeTab}
        appointment={appointment}
        onCancel={handleCancelAppointment}
        onRate={(value) => {
          setAppointmentToRate(value);
          setRatingModalVisible(true);
        }}
        onViewDetail={(value) => {
          setSelectedAppointment(value);
          setDetailModalOpen(true);
        }}
        onViewResult={handleViewResult}
      />
    ));
  };

  return (
    <div className="booking-tab-wrapper-profile">
      <h2 className="booking-title-profile">{BOOKING_TEXT.PAGE_TITLE}</h2>
      <div className="booking-tabs-profile">
        {BOOKING_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button-profile ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="booking-tab-content-profile">{renderAppointments()}</div>

      <BookingDetailModal
        open={detailModalOpen}
        appointment={selectedAppointment}
        onClose={() => setDetailModalOpen(false)}
        onSelectResult={handleSelectResult}
      />
      <MedicalResultModal
        visible={resultModalVisible}
        onClose={() => {
          setResultModalVisible(false);
          setSelectedResult(null);
        }}
        selectedResult={selectedResult}
      />
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
