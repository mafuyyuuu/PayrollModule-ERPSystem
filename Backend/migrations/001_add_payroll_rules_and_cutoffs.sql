-- =====================================================
-- Migration: Add PayrollRules and CutoffPeriods tables
-- Database: PayrollManagementSystem
-- Created: 2025-12-01
-- =====================================================

USE PayrollManagementSystem;

-- =====================================================
-- 1. PAYROLL RULES TABLE
-- Stores payroll calculation rules (overtime, deductions, bonuses, etc.)
-- =====================================================

CREATE TABLE IF NOT EXISTS PayrollRules (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type ENUM('earning', 'deduction', 'bonus', 'allowance', 'overtime') DEFAULT 'earning',
    formula TEXT COMMENT 'Formula or calculation method description',
    fixed_amount DECIMAL(12,2) DEFAULT NULL COMMENT 'Fixed amount if applicable',
    percentage DECIMAL(5,4) DEFAULT NULL COMMENT 'Percentage rate if applicable (e.g., 0.0125 for 1.25%)',
    min_value DECIMAL(12,2) DEFAULT NULL COMMENT 'Minimum cap',
    max_value DECIMAL(12,2) DEFAULT NULL COMMENT 'Maximum cap',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to ENUM('all', 'full_time', 'part_time', 'contract', 'department', 'position') DEFAULT 'all',
    department_id INT DEFAULT NULL COMMENT 'If applies_to = department',
    position_id INT DEFAULT NULL COMMENT 'If applies_to = position',
    priority INT DEFAULT 0 COMMENT 'Order of application (lower = first)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_rule_type (rule_type),
    INDEX idx_is_active (is_active),
    INDEX idx_applies_to (applies_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. INSERT DEFAULT PAYROLL RULES
-- =====================================================

INSERT INTO PayrollRules (rule_name, rule_type, formula, percentage, description, is_active, applies_to, priority) VALUES
-- Earnings
('Regular Overtime', 'overtime', 'hourly_rate * 1.25 * overtime_hours', 1.2500, 'Regular overtime rate (125% of hourly rate)', TRUE, 'all', 1),
('Rest Day Overtime', 'overtime', 'hourly_rate * 1.30 * overtime_hours', 1.3000, 'Rest day overtime rate (130% of hourly rate)', TRUE, 'all', 2),
('Holiday Overtime', 'overtime', 'hourly_rate * 2.00 * overtime_hours', 2.0000, 'Holiday overtime rate (200% of hourly rate)', TRUE, 'all', 3),

-- Deductions - Government Mandated
('SSS Contribution', 'deduction', 'Based on SSS contribution table', NULL, 'Social Security System employee contribution', TRUE, 'all', 10),
('PhilHealth Contribution', 'deduction', 'basic_salary * 0.025', 0.0250, 'PhilHealth employee share (2.5% of basic salary)', TRUE, 'all', 11),
('Pag-IBIG Contribution', 'deduction', 'basic_salary * 0.02 (max 200)', 0.0200, 'Pag-IBIG Fund employee contribution (2%, max ₱200)', TRUE, 'all', 12),
('Withholding Tax', 'deduction', 'Based on BIR tax table', NULL, 'Income tax based on taxable income bracket', TRUE, 'all', 13),

-- Allowances
('Rice Allowance', 'allowance', NULL, NULL, 'Monthly rice subsidy', TRUE, 'full_time', 20),
('Transportation Allowance', 'allowance', NULL, NULL, 'Monthly transportation allowance', TRUE, 'all', 21),
('Communication Allowance', 'allowance', NULL, NULL, 'Monthly communication allowance', TRUE, 'all', 22),

-- Bonuses
('13th Month Pay', 'bonus', 'basic_salary / 12 * months_worked', NULL, 'Mandatory 13th month pay', TRUE, 'all', 30),
('Performance Bonus', 'bonus', 'Based on performance evaluation', NULL, 'Quarterly/Annual performance bonus', TRUE, 'all', 31)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- =====================================================
-- 3. NOTE: CUTOFF PERIODS
-- The PayrollCutoffs table already exists in payrolldb.sql
-- We use that table instead of creating a new CutoffPeriods table
-- =====================================================

-- Ensure PayrollCutoffs has sample data if empty
INSERT IGNORE INTO PayrollCutoffs (cutoff_id, period_name, start_date, end_date, pay_date, frequency, status) VALUES
-- December 2025
(1, '1st Half of December 2025', '2025-12-01', '2025-12-15', '2025-12-20', 'Semi-Monthly', 'Active'),
(2, '2nd Half of December 2025', '2025-12-16', '2025-12-31', '2026-01-05', 'Semi-Monthly', 'Active'),
-- January 2026
(3, '1st Half of January 2026', '2026-01-01', '2026-01-15', '2026-01-20', 'Semi-Monthly', 'Active'),
(4, '2nd Half of January 2026', '2026-01-16', '2026-01-31', '2026-02-05', 'Semi-Monthly', 'Active')
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

-- =====================================================
-- 4. ADD ROLES TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Roles (role_id, role_name, role_description) VALUES
(1, 'Admin', 'System Administrator - Full access to all features'),
(2, 'Manager', 'Department Manager - Can approve requests and view team data'),
(3, 'Payroll', 'Payroll Staff - Can process payroll and manage employee records'),
(4, 'Employee', 'Regular Employee - Can view own data and submit requests')
ON DUPLICATE KEY UPDATE role_description = VALUES(role_description);

-- =====================================================
-- 6. ENSURE USERACCOUNTS TABLE HAS CORRECT STRUCTURE
-- =====================================================

-- Add employee_id column if it doesn't exist
-- ALTER TABLE UserAccounts ADD COLUMN IF NOT EXISTS employee_id INT DEFAULT NULL;

-- =====================================================
-- 7. CREATE ACTIVITY LOGS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS ActivityLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN, etc.',
    entity_type VARCHAR(50) NOT NULL COMMENT 'User, Payroll, Request, Employee, etc.',
    entity_id INT DEFAULT NULL,
    employee_id INT DEFAULT NULL,
    processed_by INT DEFAULT NULL,
    description TEXT,
    old_values JSON DEFAULT NULL,
    new_values JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_action_type (action_type),
    INDEX idx_entity_type (entity_type),
    INDEX idx_employee_id (employee_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DONE!
-- =====================================================

SELECT 'Migration completed successfully!' as Status;
