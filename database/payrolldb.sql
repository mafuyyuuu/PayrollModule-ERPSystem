-- =====================================================
-- PAYROLL MANAGEMENT SYSTEM DATABASE - CORRECTED
-- (No Employee Management - Only Payroll Data)
-- =====================================================

CREATE DATABASE IF NOT EXISTS PayrollManagementSystem;
USE PayrollManagementSystem;

-- Roles Table
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100)
);

-- User Accounts Table (No employee_id foreign key since Employees table is external)
CREATE TABLE UserAccounts (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT, -- References external Employee Management System
    username VARCHAR(255),
    email_address VARCHAR(255),
    password VARCHAR(255),
    role_id INT,
    status VARCHAR(50),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- Timesheets Table (employee_id references external system)
CREATE TABLE Timesheets (
    timesheet_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT, -- References external Employee Management System
    date DATE,
    time_in TIME,
    time_out TIME,
    break_duration DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    remarks VARCHAR(255),
    approved_by INT, -- References external Employee Management System
    INDEX idx_employee_date (employee_id, date)
);

-- Salary Details Table
CREATE TABLE SalaryDetails (
    salary_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT, -- References external Employee Management System
    basic_rate DECIMAL(10,2),
    overtime_rate DECIMAL(10,2),
    holiday_rate DECIMAL(10,2),
    loan_deductions DECIMAL(10,2),
    other_deductions DECIMAL(10,2),
    INDEX idx_employee (employee_id)
);

-- Payroll Table
CREATE TABLE Payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT, -- References external Employee Management System
    cutoff_start_date DATE,
    cutoff_end_date DATE,
    pay_date DATE,
    payroll_frequency VARCHAR(100),
    prepared_by INT, -- User ID from UserAccounts
    basic_pay DECIMAL(10,2),
    overtime_pay DECIMAL(10,2),
    bonuses DECIMAL(10,2),
    status VARCHAR(50),
    comments VARCHAR(255),
    deductions DECIMAL(10,2),
    net_pay DECIMAL(10,2),
    payslip_reference_number VARCHAR(100),
    FOREIGN KEY (prepared_by) REFERENCES UserAccounts(user_id),
    INDEX idx_employee (employee_id),
    INDEX idx_pay_date (pay_date)
);

-- Requests Table
CREATE TABLE Requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT, -- References external Employee Management System
    request_type VARCHAR(255),
    request_description VARCHAR(255),
    date_filed DATE,
    status VARCHAR(100),
    approved_by INT, -- References external Employee Management System
    remarks VARCHAR(255),
    INDEX idx_employee (employee_id)
);

-- Manager Actions Table
CREATE TABLE ManagerActions (
    manager_action_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    handled_by INT, -- References external Employee Management System
    date_period_covered VARCHAR(255),
    total_hours_worked DECIMAL(10,2),
    overtime_hours DECIMAL(10,2),
    leave_absence_notes VARCHAR(255),
    remarks VARCHAR(255),
    action VARCHAR(100),
    approved_by INT, -- References external Employee Management System
    type_of_exception VARCHAR(255),
    requested_amount_hours DECIMAL(10,2),
    reason VARCHAR(255),
    date_filed DATE,
    FOREIGN KEY (request_id) REFERENCES Requests(request_id)
);

-- Admin Config Table
CREATE TABLE AdminConfig (
    config_id INT AUTO_INCREMENT PRIMARY KEY,
    default_payroll_frequency VARCHAR(100),
    default_cutoff_dates VARCHAR(100),
    default_tax_rates DECIMAL(5,2),
    default_contribution_rates DECIMAL(5,2),
    salary_computation_formula VARCHAR(255),
    effective_date_of_changes DATE,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES UserAccounts(user_id)
);

-- Payroll Cutoff Periods Table
CREATE TABLE PayrollCutoffs (
    cutoff_id INT AUTO_INCREMENT PRIMARY KEY,
    period_name VARCHAR(100),
    cutoff_start_date DATE,
    cutoff_end_date DATE,
    pay_date DATE,
    frequency VARCHAR(50),
    status VARCHAR(50)
);

-- Tax and Contributions Table
CREATE TABLE TaxContributions (
    contribution_id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_id INT,
    employee_id INT,
    sss_contribution DECIMAL(10,2),
    philhealth_contribution DECIMAL(10,2),
    pagibig_contribution DECIMAL(10,2),
    withholding_tax DECIMAL(10,2),
    total_contributions DECIMAL(10,2),
    FOREIGN KEY (payroll_id) REFERENCES Payroll(payroll_id),
    INDEX idx_employee (employee_id)
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert Roles
INSERT INTO Roles (role_id, role_name) VALUES
(1, 'Admin'),
(2, 'Manager'),
(3, 'Payroll'),
(4, 'Employee');

-- Insert User Accounts (employee_id references external system)
-- Admin (not linked to employee)
INSERT INTO UserAccounts (user_id, employee_id, username, email_address, password, role_id, status) VALUES
(1, NULL, 'admin', 'admin@company.com', 'admin123', 1, 'Active'),

-- Managers (employee_id from external system)
(2, 8, 'jumiah.zamora', 'jumiah.zamora@company.com', 'manager123', 2, 'Active'),
(3, 9, 'jhervin.jimenez', 'jhervin.jimenez@company.com', 'manager123', 2, 'Active'),

-- Payroll Team (not linked to employee)
(4, NULL, 'jessa.balnig', 'jessa.balnig@company.com', 'payroll123', 3, 'Active'),
(5, NULL, 'symon.banaag', 'symon.banaag@company.com', 'payroll123', 3, 'Active'),

-- Regular Employees (employee_id from external system)
(6, 1, 'juan.delacruz', 'juan.delacruz@company.com', 'employee123', 4, 'Active'),
(7, 2, 'maria.reyes', 'maria.reyes@company.com', 'employee123', 4, 'Active'),
(8, 3, 'pedro.santos', 'pedro.santos@company.com', 'employee123', 4, 'Active'),
(9, 4, 'ana.torres', 'ana.torres@company.com', 'employee123', 4, 'Active'),
(10, 5, 'carlos.ramos', 'carlos.ramos@company.com', 'employee123', 4, 'Active');

-- Insert Salary Details (employee_id from external system)
INSERT INTO SalaryDetails (employee_id, basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions) VALUES
(1, 35000.00, 150.00, 200.00, 2000.00, 500.00),
(2, 32000.00, 140.00, 190.00, 1500.00, 300.00),
(3, 38000.00, 160.00, 210.00, 2500.00, 400.00),
(4, 30000.00, 130.00, 180.00, 1000.00, 200.00),
(5, 33000.00, 145.00, 195.00, 1800.00, 350.00),
(6, 36000.00, 155.00, 205.00, 2200.00, 450.00),
(7, 40000.00, 170.00, 220.00, 2800.00, 600.00),
(8, 55000.00, 250.00, 300.00, 3000.00, 800.00),
(9, 60000.00, 270.00, 320.00, 3500.00, 900.00),
(10, 50000.00, 220.00, 280.00, 2500.00, 700.00);

-- Insert Payroll Cutoffs
INSERT INTO PayrollCutoffs (cutoff_id, period_name, cutoff_start_date, cutoff_end_date, pay_date, frequency, status) VALUES
(1, 'November 2025 - 1st Half', '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 'Processed'),
(2, 'November 2025 - 2nd Half', '2025-11-16', '2025-11-30', '2025-12-05', 'Bi-Monthly', 'Pending'),
(3, 'December 2025 - 1st Half', '2025-12-01', '2025-12-15', '2025-12-20', 'Bi-Monthly', 'Pending');

-- Insert Timesheets (employee_id from external system)
INSERT INTO Timesheets (employee_id, date, time_in, time_out, break_duration, overtime_hours, remarks, approved_by) VALUES
-- Employee 1 - Juan
(1, '2025-11-01', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
(1, '2025-11-02', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
(1, '2025-11-03', '08:00:00', '19:00:00', 1.00, 2.00, 'Overtime', 9),
(1, '2025-11-04', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
(1, '2025-11-05', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),

-- Employee 2 - Maria
(2, '2025-11-01', '08:30:00', '17:30:00', 1.00, 0.00, 'Regular', 8),
(2, '2025-11-02', '08:30:00', '17:30:00', 1.00, 0.00, 'Regular', 8),
(2, '2025-11-03', '08:30:00', '17:30:00', 1.00, 0.00, 'Regular', 8),
(2, '2025-11-04', '08:30:00', '18:30:00', 1.00, 1.00, 'Overtime', 8),
(2, '2025-11-05', '08:30:00', '17:30:00', 1.00, 0.00, 'Regular', 8),

-- Employee 3 - Pedro
(3, '2025-11-01', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 8),
(3, '2025-11-02', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 8),
(3, '2025-11-03', '08:00:00', '18:00:00', 1.00, 1.00, 'Overtime', 8),
(3, '2025-11-04', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 8),
(3, '2025-11-05', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 8),

-- Employee 4 - Ana
(4, '2025-11-01', '09:00:00', '18:00:00', 1.00, 0.00, 'Regular', 9),
(4, '2025-11-02', '09:00:00', '18:00:00', 1.00, 0.00, 'Regular', 9),
(4, '2025-11-03', '09:00:00', '18:00:00', 1.00, 0.00, 'Regular', 9),
(4, '2025-11-04', '09:00:00', '20:00:00', 1.00, 2.00, 'Overtime', 9),
(4, '2025-11-05', '09:00:00', '18:00:00', 1.00, 0.00, 'Regular', 9),

-- Employee 5 - Carlos
(5, '2025-11-01', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
(5, '2025-11-02', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
(5, '2025-11-03', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
(5, '2025-11-04', '08:00:00', '19:00:00', 1.00, 2.00, 'Overtime', 9),
(5, '2025-11-05', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9);

-- Insert 5 Complete Payroll Records
INSERT INTO Payroll (employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency, prepared_by, basic_pay, overtime_pay, bonuses, status, comments, deductions, net_pay, payslip_reference_number) VALUES
-- Payroll 1 - Juan Dela Cruz (employee_id: 1)
(1, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 4, 17500.00, 300.00, 1000.00, 'Processed', 'Regular payout', 2500.00, 16300.00, 'PAY-2025-11-001'),

-- Payroll 2 - Maria Reyes (employee_id: 2)
(2, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 4, 16000.00, 140.00, 800.00, 'Processed', 'Regular payout', 1800.00, 15140.00, 'PAY-2025-11-002'),

-- Payroll 3 - Pedro Santos (employee_id: 3)
(3, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 5, 19000.00, 160.00, 1200.00, 'Processed', 'Regular payout', 2900.00, 17460.00, 'PAY-2025-11-003'),

-- Payroll 4 - Ana Torres (employee_id: 4)
(4, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 5, 15000.00, 260.00, 700.00, 'Processed', 'Regular payout', 1200.00, 14760.00, 'PAY-2025-11-004'),

-- Payroll 5 - Carlos Ramos (employee_id: 5)
(5, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 4, 16500.00, 290.00, 900.00, 'Processed', 'Regular payout', 2150.00, 15540.00, 'PAY-2025-11-005');

-- Insert Tax and Contributions for the 5 payrolls
INSERT INTO TaxContributions (payroll_id, employee_id, sss_contribution, philhealth_contribution, pagibig_contribution, withholding_tax, total_contributions) VALUES
(1, 1, 800.00, 450.00, 200.00, 1050.00, 2500.00),
(2, 2, 750.00, 400.00, 200.00, 450.00, 1800.00),
(3, 3, 850.00, 500.00, 200.00, 1350.00, 2900.00),
(4, 4, 700.00, 350.00, 150.00, 0.00, 1200.00),
(5, 5, 800.00, 400.00, 200.00, 750.00, 2150.00);

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'payrollsystem'@'%' IDENTIFIED BY 'payroll';
GRANT ALL PRIVILEGES ON payrollmanagementsystem.* TO 'payrollsystem'@'%';
FLUSH PRIVILEGES;
