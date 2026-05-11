CREATE DATABASE IF NOT EXISTS nexuscore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nexuscore;

DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS tools;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'hr', 'user') NOT NULL DEFAULT 'user',
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#17a673'
) ENGINE=InnoDB;

CREATE TABLE employees (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  department_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(140) NOT NULL,
  email VARCHAR(160) NOT NULL,
  position VARCHAR(120) NOT NULL,
  salary DECIMAL(10, 2) NOT NULL DEFAULT 0,
  hire_date DATE NOT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE attendance (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  work_date DATE NOT NULL,
  check_in TIME NULL,
  check_out TIME NULL,
  status ENUM('Present', 'Absent', 'Pending') NOT NULL DEFAULT 'Present',
  UNIQUE KEY unique_attendance (employee_id, work_date),
  CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE leave_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_leave_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tools (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  description VARCHAR(255) NOT NULL,
  status ENUM('Available', 'In Use', 'Maintenance') NOT NULL DEFAULT 'Available'
) ENGINE=InnoDB;

CREATE TABLE projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(160) NOT NULL,
  route VARCHAR(120) NOT NULL,
  assignment_date DATE NOT NULL,
  workload VARCHAR(80) NOT NULL DEFAULT 'Standard',
  assigned_employee_id INT UNSIGNED NULL,
  assigned_team VARCHAR(120) NOT NULL,
  status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
  CONSTRAINT fk_project_employee FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO users (id, name, email, password_hash, role, status) VALUES
(1, 'Aarav Mehta', 'admin@nexuscore.local', '$2y$10$V2ux4lygl6MDG4cIsb9A5.RMxon.gBl4G0JtLxtDGav/u51QAxbSy', 'admin', 'Active'),
(2, 'Priya Shah', 'priya.shah@nexuscore.local', '$2y$10$TlyDYZybNMlp39PEFzEmiuUDmYSuaGgSbKWOCb8Oddo5VAOqQH6jy', 'user', 'Active'),
(3, 'Riya Kapoor', 'hr@nexuscore.local', '$2y$10$V2ux4lygl6MDG4cIsb9A5.RMxon.gBl4G0JtLxtDGav/u51QAxbSy', 'hr', 'Active');

INSERT INTO departments (id, name, color) VALUES
(1, 'Operations', '#17a673'),
(2, 'Human Resources', '#7c3aed'),
(3, 'Logistics', '#0891b2'),
(4, 'Community Partnerships', '#f59e0b'),
(5, 'Finance', '#2563eb');

INSERT INTO employees (id, user_id, department_id, full_name, email, position, salary, hire_date, status) VALUES
(1, 1, 2, 'Aarav Mehta', 'admin@nexuscore.local', 'Operations Manager', 85000.00, '2023-04-01', 'Active'),
(2, 2, 1, 'Priya Shah', 'user@nexuscore.local', 'Operations Coordinator', 52000.00, '2024-01-15', 'Active'),
(3, NULL, 3, 'Kabir Rao', 'kabir.rao@nexuscore.local', 'Route Supervisor', 61000.00, '2023-08-10', 'Active'),
(4, NULL, 4, 'Meera Iyer', 'meera.iyer@nexuscore.local', 'Partner Success Lead', 59000.00, '2022-11-20', 'Active'),
(5, NULL, 5, 'Nikhil Sen', 'nikhil.sen@nexuscore.local', 'Payroll Analyst', 57000.00, '2024-06-03', 'Active'),
(6, 3, 2, 'Riya Kapoor', 'hr@nexuscore.local', 'HR Specialist', 78000.00, '2024-02-15', 'Active');

INSERT INTO attendance (employee_id, work_date, check_in, check_out, status) VALUES
(2, CURDATE(), '09:02:00', NULL, 'Present'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:55:00', '17:38:00', 'Present'),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '09:10:00', '17:25:00', 'Present'),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), NULL, NULL, 'Absent'),
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '08:48:00', '17:42:00', 'Present'),
(1, CURDATE(), '08:45:00', NULL, 'Present'),
(3, CURDATE(), '09:00:00', NULL, 'Present'),
(4, CURDATE(), '09:12:00', NULL, 'Present');

INSERT INTO leave_requests (employee_id, start_date, end_date, reason, status) VALUES
(2, DATE_ADD(CURDATE(), INTERVAL 8 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), 'Family function', 'Pending'),
(3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Medical appointment', 'Pending'),
(4, DATE_SUB(CURDATE(), INTERVAL 9 DAY), DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Personal leave', 'Approved'),
(5, DATE_ADD(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'Travel', 'Rejected');

INSERT INTO tools (name, description, status) VALUES
('Mobile Field Tablet', 'Field tablet with assignment workflows and partner notes.', 'In Use'),
('Route Planning Kit', 'Scheduling toolset for operational coverage and alerts.', 'Available'),
('Sensor Monitor Pack', 'Temperature and status monitoring sensors for logistics.', 'Available'),
('Security Badge Printer', 'Generates verified access badges for field staff.', 'Maintenance'),
('Payroll Export Tool', 'Creates monthly salary and attendance export.', 'Available'),
('Operational Report Builder', 'Generates stakeholder-ready field performance reports.', 'In Use');

INSERT INTO projects (client_name, route, assignment_date, workload, assigned_employee_id, assigned_team, status) VALUES
('NexaTech Campus', 'North Route', CURDATE(), 'Medium', 2, 'Field Team A', 'In Progress'),
('Aurora Labs', 'Central Route', CURDATE(), 'High', 3, 'Field Team B', 'Pending'),
('Metro Industrial Park', 'East Route', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Low', 2, 'Field Team A', 'Completed'),
('Harbor Innovation Hub', 'West Route', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'High', 3, 'Field Team C', 'Completed');
