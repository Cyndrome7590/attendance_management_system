import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../api/employees";
import TopBar from "../components/TopBar";
import StatusBadge from "../components/StatusBadge";
import "./AdminPage.css";

function formatLastSeen(punchTime) {
  if (!punchTime) return "—";
  const d = new Date(punchTime.replace(" ", "T"));
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function initialsOf(name) {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getEmployees()
      .then((list) => {
        if (!cancelled) setEmployees(list);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the employee directory.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const clockedInCount = employees.filter((e) => e.lastPunchType === "in").length;
  const totalEmployees = employees.length;

  return (
    <div className="wrap">
      <TopBar />

      <div className="admin-header">
        <h1>HR Panel</h1>
        <p>Live status for every registered employee. Click anyone to see their full history.</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-value">{loading ? "—" : totalEmployees}</span>
          <span className="admin-stat-label">Registered employees</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{loading ? "—" : clockedInCount}</span>
          <span className="admin-stat-label">Currently clocked in</span>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <section className="directory-section">
        <div className="directory-header">
          <h2>Employee directory</h2>
          <span className="directory-count">
            {loading ? "…" : `${totalEmployees} ${totalEmployees === 1 ? "employee" : "employees"}`}
          </span>
        </div>

        <div className="directory-list">
          {!loading && employees.length === 0 && (
            <div className="directory-empty">No employees registered yet.</div>
          )}

          {employees.map((e) => (
            <Link to={`/admin/employee/${e.id}`} className="directory-row" key={e.id}>
              <span className="directory-avatar">{initialsOf(e.name)}</span>
              <div className="directory-body">
                <span className="directory-name">{e.name}</span>
                <span className="directory-meta">
                  {e.employeeNumber}
                  {e.role === "admin" ? " · Admin" : ""}
                </span>
              </div>
              <div className="directory-right">
                <StatusBadge lastPunchType={e.lastPunchType} />
                <span className="directory-lastseen">{formatLastSeen(e.lastPunchTime)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
