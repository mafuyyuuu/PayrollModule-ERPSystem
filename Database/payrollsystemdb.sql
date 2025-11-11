-- Create the database
CREATE DATABASE IF NOT EXISTS PayrollManagementSystem;
USE PayrollManagementSystem;

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
  department_id INT
);

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

-- Departments Table
CREATE TABLE Departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(255),
  department_code VARCHAR(50),
  manager_assigned INT,
  description VARCHAR(255),
  FOREIGN KEY (manager_assigned) REFERENCES Employees(employee_id)
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

-- Employee Groups Table
CREATE TABLE EmployeeGroups (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  group_name VARCHAR(255),
  group_rules VARCHAR(255),
  effective_date DATE
);

-- Roles Table
CREATE TABLE Roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100)
);

-- User Accounts Table
CREATE TABLE UserAccounts (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  username VARCHAR(255),
  email_address VARCHAR(255),
  password VARCHAR(255),  -- bcrypt is not a SQL data type
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

-- Add foreign keys for group_id and department_id
ALTER TABLE Employees
  ADD FOREIGN KEY (group_id) REFERENCES EmployeeGroups(group_id),
  ADD FOREIGN KEY (department_id) REFERENCES Departments(department_id);

CREATE USER 'payrollsystem'@'%' IDENTIFIED BY 'payroll';
GRANT ALL PRIVILEGES ON testdb.* TO 'payrollsystem'@'%';
FLUSH PRIVILEGES;

