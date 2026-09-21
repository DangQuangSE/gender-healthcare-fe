import React from "react";
import { Modal } from "antd";
import STAFF_BOOKING_MESSAGES from "./staffBookingMessages";

const { ui } = STAFF_BOOKING_MESSAGES;

const safeString = (value) => {
  if (value === null || value === undefined) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
};

const formatDateTime = (record) => {
  const slotTime = record.appointmentDetails?.[0]?.slotTime;
  if (slotTime) {
    const date = new Date(slotTime);
    if (!Number.isNaN(date.getTime())) {
      return `${date.toLocaleDateString("vi-VN")} - ${date.toLocaleTimeString(
        "vi-VN",
        { hour: "2-digit", minute: "2-digit" }
      )}`;
    }
  }

  if (record.preferredDate) {
    const date = new Date(record.preferredDate);
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString("vi-VN");
  }

  return ui.fallback;
};

export const showStaffAppointmentDetail = (record, getStatusLabel) => {
  const detail = record.appointmentDetails?.[0];
  const medicalProfile = record.customerMedicalProfile;
  const medicalResult = detail?.medicalResult;

  Modal.info({
    title: ui.detailsTitle,
    width: 800,
    content: (
      <div>
        <p>
          <strong>{ui.customerName}:</strong>{" "}
          {safeString(record.customerName) || ui.fallback}
        </p>
        <p>
          <strong>{ui.service}:</strong> {safeString(record.serviceName) || ui.fallback}
        </p>
        <p>
          <strong>{ui.servicePrice}:</strong>{" "}
          {record.price?.toLocaleString() || "0"} VNĐ
        </p>
        <p>
          <strong>{ui.appointmentDate}:</strong> {formatDateTime(record)}
        </p>
        <p>
          <strong>{ui.status}:</strong> {getStatusLabel(record.status)}
        </p>
        <p>
          <strong>{ui.createdDate}:</strong>{" "}
          {record.created_at
            ? new Date(record.created_at).toLocaleDateString("vi-VN")
            : ui.fallback}
        </p>
        <p>
          <strong>{ui.note}:</strong> {safeString(record.note) || ui.emptyNote}
        </p>

        {medicalProfile && (
          <div className="staff-booking-detail__medical-profile">
            <p>
              <strong>{ui.basicMedicalInfo}:</strong>
            </p>
            {medicalProfile.allergies && (
              <p>• <strong>{ui.allergies}:</strong> {safeString(medicalProfile.allergies)}</p>
            )}
            {medicalProfile.chronicConditions && (
              <p>• <strong>{ui.chronicConditions}:</strong> {safeString(medicalProfile.chronicConditions)}</p>
            )}
            {medicalProfile.familyHistory && (
              <p>• <strong>{ui.familyHistory}:</strong> {safeString(medicalProfile.familyHistory)}</p>
            )}
            {medicalProfile.specialNotes && (
              <p>• <strong>{ui.specialNotes}:</strong> {safeString(medicalProfile.specialNotes)}</p>
            )}
            {!medicalProfile.allergies &&
              !medicalProfile.chronicConditions &&
              !medicalProfile.familyHistory &&
              !medicalProfile.specialNotes && (
                <p className="staff-booking-detail__muted">{ui.noMedicalInfo}</p>
              )}
          </div>
        )}

        {detail && (
          <div className="staff-booking-detail__appointment">
            <p>
              <strong>{ui.detailInfo}:</strong>
            </p>
            <p>
              • <strong>{ui.consultant}:</strong>{" "}
              {safeString(detail.consultantName) || ui.noAssignment}
            </p>
            <p>
              • <strong>{ui.detailStatus}:</strong> {getStatusLabel(detail.status)}
            </p>
            {detail.room && (
              <p>
                • <strong>{ui.room}:</strong>{" "}
                {safeString(detail.room.name) || safeString(detail.room)}
              </p>
            )}
            {medicalResult && (
              <div>
                <p>• <strong>{ui.examinationResult}:</strong></p>
                <p className="staff-booking-detail__indented">
                  - {ui.diagnosis}: {safeString(medicalResult.diagnosis) || ui.noValue}
                </p>
                <p className="staff-booking-detail__indented">
                  - {ui.treatmentPlan}: {safeString(medicalResult.treatmentPlan) || ui.noValue}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    ),
  });
};

export default showStaffAppointmentDetail;
