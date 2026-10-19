CREATE DATABASE IF NOT EXISTS attendance_system
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE attendance_system;

CREATE TABLE IF NOT EXISTS employees (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  employee_number VARCHAR(20)  NOT NULL UNIQUE,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(150) UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,    
  role            ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_records (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  employee_id  INT NOT NULL,
  type         ENUM('in', 'out') NOT NULL,
  punch_date   DATE NOT NULL,
  punch_time   DATETIME NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_attendance_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE CASCADE,

  INDEX idx_employee_date (employee_id, punch_date),
  INDEX idx_punch_time (punch_time)
) ENGINE=InnoDB;
