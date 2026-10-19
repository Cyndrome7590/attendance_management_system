import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import "./LoginPage.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!employeeNumber.trim() || !name.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const result = await register(employeeNumber.trim().toUpperCase(), name.trim(), password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark" />
          <span className="brand-name">Timecard</span>
        </div>

        <h1 className="login-title">Create your account</h1>
        <p className="login-subtitle">Register with your employee number to start clocking in.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="field">
            <span className="field-label">Employee Number</span>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="EMP-002"
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field-label">Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Doreen Chengulla"
              autoComplete="name"
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span className="field-label">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="login-hint">
          Already have an account? <Link to="/login" className="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
