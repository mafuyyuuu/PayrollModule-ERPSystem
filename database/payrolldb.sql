-- comment
DROP DATABASE PayrollManagementSystem;
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
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

-- Insert Sample Requests
INSERT INTO Requests (employee_id, request_type, request_description, date_filed, status, approved_by, remarks) VALUES
                                                                                                                    (1, 'Overtime', 'Overtime request for project deadline - 4 hours', '2025-11-10', 'Pending', NULL, NULL),
                                                                                                                    (2, 'Leave', 'Sick leave request - 1 day', '2025-11-08', 'Pending', NULL, NULL),
                                                                                                                    (3, 'Reimbursement', 'Transportation reimbursement - ₱1,500.00', '2025-11-05', 'Approved', 8, 'Approved by manager'),
                                                                                                                    (4, 'Overtime', 'Weekend overtime - 8 hours', '2025-11-12', 'Pending', NULL, NULL),
                                                                                                                    (5, 'Bonus', 'Performance bonus request', '2025-11-01', 'Rejected', 9, 'Not eligible this quarter'),
                                                                                                                    (1, 'Leave', 'Vacation leave - 3 days', '2025-11-15', 'Pending', NULL, NULL),
                                                                                                                    (2, 'Reimbursement', 'Office supplies reimbursement - ₱800.00', '2025-11-14', 'Pending', NULL, NULL),
                                                                                                                    (3, 'Overtime', 'Emergency overtime - 2 hours', '2025-11-13', 'Approved', 8, 'Approved');

-- Insert Contribution Deadlines
CREATE TABLE IF NOT EXISTS ContributionDeadlines (
                                                     deadline_id INT AUTO_INCREMENT PRIMARY KEY,
                                                     contribution_type VARCHAR(100),
                                                     deadline_date DATE,
                                                     status VARCHAR(50),
                                                     amount DECIMAL(10,2),
                                                     remarks VARCHAR(255)
);

INSERT INTO ContributionDeadlines (contribution_type, deadline_date, status, amount, remarks) VALUES
                                                                                                  ('SSS Remittance', '2025-12-10', 'Pending', 4700.00, 'Monthly SSS contribution'),
                                                                                                  ('PhilHealth', '2025-12-10', 'Pending', 2100.00, 'Monthly PhilHealth contribution'),
                                                                                                  ('Pag-IBIG', '2025-12-10', 'Pending', 950.00, 'Monthly Pag-IBIG contribution'),
                                                                                                  ('Withholding Tax', '2025-12-15', 'Pending', 3600.00, 'Monthly BIR withholding tax'),
                                                                                                  ('SSS Remittance', '2025-11-10', 'Completed', 4500.00, 'November SSS - Paid'),
                                                                                                  ('PhilHealth', '2025-11-10', 'Completed', 2000.00, 'November PhilHealth - Paid'),
                                                                                                  ('Pag-IBIG', '2025-11-10', 'Completed', 900.00, 'November Pag-IBIG - Paid'),
                                                                                                  ('Withholding Tax', '2025-11-15', 'Completed', 3400.00, 'November BIR - Paid');

-- Add more payroll records for reports (different periods and statuses)
INSERT INTO Payroll (employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency, prepared_by, basic_pay, overtime_pay, bonuses, status, comments, deductions, net_pay, payslip_reference_number) VALUES
-- October 2025 - 2nd Half
(1, '2025-10-16', '2025-10-31', '2025-11-05', 'Bi-Monthly', 4, 17500.00, 450.00, 500.00, 'Released', 'October payout', 2500.00, 15950.00, 'PAY-2025-10-001'),
(2, '2025-10-16', '2025-10-31', '2025-11-05', 'Bi-Monthly', 4, 16000.00, 280.00, 400.00, 'Released', 'October payout', 1800.00, 14880.00, 'PAY-2025-10-002'),
(3, '2025-10-16', '2025-10-31', '2025-11-05', 'Bi-Monthly', 5, 19000.00, 320.00, 600.00, 'Released', 'October payout', 2900.00, 17020.00, 'PAY-2025-10-003'),
-- October 2025 - 1st Half
(1, '2025-10-01', '2025-10-15', '2025-10-20', 'Bi-Monthly', 4, 17500.00, 150.00, 0.00, 'Released', 'October payout', 2500.00, 15150.00, 'PAY-2025-10-004'),
(2, '2025-10-01', '2025-10-15', '2025-10-20', 'Bi-Monthly', 4, 16000.00, 0.00, 0.00, 'Released', 'October payout', 1800.00, 14200.00, 'PAY-2025-10-005'),
-- September 2025
(1, '2025-09-16', '2025-09-30', '2025-10-05', 'Bi-Monthly', 4, 17500.00, 600.00, 1500.00, 'Released', 'September payout', 2500.00, 17100.00, 'PAY-2025-09-001'),
(2, '2025-09-16', '2025-09-30', '2025-10-05', 'Bi-Monthly', 4, 16000.00, 420.00, 1000.00, 'Released', 'September payout', 1800.00, 15620.00, 'PAY-2025-09-002'),
-- Pending payrolls for November 2nd half
(1, '2025-11-16', '2025-11-30', '2025-12-05', 'Bi-Monthly', 4, 17500.00, 0.00, 0.00, 'Pending', 'Pending approval', 2500.00, 15000.00, 'PAY-2025-11-006'),
(2, '2025-11-16', '2025-11-30', '2025-12-05', 'Bi-Monthly', 4, 16000.00, 0.00, 0.00, 'Pending', 'Pending approval', 1800.00, 14200.00, 'PAY-2025-11-007'),
(3, '2025-11-16', '2025-11-30', '2025-12-05', 'Bi-Monthly', 5, 19000.00, 0.00, 0.00, 'Processing', 'Under review', 2900.00, 16100.00, 'PAY-2025-11-008');

-- Insert more Tax Contributions for the additional payrolls
INSERT INTO TaxContributions (payroll_id, employee_id, sss_contribution, philhealth_contribution, pagibig_contribution, withholding_tax, total_contributions) VALUES
                                                                                                                                                                  (6, 1, 800.00, 450.00, 200.00, 1050.00, 2500.00),
                                                                                                                                                                  (7, 2, 750.00, 400.00, 200.00, 450.00, 1800.00),
                                                                                                                                                                  (8, 3, 850.00, 500.00, 200.00, 1350.00, 2900.00),
                                                                                                                                                                  (9, 1, 800.00, 450.00, 200.00, 1050.00, 2500.00),
                                                                                                                                                                  (10, 2, 750.00, 400.00, 200.00, 450.00, 1800.00),
                                                                                                                                                                  (11, 1, 800.00, 450.00, 200.00, 1050.00, 2500.00),
                                                                                                                                                                  (12, 2, 750.00, 400.00, 200.00, 450.00, 1800.00);

-- Create user and grant privileges
# CREATE USER IF NOT EXISTS 'payrollsystem'@'%' IDENTIFIED BY 'payroll';
# GRANT ALL PRIVILEGES ON payrollmanagementsystem.* TO 'payrollsystem'@'%';
# FLUSH PRIVILEGES;

-- =====================================================
-- ADDITIONAL SAMPLE DATA FOR TIMELINE CHART
-- =====================================================

-- Add more historical payroll data for the last 3 months timeline chart
INSERT INTO Payroll (employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency, prepared_by, basic_pay, overtime_pay, bonuses, status, comments, deductions, net_pay, payslip_reference_number) VALUES
-- August 2025
(1, '2025-08-16', '2025-08-31', '2025-09-05', 'Bi-Monthly', 4, 17500.00, 300.00, 500.00, 'Released', 'August payout', 2500.00, 15800.00, 'PAY-2025-08-001'),
(2, '2025-08-16', '2025-08-31', '2025-09-05', 'Bi-Monthly', 4, 16000.00, 200.00, 300.00, 'Released', 'August payout', 1800.00, 14700.00, 'PAY-2025-08-002'),
(3, '2025-08-16', '2025-08-31', '2025-09-05', 'Bi-Monthly', 5, 19000.00, 400.00, 800.00, 'Released', 'August payout', 2900.00, 17300.00, 'PAY-2025-08-003'),
(4, '2025-08-16', '2025-08-31', '2025-09-05', 'Bi-Monthly', 5, 15000.00, 130.00, 200.00, 'Released', 'August payout', 1200.00, 14130.00, 'PAY-2025-08-004'),
(5, '2025-08-16', '2025-08-31', '2025-09-05', 'Bi-Monthly', 4, 16500.00, 250.00, 400.00, 'Released', 'August payout', 2150.00, 15000.00, 'PAY-2025-08-005'),

(1, '2025-08-01', '2025-08-15', '2025-08-20', 'Bi-Monthly', 4, 17500.00, 450.00, 1000.00, 'Released', 'August payout', 2500.00, 16450.00, 'PAY-2025-08-006'),
(2, '2025-08-01', '2025-08-15', '2025-08-20', 'Bi-Monthly', 4, 16000.00, 350.00, 500.00, 'Released', 'August payout', 1800.00, 15050.00, 'PAY-2025-08-007'),
(3, '2025-08-01', '2025-08-15', '2025-08-20', 'Bi-Monthly', 5, 19000.00, 500.00, 1200.00, 'Released', 'August payout', 2900.00, 17800.00, 'PAY-2025-08-008'),
(4, '2025-08-01', '2025-08-15', '2025-08-20', 'Bi-Monthly', 5, 15000.00, 200.00, 300.00, 'Released', 'August payout', 1200.00, 14300.00, 'PAY-2025-08-009'),
(5, '2025-08-01', '2025-08-15', '2025-08-20', 'Bi-Monthly', 4, 16500.00, 400.00, 600.00, 'Released', 'August payout', 2150.00, 15350.00, 'PAY-2025-08-010'),

-- September 2025 - 1st Half
(1, '2025-09-01', '2025-09-15', '2025-09-20', 'Bi-Monthly', 4, 17500.00, 200.00, 0.00, 'Released', 'September payout', 2500.00, 15200.00, 'PAY-2025-09-003'),
(2, '2025-09-01', '2025-09-15', '2025-09-20', 'Bi-Monthly', 4, 16000.00, 140.00, 0.00, 'Released', 'September payout', 1800.00, 14340.00, 'PAY-2025-09-004'),
(3, '2025-09-01', '2025-09-15', '2025-09-20', 'Bi-Monthly', 5, 19000.00, 320.00, 500.00, 'Released', 'September payout', 2900.00, 16920.00, 'PAY-2025-09-005'),
(4, '2025-09-01', '2025-09-15', '2025-09-20', 'Bi-Monthly', 5, 15000.00, 0.00, 0.00, 'Released', 'September payout', 1200.00, 13800.00, 'PAY-2025-09-006'),
(5, '2025-09-01', '2025-09-15', '2025-09-20', 'Bi-Monthly', 4, 16500.00, 145.00, 200.00, 'Released', 'September payout', 2150.00, 14695.00, 'PAY-2025-09-007');

-- Add more payroll cutoff periods
INSERT INTO PayrollCutoffs (period_name, cutoff_start_date, cutoff_end_date, pay_date, frequency, status) VALUES
('August 2025 - 1st Half', '2025-08-01', '2025-08-15', '2025-08-20', 'Bi-Monthly', 'Released'),
('August 2025 - 2nd Half', '2025-08-16', '2025-08-31', '2025-09-05', 'Bi-Monthly', 'Released'),
('September 2025 - 1st Half', '2025-09-01', '2025-09-15', '2025-09-20', 'Bi-Monthly', 'Released'),
('September 2025 - 2nd Half', '2025-09-16', '2025-09-30', '2025-10-05', 'Bi-Monthly', 'Released'),
('October 2025 - 1st Half', '2025-10-01', '2025-10-15', '2025-10-20', 'Bi-Monthly', 'Released'),
('October 2025 - 2nd Half', '2025-10-16', '2025-10-31', '2025-11-05', 'Bi-Monthly', 'Released');

-- Add more pending requests for variety
INSERT INTO Requests (employee_id, request_type, request_description, date_filed, status, approved_by, remarks) VALUES
(6, 'Overtime', 'Project deadline overtime - 6 hours', '2025-11-18', 'Pending', NULL, NULL),
(7, 'Leave', 'Medical leave - 2 days', '2025-11-19', 'Pending', NULL, NULL),
(1, 'Reimbursement', 'Client meeting expenses - ₱3,200.00', '2025-11-20', 'Pending', NULL, NULL),
(3, 'Bonus', 'Quarterly performance bonus request', '2025-11-15', 'Pending', NULL, NULL),
(4, 'Leave', 'Emergency leave - 1 day', '2025-11-21', 'Approved', 9, 'Approved for emergency'),
(5, 'Overtime', 'System maintenance - 10 hours', '2025-11-17', 'Approved', 9, 'Weekend work approved');

-- Add more historical contribution deadlines
INSERT INTO ContributionDeadlines (contribution_type, deadline_date, status, amount, remarks) VALUES
('SSS Remittance', '2025-10-10', 'Completed', 4300.00, 'October SSS - Paid'),
('PhilHealth', '2025-10-10', 'Completed', 1900.00, 'October PhilHealth - Paid'),
('Pag-IBIG', '2025-10-10', 'Completed', 850.00, 'October Pag-IBIG - Paid'),
('Withholding Tax', '2025-10-15', 'Completed', 3200.00, 'October BIR - Paid'),
('SSS Remittance', '2025-09-10', 'Completed', 4100.00, 'September SSS - Paid'),
('PhilHealth', '2025-09-10', 'Completed', 1850.00, 'September PhilHealth - Paid'),
('Pag-IBIG', '2025-09-10', 'Completed', 800.00, 'September Pag-IBIG - Paid'),
('Withholding Tax', '2025-09-15', 'Completed', 3000.00, 'September BIR - Paid');

-- Add tax contributions for the additional payrolls (starting from payroll_id 16)
INSERT INTO TaxContributions (payroll_id, employee_id, sss_contribution, philhealth_contribution, pagibig_contribution, withholding_tax, total_contributions) VALUES
(16, 1, 800.00, 450.00, 200.00, 1050.00, 2500.00),
(17, 2, 750.00, 400.00, 200.00, 450.00, 1800.00),
(18, 3, 850.00, 500.00, 200.00, 1350.00, 2900.00),
(19, 4, 700.00, 350.00, 150.00, 0.00, 1200.00),
(20, 5, 800.00, 400.00, 200.00, 750.00, 2150.00),
(21, 1, 800.00, 450.00, 200.00, 1050.00, 2500.00),
(22, 2, 750.00, 400.00, 200.00, 450.00, 1800.00),
(23, 3, 850.00, 500.00, 200.00, 1350.00, 2900.00),
(24, 4, 700.00, 350.00, 150.00, 0.00, 1200.00),
(25, 5, 800.00, 400.00, 200.00, 750.00, 2150.00),
(26, 1, 800.00, 450.00, 200.00, 1050.00, 2500.00),
(27, 2, 750.00, 400.00, 200.00, 450.00, 1800.00),
(28, 3, 850.00, 500.00, 200.00, 1350.00, 2900.00),
(29, 4, 700.00, 350.00, 150.00, 0.00, 1200.00),
(30, 5, 800.00, 400.00, 200.00, 750.00, 2150.00);

-- =====================================================
-- MIGRATION: If you already have data in the database, run these queries to add timestamp columns
-- =====================================================
# ALTER TABLE Payroll ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
# ALTER TABLE Payroll ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
# ALTER TABLE Requests ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
# ALTER TABLE Requests ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
# UPDATE Payroll SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
# UPDATE Requests SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;

-- =====================================================
-- ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ActivityLogs
(
    log_id       INT AUTO_INCREMENT PRIMARY KEY,
    action_type  VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(100) NOT NULL,
    entity_id    INT,
    employee_id  INT,
    processed_by INT,
    description  TEXT,
    old_values   JSON,
    new_values   JSON,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- Insert sample activity logs
INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description) VALUES
('Approved', 'Timesheet', 1, 1, 9, 'Timesheet approved for Juan Dela Cruz'),
('Approved', 'Timesheet', 2, 1, 9, 'Timesheet approved for Juan Dela Cruz'),
('Approved', 'Timesheet', 6, 2, 8, 'Timesheet approved for Maria Reyes'),
('Rejected', 'Request', 5, 5, 9, 'Bonus request rejected - Not eligible this quarter'),
('Approved', 'Request', 3, 3, 8, 'Reimbursement request approved'),
('Created', 'Payroll', 1, 1, 4, 'Payroll created for Juan Dela Cruz'),
('Processed', 'Payroll', 1, 1, 4, 'Payroll processed for Juan Dela Cruz');
