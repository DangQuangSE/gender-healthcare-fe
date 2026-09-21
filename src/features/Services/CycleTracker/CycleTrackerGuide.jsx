import { CYCLE_TRACKER_TEXT } from "./CycleTracker.constants";

const CycleTrackerGuide = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content guide-modal"
        style={{ maxWidth: 540 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label={CYCLE_TRACKER_TEXT.CLOSE}
        >
          ×
        </button>
        <h2 style={{ color: "#4f46e5", fontWeight: 700, marginBottom: 12 }}>
          {CYCLE_TRACKER_TEXT.GUIDE_TITLE}
        </h2>
        <p style={{ marginBottom: 16 }}>{CYCLE_TRACKER_TEXT.GUIDE_INTRO}</p>
        <ol>
          {CYCLE_TRACKER_TEXT.GUIDE_STEPS.map(({ title, body, details }) => (
            <li key={title} style={{ marginBottom: 12 }}>
              <strong>{title}</strong> {body}
              {details && (
                <ul style={{ marginTop: 6 }}>
                  {details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        <p style={{ color: "#555", fontSize: 14 }}>
          💡 {CYCLE_TRACKER_TEXT.GUIDE_TIP}
        </p>
      </div>
    </div>
  );
};

export default CycleTrackerGuide;
