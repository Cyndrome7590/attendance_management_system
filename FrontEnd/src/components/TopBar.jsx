import { useAuth } from "../hooks/useAuth.jsx";
import { Link } from "react-router-dom";
import "./TopBar.css";

export default function TopBar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()
    : "—";

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" />
        <span className="brand-name">Timecard</span>
      </div>

      <div className="topbar-right">
        {user?.role === "admin" && (
          <Link to="/admin" className="topbar-link">
            HR Panel
          </Link>
        )}
        <div className="employee-chip">
          <span className="employee-initials">{initials}</span>
          <span className="employee-name">{user?.name ?? "Guest"}</span>
        </div>
        {user && (
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        )}
      </div>
    </header>
  );
}
