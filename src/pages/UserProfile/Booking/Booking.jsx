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
import authStorage from "../../../shared/storage/authStorage";
import bookingStorage from "../../../shared/storage/bookingStorage";
import RatingModal from "../../../components/RatingModal/RatingModal";
import MedicalResultModal from "./MedicalResultModal";
import BookingAppointmentCard from "./BookingAppointmentCard";
import BookingDetailModal from "./BookingDetailModal";
import NOTIFICATION_MESSAGES from "../../../shared/constants/notificationMessages";
import { PAYMENT_MESSAGES } from "../../../shared/constants/paymentMessages";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { processSuccessfulPaymentReturn } from "../../../features/payments/paymentReturn";
import {
  APPOINTMENT_STATUS_BY_TAB,
  BOOKING_TABS,
  BOOKING_TEXT,
} from "./Booking.constants";
import "./Booking.css";

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
    } catch (error) {
      setAppointments([]);
      message.error(getApiErrorMessage(error));
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

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm(NOTIFICATION_MESSAGES.BOOKING.CANCEL_CONFIRM)) return;
    try {
      await cancelAppointment(appointmentId);
      message.success(NOTIFICATION_MESSAGES.BOOKING.CANCEL_SUCCESS);
      setAppointments((previous) => previous.filter(({ id }) => id !== appointmentId));
    } catch (error) {
      const status = error.response?.status;
      const fallbackMessage =
        status === 500
          ? NOTIFICATION_MESSAGES.BOOKING.CANCEL_SERVER_ERROR
          : status === 404
            ? NOTIFICATION_MESSAGES.BOOKING.CANCEL_NOT_FOUND
            : status === 400
              ? NOTIFICATION_MESSAGES.BOOKING.CANCEL_INVALID_STATUS
              : NOTIFICATION_MESSAGES.BOOKING.CANCEL_FAILED;
      message.error(getApiErrorMessage(error, fallbackMessage));
      if (status === 404) {
        setAppointments((previous) => previous.filter(({ id }) => id !== appointmentId));
      }
    }
  };

  const handleCreateOnlineMeeting = async (appointmentId) => {
    try {
      await createOnlineMeeting(appointmentId);
      message.success(NOTIFICATION_MESSAGES.BOOKING.ONLINE_ROOM_CREATED);
      await fetchAppointments();
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          NOTIFICATION_MESSAGES.BOOKING.ONLINE_ROOM_CREATE_FAILED,
        ),
      );
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
        let shouldClearPendingBooking = latest.paymentStatus !== "SUCCESS";
        if (latest.paymentStatus === "SUCCESS") {
          try {
            const result = await processSuccessfulPaymentReturn({
              paymentStatus: latest,
              pendingBooking: bookingStorage.getPendingBooking(),
              orderCode: returnState.orderCode,
            });
            if (result.unresolved) {
              message.error(PAYMENT_MESSAGES.APPOINTMENT_CORRELATION_FAILED);
            } else {
              shouldClearPendingBooking = true;
              message.success(PAYMENT_MESSAGES.SUCCESS);
              if (!result.skipped) {
                message.success(NOTIFICATION_MESSAGES.BOOKING.ONLINE_ROOM_CREATED);
              }
            }
          } catch (error) {
            message.error(getApiErrorMessage(
              error,
              PAYMENT_MESSAGES.ONLINE_MEETING_CREATION_FAILED,
            ));
          }
        } else {
          message.error(PAYMENT_MESSAGES.FAILED_OR_CANCELLED);
        }
        if (shouldClearPendingBooking) bookingStorage.removePendingBooking();
      } else {
        message.info(PAYMENT_MESSAGES.PENDING);
      }
    } catch (error) {
      message.error(getApiErrorMessage(error, PAYMENT_MESSAGES.STATUS_REFRESH_FAILED));
    }

    window.history.replaceState({}, document.title, BOOKING_TEXT.ROUTE);
    setTimeout(fetchAppointments, 500);
  }, [
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
        onCreateMeeting={handleCreateOnlineMeeting}
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
