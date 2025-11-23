import express from 'express';
import { payrollDB, hrDB } from '../db.js';

const router = express.Router();

// 1. GET PAYROLL DASHBOARD STATS
router.get('/dashboard-stats', async (req, res) => {
    try {
        const [totalEmployees] = await hrDB.query(
            "SELECT COUNT(*) as count FROM employees WHERE employment_status = 'Active'"
        );

        const [processedPayouts] = await payrollDB.query(
            "SELECT COUNT(*) as count FROM Payroll WHERE status IN ('Completed', 'Paid', 'Released')"
        );

        const [pendingPayouts] = await payrollDB.query(
            "SELECT COUNT(*) as count FROM Payroll WHERE status IN ('Pending', 'Processing')"
        );

        const [upcomingSchedule] = await payrollDB.query(
            "SELECT pay_date FROM Payroll WHERE status = 'Scheduled' AND pay_date > NOW() ORDER BY pay_date ASC LIMIT 1"
        );

        res.json({
            totalEmployees: totalEmployees[0]?.count || 0,
            processedPayouts: processedPayouts[0]?.count || 0,
            pendingPayouts: pendingPayouts[0]?.count || 0,
            upcomingSchedule: upcomingSchedule[0]?.pay_date || null
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// 2. GET EMPLOYEE RECORDS WITH FILTERS AND SEARCH
router.get('/employees', async (req, res) => {
    try {
        const { search, department, position, status } = req.query;

        let query = `
            SELECT 
                e.employee_id,
                e.employee_number,
                CONCAT(e.first_name, ' ', IFNULL(e.middle_name, ''), ' ', e.last_name) as full_name,
                e.first_name,
                e.middle_name,
                e.last_name,
                e.email_address,
                e.mobile_number,
                e.employment_type,
                e.employment_status,
                e.date_hired,
                e.sss_number,
                e.philhealth_number,
                e.pagibig_number,
                e.tin_number,
                p.position_title as position,
                d.department_name as department,
                sd.basic_rate,
                sd.overtime_rate
            FROM employees e
            LEFT JOIN Positions p ON e.position_id = p.position_id
            LEFT JOIN Departments d ON e.department_id = d.department_id
            LEFT JOIN PayrollManagementSystem.SalaryDetails sd ON e.employee_id = sd.employee_id
            WHERE 1=1
        `;

        const params = [];

        if (search) {
            query += ` AND (CONCAT(e.first_name, ' ', e.last_name) LIKE ? OR e.employee_number LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (department) {
            query += ` AND d.department_name = ?`;
            params.push(department);
        }

        if (position) {
            query += ` AND p.position_title = ?`;
            params.push(position);
        }

        if (status) {
            query += ` AND e.employment_status = ?`;
            params.push(status);
        }

        query += ` ORDER BY e.employee_id`;

        const [employees] = await hrDB.query(query, params);
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employee data' });
    }
});

// 3. GET PAYROLL RECORDS WITH FILTERS
router.get('/payroll', async (req, res) => {
    try {
        const { search, status, startDate, endDate, department } = req.query;

        let query = `
            SELECT 
                p.*,
                u.username as prepared_by_name
            FROM Payroll p
            LEFT JOIN UserAccounts u ON p.prepared_by = u.user_id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            query += ` AND p.status = ?`;
            params.push(status);
        }

        if (startDate && endDate) {
            query += ` AND p.pay_date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY p.pay_date DESC, p.employee_id`;

        const [payrolls] = await payrollDB.query(query, params);

        // Enrich with employee data
        const enrichedPayrolls = await Promise.all(payrolls.map(async (payroll) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT 
                        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                        p.position_title as position,
                        d.department_name as department
                     FROM employees e
                     LEFT JOIN Positions p ON e.position_id = p.position_id
                     LEFT JOIN Departments d ON e.department_id = d.department_id
                     WHERE e.employee_id = ?`,
                    [payroll.employee_id]
                );

                return {
                    ...payroll,
                    employee_name: empRows[0]?.employee_name || `Employee ${payroll.employee_id}`,
                    position: empRows[0]?.position || 'N/A',
                    department: empRows[0]?.department || 'N/A'
                };
            } catch (_err) {
                return {
                    ...payroll,
                    employee_name: `Employee ${payroll.employee_id}`,
                    position: 'N/A',
                    department: 'N/A'
                };
            }
        }));

        // Filter by search term
        let results = enrichedPayrolls;
        if (search) {
            results = enrichedPayrolls.filter(p =>
                p.employee_name.toLowerCase().includes(search.toLowerCase()) ||
                p.payslip_reference_number?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by department
        if (department) {
            results = results.filter(p => p.department === department);
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching payroll:', error);
        res.status(500).json({ error: 'Failed to fetch payroll data' });
    }
});

// 4. GET PENDING REQUESTS WITH FILTERS
router.get('/pending-requests', async (req, res) => {
    try {
        const { search, type, status = 'Pending' } = req.query;

        let query = `SELECT * FROM Requests WHERE status = ?`;
        const params = [status];

        if (type) {
            query += ` AND request_type = ?`;
            params.push(type);
        }

        query += ` ORDER BY date_filed DESC`;

        const [requests] = await payrollDB.query(query, params);

        const enrichedRequests = await Promise.all(requests.map(async (request) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name, 
                            p.position_title as position,
                            d.department_name as department
                     FROM employees e
                     LEFT JOIN Positions p ON e.position_id = p.position_id
                     LEFT JOIN Departments d ON e.department_id = d.department_id
                     WHERE e.employee_id = ?`,
                    [request.employee_id]
                );

                return {
                    ...request,
                    employee_name: empRows[0]?.employee_name || `Employee ${request.employee_id}`,
                    position: empRows[0]?.position || 'N/A',
                    department: empRows[0]?.department || 'N/A'
                };
            } catch (_err) {
                return {
                    ...request,
                    employee_name: `Employee ${request.employee_id}`,
                    position: 'N/A',
                    department: 'N/A'
                };
            }
        }));

        // Filter by search
        let results = enrichedRequests;
        if (search) {
            results = enrichedRequests.filter(r =>
                r.employee_name.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
});

// 5. APPROVE REQUEST
router.put('/pending-requests/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { approved_by, remarks } = req.body;

    try {
        await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Approved', approved_by = ?, remarks = ?
             WHERE request_id = ?`,
            [approved_by, remarks || 'Approved', id]
        );

        res.json({ success: true, message: 'Request approved successfully' });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

// 6. REJECT REQUEST
router.put('/pending-requests/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { approved_by, remarks } = req.body;

    try {
        await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Rejected', approved_by = ?, remarks = ?
             WHERE request_id = ?`,
            [approved_by, remarks || 'Rejected', id]
        );

        res.json({ success: true, message: 'Request rejected successfully' });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// 7. GET PAYROLL REPORTS WITH FILTERS
router.get('/payroll-reports', async (req, res) => {
    try {
        const { search, startDate, endDate, status } = req.query;

        let query = `
            SELECT * FROM Payroll 
            WHERE status IN ('Released', 'Completed', 'Paid')
        `;

        const params = [];

        if (startDate && endDate) {
            query += ` AND pay_date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY pay_date DESC LIMIT 100`;

        const [reports] = await payrollDB.query(query, params);

        // Enrich with employee data
        const enrichedReports = await Promise.all(reports.map(async (report) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name
                     FROM employees WHERE employee_id = ?`,
                    [report.employee_id]
                );

                return {
                    ...report,
                    employee_name: empRows[0]?.employee_name || `Employee ${report.employee_id}`
                };
            } catch (_err) {
                return {
                    ...report,
                    employee_name: `Employee ${report.employee_id}`
                };
            }
        }));

        // Filter by search
        let results = enrichedReports;
        if (search) {
            results = enrichedReports.filter(r =>
                r.employee_name.toLowerCase().includes(search.toLowerCase()) ||
                r.payslip_reference_number?.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// 8. GET DEPARTMENTS (for filters)
router.get('/departments', async (req, res) => {
    try {
        const [departments] = await hrDB.query(
            'SELECT DISTINCT department_name FROM Departments ORDER BY department_name'
        );
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

// 9. GET POSITIONS (for filters)
router.get('/positions', async (req, res) => {
    try {
        const [positions] = await hrDB.query(
            'SELECT DISTINCT position_title FROM Positions ORDER BY position_title'
        );
        res.json(positions);
    } catch (error) {
        console.error('Error fetching positions:', error);
        res.status(500).json({ error: 'Failed to fetch positions' });
    }
});

// 10. GENERATE PAYSLIP PDF
router.get('/payslip/:payrollId', async (req, res) => {
    const { payrollId } = req.params;

    try {
        const [payroll] = await payrollDB.query(
            'SELECT * FROM Payroll WHERE payroll_id = ?',
            [payrollId]
        );

        if (payroll.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        const [employee] = await hrDB.query(
            `SELECT 
                e.*,
                p.position_title,
                d.department_name
             FROM employees e
             LEFT JOIN Positions p ON e.position_id = p.position_id
             LEFT JOIN Departments d ON e.department_id = d.department_id
             WHERE e.employee_id = ?`,
            [payroll[0].employee_id]
        );

        res.json({
            payroll: payroll[0],
            employee: employee[0] || null
        });
    } catch (error) {
        console.error('Error generating payslip:', error);
        res.status(500).json({ error: 'Failed to generate payslip' });
    }
});

export default router;