import express from 'express';
import { payrollDB, hrDB } from '../../db.js';

const router = express.Router();

// === Total Employees ===
router.get('/total-employees', async (req, res) => {
    try {
        const [rows] = await hrDB.query('SELECT COUNT(*) AS total FROM Employees');
        res.json({ total: rows[0].total || 0 });
    } catch (err) {
        console.error('Error fetching total employees:', err);
        res.status(500).json({ total: 0 });
    }
});

// === Processed Payouts ===
router.get('/processed-payouts', async (req, res) => {
    try {
        const [rows] = await payrollDB.query(
            "SELECT SUM(net_pay) AS total FROM Payroll WHERE status = 'Released'"
        );
        res.json({ total: rows[0].total || 0 });
    } catch (err) {
        console.error('Error fetching processed payouts:', err);
        res.status(500).json({ total: 0 });
    }
});

// === Pending Payouts ===
router.get('/pending-payouts', async (req, res) => {
    try {
        const [rows] = await payrollDB.query(
            "SELECT SUM(net_pay) AS total FROM Payroll WHERE status = 'Pending'"
        );
        res.json({ total: rows[0].total || 0 });
    } catch (err) {
        console.error('Error fetching pending payouts:', err);
        res.status(500).json({ total: 0 });
    }
});

// === Upcoming Payroll Schedule ===
router.get('/upcoming-schedule', async (req, res) => {
    try {
        const [rows] = await payrollDB.query(
            `SELECT CONCAT(
                            DATE_FORMAT(cutoff_start_date, '%b %d, %Y'),
                            ' - ',
                            DATE_FORMAT(cutoff_end_date, '%b %d, %Y')
                    ) AS schedule
             FROM Payroll
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
