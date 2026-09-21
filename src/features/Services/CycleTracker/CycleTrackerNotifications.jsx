import { isSameDay } from "date-fns";
import { getCycleWarnings, getRecommendations } from "./cycleTrackerUtils";
import { CYCLE_TRACKER_TEXT } from "./CycleTracker.constants";

const CycleTrackerNotifications = ({ predictions, selectedDay, userData }) => {
  if (!predictions) return null;

  const warnings = getCycleWarnings(userData.periodHistory);
  const recommendations = getRecommendations({ predictions, selectedDay, userData });
  const notifications = [];

  if (isSameDay(selectedDay, predictions.ovulationNotificationDay)) {
    notifications.push(
      <div key="ovulation-notification" className="notification-item info">
        <strong>{CYCLE_TRACKER_TEXT.NOTIFICATIONS.OVULATION_REMINDER_LABEL}</strong>{" "}
        {CYCLE_TRACKER_TEXT.NOTIFICATIONS.OVULATION_REMINDER}
      </div>
    );
  }
  if (isSameDay(selectedDay, predictions.notificationDay)) {
    notifications.push(
      <div key="period-notification" className="notification-item warning">
        <strong>{CYCLE_TRACKER_TEXT.NOTIFICATIONS.PERIOD_REMINDER_LABEL}</strong>{" "}
        {CYCLE_TRACKER_TEXT.NOTIFICATIONS.PERIOD_REMINDER}
      </div>
    );
  }
  if (isSameDay(selectedDay, predictions.ovulationDay)) {
    notifications.push(
      <div key="ovulation-today" className="notification-item info">
        <strong>{CYCLE_TRACKER_TEXT.NOTIFICATIONS.OVULATION_TODAY_LABEL}</strong>{" "}
        {CYCLE_TRACKER_TEXT.NOTIFICATIONS.OVULATION_TODAY}
      </div>
    );
  }
  warnings.forEach((warning) => {
    notifications.push(
      <div key={warning} className="notification-item danger">
        ⚠️ {warning}
      </div>
    );
  });

  return (
    <>
      <div className="tracker-notifications">{notifications}</div>
      {recommendations.length > 0 && (
        <div className="recommendations-box">
          <strong>{CYCLE_TRACKER_TEXT.RECOMMENDATIONS}</strong>
          <ul>
            {recommendations.map((recommendation) => (
              <li key={recommendation} style={{ marginBottom: 8, whiteSpace: "pre-line" }}>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default CycleTrackerNotifications;
