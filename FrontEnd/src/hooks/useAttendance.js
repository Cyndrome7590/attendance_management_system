import { useState, useEffect, useCallback } from "react";
import { getMyPunches, punch as punchApi } from "../api/attendance";

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function useAttendance() {
  const [punches, setPunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyPunches()
      .then((list) => {
        if (!cancelled) setPunches(list);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load attendance history.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lastType = punches.length > 0 ? punches[0].type : null;
  const isClockedIn = lastType === "in";

  const todaysPunches = punches
    .filter((p) => isSameDay(new Date(p.timestamp), new Date()))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const firstIn = todaysPunches.find((p) => p.type === "in") || null;
  const lastOut = [...todaysPunches].reverse().find((p) => p.type === "out") || null;

  const hoursTodayMs = firstIn
    ? (lastOut ? new Date(lastOut.timestamp) : new Date()) - new Date(firstIn.timestamp)
    : 0;

  const punch = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const record = await punchApi();
      setPunches((prev) => [record, ...prev]);
      return record;
    } catch (err) {
      setError("Couldn't record that — try again.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    punches,
    loading,
    submitting,
    error,
    isClockedIn,
    lastType,
    firstIn,
    lastOut,
    hoursTodayMs,
    punch,
  };
}
