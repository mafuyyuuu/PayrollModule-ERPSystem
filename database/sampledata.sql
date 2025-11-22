USE PayrollManagementSystem;

-- Optional cleanup (make sure FK checks are disabled temporarily)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ManagerActions;
TRUNCATE TABLE Requests;
TRUNCATE TABLE Payroll;
TRUNCATE TABLE Timesheets;
TRUNCATE TABLE SalaryDetails;
TRUNCATE TABLE EmergencyContact;
TRUNCATE TABLE UserAccounts;
TRUNCATE TABLE Employees;
TRUNCATE TABLE Departments;
TRUNCATE TABLE EmployeeGroups;
TRUNCATE TABLE Roles;
TRUNCATE TABLE AdminConfig;
TRUNCATE TABLE RemainingLeaves;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Lookups
INSERT INTO Roles (role_name) VALUES
                                  ('Admin'),
                                  ('Manager'),
                                  ('Payroll Team'),
                                  ('Employee');

INSERT INTO EmployeeGroups (group_name, group_rules, effective_date) VALUES
                                                                         ('HQ Day Shift', '08:00–17:00 core, 1h break', '2024-01-01'),
                                                                         ('Remote Flex', 'Flexible start, daily check-in before 10:00', '2024-03-01');

INSERT INTO Departments (department_name, department_code, manager_assigned, description) VALUES
                                                                                              ('Operations', 'OPS', NULL, 'Company administration'),
                                                                                              ('Engineering', 'ENG', NULL, 'Product engineering'),
                                                                                              ('Finance', 'FIN', NULL, 'Accounting & payroll'),
                                                                                              ('People', 'HR', NULL, 'People operations');

-- 2. Employees (10 total: 5 regular, 2 managers, 2 payroll, 1 admin)
INSERT INTO Employees (
    first_name, middle_name, last_name, suffix, date_of_birth,
    sex, address, contact_number, email_address, marital_status,
    position, employment_status, date_hired, group_id, department_id
) VALUES
-- Admin
('Carla', 'M', 'Navarro', NULL, '1984-04-22', 'Female', '12 Ayala Ave', '09170000001',
 'carla.navarro@example.com', 'Married', 'COO', 'Full-time', '2017-01-05', 1, 1),
-- Managers
('Lance', 'R', 'Fernandez', NULL, '1986-09-12', 'Male', '45 BGC High St', '09170000002',
 'lance.fernandez@example.com', 'Married', 'Operations Manager', 'Full-time', '2019-05-01', 1, 1),
('Mika', 'S', 'Ocampo', NULL, '1988-02-10', 'Female', '33 Ortigas Ave', '09170000003',
 'mika.ocampo@example.com', 'Single', 'Engineering Manager', 'Full-time', '2018-08-15', 1, 2),
-- Payroll team
('Alicia', 'P', 'Reyes', NULL, '1990-07-04', 'Female', '77 Shaw Blvd', '09170000004',
 'alicia.reyes@example.com', 'Married', 'Payroll Lead', 'Full-time', '2020-02-03', 2, 3),
('Brent', 'E', 'Lim', NULL, '1993-11-30', 'Male', '9 Greenhills', '09170000005',
 'brent.lim@example.com', 'Single', 'Payroll Analyst', 'Full-time', '2021-06-10', 2, 3),
-- Regular employees (5)
('Juno', 'A', 'Santos', NULL, '1995-03-22', 'Male', '18 Makati Ave', '09170000006',
 'juno.santos@example.com', 'Single', 'Software Engineer', 'Full-time', '2022-01-17', 1, 2),
('Pia', 'L', 'Garcia', NULL, '1996-05-08', 'Female', '21 Pasig Blvd', '09170000007',
 'pia.garcia@example.com', 'Single', 'QA Analyst', 'Full-time', '2023-03-27', 1, 2),
('Noel', 'T', 'Dizon', NULL, '1994-12-01', 'Male', '55 Quezon Ave', '09170000008',
 'noel.dizon@example.com', 'Married', 'UI Designer', 'Full-time', '2021-11-02', 2, 2),
('Rhea', 'C', 'Velasco', NULL, '1992-08-14', 'Female', '14 Katipunan Ave', '09170000009',
 'rhea.velasco@example.com', 'Married', 'People Partner', 'Full-time', '2020-09-07', 2, 4),
('Owen', 'D', 'Rivera', NULL, '1997-01-25', 'Male', '3 Pioneer St', '09170000010',
 'owen.rivera@example.com', 'Single', 'Data Analyst', 'Full-time', '2023-05-29', 2, 3),
-- Test accounts
('Eli', 'Q', 'Tester', NULL, '1993-09-09', 'Male', '100 Test St', '09170000011',
 'eli.tester@example.com', 'Single', 'Support Engineer', 'Full-time', '2024-01-02', 2, 2),
('Mara', 'V', 'Manageer', NULL, '1987-07-07', 'Female', '200 Test St', '09170000012',
 'mara.manageer@example.com', 'Married', 'Project Manager', 'Full-time', '2022-02-14', 1, 1),
('Paolo', 'R', 'Payroll', NULL, '1991-03-03', 'Male', '300 Test St', '09170000013',
 'paolo.payroll@example.com', 'Single', 'Payroll Associate', 'Full-time', '2021-04-18', 2, 3),
('Adina', 'L', 'Admin', NULL, '1983-01-01', 'Female', '400 Test St', '09170000014',
 'adina.admin@example.com', 'Married', 'Admin Officer', 'Full-time', '2019-05-20', 1, 1);

-- assign managers to departments after employee IDs exist
UPDATE Departments SET manager_assigned = 2 WHERE department_code = 'OPS';
UPDATE Departments SET manager_assigned = 3 WHERE department_code = 'ENG';
UPDATE Departments SET manager_assigned = 4 WHERE department_code = 'FIN';
UPDATE Departments SET manager_assigned = 9 WHERE department_code = 'HR';

-- 3. User accounts per role
INSERT INTO UserAccounts (employee_id, username, email_address, password, role_id, status) VALUES
                                                                                               (1, 'carla.admin', 'carla.navarro@example.com', '$2b$10$carla..............', 1, 'Active'),
                                                                                               (2, 'lance.ops', 'lance.fernandez@example.com', '$2b$10$lance..............', 2, 'Active'),
                                                                                               (3, 'mika.eng', 'mika.ocampo@example.com', '$2b$10$mika...............', 2, 'Active'),
                                                                                               (4, 'alicia.payroll', 'alicia.reyes@example.com', '$2b$10$alicia............', 3, 'Active'),
                                                                                               (5, 'brent.payroll', 'brent.lim@example.com', '$2b$10$brent.............', 3, 'Active'),
                                                                                               (6, 'juno.dev', 'juno.santos@example.com', '$2b$10$juno..............', 4, 'Active'),
                                                                                               (7, 'pia.qa', 'pia.garcia@example.com', '$2b$10$pia...............', 4, 'Active'),
                                                                                               (8, 'noel.design', 'noel.dizon@example.com', '$2b$10$noel..............', 4, 'Active'),
                                                                                               (9, 'rhea.people', 'rhea.velasco@example.com', '$2b$10$rhea..............', 4, 'Active'),
                                                                                               (10,'owen.analytics','owen.rivera@example.com', '$2b$10$owen.............', 4, 'Active'),
                                                                                               (11,'employee','eli.tester@example.com','$2b$12$xWsA0r3nCOfzCFwMWzYc0eb7IllU9fmPUir.do/aKvmjew.kyhHGG',4,'Active'),
                                                                                               (12,'manageer','mara.manageer@example.com','$2b$12$SxiE5BG/DEZ7bxahpDULoOq.dkAohnhDHHFcHRFk8hAw10vIObRp.',2,'Active'),
                                                                                               (13,'payroll','paolo.payroll@example.com','$2b$12$qyrw7lj/CXQT7BDunFaRHubdpaSB12R6bYDk.KkDD5Bo8BEj/QN2S',3,'Active'),
                                                                                               (14,'admin','adina.admin@example.com','$2b$12$R7h71sTxl/02IBont07zQuMZbGDRvJgaCTjLbr8Urnf4Z.3vDhVP6',1,'Active');

-- 4. Config & supporting tables
INSERT INTO AdminConfig (
    default_payroll_frequency, default_cutoff_dates, default_tax_rates,
    default_contribution_rates, salary_computation_formula, effective_date_of_changes, updated_by
) VALUES ('Semi-Monthly', '1-15,16-30', 12.00, 5.50, 'basic + OT - deductions', '2024-09-01', 1);

INSERT INTO EmergencyContact (employee_id, address, contact_name, contact_number, relationship) VALUES
                                                                                                    (6, '18 Makati Ave', 'Eva Santos', '09178880000', 'Mother'),
                                                                                                    (7, '21 Pasig Blvd', 'Leo Garcia', '09179990000', 'Father'),
                                                                                                    (8, '55 Quezon Ave', 'Mark Dizon', '09171112222', 'Brother'),
                                                                                                    (9, '14 Katipunan Ave', 'Celia Velasco', '09173334444', 'Mother'),
                                                                                                    (10,'3 Pioneer St', 'Dina Rivera', '09174445555', 'Mother'),
                                                                                                    (11,'100 Test St', 'Nora Tester', '09173330001', 'Sister'),
                                                                                                    (12,'200 Test St', 'Ivan Manageer', '09173330002', 'Spouse'),
                                                                                                    (13,'300 Test St', 'Dario Payroll', '09173330003', 'Brother'),
                                                                                                    (14,'400 Test St', 'Kara Admin', '09173330004', 'Spouse');

INSERT INTO SalaryDetails (employee_id, basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions) VALUES
                                                                                                                        (1, 160000.00, 0.00, 0.00, 0.00, 0.00),
                                                                                                                        (2, 120000.00, 900.00, 1500.00, 0.00, 500.00),
                                                                                                                        (3, 130000.00, 950.00, 1600.00, 0.00, 500.00),
                                                                                                                        (4, 100000.00, 750.00, 1300.00, 1000.00, 600.00),
                                                                                                                        (5, 85000.00, 650.00, 1200.00, 0.00, 300.00),
                                                                                                                        (6, 90000.00, 600.00, 1100.00, 0.00, 800.00),
                                                                                                                        (7, 75000.00, 500.00, 1000.00, 0.00, 500.00),
                                                                                                                        (8, 82000.00, 520.00, 1050.00, 2000.00, 400.00),
                                                                                                                        (9, 78000.00, 480.00, 980.00, 0.00, 600.00),
                                                                                                                        (10,82000.00, 550.00, 1020.00, 0.00, 450.00),
                                                                                                                        (11,70000.00, 520.00, 950.00, 0.00, 300.00),
                                                                                                                        (12,110000.00, 880.00, 1500.00, 0.00, 400.00),
                                                                                                                        (13,90000.00, 650.00, 1200.00, 0.00, 350.00),
                                                                                                                        (14,140000.00, 0.00, 0.00, 0.00, 0.00);

-- 5. Timesheets (latest entry per employee)
INSERT INTO Timesheets (employee_id, date, time_in, time_out, break_duration, overtime_hours, remarks, approved_by) VALUES
                                                                                                                        (6, '2025-11-21', '08:05:00', '17:20:00', 1.00, 1.5, 'Feature deploy', 3),
                                                                                                                        (7, '2025-11-21', '08:30:00', '17:00:00', 1.00, 0.0, 'Regression suite', 3),
                                                                                                                        (8, '2025-11-21', '09:00:00', '18:00:00', 1.00, 1.0, 'Design review', 3),
                                                                                                                        (9, '2025-11-21', '08:45:00', '17:30:00', 1.00, 0.5, 'Interviews', 2),
                                                                                                                        (10,'2025-11-21', '09:10:00', '18:05:00', 1.00, 1.2, 'BI dashboards', 2),
                                                                                                                        (4, '2025-11-21', '08:10:00', '17:15:00', 1.00, 0.8, 'Payroll closing', 2),
                                                                                                                        (5, '2025-11-21', '08:15:00', '17:05:00', 1.00, 0.4, 'Timesheet audit', 2),
                                                                                                                        (11,'2025-11-21','09:05:00','17:55:00',1.00,0.5,'Support shift',3),
                                                                                                                        (12,'2025-11-21','08:00:00','17:30:00',1.00,0.7,'Ops review',2),
                                                                                                                        (13,'2025-11-21','08:20:00','17:10:00',1.00,0.3,'Payroll QA',4),
                                                                                                                        (14,'2025-11-21','08:05:00','17:00:00',1.00,0.0,'Admin oversight',2);

-- 6. Payroll and workflow
INSERT INTO Payroll (
    employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency,
    prepared_by, basic_pay, overtime_pay, bonuses, status, comments, deductions, net_pay, payslip_reference_number
) VALUES
      (6, '2025-11-01', '2025-11-15', '2025-11-20', 'Semi-Monthly', 4, 45000.00, 900.00, 2000.00, 'Released', 'Sprint bonus', 1200.00, 46700.00, 'PSL-2025-11-006'),
      (7, '2025-11-01', '2025-11-15', '2025-11-20', 'Semi-Monthly', 4, 37500.00, 0.00, 0.00, 'Released', 'Regular payout', 900.00, 36600.00, 'PSL-2025-11-007');

INSERT INTO Requests (employee_id, request_type, request_description, date_filed, status, approved_by, remarks) VALUES
                                                                                                                    (6, 'Overtime Approval', 'Deploy support 1.5h', '2025-11-20', 'Approved', 3, 'OK to pay'),
                                                                                                                    (9, 'Leave', 'Emergency leave 11/25', '2025-11-18', 'Pending', NULL, NULL);

INSERT INTO ManagerActions (
    request_id, handled_by, date_period_covered, total_hours_worked, overtime_hours,
    leave_absence_notes, remarks, action, approved_by, type_of_exception,
    requested_amount_hours, reason, date_filed
) VALUES
    (1, 3, '2025-11-20', 9.5, 1.5, NULL, 'Logged in system', 'Approved', 2, 'Overtime', 1.5, 'Release support', '2025-11-20');

