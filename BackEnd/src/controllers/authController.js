const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

function signToken(employee) {
  return jwt.sign(
    {
      id: employee.id,
      employeeNumber: employee.employee_number,
      name: employee.name,
      role: employee.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

function publicEmployee(row) {
  return {
    id: row.id,
    employeeNumber: row.employee_number,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

async function register(req, res) {
  const { employeeNumber, name, email, password, role } = req.body;

  if (!employeeNumber || !name || !password) {
    return res.status(400).json({ error: "employeeNumber, name, and password are required." });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters." });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM employees WHERE employee_number = ?",
      [employeeNumber]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "That employee number is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const safeRole = role === "admin" ? "admin" : "employee";

    const [result] = await pool.query(
      `INSERT INTO employees (employee_number, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [employeeNumber, name, email || null, passwordHash, safeRole]
    );

    const [[row]] = await pool.query("SELECT * FROM employees WHERE id = ?", [result.insertId]);
    const employee = publicEmployee(row);
    const token = signToken(row);

    res.status(201).json({ employee, token });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Could not register employee." });
  }
}

async function login(req, res) {
  const { employeeNumber, password } = req.body;

  if (!employeeNumber || !password) {
    return res.status(400).json({ error: "employeeNumber and password are required." });
  }

  try {
    const [[row]] = await pool.query(
      "SELECT * FROM employees WHERE employee_number = ?",
      [employeeNumber]
    );
    if (!row) {
      return res.status(401).json({ error: "Employee number or password is incorrect." });
    }

    const matches = await bcrypt.compare(password, row.password_hash);
    if (!matches) {
      return res.status(401).json({ error: "Employee number or password is incorrect." });
    }

    const employee = publicEmployee(row);
    const token = signToken(row);
    res.json({ employee, token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Could not log in." });
  }
}

async function me(req, res) {
  try {
    const [[row]] = await pool.query("SELECT * FROM employees WHERE id = ?", [req.user.id]);
    if (!row) return res.status(404).json({ error: "Employee not found." });
    res.json({ employee: publicEmployee(row) });
  } catch (err) {
    console.error("me error:", err);
    res.status(500).json({ error: "Could not fetch current user." });
  }
}

module.exports = { register, login, me };
