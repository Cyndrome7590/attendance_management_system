import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiFetch, setToken, clearToken, getToken } from "../api/client";

const AuthContext = createContext(null);
const USER_KEY = "timecard_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        setInitializing(false);
        return;
      }
      try {
        const { employee } = await apiFetch("/auth/me");
        if (!cancelled) {
          setUser(employee);
          localStorage.setItem(USER_KEY, JSON.stringify(employee));
        }
      } catch {
        if (!cancelled) {
          clearToken();
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (employeeNumber, password) => {
    try {
      const { employee, token } = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ employeeNumber, password }),
      });
      setToken(token);
      localStorage.setItem(USER_KEY, JSON.stringify(employee));
      setUser(employee);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (employeeNumber, name, password) => {
    try {
      const { employee, token } = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ employeeNumber, name, password }),
      });
      setToken(token);
      localStorage.setItem(USER_KEY, JSON.stringify(employee));
      setUser(employee);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
