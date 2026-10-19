const pool = require("../config/db");
async function getAllEmployees(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.id, e.employee_number AS employeeNumber, e.name, e.email, e.role, e.created_at AS createdAt,
        lp.type AS lastPunchType, lp.punch_time AS lastPunchTime
      FROM employees e
      LEFT JOIN attendance_records lp
        ON lp.id = (
          SELECT ar2.id FROM attendance_records ar2
          WHERE ar2.employee_id = e.id
          ORDER BY ar2.punch_time DESC, ar2.id DESC
          LIMIT 1
        )
      ORDER BY e.name
    `);
    res.json(rows);
  } catch (err) {
    console.error("getAllEmployees error:", err);
    res.status(500).json({ error: "Could not fetch employees." });
  }
}

module.exports = { getAllEmployees };
