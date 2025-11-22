-- ==========================================================
-- PART 1: DATABASE & SCHEMA SETUP
-- ==========================================================
DROP DATABASE IF EXISTS PayrollManagementSystem;
CREATE DATABASE PayrollManagementSystem;
USE PayrollManagementSystem;

-- 1.1 Departments
CREATE TABLE Departments (
                             department_id INT AUTO_INCREMENT PRIMARY KEY,
                             department_name VARCHAR(100) NOT NULL,
                             department_code VARCHAR(20) UNIQUE,
                             description VARCHAR(255)
);

-- 1.2 Roles (For User Permissions)
CREATE TABLE Roles (
                       role_id INT AUTO_INCREMENT PRIMARY KEY,
                       role_name VARCHAR(50) UNIQUE
);

-- 1.3 Employee Groups (Employment Status)
CREATE TABLE EmployeeGroups (
                                group_id INT AUTO_INCREMENT PRIMARY KEY,
                                group_name VARCHAR(100),
                                description TEXT
);

-- 1.4 Leave Types (PH Legal & Company)
CREATE TABLE LeaveTypes (
                            leave_type_id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            days_entitled INT DEFAULT 0,
                            is_paid BOOLEAN DEFAULT TRUE,
                            is_convertible_to_cash BOOLEAN DEFAULT FALSE
);

-- 1.5 Tax Brackets (PH TRAIN Law)
CREATE TABLE TaxBrackets (
                             bracket_id INT AUTO_INCREMENT PRIMARY KEY,
                             min_income DECIMAL(10,2) NOT NULL,
                             max_income DECIMAL(10,2), -- NULL means "and above"
                             base_tax_amount DECIMAL(10,2) DEFAULT 0.00,
                             percentage_on_excess DECIMAL(5,2) NOT NULL,
                             effective_year INT NOT NULL
);

-- 1.6 Employees (Main Table)
CREATE TABLE Employees (
                           employee_id INT AUTO_INCREMENT PRIMARY KEY,
                           first_name VARCHAR(100) NOT NULL,
                           middle_name VARCHAR(100),
                           last_name VARCHAR(100) NOT NULL,
                           suffix VARCHAR(20),
                           date_of_birth DATE,
                           sex ENUM('Male', 'Female', 'Prefer Not to Say'),
                           marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed'),
                           address TEXT,
                           contact_number VARCHAR(20),
                           email_address VARCHAR(100) UNIQUE,
                           position VARCHAR(100),
                           employment_status ENUM('Probationary', 'Regular', 'Resigned', 'Terminated', 'AWOL') DEFAULT 'Probationary',
                           date_hired DATE,
                           group_id INT,
                           department_id INT,
                           FOREIGN KEY (group_id) REFERENCES EmployeeGroups(group_id),
                           FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

-- 1.7 Emergency Contacts
CREATE TABLE EmergencyContacts (
                                   contact_id INT AUTO_INCREMENT PRIMARY KEY,
                                   employee_id INT,
                                   contact_name VARCHAR(100),
                                   contact_number VARCHAR(20),
                                   relationship VARCHAR(50),
                                   FOREIGN KEY (employee_id) REFERENCES Employees(employee_id) ON DELETE CASCADE
);

-- 1.8 User Accounts (Login)
CREATE TABLE UserAccounts (
                              user_id INT AUTO_INCREMENT PRIMARY KEY,
                              employee_id INT UNIQUE,
                              username VARCHAR(50) UNIQUE NOT NULL,
                              password_hash VARCHAR(255) NOT NULL,
                              role_id INT,
                              is_active BOOLEAN DEFAULT TRUE,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
                              FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- 1.9 Salary Configuration
CREATE TABLE SalaryConfigs (
                               config_id INT AUTO_INCREMENT PRIMARY KEY,
                               employee_id INT,
                               basic_monthly_rate DECIMAL(10,2) NOT NULL,
                               daily_rate DECIMAL(10,2),
                               hourly_rate DECIMAL(10,2),
                               effective_date DATE NOT NULL,
                               is_active BOOLEAN DEFAULT TRUE,
                               FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- 1.10 Recurring Adjustments (SSS, Loans, Allowance)
CREATE TABLE RecurringAdjustments (
                                      adjustment_id INT AUTO_INCREMENT PRIMARY KEY,
                                      employee_id INT,
                                      adjustment_name VARCHAR(100),
                                      type ENUM('Allowance', 'Deduction') NOT NULL,
                                      amount DECIMAL(10,2) NOT NULL,
                                      frequency ENUM('EveryCutoff', 'OnceAMonth') DEFAULT 'EveryCutoff',
                                      is_active BOOLEAN DEFAULT TRUE,
                                      FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- 1.11 Attendance Logs
CREATE TABLE AttendanceLogs (
                                log_id INT AUTO_INCREMENT PRIMARY KEY,
                                employee_id INT,
                                work_date DATE NOT NULL,
                                time_in DATETIME,
                                time_out DATETIME,
                                hours_worked DECIMAL(4,2),
                                overtime_hours DECIMAL(4,2) DEFAULT 0.00,
                                status ENUM('Present', 'Absent', 'Late', 'Half Day', 'Holiday', 'Rest Day'),
                                FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- 1.12 Requests (Leaves/OT)
CREATE TABLE Requests (
                          request_id INT AUTO_INCREMENT PRIMARY KEY,
                          employee_id INT,
                          request_type ENUM('Leave', 'Overtime', 'Official Business'),
                          leave_type_id INT,
                          start_date DATETIME NOT NULL,
                          end_date DATETIME NOT NULL,
                          reason TEXT,
                          status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
                          FOREIGN KEY (employee_id) REFERENCES Employees(employee_id),
                          FOREIGN KEY (leave_type_id) REFERENCES LeaveTypes(leave_type_id)
);

-- 1.13 Request Approvals (Audit Trail)
CREATE TABLE RequestApprovals (
                                  approval_id INT AUTO_INCREMENT PRIMARY KEY,
                                  request_id INT,
                                  approver_id INT,
                                  action ENUM('Approved', 'Rejected'),
                                  remarks TEXT,
                                  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  FOREIGN KEY (request_id) REFERENCES Requests(request_id),
                                  FOREIGN KEY (approver_id) REFERENCES Employees(employee_id)
);

-- 1.14 Payroll Headers
CREATE TABLE PayrollRecords (
                                payroll_id INT AUTO_INCREMENT PRIMARY KEY,
                                employee_id INT,
                                cutoff_start DATE,
                                cutoff_end DATE,
                                payout_date DATE,
                                gross_income DECIMAL(10,2),
                                total_deductions DECIMAL(10,2),
                                net_pay DECIMAL(10,2),
                                status ENUM('Draft', 'Finalized', 'Paid') DEFAULT 'Draft',
                                FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- 1.15 Payroll Line Items
CREATE TABLE PayrollLineItems (
                                  item_id INT AUTO_INCREMENT PRIMARY KEY,
                                  payroll_id INT,
                                  item_name VARCHAR(100),
                                  category ENUM('Earning', 'Deduction'),
                                  amount DECIMAL(10,2),
                                  FOREIGN KEY (payroll_id) REFERENCES PayrollRecords(payroll_id)
);


-- ==========================================================
-- PART 2: DATA POPULATION (INSERT STATEMENTS)
-- ==========================================================

-- 2.1 Departments
INSERT INTO Departments (department_name, department_code, description) VALUES
                                                                            ('Human Resources', 'HR', 'Handles recruitment and payroll'),
                                                                            ('IT Department', 'IT', 'Software development and infrastructure'),
                                                                            ('Sales', 'SALES', 'Client acquisition and revenue'),
                                                                            ('Operations', 'OPS', 'Day-to-day business activities');

-- 2.2 Roles
INSERT INTO Roles (role_name) VALUES ('Admin'), ('Payroll'), ('Manager'), ('Employee');

-- 2.3 Employee Groups
INSERT INTO EmployeeGroups (group_name, description) VALUES
                                                         ('Regular', 'Full-time permanent employees with full benefits'),
                                                         ('Probationary', 'New hires under 6-month evaluation'),
                                                         ('Management', 'Department heads and supervisors');

-- 2.4 Leave Types (PH Standards)
INSERT INTO LeaveTypes (name, days_entitled, is_paid, is_convertible_to_cash) VALUES
                                                                                  ('Service Incentive Leave', 5, TRUE, TRUE),
                                                                                  ('Vacation Leave', 10, TRUE, FALSE),
                                                                                  ('Sick Leave', 10, TRUE, FALSE),
                                                                                  ('Maternity Leave', 105, TRUE, FALSE),
                                                                                  ('Paternity Leave', 7, TRUE, FALSE),
                                                                                  ('Solo Parent Leave', 7, TRUE, FALSE),
                                                                                  ('Emergency Leave', 3, TRUE, FALSE);

-- 2.5 Tax Brackets (2025 TRAIN Law)
INSERT INTO TaxBrackets (min_income, max_income, base_tax_amount, percentage_on_excess, effective_year) VALUES
                                                                                                            (0.00, 250000.00, 0.00, 0.00, 2025),
                                                                                                            (250000.01, 400000.00, 0.00, 0.15, 2025),
                                                                                                            (400000.01, 800000.00, 22500.00, 0.20, 2025),
                                                                                                            (800000.01, 2000000.00, 102500.00, 0.25, 2025),
                                                                                                            (2000000.01, 8000000.00, 402500.00, 0.30, 2025),
                                                                                                            (8000000.01, NULL, 2202500.00, 0.35, 2025);

-- 2.6 Employees (14 Users: 10 Real + 4 Test)
-- A. Managers
INSERT INTO Employees (first_name, last_name, position, department_id, group_id, email_address, date_hired) VALUES
                                                                                                                ('Diana', 'Prince', 'IT Manager', 2, 3, 'diana.prince@company.com', '2020-01-15'),
                                                                                                                ('Tony', 'Stark', 'Sales Manager', 3, 3, 'tony.stark@company.com', '2019-05-20');

-- B. Payroll/HR Team
INSERT INTO Employees (first_name, last_name, position, department_id, group_id, email_address, date_hired) VALUES
                                                                                                                ('Pepper', 'Potts', 'Payroll Specialist', 1, 1, 'pepper.potts@company.com', '2021-03-10'),
                                                                                                                ('Clark', 'Kent', 'HR Officer', 1, 1, 'clark.kent@company.com', '2022-08-01');

-- C. Admin
INSERT INTO Employees (first_name, last_name, position, department_id, group_id, email_address, date_hired) VALUES
    ('Bruce', 'Wayne', 'System Administrator', 2, 3, 'bruce.wayne@company.com', '2018-12-01');

-- D. Regular Employees
INSERT INTO Employees (first_name, last_name, position, department_id, group_id, email_address, date_hired) VALUES
                                                                                                                ('Peter', 'Parker', 'Junior Dev', 2, 2, 'peter.parker@company.com', '2024-01-10'),
                                                                                                                ('Natasha', 'Romanoff', 'Senior Dev', 2, 1, 'natasha.romanoff@company.com', '2021-06-15'),
                                                                                                                ('Steve', 'Rogers', 'Operations Staff', 4, 1, 'steve.rogers@company.com', '2020-07-04'),
                                                                                                                ('Wanda', 'Maximoff', 'Sales Associate', 3, 1, 'wanda.maximoff@company.com', '2023-02-14'),
                                                                                                                ('Thor', 'Odinson', 'Utility Staff', 4, 1, 'thor.odinson@company.com', '2023-11-01');

-- E. Test Dummy Employees
INSERT INTO Employees (first_name, last_name, email_address) VALUES
                                                                 ('Test', 'Admin', 'admin@test.com'),
                                                                 ('Test', 'HR', 'hr@test.com'),
                                                                 ('Test', 'Manager', 'manager@test.com'),
                                                                 ('Test', 'Employee', 'employee@test.com');

-- 2.7 Salaries (Configs)
-- Managers
INSERT INTO SalaryConfigs (employee_id, basic_monthly_rate, daily_rate, hourly_rate, effective_date) VALUES
                                                                                                         (1, 95000.00, 4318.18, 539.77, '2024-01-01'),
                                                                                                         (2, 85000.00, 3863.63, 482.95, '2024-01-01');
-- HR/Payroll
INSERT INTO SalaryConfigs (employee_id, basic_monthly_rate, daily_rate, hourly_rate, effective_date) VALUES
                                                                                                         (3, 35000.00, 1590.90, 198.86, '2024-01-01'),
                                                                                                         (4, 30000.00, 1363.63, 170.45, '2024-01-01');
-- Admin
INSERT INTO SalaryConfigs (employee_id, basic_monthly_rate, daily_rate, hourly_rate, effective_date) VALUES
    (5, 120000.00, 5454.54, 681.81, '2024-01-01');
-- Regular Staff
INSERT INTO SalaryConfigs (employee_id, basic_monthly_rate, daily_rate, hourly_rate, effective_date) VALUES
                                                                                                         (6, 25000.00, 1136.36, 142.04, '2024-01-01'), -- Peter
                                                                                                         (7, 65000.00, 2954.54, 369.31, '2024-01-01'), -- Natasha
                                                                                                         (8, 20000.00, 909.09, 113.63, '2024-01-01'),  -- Steve
                                                                                                         (9, 22000.00, 1000.00, 125.00, '2024-01-01'), -- Wanda
                                                                                                         (10, 18000.00, 818.18, 102.27, '2024-01-01'); -- Thor

-- 2.8 Recurring Adjustments (SSS/PhilHealth/PagIBIG Estimates)
-- Diana (95k)
INSERT INTO RecurringAdjustments (employee_id, adjustment_name, type, amount) VALUES
                                                                                  (1, 'SSS Contribution', 'Deduction', 1750.00),
                                                                                  (1, 'PhilHealth Contribution', 'Deduction', 2375.00),
                                                                                  (1, 'Pag-IBIG Contribution', 'Deduction', 200.00);
-- Peter (25k)
INSERT INTO RecurringAdjustments (employee_id, adjustment_name, type, amount) VALUES
                                                                                  (6, 'SSS Contribution', 'Deduction', 1250.00),
                                                                                  (6, 'PhilHealth Contribution', 'Deduction', 625.00),
                                                                                  (6, 'Pag-IBIG Contribution', 'Deduction', 200.00);
-- Thor (18k)
INSERT INTO RecurringAdjustments (employee_id, adjustment_name, type, amount) VALUES
                                                                                  (10, 'SSS Contribution', 'Deduction', 900.00),
                                                                                  (10, 'PhilHealth Contribution', 'Deduction', 450.00),
                                                                                  (10, 'Pag-IBIG Contribution', 'Deduction', 200.00);

-- 2.9 User Accounts (Logins)
-- Test Accounts
INSERT INTO UserAccounts (employee_id, username, password_hash, role_id) VALUES
                                                                             (11, 'admin', 'admin', 1),
                                                                             (12, 'payroll', 'payroll', 2),
                                                                             (13, 'manager', 'manager', 3),
                                                                             (14, 'employee', 'employee', 4);
-- Real Accounts
INSERT INTO UserAccounts (employee_id, username, password_hash, role_id) VALUES
                                                                             (1, 'diana.prince', 'password123', 3),
                                                                             (3, 'pepper.potts', 'password123', 2),
                                                                             (5, 'bruce.wayne', 'password123', 1),
                                                                             (6, 'peter.parker', 'password123', 4);

-- 2.10 Attendance & Request Simulation
-- Peter works 3 days
INSERT INTO AttendanceLogs (employee_id, work_date, time_in, time_out, hours_worked, status) VALUES
                                                                                                 (6, '2025-11-01', '2025-11-01 08:00:00', '2025-11-01 17:00:00', 8.00, 'Present'),
                                                                                                 (6, '2025-11-02', '2025-11-02 09:00:00', '2025-11-02 17:00:00', 7.00, 'Late'),
                                                                                                 (6, '2025-11-03', '2025-11-03 08:00:00', '2025-11-03 19:00:00', 8.00, 'Present');
-- Peter requests leave
INSERT INTO Requests (employee_id, request_type, leave_type_id, start_date, end_date, reason, status) VALUES
    (6, 'Leave', 2, '2025-12-24 08:00:00', '2025-12-26 17:00:00', 'Christmas Vacation', 'Approved');
-- Diana Approves
INSERT INTO RequestApprovals (request_id, approver_id, action, remarks) VALUES
    (1, 1, 'Approved', 'Approved, Merry Christmas!');