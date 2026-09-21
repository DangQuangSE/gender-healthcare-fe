import apiClient from "../../../shared/api/client";
import { CYCLE_LOGS_PATH } from "./cycleTrackerApi.constants";

export const fetchCycleLogs = () => apiClient.get(CYCLE_LOGS_PATH);

export const saveCycleLog = (logData) =>
  apiClient.post(CYCLE_LOGS_PATH, logData);
