import apiClient from "../../../../shared/api/client";

/**
 * Get doctor working schedule by date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} API response with doctor schedules
 */
export const getDoctorWorkingSchedule = async (date) => {
  try {
    const response = await apiClient.get(`/v1/schedules/doctors`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor working schedule:", error);
    throw error;
  }
};

export default getDoctorWorkingSchedule;
