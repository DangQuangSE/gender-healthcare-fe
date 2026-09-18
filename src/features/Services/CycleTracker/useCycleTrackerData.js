import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { fetchCycleLogs, saveCycleLog } from "./cycleTrackerApi";
import CYCLE_TRACKER_MESSAGES from "./cycleTrackerMessages";
import {
  calculatePredictions,
  INITIAL_USER_DATA,
  normalizeCycleLogs,
} from "./cycleTrackerUtils";
import { SYMPTOM_ENUM_MAP } from "./cycleTrackerConstants";

export const useCycleTrackerData = (token) => {
  const [userData, setUserData] = useState(INITIAL_USER_DATA);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    const response = await fetchCycleLogs();
    setUserData(normalizeCycleLogs(response.data || []));
  }, []);

  useEffect(() => {
    if (!token) {
      setUserData(INITIAL_USER_DATA);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    loadLogs()
      .catch(() => {
        if (!cancelled) setUserData(INITIAL_USER_DATA);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadLogs, token]);

  const predictions = useMemo(
    () => calculatePredictions(userData),
    [userData]
  );

  const handleSaveLog = useCallback(
    async (date, logData) => {
      if (!token) {
        toast.error(CYCLE_TRACKER_MESSAGES.LOGIN_REQUIRED);
        return;
      }

      setLoading(true);
      try {
        const symptoms = Array.isArray(logData.symptoms)
          ? logData.symptoms
              .map((symptom) => SYMPTOM_ENUM_MAP[symptom] || symptom)
              .filter(Boolean)
          : [];

        await saveCycleLog({
          startDate: format(date, "yyyy-MM-dd"),
          isPeriodStart: !!logData.isPeriodStart,
          symptoms,
          note: logData.note || "",
        });
        await loadLogs();
        toast.success(CYCLE_TRACKER_MESSAGES.LOG_SAVE_SUCCESS);
      } catch {
        toast.error(CYCLE_TRACKER_MESSAGES.LOG_SAVE_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [loadLogs, token]
  );

  return {
    handleSaveLog,
    loading,
    predictions,
    setUserData,
    userData,
  };
};
