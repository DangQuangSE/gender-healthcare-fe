import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { SYMPTOM_LABELS } from "./cycleTrackerConstants";
import { CYCLE_TRACKER_TEXT } from "./CycleTracker.constants";

const CycleTrackerSummary = ({ userData, predictions, onUpdateUserData }) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSymptomStatsModal, setShowSymptomStatsModal] = useState(false);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const filteredSymptomStats = Object.entries(userData.logs).reduce(
    (stats, [date, log]) => {
      if ((filterStart && date < filterStart) || (filterEnd && date > filterEnd)) {
        return stats;
      }
      (log.symptoms || []).forEach((symptom) => {
        stats[symptom] = (stats[symptom] || 0) + 1;
      });
      return stats;
    },
    {}
  );
  const chartData = Object.entries(filteredSymptomStats).map(([symptom, count]) => ({
    symptom,
    count,
    name: SYMPTOM_LABELS[symptom] || symptom,
  }));

  if (!predictions) {
    return <p>{CYCLE_TRACKER_TEXT.EMPTY_PREDICTIONS}</p>;
  }

  return (
    <div className="info-card">
      <button
        className="button-secondary"
        style={{ margin: "12px 0 0 0" }}
        onClick={() => setShowSymptomStatsModal(true)}
      >
        {CYCLE_TRACKER_TEXT.SYMPTOM_STATS}
      </button>
      <button
        className="button-secondary"
        style={{ margin: "12px 0" }}
        onClick={() => setShowHistoryModal(true)}
      >
        {CYCLE_TRACKER_TEXT.HISTORY}
      </button>

      {showSymptomStatsModal && (
        <div className="modal-overlay" onClick={() => setShowSymptomStatsModal(false)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setShowSymptomStatsModal(false)} aria-label={CYCLE_TRACKER_TEXT.CLOSE}>×</button>
            <h2>{CYCLE_TRACKER_TEXT.SYMPTOM_STATS}</h2>
            {chartData.length > 0 && (
              <div style={{ width: "100%", height: 260, marginBottom: 18 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
              <label>{CYCLE_TRACKER_TEXT.TABLE.FROM} <input type="date" value={filterStart} onChange={(event) => setFilterStart(event.target.value)} /></label>
              <label>{CYCLE_TRACKER_TEXT.TABLE.TO} <input type="date" value={filterEnd} onChange={(event) => setFilterEnd(event.target.value)} /></label>
            </div>
            <table className="period-history-table">
              <thead><tr><th>{CYCLE_TRACKER_TEXT.TABLE.SYMPTOM}</th><th>{CYCLE_TRACKER_TEXT.TABLE.COUNT}</th></tr></thead>
              <tbody>
                {Object.entries(filteredSymptomStats).length === 0 && <tr><td colSpan={2}>{CYCLE_TRACKER_TEXT.TABLE.EMPTY}</td></tr>}
                {Object.entries(filteredSymptomStats).map(([symptom, count]) => <tr key={symptom}><td>{SYMPTOM_LABELS[symptom] || symptom}</td><td>{count}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content" style={{ maxWidth: 700 }} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setShowHistoryModal(false)} aria-label={CYCLE_TRACKER_TEXT.CLOSE}>×</button>
            <h2>{CYCLE_TRACKER_TEXT.HISTORY}</h2>
            <table className="period-history-table">
              <thead><tr><th>{CYCLE_TRACKER_TEXT.TABLE.START_DATE}</th><th>{CYCLE_TRACKER_TEXT.TABLE.PERIOD_DAYS}</th><th>{CYCLE_TRACKER_TEXT.TABLE.NOTE}</th><th>{CYCLE_TRACKER_TEXT.TABLE.SYMPTOMS}</th></tr></thead>
              <tbody>
                {userData.periodHistory.length === 0 && <tr><td colSpan={4}>{CYCLE_TRACKER_TEXT.TABLE.EMPTY}</td></tr>}
                {userData.periodHistory.slice().sort((a, b) => new Date(b) - new Date(a)).map((startDate) => {
                  const dateKey = format(startDate, "yyyy-MM-dd");
                  const log = userData.logs[dateKey] || {};
                  return <tr key={dateKey}><td>{format(startDate, "dd/MM/yyyy")}</td><td>{userData.avgPeriodLength}</td><td>{log.note || ""}</td><td>{(log.symptoms || []).map((symptom) => SYMPTOM_LABELS[symptom] || symptom).join(", ")}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p>{CYCLE_TRACKER_TEXT.NEXT_PERIOD} <strong>{format(predictions.nextPeriodStart, "dd/MM/yyyy")}</strong></p>
      <p>{CYCLE_TRACKER_TEXT.OVULATION} <strong>{format(predictions.ovulationDay, "dd/MM/yyyy")}</strong></p>
      <p>{CYCLE_TRACKER_TEXT.AVERAGE_CYCLE} <strong>{predictions.avgCycleLength} {CYCLE_TRACKER_TEXT.DAYS}</strong></p>
      <label>
        {CYCLE_TRACKER_TEXT.AVERAGE_PERIOD}{" "}
        <input
          type="number"
          min={2}
          max={15}
          value={userData.avgPeriodLength}
          onChange={(event) => onUpdateUserData((previous) => ({ ...previous, avgPeriodLength: Math.max(2, Math.min(15, Number(event.target.value))) }))}
          style={{ width: 50, marginLeft: 8 }}
        /> {CYCLE_TRACKER_TEXT.DAYS}
      </label>
      <p>{CYCLE_TRACKER_TEXT.RECORDED_CYCLES} <strong>{userData.periodHistory.length}</strong></p>
      <p>{CYCLE_TRACKER_TEXT.LOGGED_DAYS} <strong>{Object.keys(userData.logs).length}</strong></p>
      <p>{CYCLE_TRACKER_TEXT.SYMPTOM_DAYS} <strong>{Object.values(userData.logs).filter((log) => log.symptoms?.length > 0).length}</strong></p>
    </div>
  );
};

export default CycleTrackerSummary;
