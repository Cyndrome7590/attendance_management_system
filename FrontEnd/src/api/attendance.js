import { apiFetch } from "./client";
import { getCurrentLocation } from "./geolocation";

function toIso(punchTime) {
  return punchTime.replace(" ", "T");
}

function normalizePunch(r) {
  return {
    id: r.id,
    type: r.type,
    date: r.punchDate,
    timestamp: toIso(r.punchTime),
    distanceMeters: r.distanceMeters != null ? Number(r.distanceMeters) : null,
    withinRange: r.withinRange === null || r.withinRange === undefined ? null : !!r.withinRange,
  };
}

export async function getMyPunches() {
  const rows = await apiFetch("/attendance/me");
  return rows.map(normalizePunch);
}

export async function punch() {
  const location = await getCurrentLocation();

  const r = await apiFetch("/attendance/punch", {
    method: "POST",
    body: JSON.stringify(location || {}),
  });
  return normalizePunch(r);
}

export async function getAllPunches() {
  const rows = await apiFetch("/attendance/all");
  return rows.map((r) => ({
    ...normalizePunch(r),
    employeeId: r.employeeNumber,
    employeeName: r.employeeName,
  }));
}

export async function getEmployeePunches(employeeId) {
  const rows = await apiFetch(`/attendance/employee/${employeeId}`);
  return rows.map((r) => ({
    ...normalizePunch(r),
    employeeId: r.employeeNumber,
    employeeName: r.employeeName,
  }));
}
