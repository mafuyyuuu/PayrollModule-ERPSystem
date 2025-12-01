-- =====================================================
-- 1. DATABASE SETUP
-- =====================================================
DROP DATABASE IF EXISTS PayrollManagementSystem;
CREATE DATABASE PayrollManagementSystem;
USE PayrollManagementSystem;

-- =====================================================
-- 2. TABLE CREATION
-- =====================================================

-- Roles Table
CREATE TABLE Roles (
                       role_id INT AUTO_INCREMENT PRIMARY KEY,
                       role_name VARCHAR(100),
                       role_description TEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Accounts Table
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
                            INDEX idx_employee_date (employee_id, date)
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
                               INDEX idx_employee (employee_id)
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
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         FOREIGN KEY (prepared_by) REFERENCES UserAccounts(user_id),
                         INDEX idx_employee (employee_id),
                         INDEX idx_pay_date (pay_date)
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
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          emsStatus ENUM('APPROVED','PENDING','REJECTED'),
                          emsRemarks VARCHAR(250),
                          INDEX idx_employee (employee_id)
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

-- MERGED TABLE: PayrollCutoffs
-- Combined features of old PayrollCutoffs and new CutoffPeriods
CREATE TABLE PayrollCutoffs (
                                cutoff_id INT AUTO_INCREMENT PRIMARY KEY,
                                period_name VARCHAR(100) NOT NULL,
                                start_date DATE NOT NULL,
                                end_date DATE NOT NULL,
                                pay_date DATE NOT NULL,
    -- Combined ENUM values from both previous tables to ensure compatibility
                                frequency ENUM('Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly', 'Bi-Monthly') DEFAULT 'Semi-Monthly',
                                department_id INT DEFAULT NULL,
    -- Combined ENUM values from both previous tables
                                status ENUM('Active', 'Closed', 'Processing', 'Completed', 'Processed', 'Pending', 'Released') DEFAULT 'Active',
                                total_employees INT DEFAULT 0,
                                total_amount DECIMAL(15,2) DEFAULT 0.00,
                                processed_by INT DEFAULT NULL,
                                processed_at TIMESTAMP NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                                INDEX idx_dates (start_date, end_date),
                                INDEX idx_pay_date (pay_date),
                                INDEX idx_status (status)
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

-- Contribution Deadlines
CREATE TABLE ContributionDeadlines (
                                       deadline_id INT AUTO_INCREMENT PRIMARY KEY,
                                       contribution_type VARCHAR(100),
                                       deadline_date DATE,
                                       status VARCHAR(50),
                                       amount DECIMAL(10,2),
                                       remarks VARCHAR(255)
);

-- Payroll Rules Table
CREATE TABLE PayrollRules (
                              rule_id INT AUTO_INCREMENT PRIMARY KEY,
                              rule_name VARCHAR(100) NOT NULL,
                              rule_type ENUM('earning', 'deduction', 'bonus', 'allowance', 'overtime') DEFAULT 'earning',
                              formula TEXT,
                              fixed_amount DECIMAL(12,2) DEFAULT NULL,
                              percentage DECIMAL(5,4) DEFAULT NULL,
                              min_value DECIMAL(12,2) DEFAULT NULL,
                              max_value DECIMAL(12,2) DEFAULT NULL,
                              description TEXT,
                              is_active BOOLEAN DEFAULT TRUE,
                              applies_to ENUM('all', 'full_time', 'part_time', 'contract', 'department', 'position') DEFAULT 'all',
                              department_id INT DEFAULT NULL,
                              position_id INT DEFAULT NULL,
                              priority INT DEFAULT 0,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              INDEX idx_rule_type (rule_type),
                              INDEX idx_is_active (is_active)
);

-- Approval Workflows Table
CREATE TABLE ApprovalWorkflows (
                                  workflow_id INT AUTO_INCREMENT PRIMARY KEY,
                                  name VARCHAR(255) NOT NULL,
                                  type VARCHAR(100) NOT NULL,
                                  approver VARCHAR(100) NOT NULL,
                                  status VARCHAR(50) DEFAULT 'Active',
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE ActivityLogs (
                              log_id INT AUTO_INCREMENT PRIMARY KEY,
                              action_type VARCHAR(100) NOT NULL,
                              entity_type VARCHAR(100) NOT NULL,
                              entity_id INT,
                              employee_id INT,
                              processed_by INT,
                              description TEXT,
                              old_values JSON,
                              new_values JSON,
                              ip_address VARCHAR(45) DEFAULT NULL,
                              user_agent TEXT DEFAULT NULL,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              INDEX idx_entity (entity_type, entity_id),
                              INDEX idx_created_at (created_at)
);

-- =====================================================
-- 3. INSERT SAMPLE DATA
-- =====================================================

-- Insert Roles
INSERT INTO Roles (role_id, role_name, role_description) VALUES
                                                             (1, 'Admin', 'System Administrator - Full access to all features'),
                                                             (2, 'Manager', 'Department Manager - Can approve requests and view team data'),
                                                             (3, 'Payroll', 'Payroll Staff - Can process payroll and manage employee records'),
                                                             (4, 'Employee', 'Regular Employee - Can view own data and submit requests')
ON DUPLICATE KEY UPDATE role_description = VALUES(role_description);

-- Insert User Accounts
INSERT INTO UserAccounts (user_id, employee_id, username, email_address, password, role_id, status) VALUES
                                                                                                        (1, NULL, 'admin', 'admin@company.com', 'admin123', 1, 'Active'),
                                                                                                        (2, 8, 'jumiah.zamora', 'jumiah.zamora@company.com', 'manager123', 2, 'Active'),
                                                                                                        (3, 9, 'jhervin.jimenez', 'jhervin.jimenez@company.com', 'manager123', 2, 'Active'),
                                                                                                        (4, NULL, 'jessa.balnig', 'jessa.balnig@company.com', 'payroll123', 3, 'Active'),
                                                                                                        (5, NULL, 'symon.banaag', 'symon.banaag@company.com', 'payroll123', 3, 'Active'),
                                                                                                        (6, 1, 'juan.delacruz', 'juan.delacruz@company.com', 'employee123', 4, 'Active'),
                                                                                                        (7, 2, 'maria.reyes', 'maria.reyes@company.com', 'employee123', 4, 'Active'),
                                                                                                        (8, 3, 'pedro.santos', 'pedro.santos@company.com', 'employee123', 4, 'Active'),
                                                                                                        (9, 4, 'ana.torres', 'ana.torres@company.com', 'employee123', 4, 'Active'),
                                                                                                        (10, 5, 'carlos.ramos', 'carlos.ramos@company.com', 'employee123', 4, 'Active');

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

-- Insert Payroll Cutoffs (Combined Data)
INSERT INTO PayrollCutoffs (period_name, start_date, end_date, pay_date, frequency, status) VALUES
-- Historical Data
('August 2025 - 1st Half', '2025-08-01', '2025-08-15', '2025-08-20', 'Bi-Monthly', 'Released'),
('August 2025 - 2nd Half', '2025-08-16', '2025-08-31', '2025-09-05', 'Bi-Monthly', 'Released'),
('September 2025 - 1st Half', '2025-09-01', '2025-09-15', '2025-09-20', 'Bi-Monthly', 'Released'),
('September 2025 - 2nd Half', '2025-09-16', '2025-09-30', '2025-10-05', 'Bi-Monthly', 'Released'),
('October 2025 - 1st Half', '2025-10-01', '2025-10-15', '2025-10-20', 'Bi-Monthly', 'Released'),
('October 2025 - 2nd Half', '2025-10-16', '2025-10-31', '2025-11-05', 'Bi-Monthly', 'Released'),
('November 2025 - 1st Half', '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 'Processed'),
('November 2025 - 2nd Half', '2025-11-16', '2025-11-30', '2025-12-05', 'Bi-Monthly', 'Pending'),
-- Future/Active Data (Standardized naming)
('1st Half of December 2025', '2025-12-01', '2025-12-15', '2025-12-20', 'Semi-Monthly', 'Active'),
('2nd Half of December 2025', '2025-12-16', '2025-12-31', '2026-01-05', 'Semi-Monthly', 'Active'),
('1st Half of January 2026', '2026-01-01', '2026-01-15', '2026-01-20', 'Semi-Monthly', 'Active'),
('2nd Half of January 2026', '2026-01-16', '2026-01-31', '2026-02-05', 'Semi-Monthly', 'Active');

-- Insert Payroll Rules
INSERT INTO PayrollRules (rule_name, rule_type, formula, percentage, description, is_active, applies_to, priority) VALUES
                                                                                                                       ('Regular Overtime', 'overtime', 'hourly_rate * 1.25 * overtime_hours', 1.2500, 'Regular overtime rate (125% of hourly rate)', TRUE, 'all', 1),
                                                                                                                       ('Rest Day Overtime', 'overtime', 'hourly_rate * 1.30 * overtime_hours', 1.3000, 'Rest day overtime rate (130% of hourly rate)', TRUE, 'all', 2),
                                                                                                                       ('Holiday Overtime', 'overtime', 'hourly_rate * 2.00 * overtime_hours', 2.0000, 'Holiday overtime rate (200% of hourly rate)', TRUE, 'all', 3),
                                                                                                                       ('SSS Contribution', 'deduction', 'Based on SSS contribution table', NULL, 'Social Security System employee contribution', TRUE, 'all', 10),
                                                                                                                       ('PhilHealth Contribution', 'deduction', 'basic_salary * 0.025', 0.0250, 'PhilHealth employee share (2.5% of basic salary)', TRUE, 'all', 11),
                                                                                                                       ('Pag-IBIG Contribution', 'deduction', 'basic_salary * 0.02 (max 200)', 0.0200, 'Pag-IBIG Fund employee contribution (2%, max ₱200)', TRUE, 'all', 12),
                                                                                                                       ('Withholding Tax', 'deduction', 'Based on BIR tax table', NULL, 'Income tax based on taxable income bracket', TRUE, 'all', 13),
                                                                                                                       ('Rice Allowance', 'allowance', NULL, NULL, 'Monthly rice subsidy', TRUE, 'full_time', 20),
                                                                                                                       ('Transportation Allowance', 'allowance', NULL, NULL, 'Monthly transportation allowance', TRUE, 'all', 21),
                                                                                                                       ('Communication Allowance', 'allowance', NULL, NULL, 'Monthly communication allowance', TRUE, 'all', 22),
                                                                                                                       ('13th Month Pay', 'bonus', 'basic_salary / 12 * months_worked', NULL, 'Mandatory 13th month pay', TRUE, 'all', 30),
                                                                                                                       ('Performance Bonus', 'bonus', 'Based on performance evaluation', NULL, 'Quarterly/Annual performance bonus', TRUE, 'all', 31);

-- Insert Timesheets
INSERT INTO Timesheets (employee_id, date, time_in, time_out, break_duration, overtime_hours, remarks, approved_by) VALUES
                                                                                                                        (1, '2025-11-01', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
                                                                                                                        (1, '2025-11-02', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
                                                                                                                        (1, '2025-11-03', '08:00:00', '19:00:00', 1.00, 2.00, 'Overtime', 9),
                                                                                                                        (1, '2025-11-04', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
                                                                                                                        (1, '2025-11-05', '08:00:00', '17:00:00', 1.00, 0.00, 'Regular', 9),
                                                                                                                        (2, '2025-11-01', '08:30:00', '17:30:00', 1.00, 0.00, 'Regular', 8),
                                                                                                                        (2, '2025-11-02', '08:30:00', '17:30:00', 1.00, 0.00, 'Regular', 8),
                                                                                                                        (2, '2025-11-03', '08:30:00', '17:30:00', 1.00, 0.00, 'Regular', 8),
                                                                                                                        (2, '2025-11-04', '08:30:00', '18:30:00', 1.00, 1.00, 'Overtime', 8),
                                                                                                                        (2, '2025-11-05', '08:30:00', '17:30:00', 1.00, 0.00, 'Regular', 8);

-- Insert Payroll Data
INSERT INTO Payroll (employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency, prepared_by, basic_pay, overtime_pay, bonuses, status, comments, deductions, net_pay, payslip_reference_number) VALUES
                                                                                                                                                                                                                       (1, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 4, 17500.00, 300.00, 1000.00, 'Processed', 'Regular payout', 2500.00, 16300.00, 'PAY-2025-11-001'),
                                                                                                                                                                                                                       (2, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 4, 16000.00, 140.00, 800.00, 'Processed', 'Regular payout', 1800.00, 15140.00, 'PAY-2025-11-002'),
                                                                                                                                                                                                                       (3, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 5, 19000.00, 160.00, 1200.00, 'Processed', 'Regular payout', 2900.00, 17460.00, 'PAY-2025-11-003'),
                                                                                                                                                                                                                       (4, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 5, 15000.00, 260.00, 700.00, 'Processed', 'Regular payout', 1200.00, 14760.00, 'PAY-2025-11-004'),
                                                                                                                                                                                                                       (5, '2025-11-01', '2025-11-15', '2025-11-20', 'Bi-Monthly', 4, 16500.00, 290.00, 900.00, 'Processed', 'Regular payout', 2150.00, 15540.00, 'PAY-2025-11-005'),
                                                                                                                                                                                                                       (1, '2025-10-16', '2025-10-31', '2025-11-05', 'Bi-Monthly', 4, 17500.00, 450.00, 500.00, 'Released', 'October payout', 2500.00, 15950.00, 'PAY-2025-10-001'),
                                                                                                                                                                                                                       (2, '2025-10-16', '2025-10-31', '2025-11-05', 'Bi-Monthly', 4, 16000.00, 280.00, 400.00, 'Released', 'October payout', 1800.00, 14880.00, 'PAY-2025-10-002'),
                                                                                                                                                                                                                       (3, '2025-10-16', '2025-10-31', '2025-11-05', 'Bi-Monthly', 5, 19000.00, 320.00, 600.00, 'Released', 'October payout', 2900.00, 17020.00, 'PAY-2025-10-003');

-- Insert Tax Contributions
INSERT INTO TaxContributions (payroll_id, employee_id, sss_contribution, philhealth_contribution, pagibig_contribution, withholding_tax, total_contributions) VALUES
                                                                                                                                                                  (1, 1, 800.00, 450.00, 200.00, 1050.00, 2500.00),
                                                                                                                                                                  (2, 2, 750.00, 400.00, 200.00, 450.00, 1800.00),
                                                                                                                                                                  (3, 3, 850.00, 500.00, 200.00, 1350.00, 2900.00),
                                                                                                                                                                  (4, 4, 700.00, 350.00, 150.00, 0.00, 1200.00),
                                                                                                                                                                  (5, 5, 800.00, 400.00, 200.00, 750.00, 2150.00);

-- Insert Requests
INSERT INTO Requests (employee_id, request_type, request_description, date_filed, status, approved_by, remarks) VALUES
                                                                                                                    (1, 'Overtime', 'Overtime request for project deadline - 4 hours', '2025-11-10', 'Pending', NULL, NULL),
                                                                                                                    (2, 'Leave', 'Sick leave request - 1 day', '2025-11-08', 'Pending', NULL, NULL),
                                                                                                                    (3, 'Reimbursement', 'Transportation reimbursement - ₱1,500.00', '2025-11-05', 'Approved', 8, 'Approved by manager'),
                                                                                                                    (4, 'Overtime', 'Weekend overtime - 8 hours', '2025-11-12', 'Pending', NULL, NULL),
                                                                                                                    (5, 'Bonus', 'Performance bonus request', '2025-11-01', 'Rejected', 9, 'Not eligible this quarter');

-- Insert Contribution Deadlines
INSERT INTO ContributionDeadlines (contribution_type, deadline_date, status, amount, remarks) VALUES
                                                                                                  ('SSS Remittance', '2025-12-10', 'Pending', 4700.00, 'Monthly SSS contribution'),
                                                                                                  ('PhilHealth', '2025-12-10', 'Pending', 2100.00, 'Monthly PhilHealth contribution'),
                                                                                                  ('Pag-IBIG', '2025-12-10', 'Pending', 950.00, 'Monthly Pag-IBIG contribution'),
                                                                                                  ('Withholding Tax', '2025-12-15', 'Pending', 3600.00, 'Monthly BIR withholding tax');

-- Insert Activity Logs
INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description) VALUES
                                                                                                           ('Approved', 'Timesheet', 1, 1, 9, 'Timesheet approved for Juan Dela Cruz'),
                                                                                                           ('Approved', 'Timesheet', 2, 1, 9, 'Timesheet approved for Juan Dela Cruz'),
                                                                                                           ('Approved', 'Timesheet', 6, 2, 8, 'Timesheet approved for Maria Reyes'),
                                                                                                           ('Rejected', 'Request', 5, 5, 9, 'Bonus request rejected - Not eligible this quarter'),
                                                                                                           ('Approved', 'Request', 3, 3, 8, 'Reimbursement request approved'),
                                                                                                           ('Created', 'Payroll', 1, 1, 4, 'Payroll created for Juan Dela Cruz'),
                                                                                                           ('Processed', 'Payroll', 1, 1, 4, 'Payroll processed for Juan Dela Cruz');

SELECT 'Database reset and repopulated successfully with combined PayrollCutoffs!' as Status;