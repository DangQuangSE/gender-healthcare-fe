import { useState } from "react";
import { format, startOfDay } from "date-fns";
import { useSelector } from "react-redux";
import Calendar from "./Calendar";
import LogModal from "./LogModal";
import CycleTrackerGuide from "./CycleTrackerGuide";
import CycleTrackerNotifications from "./CycleTrackerNotifications";
import CycleTrackerSummary from "./CycleTrackerSummary";
import { SYMPTOM_LABELS } from "./cycleTrackerConstants";
import { useCycleTrackerData } from "./useCycleTrackerData";
import authStorage from "../../../shared/storage/authStorage";
import {
  CYCLE_TRACKER_TEXT,
  INITIAL_MODAL_INFO,
} from "./CycleTracker.constants";
import "./CycleTracker.css";

const CycleTracker = () => {
  const reduxToken = useSelector((state) => state.user.jwt || state.user.token);
  const token = reduxToken || authStorage.getToken();
  const [showGuide, setShowGuide] = useState(false);
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));
  const [modalInfo, setModalInfo] = useState(INITIAL_MODAL_INFO);
  const { userData, predictions, loading, handleSaveLog, setUserData } =
    useCycleTrackerData(token);

  const handleCloseModal = () => setModalInfo(INITIAL_MODAL_INFO);

  const handleDayClick = (day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    setSelectedDay(startOfDay(day));
    setModalInfo({
      isOpen: true,
      date: day,
      periodDayNumber: predictions?.periodDayNumbers?.[dateKey] || null,
    });
  };

  const selectedLog = modalInfo.date
    ? userData.logs[format(modalInfo.date, "yyyy-MM-dd")]
    : undefined;
  const existingLog = selectedLog
    ? {
        ...selectedLog,
        symptoms: (selectedLog.symptoms || []).map(
          (symptom) => SYMPTOM_LABELS[symptom] || symptom
        ),
      }
    : undefined;

  return (
    <div className="cycle-tracker-container">
      {loading && <div>{CYCLE_TRACKER_TEXT.LOADING}</div>}

      {modalInfo.isOpen && (
        <LogModal
          date={modalInfo.date}
          periodDayNumber={modalInfo.periodDayNumber}
          existingLog={existingLog}
          onSave={handleSaveLog}
          onClose={handleCloseModal}
        />
      )}

      <div className="guide-preview">
        <span>
          <strong>{CYCLE_TRACKER_TEXT.GUIDE_PREVIEW_TITLE}</strong>{" "}
          {CYCLE_TRACKER_TEXT.GUIDE_PREVIEW}
        </span>
        <button
          className="button-secondary"
          style={{ marginLeft: 16 }}
          onClick={() => setShowGuide(true)}
        >
          {CYCLE_TRACKER_TEXT.GUIDE_OPEN}
        </button>
      </div>

      <header className="tracker-header">
        <h1>{CYCLE_TRACKER_TEXT.TITLE}</h1>
        <p>{CYCLE_TRACKER_TEXT.DESCRIPTION}</p>
      </header>

      <CycleTrackerGuide open={showGuide} onClose={() => setShowGuide(false)} />

      <CycleTrackerNotifications
        predictions={predictions}
        selectedDay={selectedDay}
        userData={userData}
      />

      <div className="tracker-body">
        <div className="calendar-section">
          <Calendar
            predictions={predictions}
            onDayClick={handleDayClick}
            logs={userData.logs}
          />
        </div>
        <div className="info-section">
          <h2>{CYCLE_TRACKER_TEXT.SUMMARY_TITLE}</h2>
          <CycleTrackerSummary
            userData={userData}
            predictions={predictions}
            onUpdateUserData={setUserData}
          />
          <div className="legend">
            <h3>{CYCLE_TRACKER_TEXT.LEGEND}</h3>
            <ul>
              {CYCLE_TRACKER_TEXT.LEGEND_ITEMS.map(({ className, label }) => (
                <li key={className}>
                  <span className={`legend-${className}`}></span> {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleTracker;
