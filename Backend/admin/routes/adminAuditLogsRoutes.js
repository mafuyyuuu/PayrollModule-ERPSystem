import express from 'express';
import { payrollDB, hrDB } from '../../db.js'; // PMS = payrollDB, EMS = hrDB

const router = express.Router();

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res) => {
    const search = req.query.search || '';

    try {
        // EMS logs
        const [emsLogs] = await hrDB.query(
            `SELECT date, user_name AS user, action, description
             FROM AuditLogs
             WHERE user_name LIKE ?
             ORDER BY date DESC`,
            [`%${search}%`]
        );

        // PMS logs
        const [pmsLogs] = await payrollDB.query(
            `SELECT date, user_name AS user, action, description
             FROM AuditLogs
             WHERE user_name LIKE ?
             ORDER BY date DESC`,
            [`%${search}%`]
        );

        // Combine and sort
        const logs = [...emsLogs, ...pmsLogs].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        res.json({ logs });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        res.status(500).json({ logs: [] });
    }
});

export default router;
