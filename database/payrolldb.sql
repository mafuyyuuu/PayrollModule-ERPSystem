-- =====================================================
-- PAYROLL MANAGEMENT SYSTEM DATABASE - COMPLETE SETUP
-- =====================================================

CREATE DATABASE IF NOT EXISTS PayrollManagementSystem;
USE PayrollManagementSystem;

-- Roles Table (Insert first - no dependencies)
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100)
);

-- Employee Groups Table
CREATE TABLE EmployeeGroups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(255),
    group_rules VARCHAR(255),
    effective_date DATE
);

-- Departments Table (without foreign key first)
CREATE TABLE Departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255),
    department_code VARCHAR(50),
    manager_assigned INT,
    description VARCHAR(255)
);

-- Employees Table
CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255),
    middle_name VARCHAR(255),
    last_name VARCHAR(255),
    suffix VARCHAR(255),
    date_of_birth DATE,
    sex VARCHAR(50),
    address VARCHAR(255),
    contact_number VARCHAR(50),
    email_address VARCHAR(255),
    marital_status VARCHAR(50),
    position VARCHAR(255),
    employment_status VARCHAR(100),
    date_hired DATE,
    group_id INT,
    department_id INT,
    FOREIGN KEY (group_id) REFERENCES EmployeeGroups(group_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

-- Add foreign key to Departments after Employees table exists
ALTER TABLE Departments
    ADD FOREIGN KEY (manager_assigned) REFERENCES Employees(employee_id);

-- Emergency Contact Table
CREATE TABLE EmergencyContact (
    emergency_contact_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    address VARCHAR(255),
    contact_name VARCHAR(255),
    contact_number VARCHAR(50),
    relationship VARCHAR(100),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- Timesheets Table
CREATE TABLE Timesheets (
    timesheet_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    date DATE,
    time_in TIME,
    time_out TIME,
    break_duration DECIMAL(5,2),
    overtime_hours DECIMAL(5,2),
    remarks VARCHAR(255),
    approved_by INT,
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (approved_by) REFERENCES Employees(employee_id)
);

-- Salary Details Table
CREATE TABLE SalaryDetails (
    salary_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    basic_rate DECIMAL(10,2),
    overtime_rate DECIMAL(10,2),
    holiday_rate DECIMAL(10,2),
    loan_deductions DECIMAL(10,2),
    other_deductions DECIMAL(10,2),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- Payroll Table
CREATE TABLE Payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    cutoff_start_date DATE,
    cutoff_end_date DATE,
    pay_date DATE,
    payroll_frequency VARCHAR(100),
    prepared_by INT,
    basic_pay DECIMAL(10,2),
    overtime_pay DECIMAL(10,2),
    bonuses DECIMAL(10,2),
    status VARCHAR(50),
    comments VARCHAR(255),
    deductions DECIMAL(10,2),
    net_pay DECIMAL(10,2),
    payslip_reference_number VARCHAR(100),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (prepared_by) REFERENCES Employees(employee_id)
);

-- User Accounts Table
CREATE TABLE UserAccounts (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    username VARCHAR(255),
    email_address VARCHAR(255),
    password VARCHAR(255),
    role_id INT,
    status VARCHAR(50),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- Requests Table
CREATE TABLE Requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    request_type VARCHAR(255),
    request_description VARCHAR(255),
    date_filed DATE,
    status VARCHAR(100),
    approved_by INT,
    remarks VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
    FOREIGN KEY (approved_by) REFERENCES Employees(employee_id)
);

-- Manager Actions Table
CREATE TABLE ManagerActions (
    manager_action_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    handled_by INT,
    date_period_covered VARCHAR(255),
    total_hours_worked DECIMAL(10,2),
    overtime_hours DECIMAL(10,2),
    leave_absence_notes VARCHAR(255),
    remarks VARCHAR(255),
    action VARCHAR(100),
    approved_by INT,
    type_of_exception VARCHAR(255),
    requested_amount_hours DECIMAL(10,2),
    reason VARCHAR(255),
    date_filed DATE,
    FOREIGN KEY (request_id) REFERENCES Requests(request_id),
    FOREIGN KEY (handled_by) REFERENCES Employees(employee_id),
    FOREIGN KEY (approved_by) REFERENCES Employees(employee_id)
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

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert Roles
INSERT INTO Roles (role_id, role_name) VALUES
(1, 'Admin'),
(2, 'Manager'),
(3, 'Payroll'),
(4, 'Employee');

-- Insert Employee Groups
INSERT INTO EmployeeGroups (group_id, group_name, group_rules, effective_date) VALUES
(1, 'Regular Full-Time', 'Standard 40-hour work week', '2024-01-01'),
(2, 'Management', 'Executive benefits package', '2024-01-01'),
(3, 'Payroll Team', 'Administrative staff', '2024-01-01');

-- Insert Departments
INSERT INTO Departments (department_id, department_name, department_code, manager_assigned, description) VALUES
(1, 'Human Resources', 'HR', NULL, 'Human Resources Department'),
(2, 'Finance', 'FIN', NULL, 'Finance Department'),
(3, 'IT', 'IT', NULL, 'Information Technology'),
(4, 'Operations', 'OPS', NULL, 'Operations Department');

-- Insert Employees (5 Regular + 2 Payroll + 2 Managers + 1 Admin = 10 total)
-- Regular Employees
INSERT INTO Employees (employee_id, first_name, middle_name, last_name, suffix, date_of_birth, sex, address, contact_number, email_address, marital_status, position, employment_status, date_hired, group_id, department_id) VALUES
(1, 'Juan', 'Santos', 'Dela Cruz', NULL, '1990-05-15', 'Male', '123 Rizal St, Manila', '09171234567', 'juan.delacruz@company.com', 'Married', 'Software Developer', 'Regular', '2022-01-15', 1, 3),
(2, 'Maria', 'Garcia', 'Reyes', NULL, '1992-08-22', 'Female', '456 Bonifacio Ave, Quezon City', '09187654321', 'maria.reyes@company.com', 'Single', 'HR Specialist', 'Regular', '2022-03-20', 1, 1),
(3, 'Pedro', 'Lopez', 'Santos', NULL, '1988-12-10', 'Male', '789 Aguinaldo Blvd, Makati', '09191234567', 'pedro.santos@company.com', 'Married', 'Accountant', 'Regular', '2021-06-01', 1, 2),
(4, 'Ana', 'Marie', 'Torres', NULL, '1995-03-18', 'Female', '321 Luna St, Pasig', '09178889999', 'ana.torres@company.com', 'Single', 'Operations Coordinator', 'Regular', '2023-02-15', 1, 4),
(5, 'Carlos', 'Miguel', 'Ramos', NULL, '1991-07-25', 'Male', '654 Mabini St, Taguig', '09189991111', 'carlos.ramos@company.com', 'Married', 'Quality Analyst', 'Regular', '2022-09-10', 1, 4),

-- Payroll Team
(6, 'Jessa', 'Mae', 'Balnig', NULL, '1993-04-12', 'Female', '147 Roxas Blvd, Manila', '09172223333', 'jessa.balnig@company.com', 'Single', 'Payroll Specialist', 'Regular', '2021-11-01', 3, 2),
(7, 'Symon', 'Cruz', 'Banaag', NULL, '1989-09-30', 'Male', '258 Del Pilar St, Manila', '09183334444', 'symon.banaag@company.com', 'Married', 'Payroll Officer', 'Regular', '2020-08-15', 3, 2),

-- Managers
(8, 'Princess Jumiah', 'Ali', 'Zamora', NULL, '1987-06-20', 'Female', '369 Quezon Ave, Quezon City', '09194445555', 'jumiah.zamora@company.com', 'Married', 'HR Manager', 'Regular', '2020-03-01', 2, 1),
(9, 'Jhervin', 'Santos', 'Jimenez', NULL, '1986-11-05', 'Male', '741 EDSA, Mandaluyong', '09185556666', 'jhervin.jimenez@company.com', 'Married', 'IT Manager', 'Regular', '2019-07-20', 2, 3),

-- Admin (not linked to Employees table as per role rules)
(10, 'Edrianne', 'Joy', 'Lumabas', NULL, '1990-02-14', 'Female', '852 Taft Ave, Manila', '09196667777', 'edrianne.lumabas@company.com', 'Single', 'System Administrator', 'Regular', '2019-01-10', 2, 3);

-- Update Department Managers
UPDATE Departments SET manager_assigned = 8 WHERE department_id = 1;
UPDATE Departments SET manager_assigned = 9 WHERE department_id = 3;

-- Insert Emergency Contacts
INSERT INTO EmergencyContact (employee_id, address, contact_name, contact_number, relationship) VALUES
(1, '123 Rizal St, Manila', 'Rosa Dela Cruz', '09171111111', 'Spouse'),
(2, '456 Bonifacio Ave, Quezon City', 'Carmen Reyes', '09182222222', 'Mother'),
(3, '789 Aguinaldo Blvd, Makati', 'Linda Santos', '09193333333', 'Spouse'),
(4, '321 Luna St, Pasig', 'Roberto Torres', '09174444444', 'Father'),
(5, '654 Mabini St, Taguig', 'Elena Ramos', '09185555555', 'Spouse'),
(6, '147 Roxas Blvd, Manila', 'Maria Balnig', '09196666666', 'Mother'),
(7, '258 Del Pilar St, Manila', 'Susan Banaag', '09177777777', 'Spouse'),
(8, '369 Quezon Ave, Quezon City', 'Ahmed Zamora', '09188888888', 'Spouse'),
(9, '741 EDSA, Mandaluyong', 'Grace Jimenez', '09199999999', 'Spouse'),
(10, '852 Taft Ave, Manila', 'Antonio Lumabas', '09170000000', 'Father');

-- Insert Salary Details
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

-- Insert User Accounts
-- Admin (not linked to employee)
INSERT INTO UserAccounts (user_id, employee_id, username, email_address, password, role_id, status) VALUES
(1, NULL, 'admin', 'admin@company.com', 'admin123', 1, 'Active'),

-- Managers
(2, 8, 'jumiah.zamora', 'jumiah.zamora@company.com', 'manager123', 2, 'Active'),
(3, 9, 'jhervin.jimenez', 'jhervin.jimenez@company.com', 'manager123', 2, 'Active'),

-- Payroll Team (not linked to employee)
(4, NULL, 'jessa.balnig', 'jessa.balnig@company.com', 'payroll123', 3, 'Active'),
(5, NULL, 'symon.banaag', 'symon.banaag@company.com', 'payroll123', 3, 'Active'),

-- Regular Employees
(6, 1, 'juan.delacruz', 'juan.delacruz@company.com', 'employee123', 4, 'Active'),
(7, 2, 'maria.reyes', 'maria.reyes@company.com', 'employee123', 4, 'Active'),
(8, 3, 'pedro.santos', 'pedro.santos@company.com', 'employee123', 4, 'Active'),
(9, 4, 'ana.torres', 'ana.torres@company.com', 'employee123', 4, 'Active'),
(10, 5, 'carlos.ramos', 'carlos.ramos@company.com', 'employee123', 4, 'Active');

-- Insert Timesheets (Recent data for payroll calculation)
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
-- Payroll 1 - Juan Dela Cruz
(1, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 6, 17500.00, 300.00, 1000.00, 'Processed', 'Regular payout', 2500.00, 16300.00, 'PAY-2025-11-001'),

-- Payroll 2 - Maria Reyes
(2, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 6, 16000.00, 140.00, 800.00, 'Processed', 'Regular payout', 1800.00, 15140.00, 'PAY-2025-11-002'),

-- Payroll 3 - Pedro Santos
(3, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 7, 19000.00, 160.00, 1200.00, 'Processed', 'Regular payout', 2900.00, 17460.00, 'PAY-2025-11-003'),

-- Payroll 4 - Ana Torres
(4, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 7, 15000.00, 260.00, 700.00, 'Processed', 'Regular payout', 1200.00, 14760.00, 'PAY-2025-11-004'),

-- Payroll 5 - Carlos Ramos
(5, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 6, 16500.00, 290.00, 900.00, 'Processed', 'Regular payout', 2150.00, 15540.00, 'PAY-2025-11-005');

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'payrollsystem'@'%' IDENTIFIED BY 'payroll';
GRANT ALL PRIVILEGES ON payrollmanagementsystem.* TO 'payrollsystem'@'%';
FLUSH PRIVILEGES;
