import "./StatusBadge.css";

export default function StatusBadge({ lastPunchType }) {
  if (lastPunchType === "in") {
    return <span className="status-badge in">Clocked in</span>;
  }
  if (lastPunchType === "out") {
    return <span className="status-badge out">Clocked out</span>;
  }
  return <span className="status-badge never">No activity yet</span>;
}
