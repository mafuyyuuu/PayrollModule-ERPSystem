// backend/admin/routes/adminDashboardRoutes.js
import express from 'express';
import { payrollDB, hrDB } from '../../db.js';

const router = express.Router();

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
        const [rows] = await payrollDB.execute(
            `SELECT SUM(net_pay) AS total
             FROM Payroll
             WHERE status IN ('Completed', 'Paid', 'Released')`
        );
        res.json({ total: rows[0]?.total || 0 });
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
            `SELECT SUM(net_pay) AS total
             FROM Payroll
             WHERE status IN ('Pending', 'Processing')`
        );
        res.json({ total: rows[0]?.total || 0 });
    } catch (err) {
        console.error('Error fetching pending payouts:', err);
        res.status(500).json({ total: 0 });
    }
});

// ==========================
// UPCOMING PAYROLL SCHEDULE (PayrollCutoffs table)
// ==========================
router.get('/upcoming-schedule', async (req, res) => {
    try {
        const [rows] = await payrollDB.execute(
            `SELECT CONCAT(
                            DATE_FORMAT(cutoff_start_date,'%b %d, %Y'),
                            ' - ',
                            DATE_FORMAT(cutoff_end_date,'%b %d, %Y')
                    ) AS schedule
             FROM PayrollCutoffs
             WHERE cutoff_start_date >= CURDATE()
             ORDER BY cutoff_start_date ASC
                 LIMIT 1`
        );
        res.json({ schedule: rows[0]?.schedule || 'No upcoming schedule' });
    } catch (err) {
        console.error('Error fetching upcoming schedule:', err);
        res.status(500).json({ schedule: 'No upcoming schedule' });
    }
});

export default router;
