-- Use the database
CREATE DATABASE IF NOT EXISTS PayrollManagementSystem;
USE PayrollManagementSystem;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;


-- Employee Groups
INSERT INTO EmployeeGroups (group_name, group_rules, effective_date)
VALUES
('Regular Staff', 'Standard payroll rules apply', '2024-01-01'),
('IT Personnel', 'OT flexible policy', '2024-01-01'),
('Management', 'Higher pay grade policies apply', '2024-01-01');

SELECT * FROM EmployeeGroups;


-- Roles
INSERT INTO Roles (role_name)
VALUES
('Employee'),
('Payroll Staff'),
('Manager'),
('Admin');

SELECT * FROM Roles;


-- Departments
INSERT INTO Departments (department_name, department_code, manager_assigned, description)
VALUES
('Payroll Department', 'PAY', NULL, 'Handles salary processing'),
('Design Department', 'DES', NULL, 'Handles UI/UX and frontend visuals'),
('IT Department', 'ITD', NULL, 'Technical and system support'),
('Admin Department', 'ADM', NULL, 'Administrative functions and support');

SELECT * FROM Departments;


-- Employees
INSERT INTO Employees (
first_name, middle_name, last_name, suffix, date_of_birth, sex, address,
contact_number, email_address, marital_status, position, employment_status,
date_hired, group_id, department_id
) VALUES
('Jessa', 'Acuram', 'Balnig', NULL, '2004-10-27', 'Female', 'Caniogan, Pasig City',
'09950074295', 'jessa.balnig@example.com', 'Married', 'Payroll Assistant', 'Full-time',
'2023-09-10', 1, 1),

('Jumiah', 'Rose', 'Zamora', NULL, '2003-03-04', 'Female', 'Kapitolyo, Pasig City',
'09982341234', 'jumiah.zamora@example.com', 'Single', 'UI/UX Designer', 'Full-time',
'2024-01-15', 1, 2),

('Jhervin', 'Santos', 'Jimenez', NULL, '2002-05-18', 'Male', 'San Joaquin, Pasig City',
'09124567890', 'jhervin.jimenez@example.com', 'Single', 'IT Support Staff', 'Full-time',
'2023-08-01', 2, 3),

('Symon', 'Reyes', 'Banaag', NULL, '2001-11-09', 'Male', 'Pinagbuhatan, Pasig City',
'09231234567', 'symon.banaag@example.com', 'Married', 'Manager', 'Full-time',
'2022-05-20', 3, 1),

('Edrianne', 'Lopez', 'Lumabas', NULL, '2000-07-12', 'Male', 'Bagong Ilog, Pasig City',
'09198765432', 'edrianne.lumabas@example.com', 'Single', 'Admin Officer', 'Full-time',
'2021-02-10', 3, 4);

SELECT * FROM Employees;


-- Update department managers
UPDATE Departments SET manager_assigned = 4 WHERE department_id = 1;
UPDATE Departments SET manager_assigned = 2 WHERE department_id = 2;
UPDATE Departments SET manager_assigned = 3 WHERE department_id = 3;
UPDATE Departments SET manager_assigned = 5 WHERE department_id = 4;


-- User Accounts
INSERT INTO UserAccounts (employee_id, username, email_address, password, role_id, status)
VALUES
(1, 'jessa.b', 'jessa.balnig@example.com', 'hashed_password', 1, 'Active'),
(2, 'jumiah.z', 'jumiah.zamora@example.com', 'hashed_password', 1, 'Active'),
(3, 'jhervin.j', 'jhervin.jimenez@example.com', 'hashed_password', 1, 'Active'),
(4, 'symon.b', 'symon.banaag@example.com', 'hashed_password', 3, 'Active'),
(5, 'edrianne.l', 'edrianne.lumabas@example.com', 'hashed_password', 4, 'Active');

SELECT * FROM UserAccounts;


-- Emergency Contacts
INSERT INTO EmergencyContact (employee_id, address, contact_name, contact_number, relationship)
VALUES
(1, 'Caniogan, Pasig City', 'Maria Balnig', '09950070000', 'Mother'),
(2, 'Kapitolyo, Pasig City', 'Jenny Zamora', '09981231231', 'Sister'),
(3, 'San Joaquin, Pasig City', 'Ramon Jimenez', '09123456710', 'Father'),
(4, 'Pinagbuhatan, Pasig City', 'Liza Banaag', '09239876543', 'Wife'),
(5, 'Bagong Ilog, Pasig City', 'Leo Lumabas', '09190001111', 'Brother');

SELECT * FROM EmergencyContact;


-- Timesheets
INSERT INTO Timesheets (employee_id, date, time_in, time_out, break_duration, overtime_hours, remarks, approved_by)
VALUES
(1, '2025-01-10', '08:00', '17:00', 1.00, 0.00, 'Regular shift', 4),
(1, '2025-01-11', '08:15', '17:30', 1.00, 0.50, 'Overtime', 4),

(2, '2025-01-10', '09:00', '18:00', 1.00, 0.00, 'Design tasks', 4),
(2, '2025-01-11', '09:05', '18:30', 1.00, 0.50, 'UI revisions', 4);

SELECT * FROM Timesheets;


-- Payroll
INSERT INTO Payroll (employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency,
prepared_by, basic_pay, overtime_pay, bonuses, status, comments, deductions, net_pay, payslip_reference_number)
VALUES
(1, '2025-01-01', '2025-01-15', '2025-01-20', 'Semi-monthly', 5, 12000.00, 500.00, 1000.00,
'Released', 'Good attendance', 800.00, 12700.00, 'PSL-001-2025'),

(2, '2025-01-01', '2025-01-15', '2025-01-20', 'Semi-monthly', 4, 15000.00, 700.00, 0.00,
'Pending', 'Review required', 1000.00, 14700.00, 'PSL-002-2025');

SELECT * FROM Payroll;


-- Salary Details
INSERT INTO SalaryDetails (employee_id, basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions)
VALUES
(1, 600.00, 80.00, 150.00, 0.00, 200.00),
(2, 750.00, 95.00, 180.00, 0.00, 150.00),
(3, 700.00, 90.00, 170.00, 200.00, 100.00),
(4, 1200.00, 150.00, 250.00, 0.00, 400.00),
(5, 900.00, 120.00, 200.00, 0.00, 300.00);

SELECT * FROM SalaryDetails;


-- Requests
INSERT INTO Requests (employee_id, request_type, request_description, date_filed, status, approved_by, remarks)
VALUES
(1, 'Leave Request', 'Medical leave for 2 days', '2025-01-12', 'Pending', NULL, NULL),
(2, 'Overtime Request', 'Overtime for UI fixes', '2025-01-11', 'Approved', 4, 'Valid request');

SELECT * FROM Requests;


-- Manager Actions
INSERT INTO ManagerActions (
request_id, handled_by, date_period_covered, total_hours_worked, overtime_hours,
leave_absence_notes, remarks, action, approved_by, type_of_exception,
requested_amount_hours, reason, date_filed
) VALUES
(1, 4, 'Jan 12–13, 2025', 16.00, 0.00, 'Sick leave documents provided', 'Approved', 'Approved', 4,
'Leave', 0, 'Medical reason', '2025-01-12'),

(2, 4, 'Jan 10–11, 2025', 16.00, 2.00, NULL, 'Approved', 'Approved', 4,
'Overtime', 2, 'Urgent UI tasks', '2025-01-11');

SELECT * FROM ManagerActions;


-- Admin Config
INSERT INTO AdminConfig (
default_payroll_frequency, default_cutoff_dates, default_tax_rates,
default_contribution_rates, salary_computation_formula, effective_date_of_changes, updated_by
) VALUES
('Semi-monthly', '1st-15th, 16th-30th', 10.00, 4.00,
'net_pay = basic_pay + overtime - deductions', '2024-12-01', 5);


SELECT * FROM AdminConfig;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;