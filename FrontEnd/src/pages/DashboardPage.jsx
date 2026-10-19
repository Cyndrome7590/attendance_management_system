import { useAuth } from "../hooks/useAuth.jsx";
import { useClock } from "../hooks/useClock";
import { useAttendance } from "../hooks/useAttendance";
import { useToast } from "../hooks/useToast";
import TopBar from "../components/TopBar";
import PunchButton from "../components/PunchButton";
import TodaySummary from "../components/TodaySummary";
import ActivityLog from "../components/ActivityLog";
import Toast from "../components/Toast";
import "./DashboardPage.css";

function formatDateLine(date) {
  return date.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const now = useClock();
  const {
    punches,
    loading,
    submitting,
    isClockedIn,
    lastType,
    firstIn,
    lastOut,
    hoursTodayMs,
    punch,
  } = useAttendance();
  const { message, visible, showToast } = useToast();

  async function handlePunch() {
    try {
      const record = await punch();
      let msg =
        record.type === "in"
          ? `Welcome in — logged at ${formatTime(record.timestamp)}`
          : `Have a good one — logged at ${formatTime(record.timestamp)}`;
      if (record.withinRange === false) {
        msg += " (flagged: outside the workplace area)";
      }
      showToast(msg);
    } catch {
      showToast("Couldn't record that — try again.");
    }
  }

  const statusLabel = loading
    ? "Checking status…"
    : isClockedIn
    ? "Clocked in"
    : lastType === "out"
    ? "Clocked out"
    : "Not clocked in yet";

  const statusClass = loading ? "" : isClockedIn ? "in" : "out";

  return (
    <div className="wrap">
      <TopBar />

      <main className="clock-stage">
        <div className="identity-line">
          <span className="identity-name">{user.name}</span>
          <span className="identity-sep">·</span>
          <span className="identity-id">{user.employeeNumber}</span>
        </div>
        <div className="date-line">{formatDateLine(now)}</div>
        <div className="live-clock">{now.toLocaleTimeString([], { hour12: false })}</div>

        <div className="status-line">
          <span className={`status-dot ${statusClass}`} />
          <span>{statusLabel}</span>
        </div>

        <PunchButton
          isClockedIn={isClockedIn}
          submitting={submitting || loading}
          onPunch={handlePunch}
        />

        <TodaySummary firstIn={firstIn} lastOut={lastOut} hoursTodayMs={hoursTodayMs} />
      </main>

      <ActivityLog punches={punches} />

      <Toast message={message} visible={visible} />
    </div>
  );
}
