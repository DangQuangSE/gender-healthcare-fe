import { Modal } from "antd";
import { APPOINTMENT_STATUS_LABELS, BOOKING_TEXT } from "./Booking.constants";

const BookingDetailModal = ({ onClose, onSelectResult, open, appointment }) => {
  if (!appointment) return null;

  return (
    <Modal
      title={BOOKING_TEXT.DETAIL_TITLE}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className="appointment-detail-modal"
      centered
    >
      <div className="appointment-detail-content">
        <div className="detail-section">
          <h3>{BOOKING_TEXT.GENERAL_INFO}</h3>
          <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.DATE_OF_APPOINTMENT}</span><span className="detail-value">{appointment.preferredDate}</span></div>
          <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.SERVICE}</span><span className="detail-value">{appointment.serviceName}</span></div>
          <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.ROOM}</span><span className="detail-value">{appointment.appointmentDetails?.[0]?.room?.name || BOOKING_TEXT.UNASSIGNED}</span></div>
          <div className="detail-item">
            <span className="detail-label">{BOOKING_TEXT.STATUS}</span>
            <span className={`detail-value status ${appointment.status.toLowerCase()}`}>
              {APPOINTMENT_STATUS_LABELS[appointment.status] || appointment.status}
            </span>
          </div>
          <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.PRICE}</span><span className="detail-value">{appointment.price?.toLocaleString()} VND</span></div>
          <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.NOTE}</span><span className="detail-value">{appointment.note || BOOKING_TEXT.NOT_AVAILABLE}</span></div>
        </div>

        {appointment.appointmentDetails?.length > 0 && (
          <div className="detail-section">
            <h3>{BOOKING_TEXT.SERVICE_DETAILS}</h3>
            {appointment.appointmentDetails.map((detail, index) => (
              <div key={detail.id || index} className="service-detail-item">
                <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.CONSULTANT}</span><span className="detail-value">{detail.consultantName || BOOKING_TEXT.UNASSIGNED}</span></div>
                <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.APPOINTMENT_TIME}</span><span className="detail-value">{detail.slotTime ? new Date(detail.slotTime).toLocaleString() : BOOKING_TEXT.UNDETERMINED}</span></div>
                {detail.room && (
                  <>
                    <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.ROOM}</span><span className="detail-value">{detail.room.name}</span></div>
                    <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.SPECIALIZATION}</span><span className="detail-value">{detail.room.specializationName}</span></div>
                  </>
                )}
                <div className="detail-item">
                  <span className="detail-label">{BOOKING_TEXT.SERVICE_STATUS}</span>
                  <span className={`detail-value status ${detail.status?.toLowerCase()}`}>
                    {APPOINTMENT_STATUS_LABELS[detail.status] || detail.status}
                  </span>
                </div>
                {detail.joinUrl && (
                  <div className="detail-item"><span className="detail-label">{BOOKING_TEXT.ONLINE_LINK}</span><span className="detail-value"><a href={detail.joinUrl} target="_blank" rel="noopener noreferrer" className="zoom-link">{BOOKING_TEXT.JOIN_ROOM}</a></span></div>
                )}
                {detail.medicalResult && (
                  <div className="detail-item">
                    <span className="detail-label">{BOOKING_TEXT.MEDICAL_RESULT}</span>
                    <span
                      className="detail-value result-link"
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectResult({ appointment, medicalProfile: appointment.customerMedicalProfile || {}, selectedDetail: detail })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          onSelectResult({ appointment, medicalProfile: appointment.customerMedicalProfile || {}, selectedDetail: detail });
                        }
                      }}
                    >
                      {BOOKING_TEXT.VIEW_RESULT}
                    </span>
                  </div>
                )}
                {index < appointment.appointmentDetails.length - 1 && <hr className="service-separator" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BookingDetailModal;
