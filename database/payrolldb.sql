-- =====================================================
-- PAYROLL MANAGEMENT SYSTEM - MOCK DATABASE
-- =====================================================

CREATE DATABASE IF NOT EXISTS PayrollManagementSystem;
USE PayrollManagementSystem;

-- Roles Table
CREATE TABLE Roles (
                       role_id INT AUTO_INCREMENT PRIMARY KEY,
                       role_name VARCHAR(100) NOT NULL
);

-- User Accounts Table (linked to EMS Employees)
CREATE TABLE UserAccounts (
                              user_id INT AUTO_INCREMENT PRIMARY KEY,
                              employee_id INT, -- references EMS.Employees
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
                            employee_id INT, -- references EMS.Employees
                            date DATE,
                            time_in TIME,
                            time_out TIME,
                            break_duration DECIMAL(5,2),
                            overtime_hours DECIMAL(5,2),
                            remarks VARCHAR(255),
                            approved_by INT
);

-- Salary Details Table
CREATE TABLE SalaryDetails (
                               salary_detail_id INT AUTO_INCREMENT PRIMARY KEY,
                               employee_id INT, -- references EMS.Employees
                               basic_rate DECIMAL(10,2),
                               overtime_rate DECIMAL(10,2),
                               holiday_rate DECIMAL(10,2),
                               loan_deductions DECIMAL(10,2),
                               other_deductions DECIMAL(10,2)
);

-- Payroll Table
CREATE TABLE Payroll (
                         payroll_id INT AUTO_INCREMENT PRIMARY KEY,
                         employee_id INT, -- references EMS.Employees
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
                         FOREIGN KEY (prepared_by) REFERENCES UserAccounts(user_id)
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
                          remarks VARCHAR(255)
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
                                  FOREIGN KEY (payroll_id) REFERENCES Payroll(payroll_id)
);

-- Audit Logs
CREATE TABLE AuditLogs (
                           id INT AUTO_INCREMENT PRIMARY KEY,
                           date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           user_name VARCHAR(255) NOT NULL,
                           action VARCHAR(255) NOT NULL,
                           description TEXT
);

-- =====================================================
-- INSERT DUMMY DATA
-- =====================================================

-- Roles
INSERT INTO Roles (role_name) VALUES
                                  ('Employee'), ('Payroll Officer'), ('HR Manager'), ('Admin');

-- User Accounts (linked to EMS employees 1–10)
INSERT INTO UserAccounts (employee_id, username, email_address, password, role_id, status) VALUES
                                                                                               (1, 'juan.delacruz', 'juan.delacruz@company.com', 'password123', 1, 'Active'),
                                                                                               (2, 'maria.reyes', 'maria.reyes@company.com', 'password123', 1, 'Active'),
                                                                                               (3, 'pedro.santos', 'pedro.santos@company.com', 'password123', 1, 'Active'),
                                                                                               (4, 'ana.torres', 'ana.torres@company.com', 'password123', 1, 'Active'),
                                                                                               (5, 'carlos.ramos', 'carlos.ramos@company.com', 'password123', 1, 'Active'),
                                                                                               (6, 'jessa.balnig', 'jessa.balnig@company.com', 'password123', 2, 'Active'),
                                                                                               (7, 'symon.banaag', 'symon.banaag@company.com', 'password123', 2, 'Active'),
                                                                                               (8, 'jumiah.zamora', 'jumiah.zamora@company.com', 'password123', 3, 'Active'),
                                                                                               (9, 'jhervin.jimenez', 'jhervin.jimenez@company.com', 'password123', 3, 'Active'),
                                                                                               (10, 'edrianne.lumabas', 'edrianne.lumabas@company.com', 'password123', 4, 'Active');

-- Salary Details
INSERT INTO SalaryDetails (employee_id, basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions) VALUES
                                                                                                                        (1, 35000, 200, 300, 500, 200),
                                                                                                                        (2, 28000, 180, 250, 0, 150),
                                                                                                                        (3, 32000, 200, 280, 1000, 300),
                                                                                                                        (4, 26000, 150, 200, 0, 100),
                                                                                                                        (5, 30000, 180, 250, 500, 200),
                                                                                                                        (6, 40000, 250, 350, 0, 300),
                                                                                                                        (7, 38000, 220, 320, 0, 200),
                                                                                                                        (8, 50000, 300, 400, 0, 400),
                                                                                                                        (9, 55000, 350, 450, 0, 500),
                                                                                                                        (10, 42000, 250, 350, 0, 200);

-- Payroll
INSERT INTO Payroll (employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency, prepared_by, basic_pay, overtime_pay, bonuses, status, comments, deductions, net_pay, payslip_reference_number) VALUES
                                                                                                                                                                                                                       (1, '2025-11-01','2025-11-15','2025-11-20','Semi-Monthly',6,35000,1000,2000,'Processed','On time',700,37300,'PSL-202511001'),
                                                                                                                                                                                                                       (2, '2025-11-01','2025-11-15','2025-11-20','Semi-Monthly',6,28000,500,1000,'Processed','On time',150,28950,'PSL-202511002'),
                                                                                                                                                                                                                       (3, '2025-11-01','2025-11-15','2025-11-20','Semi-Monthly',6,32000,800,1500,'Processed','On time',1300,33000,'PSL-202511003'),
                                                                                                                                                                                                                       (4, '2025-11-01','2025-11-15','2025-11-20','Semi-Monthly',6,26000,200,500,'Processed','On time',100,26600,'PSL-202511004'),
                                                                                                                                                                                                                       (5, '2025-11-01','2025-11-15','2025-11-20','Semi-Monthly',6,30000,400,800,'Processed','On time',700,30500,'PSL-202511005');

-- Timesheets
INSERT INTO Timesheets (employee_id, date, time_in, time_out, break_duration, overtime_hours, remarks, approved_by) VALUES
                                                                                                                        (1,'2025-11-01','08:00:00','17:00:00',1,2,'Normal work',6),
                                                                                                                        (2,'2025-11-01','08:30:00','17:30:00',1,1,'Normal work',6),
                                                                                                                        (3,'2025-11-01','09:00:00','18:00:00',1,2,'Normal work',6),
                                                                                                                        (4,'2025-11-01','08:00:00','17:00:00',1,0.5,'Normal work',6),
                                                                                                                        (5,'2025-11-01','08:30:00','17:30:00',1,1,'Normal work',6);

-- Requests
INSERT INTO Requests (employee_id, request_type, request_description, date_filed, status, approved_by, remarks) VALUES
                                                                                                                    (1,'Leave','Medical leave','2025-11-10','Approved',4,'Approved by HR'),
                                                                                                                    (2,'OT Adjustment','Overtime correction','2025-11-11','Pending',6,'Waiting approval'),
                                                                                                                    (3,'Leave','Vacation leave','2025-11-09','Approved',8,'Approved by Manager'),
                                                                                                                    (4,'Salary Adjustment','Bonus correction','2025-11-12','Approved',6,'Processed'),
                                                                                                                    (5,'Loan','Salary loan request','2025-11-13','Pending',7,'Under review');

-- Manager Actions
INSERT INTO ManagerActions (request_id, handled_by, date_period_covered, total_hours_worked, overtime_hours, leave_absence_notes, remarks, action, approved_by, type_of_exception, requested_amount_hours, reason, date_filed) VALUES
                                                                                                                                                                                                                                   (1,4,'2025-11-01 to 2025-11-15',80,2,'Sick leave','Approved','Approve',4,'Medical',0,'Medical leave', '2025-11-10'),
                                                                                                                                                                                                                                   (3,8,'2025-11-01 to 2025-11-15',80,0,'Vacation','Approved','Approve',8,'Personal',0,'Vacation leave', '2025-11-09');

-- Tax Contributions
INSERT INTO TaxContributions (payroll_id, employee_id, sss_contribution, philhealth_contribution, pagibig_contribution, withholding_tax, total_contributions) VALUES
                                                                                                                                                                  (1,1,500,200,100,900,1700),
                                                                                                                                                                  (2,2,400,180,100,700,1380),
                                                                                                                                                                  (3,3,550,220,120,1000,1890),
                                                                                                                                                                  (4,4,450,200,100,600,1350),
                                                                                                                                                                  (5,5,500,200,100,800,1600);

-- Audit Logs
INSERT INTO AuditLogs (user_name, action, description) VALUES
                                                           ('jessa.balnig','Created Payroll','Created payroll for Juan Dela Cruz'),
                                                           ('juan.delacruz','Submitted Timesheet','Timesheet submitted for 2025-11-01'),
                                                           ('ana.torres','Approved Request','Leave request approved for Maria Reyes'),
                                                           ('symon.banaag','Adjusted Payroll','Corrected overtime for Carlos Ramos');

