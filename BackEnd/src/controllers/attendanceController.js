const pool = require("../config/db");
const { distanceInMeters } = require("../utils/geo");

function toDateStr(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function toDateTimeStr(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${toDateStr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const WORKPLACE_LAT = process.env.WORKPLACE_LAT ? Number(process.env.WORKPLACE_LAT) : null;
const WORKPLACE_LNG = process.env.WORKPLACE_LNG ? Number(process.env.WORKPLACE_LNG) : null;
const WORKPLACE_RADIUS_METERS = process.env.WORKPLACE_RADIUS_METERS
  ? Number(process.env.WORKPLACE_RADIUS_METERS)
  : 150;

const HAS_WORKPLACE_CONFIG = WORKPLACE_LAT !== null && WORKPLACE_LNG !== null;

async function punch(req, res) {
  const employeeId = req.user.id;
  const { latitude, longitude } = req.body || {};

  const hasLocation =
    typeof latitude === "number" && typeof longitude === "number" &&
    !Number.isNaN(latitude) && !Number.isNaN(longitude);

  let distanceMeters = null;
  let withinRange = null;

  if (hasLocation && HAS_WORKPLACE_CONFIG) {
    distanceMeters = distanceInMeters(latitude, longitude, WORKPLACE_LAT, WORKPLACE_LNG);
    withinRange = distanceMeters <= WORKPLACE_RADIUS_METERS ? 1 : 0;
  }

  try {
    const [[last]] = await pool.query(
      `SELECT type FROM attendance_records
       WHERE employee_id = ?
       ORDER BY punch_time DESC, id DESC
       LIMIT 1`,
      [employeeId]
    );

    const nextType = last?.type === "in" ? "out" : "in";
    const now = new Date();

    const [result] = await pool.query(
      `INSERT INTO attendance_records
         (employee_id, type, punch_date, punch_time, latitude, longitude, distance_meters, within_range)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        nextType,
        toDateStr(now),
        toDateTimeStr(now),
        hasLocation ? latitude : null,
        hasLocation ? longitude : null,
        distanceMeters,
        withinRange,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      employeeId,
      type: nextType,
      punchDate: toDateStr(now),
      punchTime: toDateTimeStr(now),
      latitude: hasLocation ? latitude : null,
      longitude: hasLocation ? longitude : null,
      distanceMeters,
      withinRange,
    });
  } catch (err) {
    console.error("punch error:", err);
    res.status(500).json({ error: "Could not record punch." });
  }
}

async function getMine(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, employee_id AS employeeId, type,
              punch_date AS punchDate, punch_time AS punchTime,
              latitude, longitude, distance_meters AS distanceMeters, within_range AS withinRange
       FROM attendance_records
       WHERE employee_id = ?
       ORDER BY punch_time DESC, id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("getMine error:", err);
    res.status(500).json({ error: "Could not fetch attendance records." });
  }
}

async function getAll(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ar.id, ar.employee_id AS employeeId,
              e.employee_number AS employeeNumber, e.name AS employeeName,
              ar.type, ar.punch_date AS punchDate, ar.punch_time AS punchTime,
              ar.latitude, ar.longitude, ar.distance_meters AS distanceMeters, ar.within_range AS withinRange
       FROM attendance_records ar
       JOIN employees e ON e.id = ar.employee_id
       ORDER BY ar.punch_time DESC, ar.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("getAll error:", err);
    res.status(500).json({ error: "Could not fetch attendance records." });
  }
}

async function getForEmployee(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT ar.id, ar.employee_id AS employeeId,
              e.employee_number AS employeeNumber, e.name AS employeeName,
              ar.type, ar.punch_date AS punchDate, ar.punch_time AS punchTime,
              ar.latitude, ar.longitude, ar.distance_meters AS distanceMeters, ar.within_range AS withinRange
       FROM attendance_records ar
       JOIN employees e ON e.id = ar.employee_id
       WHERE ar.employee_id = ?
       ORDER BY ar.punch_time DESC, ar.id DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("getForEmployee error:", err);
    res.status(500).json({ error: "Could not fetch employee's attendance records." });
  }
}

module.exports = { punch, getMine, getAll, getForEmployee };
