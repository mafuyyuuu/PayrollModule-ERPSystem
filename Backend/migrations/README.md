# Database Migrations

This folder contains SQL migration files for the Payroll Management System.

## Migration Files

### 001_add_payroll_rules_and_cutoffs.sql
**Database:** PayrollManagementSystem

Creates the following tables:
- `PayrollRules` - Stores payroll calculation rules (overtime rates, deductions, bonuses, etc.)
- `Roles` - User roles (Admin, Manager, Payroll, Employee)
- `ActivityLogs` - System activity/audit logs

Uses existing table:
- `PayrollCutoffs` - Uses the existing table from payrolldb.sql (stores payroll cutoff periods and pay dates)

Also inserts:
- Default payroll rules (overtime, SSS, PhilHealth, Pag-IBIG, tax, allowances, bonuses)
- Sample cutoff periods for December 2025 and January 2026
- Default user roles

### 002_ensure_hr_tables.sql
**Database:** payaborhr

Ensures the following tables exist with proper structure:
- `employeetype` - Employment types (Full Time, Part Time, Contract, etc.)
- `departments` - Company departments
- `positions` - Job positions with salary ranges
- `emergencycontacts` - Employee emergency contacts

Also adds missing columns to `employees` table:
- `profile_path` - For storing employee photo filename
- `date_hired` - Employee hire date
- `email` - Employee email address

## How to Run Migrations

### Option 1: MySQL Command Line
```bash
# Run PayrollManagementSystem migrations
mysql -u root -p PayrollManagementSystem < migrations/001_add_payroll_rules_and_cutoffs.sql

# Run payaborhr migrations
mysql -u root -p payaborhr < migrations/002_ensure_hr_tables.sql
```

### Option 2: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database server
3. Open the migration file
4. Execute the script (Ctrl+Shift+Enter)

### Option 3: phpMyAdmin
1. Open phpMyAdmin
2. Select the appropriate database
3. Go to SQL tab
4. Copy and paste the migration script
5. Click "Go" to execute

## Notes

- All tables use `IF NOT EXISTS` to prevent errors if tables already exist
- Insert statements use `ON DUPLICATE KEY UPDATE` to prevent duplicate entries
- Foreign keys are set with `ON DELETE CASCADE` where appropriate
- All tables use `utf8mb4` charset for full Unicode support

## Rollback

To rollback these migrations, you would need to:
```sql
-- For PayrollManagementSystem
DROP TABLE IF EXISTS PayrollRules;
DROP TABLE IF EXISTS CutoffPeriods;
DROP TABLE IF EXISTS ActivityLogs;
-- Note: Be careful with Roles table as UserAccounts may reference it

-- For payaborhr
-- Be careful with these as they may contain important data
-- DROP TABLE IF EXISTS employeetype;
-- DROP TABLE IF EXISTS departments;
-- DROP TABLE IF EXISTS positions;
-- DROP TABLE IF EXISTS emergencycontacts;
```

⚠️ **Warning:** Rollback scripts will permanently delete data. Always backup before running.
