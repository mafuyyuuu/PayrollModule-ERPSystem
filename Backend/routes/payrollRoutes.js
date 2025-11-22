import express from 'express';
import { payrollDB, hrDB } from '../db.js';

const router = express.Router();

// 1. CALCULATE PAYROLL (Merges HR + Payroll Data)
router.get('/calculate', async (req, res) => {
    try {
        // A. Get Employees from HR DB
        const [employees] = await hrDB.query("SELECT * FROM employees WHERE employment_status = 'Regular'");

        // B. Get Financials from Payroll DB
        const [salaries] = await payrollDB.query("SELECT * FROM SalaryConfigs");
        const [deductions] = await payrollDB.query("SELECT * FROM RecurringAdjustments");

        // C. Merge in JavaScript
        const mergedData = employees.map(emp => {
            const salaryRecord = salaries.find(s => s.employee_id === emp.employee_id);
            const gross = salaryRecord ? Number(salaryRecord.basic_monthly_rate) : 0;

            const userDeductions = deductions
                .filter(d => d.employee_id === emp.employee_id)
                .reduce((sum, d) => sum + Number(d.amount), 0);

            return {
                id: emp.employee_id,
                name: `${emp.first_name} ${emp.last_name}`,
                position: emp.position,
                gross_salary: gross,
                total_deductions: userDeductions,
                net_pay: gross - userDeductions
            };
        });

        res.json(mergedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. DASHBOARD STATS
router.get('/stats', async (req, res) => {
    try {
        const [empCount] = await hrDB.query("SELECT COUNT(*) as c FROM employees");
        const [reqCount] = await payrollDB.query("SELECT COUNT(*) as c FROM Requests WHERE status='Pending'");

        res.json({
            total_employees: empCount[0].c,
            pending_requests: reqCount[0].c,
            processed_payouts: 0, // Placeholder
            next_payout_date: "Nov 30, 2025"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. EMPLOYEE LIST
router.get('/employees', async (req, res) => {
    try {
        const [rows] = await hrDB.query("SELECT * FROM employees");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. PENDING REQUESTS (Merged)
router.get('/requests', async (req, res) => {
    try {
        const [requests] = await payrollDB.query("SELECT * FROM Requests WHERE status='Pending'");
        const [employees] = await hrDB.query("SELECT employee_id, first_name, last_name FROM employees");

        const data = requests.map(req => {
            const emp = employees.find(e => e.employee_id === req.employee_id);
            return {
                ...req,
                employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown"
            };
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;