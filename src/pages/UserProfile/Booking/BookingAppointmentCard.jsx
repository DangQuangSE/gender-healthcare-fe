import { BOOKING_TEXT, APPOINTMENT_STATUS_LABELS, CANCELLABLE_APPOINTMENT_STATUSES } from "./Booking.constants";

const BookingAppointmentCard = ({
  activeTab,
  appointment,
  onCancel,
  onRate,
  onViewDetail,
  onViewResult,
}) => {
  const hasMedicalResult = appointment.appointmentDetails?.some(
    (detail) => detail.medicalResult && Object.keys(detail.medicalResult).length > 0
  );
  const joinUrl = appointment.appointmentDetails?.find((detail) => detail.joinUrl)?.joinUrl;
  const canViewResult =
    appointment.status === "COMPLETED" &&
    ["completed", "history"].includes(activeTab) &&
    hasMedicalResult;

  return (
    <div className="booking-card-profile">
      <h2>{BOOKING_TEXT.CARD_TITLE}</h2>
      <div className="booking-info-profile">
        <p><strong>{BOOKING_TEXT.APPOINTMENT_DATE}</strong> {appointment.preferredDate}</p>
        <p><strong>{BOOKING_TEXT.SERVICE}</strong> {appointment.serviceName}</p>
        <p><strong>{BOOKING_TEXT.ROOM}</strong> {appointment.appointmentDetails?.[0]?.room?.name || BOOKING_TEXT.NOT_AVAILABLE}</p>
        <p>
          <strong>{BOOKING_TEXT.STATUS}</strong>{" "}
          <span className={`status ${appointment.status.toLowerCase()}`}>
            {APPOINTMENT_STATUS_LABELS[appointment.status] || appointment.status}
          </span>
        </p>
        <p><strong>{BOOKING_TEXT.NOTE}</strong> {appointment.note || BOOKING_TEXT.NOT_AVAILABLE}</p>
        <p><strong>{BOOKING_TEXT.PRICE}</strong> {appointment.price?.toLocaleString()} VND</p>
        <div className="appointment-actions">
          <button className="detail-button-profile" onClick={() => onViewDetail(appointment)}>
            {BOOKING_TEXT.VIEW_DETAIL}
          </button>
          {CANCELLABLE_APPOINTMENT_STATUSES.includes(appointment.status) && (
            <button className="cancel-button-profile" onClick={() => onCancel(appointment.id)}>
              {BOOKING_TEXT.CANCEL}
            </button>
          )}
          {appointment.serviceType === "CONSULTING_ON" && appointment.status === "CONFIRMED" && joinUrl && (
            <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="online-consultation-button-profile" title={BOOKING_TEXT.ONLINE_TITLE}>
              {BOOKING_TEXT.ONLINE_CONSULTATION}
            </a>
          )}
          {canViewResult && (
            <button className="result-button-profile" onClick={() => onViewResult(appointment)} title={BOOKING_TEXT.RESULT_TITLE}>
              {BOOKING_TEXT.VIEW_RESULT}
            </button>
          )}
          {appointment.status === "COMPLETED" && (
            <button className={`rate-service-btn${appointment.isRated ? " rated" : ""}`} onClick={() => onRate(appointment)}>
              {appointment.isRated ? BOOKING_TEXT.EDIT_RATING : BOOKING_TEXT.RATE}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingAppointmentCard;
