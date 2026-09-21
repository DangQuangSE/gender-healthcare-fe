import CYCLE_TRACKER_MESSAGES from "./cycleTrackerMessages";
import { SYMPTOM_ENUM_MAP } from "./cycleTrackerConstants";
import {
  addDays,
  differenceInDays,
  format,
  isSameDay,
  subDays,
} from "date-fns";

export const MIN_CYCLE_LENGTH = 15;
export const MAX_CYCLE_LENGTH = 60;
export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export const INITIAL_USER_DATA = {
  periodHistory: [],
  logs: {},
  avgPeriodLength: DEFAULT_PERIOD_LENGTH,
};

export const normalizeCycleLogs = (logsArr = []) => {
  const logs = {};
  const periodHistory = [];

  logsArr.forEach((item) => {
    const symptoms = Array.isArray(item.symptoms)
      ? item.symptoms
      : typeof item.symptoms === "string"
        ? item.symptoms
            .split(",")
            .map((symptom) => symptom.trim())
            .filter(Boolean)
        : [];

    logs[item.startDate] = {
      symptoms,
      note: item.note || "",
      isPeriodStart: item.isPeriodStart,
    };

    if (item.isPeriodStart) {
      periodHistory.push(new Date(item.startDate));
    }
  });

  return {
    periodHistory,
    logs,
    avgPeriodLength: DEFAULT_PERIOD_LENGTH,
  };
};

export const calculatePredictions = (userData) => {
  const { periodHistory, avgPeriodLength } = userData;
  if (periodHistory.length === 0) return null;

  const sortedHistory = [...periodHistory].sort((a, b) => b - a);
  const lastPeriodStart = sortedHistory[0];
  let avgCycleLength = DEFAULT_CYCLE_LENGTH;

  if (sortedHistory.length > 1) {
    const validCycleLengths = [];
    for (let i = 0; i < sortedHistory.length - 1; i += 1) {
      const diff = differenceInDays(sortedHistory[i], sortedHistory[i + 1]);
      if (diff >= MIN_CYCLE_LENGTH && diff <= MAX_CYCLE_LENGTH) {
        validCycleLengths.push(diff);
      }
    }

    if (validCycleLengths.length > 0) {
      avgCycleLength = Math.round(
        validCycleLengths.reduce((sum, value) => sum + value, 0) /
          validCycleLengths.length
      );
    }
  }

  const periodDayNumbers = {};
  const periodDays = [];
  sortedHistory.forEach((startDate) => {
    for (let i = 0; i < avgPeriodLength; i += 1) {
      const currentPeriodDay = addDays(startDate, i);
      periodDayNumbers[format(currentPeriodDay, "yyyy-MM-dd")] = i + 1;
      periodDays.push(currentPeriodDay);
    }
  });

  const nextPeriodStart = addDays(lastPeriodStart, avgCycleLength);
  const ovulationDay = subDays(nextPeriodStart, 14);

  return {
    nextPeriodStart,
    nextPeriodEnd: addDays(nextPeriodStart, avgPeriodLength - 1),
    ovulationDay,
    ovulationNotificationDay: subDays(ovulationDay, 2),
    notificationDay: subDays(nextPeriodStart, 2),
    periodDayNumbers,
    periodDays,
    avgCycleLength,
  };
};

export const getCycleWarnings = (periodHistory) => {
    if (!periodHistory || periodHistory.length < 2) return [];

    const warnings = [];
    const cycleLengths = [];
    for (let i = 1; i < periodHistory.length; i++) {
      const prev = new Date(periodHistory[i - 1]);
      const curr = new Date(periodHistory[i]);
      const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      cycleLengths.push(diff);
      if (diff < 21) {
        warnings.push(
          `Chu kỳ từ ${format(prev, "dd/MM/yyyy")} đến ${format(
            curr,
            "dd/MM/yyyy"
          )} quá ngắn (${diff} ngày).`
        );
      }
      if (diff > 35) {
        warnings.push(
          `Chu kỳ từ ${format(prev, "dd/MM/yyyy")} đến ${format(
            curr,
            "dd/MM/yyyy"
          )} quá dài (${diff} ngày).`
        );
      }
    }
    const max = Math.max(...cycleLengths);
    const min = Math.min(...cycleLengths);
    if (max - min > 7) {
      warnings.push(
        "Chu kỳ kinh nguyệt của bạn không đều (độ lệch giữa các chu kỳ lớn hơn 7 ngày)."
      );
    }
    return warnings;
  };



export const getRecommendations = ({ predictions, userData, selectedDay }) => {
    if (!predictions) return [];

    const recs = [];
    const log = userData.logs[format(selectedDay, "yyyy-MM-dd")];

    // ...giữ nguyên logic gợi ý như cũ...

    // 🔁 Gợi ý về chu kỳ
    if (
      isSameDay(selectedDay, predictions.notificationDay) ||
      (differenceInDays(predictions.nextPeriodStart, selectedDay) <= 3 &&
        differenceInDays(predictions.nextPeriodStart, selectedDay) >= 0)
    ) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.NEXT_PERIOD_PREP);
    }
    if (isSameDay(selectedDay, predictions.ovulationNotificationDay)) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.OVULATION_PREP);
    }
    recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.NEXT_PERIOD_PREDICTION(format(predictions.nextPeriodStart, "dd/MM/yyyy")));

    // 🧠 Gợi ý về sức khỏe thể chất và tinh thần
    if (log && log.symptoms && log.symptoms.includes(SYMPTOM_ENUM_MAP["Mệt mỏi"])) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.FATIGUE);
    }
    if (log && log.symptoms && log.symptoms.includes(SYMPTOM_ENUM_MAP["Đau bụng"])) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.PERIOD_PAIN);
    }
    const warnings = getCycleWarnings(userData.periodHistory);
    if (warnings.length > 0) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.ABNORMAL_CYCLE);
    }

    // 🧬 Gợi ý cho người muốn mang thai
    if (
      differenceInDays(predictions.ovulationDay, selectedDay) <= 2 &&
      differenceInDays(predictions.ovulationDay, selectedDay) >= -2
    ) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.FERTILE_WINDOW);
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.OVULATION_SIGNS);
    }

    //  Gợi ý tránh thai tự nhiên
    if (
      differenceInDays(predictions.ovulationDay, selectedDay) <= 2 &&
      differenceInDays(predictions.ovulationDay, selectedDay) >= -2
    ) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.HIGH_FERTILITY);
    }

    // 🧘 Gợi ý về lối sống
    if (
      log &&
      (log.symptoms.includes(SYMPTOM_ENUM_MAP["Đau bụng"]) ||
        log.symptoms.includes(SYMPTOM_ENUM_MAP["Căng ngực"]) ||
        log.symptoms.includes(SYMPTOM_ENUM_MAP["Chướng bụng"]))
    ) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.HEALTHY_LIFESTYLE);
    }

    // Gợi ý tổng quát
    if (
      log &&
      log.symptoms.length === 0 &&
      !log.isPeriodStart &&
      !(
        isSameDay(selectedDay, predictions.notificationDay) ||
        isSameDay(selectedDay, predictions.ovulationNotificationDay) ||
        isSameDay(selectedDay, predictions.ovulationDay)
      )
    ) {
      recs.push(CYCLE_TRACKER_MESSAGES.RECOMMENDATIONS.LOG_PROMPT);
    }

    return recs;
  };


