// backend/admin/routes/adminAuditLogsRoutes.js
import express from 'express';
import { payrollDB } from '../../db.js'; // <-- Correct import from db.js

const router = express.Router();

// ==================== GET ALL AUDIT LOGS ====================
router.get('/audit-logs', async (req, res) => {
    const search = req.query.search || '';

    try {
        const [logs] = await payrollDB.execute(
            `SELECT
                 id,
                 DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') AS date,
                 user_name AS user,
                 action,
                 COALESCE(description, '') AS description
             FROM AuditLogs
             WHERE user_name LIKE ? OR action LIKE ? OR COALESCE(description,'') LIKE ?
             ORDER BY date DESC
                 LIMIT 100`,
            [`%${search}%`, `%${search}%`, `%${search}%`]
        );

        res.json({ logs });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        res.status(500).json({ logs: [] });
    }
});

// ==================== ADD A NEW AUDIT LOG ====================
router.post('/audit-logs', async (req, res) => {
    const { user_name, action, description } = req.body;

    if (!user_name || !action) {
        return res.status(400).json({ message: 'user_name and action are required' });
    }

    try {
        await payrollDB.execute(
            `INSERT INTO AuditLogs (user_name, action, description, date)
             VALUES (?, ?, ?, NOW())`,
            [user_name, action, description || '']
        );

        res.json({ message: 'Audit log recorded successfully' });
    } catch (err) {
        console.error('Error adding audit log:', err);
        res.status(500).json({ message: 'Failed to record audit log' });
    }
});

export default router;
