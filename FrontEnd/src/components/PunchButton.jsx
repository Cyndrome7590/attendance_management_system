import "./PunchButton.css";

export default function PunchButton({ isClockedIn, submitting, onPunch }) {
  const stateClass = isClockedIn ? "state-out" : "state-in";

  return (
    <button
      className={`punch-btn ${stateClass}`}
      disabled={submitting}
      onClick={onPunch}
    >
      <span className="punch-btn-label">
        {submitting ? "Working…" : isClockedIn ? "Clock Out" : "Clock In"}
      </span>
      <span className="punch-btn-sub">
        {isClockedIn ? "Tap when you leave" : "Tap when you arrive"}
      </span>
    </button>
  );
}
