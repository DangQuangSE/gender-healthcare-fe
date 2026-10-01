const toPositiveId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const sameOrderCode = (first, second) =>
  first != null && second != null && String(first) === String(second);

export const getCorrelatedAppointmentId = (
  paymentStatus,
  pendingBooking,
  returnOrderCode,
) => {
  if (returnOrderCode == null) return null;

  const statusOrderCode = paymentStatus?.orderCode;
  if (statusOrderCode != null && !sameOrderCode(statusOrderCode, returnOrderCode)) {
    return null;
  }

  const statusAppointmentId = toPositiveId(paymentStatus?.appointmentId);
  if (statusAppointmentId) return statusAppointmentId;

  const pendingAppointmentId = toPositiveId(pendingBooking?.appointmentId);
  const pendingOrderCode = pendingBooking?.orderCode;
  if (
    pendingAppointmentId &&
    sameOrderCode(pendingOrderCode, returnOrderCode) &&
    (statusOrderCode == null || sameOrderCode(pendingOrderCode, statusOrderCode))
  ) {
    return pendingAppointmentId;
  }

  return null;
};

