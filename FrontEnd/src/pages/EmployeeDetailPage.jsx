import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEmployees } from "../api/employees";
import { getEmployeePunches } from "../api/attendance";
import TopBar from "../components/TopBar";
import StatusBadge from "../components/StatusBadge";
import ActivityLog from "../components/ActivityLog";
import "./EmployeeDetailPage.css";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [punches, setPunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getEmployees(), getEmployeePunches(id)])
      .then(([employees, punchList]) => {
        if (cancelled) return;
        const match = employees.find((e) => String(e.id) === String(id));
        setEmployee(match || null);
        setPunches(punchList);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this employee's record.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const offSiteCount = punches.filter((p) => p.withinRange === false).length;

  return (
    <div className="wrap">
      <TopBar />

      <Link to="/admin" className="back-link">Back to HR panel</Link>

      {loading && <div className="detail-loading">Loading…</div>}

      {!loading && error && <div className="admin-error">{error}</div>}

      {!loading && !error && !employee && (
        <div className="admin-error">No employee found with that ID.</div>
      )}

      {!loading && !error && employee && (
        <>
          <div className="detail-header">
            <div>
              <h1>{employee.name}</h1>
              <p className="detail-meta">
                {employee.employeeNumber}
                {employee.role === "admin" ? " · Admin" : " · Employee"}
                {employee.email ? ` · ${employee.email}` : ""}
              </p>
              {offSiteCount > 0 && (
                <p className="detail-flag-note">{offSiteCount} off-site {offSiteCount === 1 ? "punch" : "punches"} recorded</p>
              )}
            </div>
            <StatusBadge lastPunchType={employee.lastPunchType} />
          </div>

          <ActivityLog punches={punches} />
        </>
      )}
    </div>
  );
}
