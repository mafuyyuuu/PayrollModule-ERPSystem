import express from 'express';
import { payrollPool, employeePool } from '../../server.js';

const router = express.Router();

// Sample employees

router.get('/debug/employees-sample', async (req, res) => {
    try {
        const [rows] = await employeePool.execute(
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

// Sample payrolls

router.get('/debug/payroll-sample', async (req, res) => {
    try {
        const [rows] = await payrollPool.execute(
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

// Total Employees

router.get('/total-employees', async (req, res) => {
    try {
        const [rows] = await employeePool.execute(
            `SELECT COUNT(*) AS total FROM Employees WHERE employment_status = 'Active'`
        );
        res.json({ total: rows[0]?.total || 0 });
    } catch (err) {
        console.error('Error fetching total employees:', err);
        res.status(500).json({ total: 0 });
    }
});


// Processed Payouts

router.get('/processed-payouts', async (req, res) => {
    try {
        const [rows] = await payrollPool.execute(
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

// Pending Payouts

router.get('/pending-payouts', async (req, res) => {
    try {
        const [rows] = await payrollPool.execute(
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

// Payroll Schedule (Pure js)

router.get('/upcoming-schedule', async (req, res) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        let nextPayDate;

        if (today.getDate() <= 15) {
            nextPayDate = new Date(year, month, 15);
        } else {
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


// Notification (Based sa audit logs muna)
router.get('/recent-activity-notifications', async (req, res) => {
    try {
        const [logRows] = await payrollPool.execute(
            `SELECT date, user_name, action, description
             FROM AuditLogs
             ORDER BY date DESC
             LIMIT 4`
        );

            const notifications = logRows.map(row => {
            const logDate = new Date(row.date);
            const formattedTime = logDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
            const formattedDate = logDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });

            return {

                title: `${row.action} by ${row.user_name}`,
                message: `${formattedDate} at ${formattedTime}: ${row.description}`,
            };
        });

        res.json({ notifications });
    } catch (err) {
        console.error('Error fetching recent activity notifications:', err);
        res.status(500).json({ notifications: [] });
    }
});

export default router;