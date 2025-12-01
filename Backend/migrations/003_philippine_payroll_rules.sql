-- =====================================================
-- Migration: Philippine Standard Payroll Rules 2024-2025
-- Database: PayrollManagementSystem
-- Based on: SSS, PhilHealth, Pag-IBIG, TRAIN Law
-- Created: 2025-12-01
-- =====================================================

USE PayrollManagementSystem;

-- =====================================================
-- 1. CLEAR EXISTING RULES (Optional - Comment out if you want to keep existing)
-- =====================================================
-- DELETE FROM PayrollRules;

-- =====================================================
-- 2. INSERT PHILIPPINE STANDARD PAYROLL RULES
-- =====================================================

-- First, remove existing standard rules to avoid duplicates
DELETE FROM PayrollRules WHERE rule_name IN (
    'SSS Contribution',
    'PhilHealth Contribution', 
    'Pag-IBIG Contribution',
    'Withholding Tax',
    'Regular Overtime',
    'Rest Day Overtime',
    'Holiday Overtime',
    'Special Holiday Overtime',
    'Night Differential',
    '13th Month Pay',
    'De Minimis Benefits'
);

-- =====================================================
-- GOVERNMENT MANDATORY DEDUCTIONS
-- =====================================================

-- SSS Contribution (2024) - Employee Share: 4.5% of MSC
-- Minimum MSC: ₱4,000 (contribution: ₱180)
-- Maximum MSC: ₱30,000 (contribution: ₱1,350)
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount, 
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'SSS Contribution', 
    'deduction', 
    '4.5% of Monthly Salary Credit (MSC). MSC ranges from ₱4,000 to ₱30,000.', 
    0.0450,  -- 4.5%
    NULL,
    180.00,   -- Minimum contribution (₱4,000 MSC × 4.5%)
    1350.00,  -- Maximum contribution (₱30,000 MSC × 4.5%)
    'Social Security System (SSS) Employee Contribution - 2024 Rate: 4.5% of Monthly Salary Credit. Employer pays additional 9.5% + 1% EC.',
    TRUE, 
    'all', 
    10
);

-- PhilHealth Contribution (2024) - Employee Share: 2.5%
-- Total Rate: 5% (shared equally between employer and employee)
-- Salary Floor: ₱10,000 (min contribution: ₱250)
-- Salary Cap: ₱100,000 (max contribution: ₱2,500)
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'PhilHealth Contribution',
    'deduction',
    '2.5% of Basic Monthly Salary (Employee Share). Total rate is 5% shared equally.',
    0.0250,  -- 2.5%
    NULL,
    250.00,   -- Minimum contribution (₱10,000 × 2.5%)
    2500.00,  -- Maximum contribution (₱100,000 × 2.5%)
    'Philippine Health Insurance Corporation (PhilHealth) - 2024 Rate: 5% total, 2.5% employee share. Salary floor ₱10,000, cap ₱100,000.',
    TRUE,
    'all',
    11
);

-- Pag-IBIG Contribution (2024) - Employee Share: 2% (max ₱100)
-- For salary ≤ ₱1,500: Employee pays 1%
-- For salary > ₱1,500: Employee pays 2% (capped at ₱100)
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'Pag-IBIG Contribution',
    'deduction',
    '2% of Basic Salary for salary over ₱1,500, capped at ₱100. For salary ≤₱1,500, rate is 1%.',
    0.0200,  -- 2%
    NULL,
    NULL,
    100.00,   -- Maximum contribution is ₱100
    'Pag-IBIG Fund (HDMF) Employee Contribution - 2024: 2% of basic salary (max ₱100). Employer matches 2% (max ₱100).',
    TRUE,
    'all',
    12
);

-- Withholding Tax (TRAIN Law 2024-2025)
-- Uses graduated tax table
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'Withholding Tax',
    'deduction',
    'TRAIN Law Tax Table: ₱0-250K: 0%; ₱250K-400K: 15% of excess; ₱400K-800K: ₱22,500+20%; ₱800K-2M: ₱102,500+25%; ₱2M-8M: ₱402,500+30%; Over ₱8M: ₱2,202,500+35%',
    NULL,
    NULL,
    0.00,
    NULL,
    'Bureau of Internal Revenue (BIR) Withholding Tax based on TRAIN Law (RA 10963) - Effective 2018-2025. First ₱250,000 annual income is tax-exempt.',
    TRUE,
    'all',
    13
);

-- =====================================================
-- OVERTIME RATES (Labor Code of the Philippines)
-- =====================================================

-- Regular Overtime - 125% (25% premium)
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'Regular Overtime',
    'overtime',
    'Hourly Rate × 1.25 × OT Hours. Premium: 25% on top of regular hourly rate.',
    1.2500,  -- 125% multiplier
    NULL,
    NULL,
    NULL,
    'Regular Overtime Pay (Labor Code Art. 87) - Work beyond 8 hours on regular working days. Rate: 125% of hourly rate.',
    TRUE,
    'all',
    1
);

-- Rest Day Overtime - 130%
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'Rest Day Overtime',
    'overtime',
    'Hourly Rate × 1.30 × OT Hours. For work on employee scheduled rest day.',
    1.3000,  -- 130% multiplier
    NULL,
    NULL,
    NULL,
    'Rest Day Overtime Pay (Labor Code Art. 93) - Work on scheduled rest day. Rate: 130% of hourly rate.',
    TRUE,
    'all',
    2
);

-- Special Holiday Overtime - 130% (or 150% if also rest day)
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'Special Holiday Overtime',
    'overtime',
    'Hourly Rate × 1.30 × Hours Worked. If coinciding with rest day: 150%.',
    1.3000,  -- 130% multiplier
    NULL,
    NULL,
    NULL,
    'Special Non-Working Holiday Pay (Labor Code) - Rate: 130% of hourly rate. If on rest day: 150%.',
    TRUE,
    'all',
    3
);

-- Regular Holiday Overtime - 200% (double pay)
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'Holiday Overtime',
    'overtime',
    'Hourly Rate × 2.00 × Hours Worked. Double pay for regular holidays.',
    2.0000,  -- 200% multiplier
    NULL,
    NULL,
    NULL,
    'Regular Holiday Pay (Labor Code Art. 94) - Double pay for work on regular holidays. Rate: 200% of hourly rate.',
    TRUE,
    'all',
    4
);

-- Night Differential - Additional 10%
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'Night Differential',
    'earning',
    'Hourly Rate × 0.10 × Night Hours. Additional 10% for work between 10PM-6AM.',
    0.1000,  -- 10% additional
    NULL,
    NULL,
    NULL,
    'Night Shift Differential (Labor Code Art. 86) - Additional 10% for work between 10:00 PM and 6:00 AM.',
    TRUE,
    'all',
    5
);

-- =====================================================
-- MANDATORY BENEFITS
-- =====================================================

-- 13th Month Pay
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    '13th Month Pay',
    'bonus',
    'Total Basic Salary Earned During the Year ÷ 12. Must be paid on or before December 24.',
    NULL,
    NULL,
    NULL,
    NULL,
    '13th Month Pay (PD 851) - Mandatory for all rank-and-file employees. Formula: Total Basic Salary ÷ 12. Tax-exempt up to ₱90,000.',
    TRUE,
    'all',
    30
);

-- De Minimis Benefits
INSERT INTO PayrollRules (
    rule_name, rule_type, formula, percentage, fixed_amount,
    min_value, max_value, description, is_active, applies_to, priority
) VALUES (
    'De Minimis Benefits',
    'allowance',
    'Tax-exempt benefits: Rice ₱2,000/mo, Clothing ₱6,000/yr, Medical ₱10,000/yr, Laundry ₱300/mo',
    NULL,
    NULL,
    NULL,
    NULL,
    'De Minimis Benefits (RR 11-2018) - Tax-exempt fringe benefits: Rice subsidy ₱2,000/mo, Uniform/Clothing ₱6,000/yr, Medical cash ₱10,000/yr, Laundry ₱300/mo, Achievement awards ₱10,000/yr.',
    TRUE,
    'all',
    20
);

-- =====================================================
-- 3. SSS CONTRIBUTION TABLE (2024)
-- This is the detailed table for accurate SSS computation
-- =====================================================

CREATE TABLE IF NOT EXISTS SSSContributionTable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salary_bracket_min DECIMAL(12,2) NOT NULL,
    salary_bracket_max DECIMAL(12,2) NOT NULL,
    monthly_salary_credit DECIMAL(12,2) NOT NULL,
    employee_contribution DECIMAL(12,2) NOT NULL,  -- 4.5%
    employer_contribution DECIMAL(12,2) NOT NULL,  -- 9.5%
    ec_contribution DECIMAL(12,2) NOT NULL,        -- 1% (employer only)
    total_contribution DECIMAL(12,2) NOT NULL,     -- 14% + EC
    effective_date DATE DEFAULT '2024-01-01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_salary_range (salary_bracket_min, salary_bracket_max)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clear existing SSS table data
DELETE FROM SSSContributionTable WHERE effective_date = '2024-01-01';

-- Insert 2024 SSS Contribution Table
INSERT INTO SSSContributionTable (salary_bracket_min, salary_bracket_max, monthly_salary_credit, employee_contribution, employer_contribution, ec_contribution, total_contribution) VALUES
(0.00, 4249.99, 4000.00, 180.00, 380.00, 10.00, 570.00),
(4250.00, 4749.99, 4500.00, 202.50, 427.50, 10.00, 640.00),
(4750.00, 5249.99, 5000.00, 225.00, 475.00, 10.00, 710.00),
(5250.00, 5749.99, 5500.00, 247.50, 522.50, 10.00, 780.00),
(5750.00, 6249.99, 6000.00, 270.00, 570.00, 10.00, 850.00),
(6250.00, 6749.99, 6500.00, 292.50, 617.50, 10.00, 920.00),
(6750.00, 7249.99, 7000.00, 315.00, 665.00, 10.00, 990.00),
(7250.00, 7749.99, 7500.00, 337.50, 712.50, 10.00, 1060.00),
(7750.00, 8249.99, 8000.00, 360.00, 760.00, 10.00, 1130.00),
(8250.00, 8749.99, 8500.00, 382.50, 807.50, 10.00, 1200.00),
(8750.00, 9249.99, 9000.00, 405.00, 855.00, 10.00, 1270.00),
(9250.00, 9749.99, 9500.00, 427.50, 902.50, 10.00, 1340.00),
(9750.00, 10249.99, 10000.00, 450.00, 950.00, 10.00, 1410.00),
(10250.00, 10749.99, 10500.00, 472.50, 997.50, 10.00, 1480.00),
(10750.00, 11249.99, 11000.00, 495.00, 1045.00, 10.00, 1550.00),
(11250.00, 11749.99, 11500.00, 517.50, 1092.50, 10.00, 1620.00),
(11750.00, 12249.99, 12000.00, 540.00, 1140.00, 10.00, 1690.00),
(12250.00, 12749.99, 12500.00, 562.50, 1187.50, 10.00, 1760.00),
(12750.00, 13249.99, 13000.00, 585.00, 1235.00, 10.00, 1830.00),
(13250.00, 13749.99, 13500.00, 607.50, 1282.50, 10.00, 1900.00),
(13750.00, 14249.99, 14000.00, 630.00, 1330.00, 10.00, 1970.00),
(14250.00, 14749.99, 14500.00, 652.50, 1377.50, 10.00, 2040.00),
(14750.00, 15249.99, 15000.00, 675.00, 1425.00, 10.00, 2110.00),
(15250.00, 15749.99, 15500.00, 697.50, 1472.50, 10.00, 2180.00),
(15750.00, 16249.99, 16000.00, 720.00, 1520.00, 10.00, 2250.00),
(16250.00, 16749.99, 16500.00, 742.50, 1567.50, 10.00, 2320.00),
(16750.00, 17249.99, 17000.00, 765.00, 1615.00, 10.00, 2390.00),
(17250.00, 17749.99, 17500.00, 787.50, 1662.50, 10.00, 2460.00),
(17750.00, 18249.99, 18000.00, 810.00, 1710.00, 10.00, 2530.00),
(18250.00, 18749.99, 18500.00, 832.50, 1757.50, 10.00, 2600.00),
(18750.00, 19249.99, 19000.00, 855.00, 1805.00, 10.00, 2670.00),
(19250.00, 19749.99, 19500.00, 877.50, 1852.50, 10.00, 2740.00),
(19750.00, 20249.99, 20000.00, 900.00, 1900.00, 10.00, 2810.00),
(20250.00, 20749.99, 20500.00, 922.50, 1947.50, 10.00, 2880.00),
(20750.00, 21249.99, 21000.00, 945.00, 1995.00, 10.00, 2950.00),
(21250.00, 21749.99, 21500.00, 967.50, 2042.50, 10.00, 3020.00),
(21750.00, 22249.99, 22000.00, 990.00, 2090.00, 10.00, 3090.00),
(22250.00, 22749.99, 22500.00, 1012.50, 2137.50, 10.00, 3160.00),
(22750.00, 23249.99, 23000.00, 1035.00, 2185.00, 10.00, 3230.00),
(23250.00, 23749.99, 23500.00, 1057.50, 2232.50, 10.00, 3300.00),
(23750.00, 24249.99, 24000.00, 1080.00, 2280.00, 10.00, 3370.00),
(24250.00, 24749.99, 24500.00, 1102.50, 2327.50, 10.00, 3440.00),
(24750.00, 25249.99, 25000.00, 1125.00, 2375.00, 10.00, 3510.00),
(25250.00, 25749.99, 25500.00, 1147.50, 2422.50, 10.00, 3580.00),
(25750.00, 26249.99, 26000.00, 1170.00, 2470.00, 10.00, 3650.00),
(26250.00, 26749.99, 26500.00, 1192.50, 2517.50, 10.00, 3720.00),
(26750.00, 27249.99, 27000.00, 1215.00, 2565.00, 10.00, 3790.00),
(27250.00, 27749.99, 27500.00, 1237.50, 2612.50, 10.00, 3860.00),
(27750.00, 28249.99, 28000.00, 1260.00, 2660.00, 10.00, 3930.00),
(28250.00, 28749.99, 28500.00, 1282.50, 2707.50, 10.00, 4000.00),
(28750.00, 29249.99, 29000.00, 1305.00, 2755.00, 10.00, 4070.00),
(29250.00, 29749.99, 29500.00, 1327.50, 2802.50, 10.00, 4140.00),
(29750.00, 999999.99, 30000.00, 1350.00, 2850.00, 10.00, 4210.00);

-- =====================================================
-- 4. WITHHOLDING TAX TABLE (TRAIN Law 2024-2025)
-- Monthly Tax Table for easier computation
-- =====================================================

CREATE TABLE IF NOT EXISTS WithholdingTaxTable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compensation_range_min DECIMAL(12,2) NOT NULL,
    compensation_range_max DECIMAL(12,2) NOT NULL,
    base_tax DECIMAL(12,2) NOT NULL,
    excess_percentage DECIMAL(5,4) NOT NULL,
    excess_over DECIMAL(12,2) NOT NULL,
    description VARCHAR(100),
    period_type ENUM('monthly', 'semi_monthly', 'weekly', 'daily') DEFAULT 'monthly',
    effective_date DATE DEFAULT '2024-01-01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clear existing tax table data
DELETE FROM WithholdingTaxTable WHERE effective_date = '2024-01-01' AND period_type = 'monthly';

-- Insert Monthly Withholding Tax Table (TRAIN Law 2024-2025)
-- Based on annual brackets divided by 12
INSERT INTO WithholdingTaxTable (compensation_range_min, compensation_range_max, base_tax, excess_percentage, excess_over, description, period_type) VALUES
(0.00, 20833.33, 0.00, 0.0000, 0.00, '₱0-₱250,000 annual: Exempt', 'monthly'),
(20833.34, 33333.33, 0.00, 0.1500, 20833.33, '₱250,001-₱400,000 annual: 15% of excess', 'monthly'),
(33333.34, 66666.67, 1875.00, 0.2000, 33333.33, '₱400,001-₱800,000 annual: ₱22,500 + 20%', 'monthly'),
(66666.68, 166666.67, 8541.67, 0.2500, 66666.67, '₱800,001-₱2,000,000 annual: ₱102,500 + 25%', 'monthly'),
(166666.68, 666666.67, 33541.67, 0.3000, 166666.67, '₱2,000,001-₱8,000,000 annual: ₱402,500 + 30%', 'monthly'),
(666666.68, 999999999.99, 183541.67, 0.3500, 666666.67, 'Over ₱8,000,000 annual: ₱2,202,500 + 35%', 'monthly');

-- =====================================================
-- 5. PHILHEALTH CONTRIBUTION TABLE (2024)
-- =====================================================

CREATE TABLE IF NOT EXISTS PhilHealthContributionTable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salary_bracket_min DECIMAL(12,2) NOT NULL,
    salary_bracket_max DECIMAL(12,2) NOT NULL,
    premium_rate DECIMAL(5,4) NOT NULL,           -- 5% total
    employee_share DECIMAL(12,2) NOT NULL,         -- 2.5%
    employer_share DECIMAL(12,2) NOT NULL,         -- 2.5%
    total_contribution DECIMAL(12,2) NOT NULL,
    effective_date DATE DEFAULT '2024-01-01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clear existing PhilHealth data
DELETE FROM PhilHealthContributionTable WHERE effective_date = '2024-01-01';

-- PhilHealth 2024: 5% with salary floor ₱10,000 and cap ₱100,000
INSERT INTO PhilHealthContributionTable (salary_bracket_min, salary_bracket_max, premium_rate, employee_share, employer_share, total_contribution) VALUES
(0.00, 9999.99, 0.0500, 250.00, 250.00, 500.00),           -- Floor: based on ₱10,000
(10000.00, 99999.99, 0.0500, 0.00, 0.00, 0.00),            -- 5% of actual salary (computed dynamically)
(100000.00, 999999999.99, 0.0500, 2500.00, 2500.00, 5000.00); -- Cap: based on ₱100,000

-- =====================================================
-- DONE!
-- =====================================================

SELECT 'Philippine Payroll Rules (2024-2025) migration completed successfully!' as Status;
SELECT 'Tables created: SSSContributionTable, WithholdingTaxTable, PhilHealthContributionTable' as Tables;
SELECT 'Rules added: SSS, PhilHealth, Pag-IBIG, Withholding Tax, Overtime rates, 13th Month Pay' as Rules;
