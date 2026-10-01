import { createOnlineMeeting } from "../appointments/appointmentApi";
import { createNotification } from "../notifications/notificationApi";
import NOTIFICATION_MESSAGES from "../../shared/constants/notificationMessages";
import { getCorrelatedAppointmentId } from "./appointmentCorrelation";
import { PAYMENT_RETURN_STORAGE } from "./paymentReturn.constants";

const inMemoryMarkers = new Set();

const getStorage = () => {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  return window.sessionStorage;
};

const getMarker = (prefix, orderCode, appointmentId) =>
  `${prefix}${orderCode}:${appointmentId}`;

const hasMarker = (key) => {
  const storage = getStorage();
  return storage ? storage.getItem(key) === "true" : inMemoryMarkers.has(key);
};

const setMarker = (key) => {
  const storage = getStorage();
  if (storage) {
    storage.setItem(key, "true");
    return;
  }
  inMemoryMarkers.add(key);
};

const removeMarker = (key) => {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(key);
    return;
  }
  inMemoryMarkers.delete(key);
};

const notifyAppointmentCreated = async (appointmentId) => {
  try {
    await createNotification({
      title: NOTIFICATION_MESSAGES.BOOKING.APPOINTMENT_TITLE,
      content: NOTIFICATION_MESSAGES.BOOKING.APPOINTMENT_CONTENT,
      type: "APPOINTMENT",
      appointmentId,
    });
    return true;
  } catch {
    // Notification failure must not prevent the online room from being created.
    return false;
  }
};

export const processSuccessfulPaymentReturn = async ({
  paymentStatus,
  pendingBooking,
  orderCode,
}) => {
  const appointmentId = getCorrelatedAppointmentId(
    paymentStatus,
    pendingBooking,
    orderCode,
  );
  if (!appointmentId) {
    return { appointmentId: null, processed: false, unresolved: true };
  }

  const processedKey = getMarker(
    PAYMENT_RETURN_STORAGE.PROCESSED_KEY_PREFIX,
    orderCode,
    appointmentId,
  );
  const processingKey = getMarker(
    PAYMENT_RETURN_STORAGE.PROCESSING_KEY_PREFIX,
    orderCode,
    appointmentId,
  );
  const notificationKey = getMarker(
    PAYMENT_RETURN_STORAGE.NOTIFICATION_KEY_PREFIX,
    orderCode,
    appointmentId,
  );
  if (hasMarker(processedKey) || hasMarker(processingKey)) {
    return { appointmentId, processed: true, skipped: true, unresolved: false };
  }

  setMarker(processingKey);
  try {
    if (!hasMarker(notificationKey) && await notifyAppointmentCreated(appointmentId)) {
      setMarker(notificationKey);
    }
    await createOnlineMeeting(appointmentId);
    setMarker(processedKey);
    return { appointmentId, processed: true, skipped: false, unresolved: false };
  } catch (error) {
    removeMarker(processingKey);
    throw error;
  }
};
