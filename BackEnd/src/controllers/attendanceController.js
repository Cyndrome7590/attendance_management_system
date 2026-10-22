
const pool = require("../config/db");
const { distanceInMeters } = require("../utils/geo");

function toDateStr(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function toDateTimeStr(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${toDateStr(d)} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

// Workplace coordinates are configured in Render environment variables.
const WORKPLACE_LAT = process.env.WORKPLACE_LAT
  ? Number(process.env.WORKPLACE_LAT)
  : null;

const WORKPLACE_LNG = process.env.WORKPLACE_LNG
  ? Number(process.env.WORKPLACE_LNG)
  : null;

const WORKPLACE_RADIUS_METERS = process.env.WORKPLACE_RADIUS_METERS
  ? Number(process.env.WORKPLACE_RADIUS_METERS)
  : 150;

const HAS_WORKPLACE_CONFIG =
  WORKPLACE_LAT !== null &&
  WORKPLACE_LNG !== null &&
  Number.isFinite(WORKPLACE_LAT) &&
  Number.isFinite(WORKPLACE_LNG) &&
  WORKPLACE_LAT >= -90 &&
  WORKPLACE_LAT <= 90 &&
  WORKPLACE_LNG >= -180 &&
  WORKPLACE_LNG <= 180 &&
  Number.isFinite(WORKPLACE_RADIUS_METERS) &&
  WORKPLACE_RADIUS_METERS > 0;

async function punch(req, res) {
  const employeeId = req.user.id;
  const { latitude, longitude } = req.body || {};

  // 1. Verify workplace configuration.
  if (!HAS_WORKPLACE_CONFIG) {
    return res.status(503).json({
      error:
        "Workplace location is not configured correctly. Please contact the administrator.",
    });
  }

  // 2. Require valid GPS coordinates.
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      error:
        "Valid GPS coordinates are required. Enable location access and try again.",
    });
  }

  // 3. Calculate distance from the registered workplace.
  const distanceMeters = distanceInMeters(
    latitude,
    longitude,
    WORKPLACE_LAT,
    WORKPLACE_LNG
  );

  if (!Number.isFinite(distanceMeters)) {
    return res.status(400).json({
      error: "Could not verify your location. Please try again.",
    });
  }

  const withinRange = distanceMeters <= WORKPLACE_RADIUS_METERS;

  // 4. Reject attendance attempts outside the allowed radius.
  if (!withinRange) {
    return res.status(403).json({
      error: "You are outside the permitted workplace attendance area.",
      distanceMeters: Math.round(distanceMeters),
      allowedRadiusMeters: WORKPLACE_RADIUS_METERS,
    });
  }

  try {
    // 5. Determine the next attendance action.
    const [[last]] = await pool.query(
      `SELECT type
       FROM attendance_records
       WHERE employee_id = ?
       ORDER BY punch_time DESC, id DESC
       LIMIT 1`,
      [employeeId]
    );

    const nextType = last?.type === "in" ? "out" : "in";
    const now = new Date();
    const punchDate = toDateStr(now);
    const punchTime = toDateTimeStr(now);

    // 6. Save the verified attendance record.
    const [result] = await pool.query(
      `INSERT INTO attendance_records
        (
          employee_id,
          type,
          punch_date,
          punch_time,
          latitude,
          longitude,
          distance_meters,
          within_range
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        nextType,
        punchDate,
        punchTime,
        latitude,
        longitude,
        distanceMeters,
        withinRange ? 1 : 0,
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      employeeId,
      type: nextType,
      punchDate,
      punchTime,
      latitude,
      longitude,
      distanceMeters,
      withinRange,
    });
  } catch (err) {
    console.error("punch error:", err);

    return res.status(500).json({
      error: "Could not record attendance. Please try again.",
    });
  }
}

async function getMine(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         employee_id AS employeeId,
         type,
         punch_date AS punchDate,
         punch_time AS punchTime,
         latitude,
         longitude,
         distance_meters AS distanceMeters,
         within_range AS withinRange
       FROM attendance_records
       WHERE employee_id = ?
       ORDER BY punch_time DESC, id DESC`,
      [req.user.id]
    );

    return res.json(rows);
  } catch (err) {
    console.error("getMine error:", err);

    return res.status(500).json({
      error: "Could not fetch attendance records.",
    });
  }
}

async function getAll(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
         ar.id,
         ar.employee_id AS employeeId,
         e.employee_number AS employeeNumber,
         e.name AS employeeName,
         ar.type,
         ar.punch_date AS punchDate,
         ar.punch_time AS punchTime,
         ar.latitude,
         ar.longitude,
         ar.distance_meters AS distanceMeters,
         ar.within_range AS withinRange
       FROM attendance_records ar
       JOIN employees e ON e.id = ar.employee_id
       ORDER BY ar.punch_time DESC, ar.id DESC`
    );

    return res.json(rows);
  } catch (err) {
    console.error("getAll error:", err);

    return res.status(500).json({
      error: "Could not fetch attendance records.",
    });
  }
}

async function getForEmployee(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT
         ar.id,
         ar.employee_id AS employeeId,
         e.employee_number AS employeeNumber,
         e.name AS employeeName,
         ar.type,
         ar.punch_date AS punchDate,
         ar.punch_time AS punchTime,
         ar.latitude,
         ar.longitude,
         ar.distance_meters AS distanceMeters,
         ar.within_range AS withinRange
       FROM attendance_records ar
       JOIN employees e ON e.id = ar.employee_id
       WHERE ar.employee_id = ?
       ORDER BY ar.punch_time DESC, ar.id DESC`,
      [id]
    );

    return res.json(rows);
  } catch (err) {
    console.error("getForEmployee error:", err);

    return res.status(500).json({
      error: "Could not fetch employee's attendance records.",
    });
  }
}

module.exports = {
  punch,
  getMine,
  getAll,
  getForEmployee,
};
