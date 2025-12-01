/* eslint-disable no-unused-vars */
import express from 'express';
import { payrollDB, hrDB } from '../db.js';

const router = express.Router();

// Helper function to log activity
const logActivity = async (actionType, entityType, entityId, description, processedBy = null) => {
    try {
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, description, processed_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [actionType, entityType, entityId, description, processedBy]
        );
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// =====================================================
// 1. ADMIN DASHBOARD STATS
// =====================================================
router.get('/dashboard-stats', async (req, res) => {
    try {
        // Get total employees count
        const [totalEmployees] = await hrDB.query(
            "SELECT COUNT(*) as count FROM employees"
        );

        // Get processed payouts (sum of net_pay for completed payrolls)
        const [processedPayouts] = await payrollDB.query(
            "SELECT COALESCE(SUM(net_pay), 0) as total FROM Payroll WHERE status IN ('Completed', 'Paid', 'Released')"
        );

        // Get pending payouts
        const [pendingPayouts] = await payrollDB.query(
            "SELECT COALESCE(SUM(net_pay), 0) as total FROM Payroll WHERE status IN ('Pending', 'Processing', 'Approved')"
        );

        // Get upcoming schedule from PayrollCutoffs
        const [upcomingSchedule] = await payrollDB.query(
            "SELECT pay_date FROM PayrollCutoffs WHERE pay_date >= CURDATE() ORDER BY pay_date ASC LIMIT 1"
        );

        res.json({
            totalEmployees: totalEmployees[0]?.count || 0,
            processedPayouts: parseFloat(processedPayouts[0]?.total) || 0,
            pendingPayouts: parseFloat(pendingPayouts[0]?.total) || 0,
            upcomingSchedule: upcomingSchedule[0]?.pay_date || null
        });
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// =====================================================
// 2. USER MANAGEMENT - GET ALL USERS
// =====================================================
router.get('/users', async (req, res) => {
    try {
        const { search, status, role } = req.query;

        let query = `
            SELECT 
                u.user_id,
                u.employee_id,
                u.username,
                u.email_address,
                u.role_id,
                u.status,
                r.role_name
            FROM UserAccounts u
            LEFT JOIN Roles r ON u.role_id = r.role_id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ` AND (u.username LIKE ? OR u.email_address LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status) {
            query += ` AND u.status = ?`;
            params.push(status);
        }

        if (role) {
            query += ` AND u.role_id = ?`;
            params.push(role);
        }

        query += ` ORDER BY u.user_id`;

        const [users] = await payrollDB.query(query, params);

        // Enrich with employee names
        const enrichedUsers = await Promise.all(users.map(async (user) => {
            let employeeName = null;
            if (user.employee_id) {
                try {
                    const [empRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as name FROM employees WHERE employee_id = ?`,
                        [user.employee_id]
                    );
                    employeeName = empRows[0]?.name || null;
                } catch (e) {
                    console.log('Could not fetch employee name');
                }
            }

            const roleMap = { 1: 'Admin', 2: 'Manager', 3: 'Payroll', 4: 'Employee' };

            return {
                id: user.user_id,
                name: employeeName || user.username,
                username: user.username,
                email: user.email_address,
                role: user.role_name || roleMap[user.role_id] || 'Unknown',
                roleId: user.role_id,
                status: user.status,
                employeeId: user.employee_id
            };
        }));

        res.json(enrichedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// =====================================================
// 3. USER MANAGEMENT - CREATE USER
// =====================================================
router.post('/users', async (req, res) => {
    const { username, email, password, role_id, employee_id, status } = req.body;

    try {
        // Check if username already exists
        const [existing] = await payrollDB.query(
            `SELECT user_id FROM UserAccounts WHERE username = ?`,
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const [result] = await payrollDB.query(
            `INSERT INTO UserAccounts (employee_id, username, email_address, password, role_id, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [employee_id || null, username, email, password, role_id, status || 'Active']
        );

        // Log activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, processed_by, description)
             VALUES ('CREATE', 'User', ?, ?, ?)`,
            [result.insertId, null, `User ${username} created`]
        );

        res.status(201).json({ success: true, userId: result.insertId, message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// =====================================================
// 4. USER MANAGEMENT - UPDATE USER
// =====================================================
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, role_id, status, employee_id } = req.body;

    try {
        const [result] = await payrollDB.query(
            `UPDATE UserAccounts 
             SET username = COALESCE(?, username),
                 email_address = COALESCE(?, email_address),
                 role_id = COALESCE(?, role_id),
                 status = COALESCE(?, status),
                 employee_id = COALESCE(?, employee_id)
             WHERE user_id = ?`,
            [username, email, role_id, status, employee_id, id]
        );

        // Log activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, processed_by, description)
             VALUES ('UPDATE', 'User', ?, ?, ?)`,
            [id, null, `User ${id} updated`]
        );

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// =====================================================
// 5. USER MANAGEMENT - DELETE USER
// =====================================================
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await payrollDB.query(
            `DELETE FROM UserAccounts WHERE user_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Log activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, processed_by, description)
             VALUES ('DELETE', 'User', ?, ?, ?)`,
            [id, null, `User ${id} deleted`]
        );

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// =====================================================
// 6. AUDIT LOGS - GET ALL LOGS
// =====================================================
router.get('/audit-logs', async (req, res) => {
    try {
        const { search, actionType, startDate, endDate, limit = 100 } = req.query;

        let query = `
            SELECT 
                log_id,
                action_type,
                entity_type,
                entity_id,
                employee_id,
                processed_by,
                description,
                old_values,
                new_values,
                created_at
            FROM ActivityLogs
            WHERE 1=1
        `;
        const params = [];

        if (actionType) {
            query += ` AND action_type = ?`;
            params.push(actionType);
        }

        if (startDate && endDate) {
            query += ` AND DATE(created_at) BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY created_at DESC LIMIT ?`;
        params.push(parseInt(limit));

        const [logs] = await payrollDB.query(query, params);

        // Enrich with user names
        const enrichedLogs = await Promise.all(logs.map(async (log) => {
            let userName = 'System';
            let processedByName = 'System';

            try {
                if (log.employee_id) {
                    const [empRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as name FROM employees WHERE employee_id = ?`,
                        [log.employee_id]
                    );
                    userName = empRows[0]?.name || `Employee ${log.employee_id}`;
                }

                if (log.processed_by) {
                    const [procRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as name FROM employees WHERE employee_id = ?`,
                        [log.processed_by]
                    );
                    processedByName = procRows[0]?.name || `User ${log.processed_by}`;
                }
            } catch (e) {
                // Keep defaults
            }

            return {
                id: log.log_id,
                date: log.created_at,
                user: userName,
                action: log.action_type,
                entityType: log.entity_type,
                description: log.description || `${log.action_type} ${log.entity_type} #${log.entity_id}`,
                processedBy: processedByName
            };
        }));

        // Filter by search
        let results = enrichedLogs;
        if (search) {
            results = enrichedLogs.filter(log =>
                log.user.toLowerCase().includes(search.toLowerCase()) ||
                log.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// =====================================================
// 7. NOTIFICATIONS/ALERTS - GET ALL
// =====================================================
router.get('/notifications', async (req, res) => {
    try {
        // Get all recent activity logs from the system
        const [activities] = await payrollDB.query(`
            SELECT 
                log_id as id,
                action_type,
                entity_type,
                entity_id,
                CASE 
                    WHEN action_type = 'CREATE' AND entity_type = 'Payroll' THEN 'Payroll Created'
                    WHEN action_type = 'UPDATE' AND entity_type = 'Payroll' THEN 'Payroll Updated'
                    WHEN action_type = 'DELETE' AND entity_type = 'Payroll' THEN 'Payroll Deleted'
                    WHEN action_type = 'CREATE' AND entity_type = 'PayrollRule' THEN 'Payroll Rule Added'
                    WHEN action_type = 'UPDATE' AND entity_type = 'PayrollRule' THEN 'Payroll Rule Updated'
                    WHEN action_type = 'DELETE' AND entity_type = 'PayrollRule' THEN 'Payroll Rule Deleted'
                    WHEN action_type = 'CREATE' AND entity_type = 'PayrollCutoff' THEN 'Cutoff Period Added'
                    WHEN action_type = 'UPDATE' AND entity_type = 'PayrollCutoff' THEN 'Cutoff Period Updated'
                    WHEN action_type = 'DELETE' AND entity_type = 'PayrollCutoff' THEN 'Cutoff Period Deleted'
                    WHEN action_type = 'CREATE' AND entity_type = 'User' THEN 'User Created'
                    WHEN action_type = 'UPDATE' AND entity_type = 'User' THEN 'User Updated'
                    WHEN action_type = 'DELETE' AND entity_type = 'User' THEN 'User Deleted'
                    WHEN action_type = 'APPROVE' THEN 'Request Approved'
                    WHEN action_type = 'REJECT' THEN 'Request Rejected'
                    WHEN action_type = 'LOGIN' THEN 'User Login'
                    WHEN action_type = 'LOGOUT' THEN 'User Logout'
                    WHEN action_type = 'PROCESS' THEN 'Payroll Processed'
                    WHEN action_type = 'RELEASE' THEN 'Payroll Released'
                    ELSE CONCAT(action_type, ' ', entity_type)
                END as title,
                description as message,
                processed_by,
                created_at as date
            FROM ActivityLogs
            ORDER BY created_at DESC
            LIMIT 50
        `);

        // Get user names for processed_by
        const userIds = [...new Set(activities.filter(a => a.processed_by).map(a => a.processed_by))];
        let userMap = {};
        
        if (userIds.length > 0) {
            try {
                const [users] = await hrDB.query(
                    `SELECT employee_id, CONCAT(first_name, ' ', last_name) as full_name 
                     FROM employees WHERE employee_id IN (?)`,
                    [userIds]
                );
                userMap = users.reduce((acc, u) => {
                    acc[u.employee_id] = u.full_name;
                    return acc;
                }, {});
            } catch (e) {
                // Ignore if we can't get user names
            }
        }

        const enrichedActivities = activities.map(a => ({
            ...a,
            user: userMap[a.processed_by] || (a.processed_by ? `User #${a.processed_by}` : 'System')
        }));

        res.json(enrichedActivities);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// =====================================================
// CLEAR ALL ACTIVITY LOGS
// =====================================================
router.delete('/activity-logs', async (req, res) => {
    try {
        await payrollDB.query('DELETE FROM ActivityLogs');
        res.json({ success: true, message: 'All activity logs cleared' });
    } catch (error) {
        console.error('Error clearing activity logs:', error);
        res.status(500).json({ error: 'Failed to clear activity logs' });
    }
});

// =====================================================
// 8. APPROVAL WORKFLOWS - GET ALL
// =====================================================
router.get('/workflows', async (req, res) => {
    try {
        const [workflows] = await payrollDB.query(`
            SELECT 
                workflow_id as id,
                name,
                type,
                approver,
                status
            FROM ApprovalWorkflows
            ORDER BY workflow_id
        `);

        res.json(workflows);
    } catch (error) {
        console.error('Error fetching workflows:', error);
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

// =====================================================
// 8a. APPROVAL WORKFLOWS - CREATE
// =====================================================
router.post('/workflows', async (req, res) => {
    const { name, type, approver, status } = req.body;

    try {
        const [result] = await payrollDB.query(
            `INSERT INTO ApprovalWorkflows (name, type, approver, status) VALUES (?, ?, ?, ?)`,
            [name, type, approver, status || 'Active']
        );

        await logActivity('CREATE', 'Workflow', result.insertId, `Created workflow: ${name}`);

        res.status(201).json({ 
            success: true, 
            workflowId: result.insertId, 
            message: 'Workflow created successfully' 
        });
    } catch (error) {
        console.error('Error creating workflow:', error);
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

// =====================================================
// 8b. APPROVAL WORKFLOWS - UPDATE
// =====================================================
router.put('/workflows/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type, approver, status } = req.body;

    try {
        await payrollDB.query(
            `UPDATE ApprovalWorkflows 
             SET name = COALESCE(?, name),
                 type = COALESCE(?, type),
                 approver = COALESCE(?, approver),
                 status = COALESCE(?, status)
             WHERE workflow_id = ?`,
            [name, type, approver, status, id]
        );

        await logActivity('UPDATE', 'Workflow', id, `Updated workflow: ${name || id}`);

        res.json({ success: true, message: 'Workflow updated successfully' });
    } catch (error) {
        console.error('Error updating workflow:', error);
        res.status(500).json({ error: 'Failed to update workflow' });
    }
});

// =====================================================
// 8c. APPROVAL WORKFLOWS - DELETE
// =====================================================
router.delete('/workflows/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await payrollDB.query(
            `DELETE FROM ApprovalWorkflows WHERE workflow_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        await logActivity('DELETE', 'Workflow', id, `Deleted workflow #${id}`);

        res.json({ success: true, message: 'Workflow deleted successfully' });
    } catch (error) {
        console.error('Error deleting workflow:', error);
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
});

// =====================================================
// 8d. APPROVAL WORKFLOWS - DELETE MULTIPLE
// =====================================================
router.post('/workflows/delete-batch', async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No workflow IDs provided' });
    }

    try {
        const [result] = await payrollDB.query(
            `DELETE FROM ApprovalWorkflows WHERE workflow_id IN (?)`,
            [ids]
        );

        await logActivity('DELETE', 'Workflow', null, `Deleted ${result.affectedRows} workflow(s)`);

        res.json({ 
            success: true, 
            deletedCount: result.affectedRows,
            message: `${result.affectedRows} workflow(s) deleted successfully` 
        });
    } catch (error) {
        console.error('Error deleting workflows:', error);
        res.status(500).json({ error: 'Failed to delete workflows' });
    }
});

// =====================================================
// 9. APPROVAL EXCEPTIONS - GET ALL
// =====================================================
router.get('/exceptions', async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT 
                r.request_id,
                r.employee_id,
                r.request_type,
                r.request_description,
                r.date_filed,
                r.status,
                r.approved_by,
                r.remarks
            FROM Requests r
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ` AND r.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY r.date_filed DESC LIMIT 50`;

        const [requests] = await payrollDB.query(query, params);

        // Enrich with employee names
        const enrichedRequests = await Promise.all(requests.map(async (req) => {
            let employeeName = `Employee ${req.employee_id}`;
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as name FROM employees WHERE employee_id = ?`,
                    [req.employee_id]
                );
                employeeName = empRows[0]?.name || employeeName;
            } catch (e) {
                // Keep default
            }

            return {
                id: `EX${String(req.request_id).padStart(3, '0')}`,
                requestId: req.request_id,
                name: employeeName,
                type: req.request_type,
                description: req.request_description,
                dateFiled: req.date_filed,
                status: req.status
            };
        }));

        res.json(enrichedRequests);
    } catch (error) {
        console.error('Error fetching exceptions:', error);
        res.status(500).json({ error: 'Failed to fetch exceptions' });
    }
});

// =====================================================
// 10. ROLES - GET ALL
// =====================================================
router.get('/roles', async (req, res) => {
    try {
        const [roles] = await payrollDB.query(`
            SELECT role_id, role_name, role_description
            FROM Roles
            ORDER BY role_id
        `);

        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        // Return default roles if table doesn't exist
        res.json([
            { role_id: 1, role_name: 'Admin', role_description: 'System Administrator' },
            { role_id: 2, role_name: 'Manager', role_description: 'Department Manager' },
            { role_id: 3, role_name: 'Payroll', role_description: 'Payroll Staff' },
            { role_id: 4, role_name: 'Employee', role_description: 'Regular Employee' }
        ]);
    }
});

// =====================================================
// 11. SYSTEM CONFIGURATION
// =====================================================
router.get('/configuration', async (req, res) => {
    try {
        // Return system configuration (could be from a config table)
        res.json({
            companyName: 'Payroll Management System',
            payrollFrequency: 'Semi-Monthly',
            workingDaysPerMonth: 22,
            regularHoursPerDay: 8,
            overtimeRate: 1.25,
            taxSettings: {
                sss: { rate: 0.045, maxContribution: 1350 },
                philhealth: { rate: 0.025 },
                pagibig: { rate: 0.02, maxContribution: 200 }
            }
        });
    } catch (error) {
        console.error('Error fetching configuration:', error);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

// =====================================================
// 12. REPORTS SUMMARY
// =====================================================
router.get('/reports-summary', async (req, res) => {
    try {
        // Get payroll summary
        const [payrollSummary] = await payrollDB.query(`
            SELECT 
                COUNT(*) as total_payrolls,
                SUM(net_pay) as total_disbursed,
                SUM(deductions) as total_deductions,
                AVG(net_pay) as avg_salary
            FROM Payroll
            WHERE YEAR(pay_date) = YEAR(CURDATE())
        `);

        // Get employee count by department
        const [deptCounts] = await hrDB.query(`
            SELECT 
                d.department_name,
                COUNT(*) as employee_count
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            GROUP BY e.department_id, d.department_name
        `);

        // Get request statistics
        const [requestStats] = await payrollDB.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM Requests
            WHERE YEAR(date_filed) = YEAR(CURDATE())
            GROUP BY status
        `);

        res.json({
            payroll: payrollSummary[0] || {},
            departments: deptCounts,
            requests: requestStats
        });
    } catch (error) {
        console.error('Error fetching reports summary:', error);
        res.status(500).json({ error: 'Failed to fetch reports summary' });
    }
});

// =====================================================
// 13. BROADCAST MESSAGES
// =====================================================
router.post('/broadcasts', async (req, res) => {
    const { title, message, recipients } = req.body;
    
    try {
        // Log the broadcast as an activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, description, created_at)
             VALUES ('BROADCAST', 'Notification', ?, NOW())`,
            [`Broadcast: ${title} - ${message}`]
        );
        
        res.json({ success: true, message: 'Broadcast sent successfully' });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        res.status(500).json({ error: 'Failed to send broadcast' });
    }
});

// =====================================================
// 14. EMPLOYEE TYPES (from HR database)
// =====================================================
router.get('/employee-types', async (req, res) => {
    try {
        const [types] = await hrDB.query(`
            SELECT employee_type_id, employee_type_name 
            FROM employee_type
            ORDER BY employee_type_id
        `);
        res.json(types);
    } catch (error) {
        console.error('Error fetching employee types:', error);
        res.json([
            { employee_type_id: 1, employee_type_name: "Full Time" },
            { employee_type_id: 2, employee_type_name: "Part Time" },
            { employee_type_id: 3, employee_type_name: "Contract" }
        ]);
    }
});

// =====================================================
// 15. UPLOAD USER PHOTOS
// =====================================================
router.post('/users/photos', async (req, res) => {
    // Photo uploads would typically be handled with multer middleware
    // For now, just log the attempt
    try {
        await logActivity('UPLOAD', 'UserPhoto', null, 'User photos uploaded');
        res.json({ success: true, message: 'Photos uploaded successfully' });
    } catch (error) {
        console.error('Error uploading photos:', error);
        res.status(500).json({ error: 'Failed to upload photos' });
    }
});

export default router;
