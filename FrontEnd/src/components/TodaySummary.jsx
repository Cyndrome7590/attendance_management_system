import "./TodaySummary.css";

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

export default function TodaySummary({ firstIn, lastOut, hoursTodayMs }) {
  return (
    <div className="today-summary">
      <div className="summary-item">
        <span className="summary-label">Arrived</span>
        <span className="summary-value">{firstIn ? formatTime(firstIn.timestamp) : "—:—"}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-item">
        <span className="summary-label">Departed</span>
        <span className="summary-value">{lastOut ? formatTime(lastOut.timestamp) : "—:—"}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-item">
        <span className="summary-label">Hours today</span>
        <span className="summary-value">{firstIn ? formatDuration(Math.max(hoursTodayMs, 0)) : "—"}</span>
      </div>
    </div>
  );
}
