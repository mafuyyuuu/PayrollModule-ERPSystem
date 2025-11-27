// admin/routes/adminAuditLogsRoutes.js

import express from 'express';
// Assuming the main server file is two directories up and exports 'payrollPool'
import { payrollPool } from '../../server.js';

const router = express.Router();

/* ---------------------------------------------
   INTERNAL AUDIT LOG FUNCTION (FOR OTHER ROUTES TO USE)
------------------------------------------------ */
/**
 * Records an entry into the AuditLogs table in the PayrollManagementSystem database.
 * @param {string} user_name - The user or system process that performed the action.
 * @param {string} action - A short, descriptive action type (e.g., USER_LOGIN, PAYROLL_PROCESSED).
 * @param {string} description - A detailed description of the event.
 * @returns {Promise<boolean>} - True if log was successful, False otherwise.
 */
export async function recordAuditLog(user_name, action, description = "") {
    try {
        await payrollPool.execute(
            // Confirmed table name: AuditLogs
            `INSERT INTO AuditLogs (user_name, action, description, date)
             VALUES (?, ?, ?, NOW())`,
            [user_name, action, description]
        );
        return true;
    } catch (err) {
        console.error("❌ Error writing audit log during system operation:", err.message);
        return false;
    }
}

/* ---------------------------------------------
   GET ALL AUDIT LOGS (API Endpoint)
------------------------------------------------ */
/**
 * GET /api/admin/audit-logs
 * Fetches the latest 100 audit logs, with optional filtering by 'search' query parameter.
 */
router.get('/audit-logs', async (req, res) => {
    // Sanitize and prepare search term for LIKE queries
    const search = req.query.search || '';
    const searchTerm = `%${search}%`;

    // Base query structure
    let query = `
        SELECT
            id,
            DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') AS date,
             user_name,
             action,
             COALESCE(description, '') AS description
        FROM AuditLogs
        WHERE 1=1 `; // Start with 1=1 for easy dynamic WHERE clause concatenation

    const params = [];

    // Apply filtering if a search term is provided
    if (search.length > 0) {
        query += `
           AND (user_name LIKE ?
           OR action LIKE ?
           OR COALESCE(description,'') LIKE ?)
        `;
        // Push the search term for each column check
        params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add ordering and limit clauses
    query += `
        ORDER BY date DESC, id DESC
        LIMIT 100`;

    try {
        // Execute the dynamically built query and parameters
        const [logs] = await payrollPool.execute(query, params);

        console.log(`✅ Audit Logs Fetched: ${logs.length} records.`);
        // Respond with the fetched data
        res.json({ logs });
    } catch (err) {
        // Log detailed error information for debugging
        console.error('❌ CRITICAL DB QUERY ERROR fetching AuditLogs:', err.message);
        console.error('Debug Query:', query.trim().replace(/\s\s+/g, ' '), 'Params:', params);

        // Respond with a 500 status and the error message
        res.status(500).json({ logs: [], error: 'DB QUERY FAILED: ' + err.message });
    }
});

/* ---------------------------------------------
   ADD A NEW AUDIT LOG (manual POST endpoint)
------------------------------------------------ */
/**
 * POST /api/admin/audit-logs
 * Manually adds an audit log entry (useful for testing or specific admin tools).
 */
router.post('/audit-logs', async (req, res) => {
    const { user_name, action, description } = req.body;

    if (!user_name || !action) {
        return res.status(400).json({ message: 'user_name and action are required' });
    }

    try {
        // Call the internal function, or directly execute the insert
        await payrollPool.execute(
            `INSERT INTO AuditLogs (user_name, action, description, date)
             VALUES (?, ?, ?, NOW())`,
            [user_name, action, description || '']
        );

        res.json({ message: 'Audit log recorded successfully' });
    } catch (err) {
        console.error('❌ Error adding audit log:', err);
        res.status(500).json({ message: 'Failed to record audit log' });
    }
});

export default router;