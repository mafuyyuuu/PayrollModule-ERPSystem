-- =====================================================
-- Migration: Ensure HR database tables exist
-- Database: payaborhr
-- Created: 2025-12-01
-- =====================================================

USE payaborhr;

-- =====================================================
-- 1. ENSURE EMPLOYEE TYPES TABLE EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS employeetype (
    employee_type_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO employeetype (employee_type_id, employee_type_name, description) VALUES
(1, 'Full Time', 'Full-time employee with regular hours'),
(2, 'Part Time', 'Part-time employee with reduced hours'),
(3, 'Contract', 'Contract-based employee'),
(4, 'Temporary', 'Temporary/seasonal employee'),
(5, 'Probationary', 'Employee on probation period')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- =====================================================
-- 2. ENSURE DEPARTMENTS TABLE EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    department_description TEXT,
    manager_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample departments if none exist
INSERT INTO departments (department_name, department_description) 
SELECT * FROM (SELECT 'Human Resources' as name, 'HR department handling recruitment and employee relations' as desc) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Human Resources')
LIMIT 1;

INSERT INTO departments (department_name, department_description) 
SELECT * FROM (SELECT 'Information Technology' as name, 'IT department handling systems and technology' as desc) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Information Technology')
LIMIT 1;

INSERT INTO departments (department_name, department_description) 
SELECT * FROM (SELECT 'Finance' as name, 'Finance department handling accounting and payroll' as desc) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Finance')
LIMIT 1;

INSERT INTO departments (department_name, department_description) 
SELECT * FROM (SELECT 'Operations' as name, 'Operations department handling daily operations' as desc) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Operations')
LIMIT 1;

INSERT INTO departments (department_name, department_description) 
SELECT * FROM (SELECT 'Marketing' as name, 'Marketing department handling promotions and branding' as desc) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE department_name = 'Marketing')
LIMIT 1;

-- =====================================================
-- 3. ENSURE POSITIONS TABLE EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    position_name VARCHAR(100) NOT NULL,
    position_description TEXT,
    position_min_salary DECIMAL(12,2) DEFAULT NULL,
    position_max_salary DECIMAL(12,2) DEFAULT NULL,
    department_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample positions if none exist
INSERT INTO positions (position_name, position_description, position_min_salary, position_max_salary) 
SELECT * FROM (SELECT 'Software Developer' as name, 'Develops and maintains software applications' as desc, 35000.00 as min_sal, 80000.00 as max_sal) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM positions WHERE position_name = 'Software Developer')
LIMIT 1;

INSERT INTO positions (position_name, position_description, position_min_salary, position_max_salary) 
SELECT * FROM (SELECT 'HR Manager' as name, 'Manages human resources operations' as desc, 45000.00 as min_sal, 90000.00 as max_sal) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM positions WHERE position_name = 'HR Manager')
LIMIT 1;

INSERT INTO positions (position_name, position_description, position_min_salary, position_max_salary) 
SELECT * FROM (SELECT 'Accountant' as name, 'Handles financial records and reporting' as desc, 30000.00 as min_sal, 60000.00 as max_sal) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM positions WHERE position_name = 'Accountant')
LIMIT 1;

INSERT INTO positions (position_name, position_description, position_min_salary, position_max_salary) 
SELECT * FROM (SELECT 'Administrative Assistant' as name, 'Provides administrative support' as desc, 18000.00 as min_sal, 35000.00 as max_sal) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM positions WHERE position_name = 'Administrative Assistant')
LIMIT 1;

-- =====================================================
-- 4. ENSURE EMERGENCY CONTACTS TABLE EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS emergencycontacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    contact_number VARCHAR(20),
    contact_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_employee (employee_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. ENSURE EMPLOYEES TABLE HAS ALL REQUIRED COLUMNS
-- =====================================================

-- Add profile_path column if it doesn't exist
-- This stores the filename of the employee's profile photo
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_path VARCHAR(255) DEFAULT NULL;

-- Add date_hired column if it doesn't exist
ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_hired DATE DEFAULT NULL;

-- Add email column if it doesn't exist
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email VARCHAR(100) DEFAULT NULL;

-- =====================================================
-- DONE!
-- =====================================================

SELECT 'HR Database migration completed successfully!' as Status;
