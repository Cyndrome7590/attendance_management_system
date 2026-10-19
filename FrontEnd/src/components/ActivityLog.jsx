import "./ActivityLog.css";

function isToday(dateStr) {
  const today = new Date().toLocaleDateString("en-CA");
  return dateStr === today;
}

function formatDateLabel(dateStr) {
  if (isToday(dateStr)) return "Today";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ActivityLog({ punches, showEmployeeName = false }) {
  const recent = punches.slice(0, 30);

  return (
    <section className="log-section">
      <div className="log-header">
        <h2>Recent activity</h2>
        <span className="log-count">
          {punches.length} {punches.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="log-list">
        {recent.length === 0 && (
          <div className="log-empty">No punches yet. Your first clock-in will show up here.</div>
        )}

        {recent.map((p) => {
          const dateStr = p.date || new Date(p.timestamp).toLocaleDateString("en-CA");
          const dateLabel = formatDateLabel(dateStr);

          return (
            <div className="log-entry" key={p.id}>
              <div className={`log-icon ${p.type}`}>{p.type === "in" ? "IN" : "OUT"}</div>
              <div className="log-body">
                <span className="log-title">
                  {showEmployeeName && (p.employeeName || p.employeeId) ? (
                    <>
                      <span className="log-employee">{p.employeeName || "Unknown"}</span>
                      {p.employeeId && <span className="log-employee-id"> ({p.employeeId})</span>}
                      {" — "}
                    </>
                  ) : null}
                  {p.type === "in" ? "Clocked in" : "Clocked out"}
                  {p.withinRange === false && (
                    <span className="log-flag" title={
                      p.distanceMeters != null
                        ? `${Math.round(p.distanceMeters)}m from the workplace`
                        : "Outside the allowed radius"
                    }>
                      ⚠ Off-site
                    </span>
                  )}
                </span>
                <span className="log-date">{dateLabel}</span>
              </div>
              <div className="log-time">{formatTime(p.timestamp)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
