// backend/admin/routes/adminDashboardRoutes.js
import express from 'express';
import { payrollDB, hrDB } from '../../db.js'; // must match your backend/db.js exports

const router = express.Router();

// -----------------------------
// DEBUG: SHOW SAMPLE EMPLOYEES
// -----------------------------
router.get('/debug/employees-sample', async (req, res) => {
    try {
        const [rows] = await hrDB.execute(
            `SELECT employee_id, employee_number, first_name, last_name, employment_status, date_hired
             FROM Employees
             ORDER BY employee_id
                 LIMIT 10`
        );
        res.json({ count: rows.length, rows });
    } catch (err) {
        console.error('Debug employees error:', err);
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------
// DEBUG: SHOW SAMPLE PAYROLLS
// -----------------------------
router.get('/debug/payroll-sample', async (req, res) => {
    try {
        const [rows] = await payrollDB.execute(
            `SELECT payroll_id, employee_id, cutoff_start_date, cutoff_end_date, pay_date, status, net_pay
             FROM Payroll
             ORDER BY pay_date DESC
                 LIMIT 10`
        );
        res.json({ count: rows.length, rows });
    } catch (err) {
        console.error('Debug payroll error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// TOTAL EMPLOYEES (EMS ONLY)
// ==========================
router.get('/total-employees', async (req, res) => {
    try {
        const [rows] = await hrDB.execute(
            `SELECT COUNT(*) AS total FROM Employees WHERE employment_status = 'Active'`
        );
        res.json({ total: rows[0]?.total || 0 });
    } catch (err) {
        console.error('Error fetching total employees:', err);
        res.status(500).json({ total: 0 });
    }
});

// ==========================
// PROCESSED PAYOUTS (Payroll only)
// ==========================
router.get('/processed-payouts', async (req, res) => {
    try {
        // include 'Processed' because your sample inserts use that status.
        const [rows] = await payrollDB.execute(
            `SELECT COALESCE(SUM(net_pay), 0) AS total
             FROM Payroll
             WHERE status IN ('Processed', 'Completed', 'Paid', 'Released')`
        );
        res.json({ total: Number(rows[0]?.total || 0) });
    } catch (err) {
        console.error('Error fetching processed payouts:', err);
        res.status(500).json({ total: 0 });
    }
});

// ==========================
// PENDING PAYOUTS (Payroll only)
// ==========================
router.get('/pending-payouts', async (req, res) => {
    try {
        const [rows] = await payrollDB.execute(
            `SELECT COALESCE(SUM(net_pay), 0) AS total
             FROM Payroll
             WHERE status IN ('Pending', 'Processing')`
        );
        res.json({ total: Number(rows[0]?.total || 0) });
    } catch (err) {
        console.error('Error fetching pending payouts:', err);
        res.status(500).json({ total: 0 });
    }
});

// ==========================
// UPCOMING PAYROLL SCHEDULE (exact semi-monthly date)
// ==========================
router.get('/upcoming-schedule', async (req, res) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-indexed

        let nextPayDate;

        if (today.getDate() <= 15) {
            // Next pay date is the 15th of this month
            nextPayDate = new Date(year, month, 15);
        } else {
            // Next pay date is the 30th of this month
            nextPayDate = new Date(year, month, 30);
        }

        // Format date as 'Dec 15, 2025'
        const options = { year: 'numeric', month: 'short', day: '2-digit' };
        const formattedDate = nextPayDate.toLocaleDateString('en-US', options);

        res.json({ schedule: formattedDate });

    } catch (err) {
        console.error('Error fetching upcoming schedule:', err);
        res.status(500).json({ schedule: 'No upcoming schedule' });
    }
});



export default router;
