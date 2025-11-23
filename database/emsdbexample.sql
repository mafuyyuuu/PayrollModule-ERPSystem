-- =====================================================
-- EMPLOYEE MANAGEMENT SYSTEM - MOCK DATABASE
-- =====================================================

CREATE DATABASE IF NOT EXISTS EmployeeManagementSystem;
USE EmployeeManagementSystem;

-- Departments Table
CREATE TABLE Departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
    department_code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions Table
CREATE TABLE Positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    position_title VARCHAR(255) NOT NULL,
    department_id INT,
    salary_grade VARCHAR(50),
    min_salary DECIMAL(10,2),
    max_salary DECIMAL(10,2),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

-- Employees Table (Main Employee Data)
CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL,
    suffix VARCHAR(50),
    date_of_birth DATE,
    sex VARCHAR(20),
    civil_status VARCHAR(50),
    nationality VARCHAR(100),
    religion VARCHAR(100),
    
    -- Contact Information
    email_address VARCHAR(255),
    phone_number VARCHAR(50),
    mobile_number VARCHAR(50),
    
    -- Address
    street_address VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Employment Details
    position_id INT,
    department_id INT,
    employment_type VARCHAR(50), -- Regular, Contractual, Part-Time
    employment_status VARCHAR(50), -- Active, On Leave, Resigned, Terminated
    date_hired DATE,
    date_regularized DATE,
    date_separated DATE,
    
    -- Government IDs
    sss_number VARCHAR(50),
    philhealth_number VARCHAR(50),
    pagibig_number VARCHAR(50),
    tin_number VARCHAR(50),
    
    -- System fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (position_id) REFERENCES Positions(position_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

-- Emergency Contacts
CREATE TABLE EmergencyContacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    contact_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone_number VARCHAR(50),
    mobile_number VARCHAR(50),
    address TEXT,
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- Educational Background
CREATE TABLE EducationalBackground (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    education_level VARCHAR(100), -- Elementary, High School, College, Graduate
    school_name VARCHAR(255),
    course VARCHAR(255),
    year_graduated INT,
    honors VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- Work Experience
CREATE TABLE WorkExperience (
    experience_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    company_name VARCHAR(255),
    position VARCHAR(255),
    start_date DATE,
    end_date DATE,
    responsibilities TEXT,
    FOREIGN KEY (employee_id) REFERENCES Employees(employee_id)
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert Departments
INSERT INTO Departments (department_id, department_name, department_code, description) VALUES
(1, 'Human Resources', 'HR', 'Human Resources and Admin'),
(2, 'Finance', 'FIN', 'Finance and Accounting'),
(3, 'Information Technology', 'IT', 'IT and Systems'),
(4, 'Operations', 'OPS', 'Operations and Logistics'),
(5, 'Sales and Marketing', 'SAL', 'Sales and Marketing');

-- Insert Positions
INSERT INTO Positions (position_id, position_title, department_id, salary_grade, min_salary, max_salary) VALUES
(1, 'Software Developer', 3, 'P3', 30000.00, 50000.00),
(2, 'HR Specialist', 1, 'P2', 25000.00, 40000.00),
(3, 'Accountant', 2, 'P3', 30000.00, 45000.00),
(4, 'Operations Coordinator', 4, 'P2', 25000.00, 38000.00),
(5, 'Quality Analyst', 4, 'P2', 28000.00, 42000.00),
(6, 'Payroll Specialist', 2, 'P3', 32000.00, 48000.00),
(7, 'Payroll Officer', 2, 'P4', 35000.00, 55000.00),
(8, 'HR Manager', 1, 'M1', 50000.00, 70000.00),
(9, 'IT Manager', 3, 'M1', 55000.00, 75000.00),
(10, 'System Administrator', 3, 'P4', 40000.00, 60000.00);

-- Insert Employees (Same 10 employees to match payroll system)
INSERT INTO Employees (employee_id, employee_number, first_name, middle_name, last_name, suffix, date_of_birth, sex, civil_status, nationality, religion, email_address, phone_number, mobile_number, street_address, city, province, postal_code, country, position_id, department_id, employment_type, employment_status, date_hired, date_regularized, sss_number, philhealth_number, pagibig_number, tin_number) VALUES

(1, 'EMP-2022-001', 'Juan', 'Santos', 'Dela Cruz', NULL, '1990-05-15', 'Male', 'Married', 'Filipino', 'Roman Catholic', 'juan.delacruz@company.com', '02-1234567', '09171234567', '123 Rizal St', 'Manila', 'Metro Manila', '1000', 'Philippines', 1, 3, 'Regular', 'Active', '2022-01-15', '2022-07-15', '34-1234567-8', '12-345678901-2', '1234-5678-9012', '123-456-789-000'),

(2, 'EMP-2022-002', 'Maria', 'Garcia', 'Reyes', NULL, '1992-08-22', 'Female', 'Single', 'Filipino', 'Roman Catholic', 'maria.reyes@company.com', '02-7654321', '09187654321', '456 Bonifacio Ave', 'Quezon City', 'Metro Manila', '1100', 'Philippines', 2, 1, 'Regular', 'Active', '2022-03-20', '2022-09-20', '34-9876543-2', '12-987654321-0', '9876-5432-1098', '987-654-321-000'),

(3, 'EMP-2021-015', 'Pedro', 'Lopez', 'Santos', NULL, '1988-12-10', 'Male', 'Married', 'Filipino', 'Roman Catholic', 'pedro.santos@company.com', '02-1112233', '09191234567', '789 Aguinaldo Blvd', 'Makati', 'Metro Manila', '1200', 'Philippines', 3, 2, 'Regular', 'Active', '2021-06-01', '2021-12-01', '34-5555666-7', '12-555566667-8', '5555-6666-7777', '555-666-777-000'),

(4, 'EMP-2023-008', 'Ana', 'Marie', 'Torres', NULL, '1995-03-18', 'Female', 'Single', 'Filipino', 'Christian', 'ana.torres@company.com', '02-8889999', '09178889999', '321 Luna St', 'Pasig', 'Metro Manila', '1600', 'Philippines', 4, 4, 'Regular', 'Active', '2023-02-15', '2023-08-15', '34-1111222-3', '12-111122223-4', '1111-2222-3333', '111-222-333-000'),

(5, 'EMP-2022-025', 'Carlos', 'Miguel', 'Ramos', NULL, '1991-07-25', 'Male', 'Married', 'Filipino', 'Roman Catholic', 'carlos.ramos@company.com', '02-9991111', '09189991111', '654 Mabini St', 'Taguig', 'Metro Manila', '1630', 'Philippines', 5, 4, 'Regular', 'Active', '2022-09-10', '2023-03-10', '34-4444555-6', '12-444455556-7', '4444-5555-6666', '444-555-666-000'),

(6, 'EMP-2021-032', 'Jessa', 'Mae', 'Balnig', NULL, '1993-04-12', 'Female', 'Single', 'Filipino', 'Roman Catholic', 'jessa.balnig@company.com', '02-2223333', '09172223333', '147 Roxas Blvd', 'Manila', 'Metro Manila', '1000', 'Philippines', 6, 2, 'Regular', 'Active', '2021-11-01', '2022-05-01', '34-7777888-9', '12-777788889-0', '7777-8888-9999', '777-888-999-000'),

(7, 'EMP-2020-019', 'Symon', 'Cruz', 'Banaag', NULL, '1989-09-30', 'Male', 'Married', 'Filipino', 'Roman Catholic', 'symon.banaag@company.com', '02-3334444', '09183334444', '258 Del Pilar St', 'Manila', 'Metro Manila', '1000', 'Philippines', 7, 2, 'Regular', 'Active', '2020-08-15', '2021-02-15', '34-3333444-5', '12-333344445-6', '3333-4444-5555', '333-444-555-000'),

(8, 'EMP-2020-005', 'Princess Jumiah', 'Ali', 'Zamora', NULL, '1987-06-20', 'Female', 'Married', 'Filipino', 'Islam', 'jumiah.zamora@company.com', '02-4445555', '09194445555', '369 Quezon Ave', 'Quezon City', 'Metro Manila', '1100', 'Philippines', 8, 1, 'Regular', 'Active', '2020-03-01', '2020-09-01', '34-6666777-8', '12-666677778-9', '6666-7777-8888', '666-777-888-000'),

(9, 'EMP-2019-012', 'Jhervin', 'Santos', 'Jimenez', NULL, '1986-11-05', 'Male', 'Married', 'Filipino', 'Roman Catholic', 'jhervin.jimenez@company.com', '02-5556666', '09185556666', '741 EDSA', 'Mandaluyong', 'Metro Manila', '1550', 'Philippines', 9, 3, 'Regular', 'Active', '2019-07-20', '2020-01-20', '34-8888999-0', '12-888899990-1', '8888-9999-0000', '888-999-000-111'),

(10, 'EMP-2019-003', 'Edrianne', 'Joy', 'Lumabas', NULL, '1990-02-14', 'Female', 'Single', 'Filipino', 'Roman Catholic', 'edrianne.lumabas@company.com', '02-6667777', '09196667777', '852 Taft Ave', 'Manila', 'Metro Manila', '1000', 'Philippines', 10, 3, 'Regular', 'Active', '2019-01-10', '2019-07-10', '34-2222333-4', '12-222233334-5', '2222-3333-4444', '222-333-444-000');

-- Insert Emergency Contacts
INSERT INTO EmergencyContacts (employee_id, contact_name, relationship, phone_number, mobile_number, address) VALUES
(1, 'Rosa Dela Cruz', 'Spouse', '02-1111111', '09171111111', '123 Rizal St, Manila'),
(2, 'Carmen Reyes', 'Mother', '02-2222222', '09182222222', '456 Bonifacio Ave, Quezon City'),
(3, 'Linda Santos', 'Spouse', '02-3333333', '09193333333', '789 Aguinaldo Blvd, Makati'),
(4, 'Roberto Torres', 'Father', '02-4444444', '09174444444', '321 Luna St, Pasig'),
(5, 'Elena Ramos', 'Spouse', '02-5555555', '09185555555', '654 Mabini St, Taguig'),
(6, 'Maria Balnig', 'Mother', '02-6666666', '09196666666', '147 Roxas Blvd, Manila'),
(7, 'Susan Banaag', 'Spouse', '02-7777777', '09177777777', '258 Del Pilar St, Manila'),
(8, 'Ahmed Zamora', 'Spouse', '02-8888888', '09188888888', '369 Quezon Ave, Quezon City'),
(9, 'Grace Jimenez', 'Spouse', '02-9999999', '09199999999', '741 EDSA, Mandaluyong'),
(10, 'Antonio Lumabas', 'Father', '02-0000000', '09170000000', '852 Taft Ave, Manila');

-- Create VPN user with remote access privileges
CREATE USER IF NOT EXISTS 'payroll_vpn'@'%' IDENTIFIED BY 'vpn_payroll_2025';
GRANT SELECT ON employeemanagementsystem.Employees TO 'payroll_vpn'@'%';
GRANT SELECT ON employeemanagementsystem.Departments TO 'payroll_vpn'@'%';
GRANT SELECT ON employeemanagementsystem.Positions TO 'payroll_vpn'@'%';
GRANT SELECT ON employeemanagementsystem.EmergencyContacts TO 'payroll_vpn'@'%';
FLUSH PRIVILEGES;
