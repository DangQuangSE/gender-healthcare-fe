import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { getMySchedule } from "../../../scheduling/scheduleApi";
import dayjs from "dayjs";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

/**
 * Custom hook for managing my schedule appointments
 */
export const useMySchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch appointments with optional filters
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} status - Appointment status
   */
  const fetchAppointments = useCallback(async (date = null, status = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMySchedule(date, status);
      setAppointments(response.data || []);

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch appointments";
      setError(errorMessage);
      toast.error(
        NOTIFICATION_MESSAGES.SCHEDULE.FETCH_APPOINTMENTS_FAILED(errorMessage)
      );
      console.error("Error fetching appointments:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch today's appointments
   */
  const fetchTodayAppointments = useCallback(
    (status = null) => {
      const today = dayjs().format("YYYY-MM-DD");
      return fetchAppointments(today, status);
    },
    [fetchAppointments]
  );

  /**
   * Fetch confirmed appointments
   */
  const fetchConfirmedAppointments = useCallback(
    (date = null) => {
      return fetchAppointments(date, "CONFIRMED");
    },
    [fetchAppointments]
  );

  /**
   * Fetch pending appointments
   */
  const fetchPendingAppointments = useCallback(
    (date = null) => {
      return fetchAppointments(date, "PENDING");
    },
    [fetchAppointments]
  );

  /**
   * Fetch cancelled appointments
   */
  const fetchCancelledAppointments = useCallback(
    (date = null) => {
      return fetchAppointments(date, "CANCELLED");
    },
    [fetchAppointments]
  );

  /**
   * Get all appointment details from appointments array
   */
  const getAllAppointmentDetails = useCallback(() => {
    return appointments.flatMap(
      (appointment) =>
        appointment.appointmentDetails?.map((detail) => ({
          ...detail,
          appointmentId: appointment.id,
          appointmentPrice: appointment.price,
          appointmentNote: appointment.note,
          preferredDate: appointment.preferredDate,
          appointmentStatus: appointment.status,
          customerName: appointment.customerName,
          isPaid: appointment.isPaid,
          paymentStatus: appointment.paymentStatus,
          created_at: appointment.created_at,
        })) || []
    );
  }, [appointments]);

  /**
   * Get appointments by service name
   */
  const getAppointmentsByService = useCallback(
    (serviceName) => {
      return getAllAppointmentDetails().filter((detail) =>
        detail.serviceName?.toLowerCase().includes(serviceName.toLowerCase())
      );
    },
    [getAllAppointmentDetails]
  );

  /**
   * Get appointments by consultant
   */
  const getAppointmentsByConsultant = useCallback(
    (consultantId) => {
      return getAllAppointmentDetails().filter(
        (detail) => detail.consultantId === consultantId
      );
    },
    [getAllAppointmentDetails]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh appointments with current filters
   */
  const refresh = useCallback(() => {
    // This will re-fetch with no filters by default
    return fetchAppointments();
  }, [fetchAppointments]);

  return {
    // State
    appointments,
    loading,
    error,

    // Actions
    fetchAppointments,
    fetchTodayAppointments,
    fetchConfirmedAppointments,
    fetchPendingAppointments,
    fetchCancelledAppointments,
    refresh,
    clearError,

    // Computed data
    getAllAppointmentDetails,
    getAppointmentsByService,
    getAppointmentsByConsultant,

    // Utility
    setAppointments,
    setError,
  };
};

export default useMySchedule;
