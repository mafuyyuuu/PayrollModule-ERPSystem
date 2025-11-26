/* eslint-disable no-unused-vars */
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

        query += ` ORDER BY COALESCE(p.updated_at, p.pay_date) DESC, p.pay_date DESC, p.employee_id`;

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
        const { search, type, status, showAll } = req.query;

        // If showAll is true, show all requests regardless of status
        // Otherwise default to showing Pending requests only
        let query = `SELECT * FROM Requests`;
        const params = [];

        if (!showAll) {
            query += ` WHERE status = ?`;
            params.push(status || 'Pending');
        }

        if (type) {
            query += params.length > 0 ? ` AND request_type = ?` : ` WHERE request_type = ?`;
            params.push(type);
        }

        query += ` ORDER BY COALESCE(updated_at, date_filed) DESC, date_filed DESC`;

        const [requests] = await payrollDB.query(query, params);
        console.log(`📋 Found ${requests.length} requests`);

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
        console.log(`📝 Approving request ID: ${id}`);
        const [result] = await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Approved', approved_by = ?, remarks = ?
             WHERE request_id = ?`,
            [approved_by, remarks || 'Approved', id]
        );

        console.log(`✅ Request ${id} approved. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Request approved successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Failed to approve request', details: error.message });
    }
});

// 6. REJECT REQUEST
router.put('/pending-requests/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { approved_by, remarks } = req.body;

    try {
        console.log(`📝 Rejecting request ID: ${id}`);
        const [result] = await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Rejected', approved_by = ?, remarks = ?
             WHERE request_id = ?`,
            [approved_by, remarks || 'Rejected', id]
        );

        console.log(`✅ Request ${id} rejected. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Request rejected successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request', details: error.message });
    }
});

// 7. GET PAYROLL REPORTS WITH FILTERS
router.get('/payroll-reports', async (req, res) => {
    try {
        const { search, startDate, endDate, status } = req.query;

        // Query all payroll records with preparer info
        let query = `
            SELECT
                p.*,
                u.username as prepared_by_name
            FROM Payroll p
            LEFT JOIN UserAccounts u ON p.prepared_by = u.user_id
            WHERE 1=1
        `;

        const params = [];

        // Add Date Filters
        if (startDate && endDate) {
            query += ` AND p.pay_date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        // Add Specific Status Filter
        if (status && status !== 'all') {
            query += ` AND p.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY COALESCE(p.updated_at, p.pay_date) DESC, p.pay_date DESC LIMIT 100`;

        const [reports] = await payrollDB.query(query, params);
        console.log(`📊 Found ${reports.length} payroll reports`);

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

// 11. GET TIMELINE DATA FOR DASHBOARD CHART
router.get('/timeline', async (req, res) => {
    try {
        const { days = 90 } = req.query;

        // Get payroll data grouped by pay_date for the timeline
        const [payrollData] = await payrollDB.query(`
            SELECT 
                pay_date as date,
                SUM(net_pay) as payouts,
                SUM(deductions) as deductions,
                COUNT(*) as count
            FROM Payroll
            WHERE pay_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY pay_date
            ORDER BY pay_date ASC
        `, [parseInt(days)]);

        res.json(payrollData);
    } catch (error) {
        console.error('Error fetching timeline data:', error);
        res.status(500).json({ error: 'Failed to fetch timeline data' });
    }
});

// 12. GET TAX CONTRIBUTIONS DATA
router.get('/tax-contributions', async (req, res) => {
    try {
        const { department } = req.query;

        // Get monthly contribution totals from TaxContributions table
        let monthlyQuery = `
            SELECT 
                DATE_FORMAT(MIN(p.pay_date), '%b') as month,
                DATE_FORMAT(MIN(p.pay_date), '%Y-%m') as month_year,
                SUM(tc.sss_contribution) as sss,
                SUM(tc.philhealth_contribution) as philhealth,
                SUM(tc.pagibig_contribution) as pagibig,
                SUM(tc.withholding_tax) as tax,
                SUM(tc.total_contributions) as total_contributions
            FROM TaxContributions tc
            JOIN Payroll p ON tc.payroll_id = p.payroll_id
            WHERE p.pay_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(p.pay_date), MONTH(p.pay_date)
            ORDER BY month_year ASC
        `;

        const [monthlyData] = await payrollDB.query(monthlyQuery);
        console.log(`📊 Monthly tax data: ${monthlyData.length} months`);

        // Get upcoming deadlines with proper status calculation
        const [upcomingDeadlines] = await payrollDB.query(`
            SELECT 
                contribution_type,
                deadline_date,
                CASE 
                    WHEN status = 'Completed' OR status = 'Paid' THEN 'Completed'
                    WHEN deadline_date < CURDATE() THEN 'Overdue'
                    WHEN DATEDIFF(deadline_date, CURDATE()) <= 7 THEN 'Due Soon'
                    ELSE 'Upcoming'
                END as status,
                amount,
                remarks
            FROM ContributionDeadlines
            ORDER BY deadline_date DESC
            LIMIT 10
        `);

        // Get department breakdown - need to join with HR database
        let departmentData = [];
        try {
            // Get all tax contributions with employee IDs
            const [taxByEmployee] = await payrollDB.query(`
                SELECT 
                    tc.employee_id,
                    SUM(tc.sss_contribution) as sss,
                    SUM(tc.philhealth_contribution) as philhealth,
                    SUM(tc.pagibig_contribution) as pagibig,
                    SUM(tc.withholding_tax) as tax
                FROM TaxContributions tc
                JOIN Payroll p ON tc.payroll_id = p.payroll_id
                WHERE p.pay_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                GROUP BY tc.employee_id
            `);

            // Get department for each employee from HR DB
            const empDeptMap = {};
            for (const emp of taxByEmployee) {
                try {
                    const [deptRows] = await hrDB.query(
                        `SELECT d.department_name as department
                         FROM employees e
                         LEFT JOIN Departments d ON e.department_id = d.department_id
                         WHERE e.employee_id = ?`,
                        [emp.employee_id]
                    );
                    empDeptMap[emp.employee_id] = deptRows[0]?.department || 'Unknown';
                } catch (_err) {
                    empDeptMap[emp.employee_id] = 'Unknown';
                }
            }

            // Aggregate by department
            const deptTotals = {};
            for (const emp of taxByEmployee) {
                const dept = empDeptMap[emp.employee_id];
                if (!deptTotals[dept]) {
                    deptTotals[dept] = { name: dept, sss: 0, philhealth: 0, pagibig: 0, tax: 0 };
                }
                deptTotals[dept].sss += parseFloat(emp.sss) || 0;
                deptTotals[dept].philhealth += parseFloat(emp.philhealth) || 0;
                deptTotals[dept].pagibig += parseFloat(emp.pagibig) || 0;
                deptTotals[dept].tax += parseFloat(emp.tax) || 0;
            }

            departmentData = Object.values(deptTotals);

            // Filter by department if specified
            if (department) {
                departmentData = departmentData.filter(d => 
                    d.name.toLowerCase().includes(department.toLowerCase())
                );
            }
        } catch (hrErr) {
            console.log('⚠️ Could not fetch department data from HR:', hrErr.message);
            // Use fallback data
            departmentData = [
                { name: 'Finance', sss: 1600, philhealth: 850, pagibig: 400, tax: 1500 },
                { name: 'HR', sss: 1500, philhealth: 850, pagibig: 350, tax: 1050 },
                { name: 'IT', sss: 800, philhealth: 400, pagibig: 200, tax: 750 },
            ];
        }

        // Get summary data
        const [summaryData] = await payrollDB.query(`
            SELECT 
                SUM(sss_contribution) as total_sss,
                SUM(philhealth_contribution) as total_philhealth,
                SUM(pagibig_contribution) as total_pagibig,
                SUM(withholding_tax) as total_tax,
                SUM(total_contributions) as grand_total
            FROM TaxContributions
        `);

        res.json({
            monthlyData,
            upcomingDeadlines,
            departmentData,
            summaryData: summaryData[0] || {}
        });
    } catch (error) {
        console.error('Error fetching tax contributions:', error);
        res.status(500).json({ error: 'Failed to fetch tax contributions' });
    }
});

// 13. GET CUTOFF PERIODS
router.get('/cutoffs', async (req, res) => {
    try {
        const [cutoffs] = await payrollDB.query(`
            SELECT 
                cutoff_id,
                period_name,
                cutoff_start_date,
                cutoff_end_date,
                pay_date,
                frequency,
                status,
                (SELECT SUM(net_pay) FROM Payroll 
                 WHERE cutoff_start_date = pc.cutoff_start_date 
                 AND cutoff_end_date = pc.cutoff_end_date) as total_amount
            FROM PayrollCutoffs pc
            ORDER BY cutoff_start_date DESC
        `);

        res.json(cutoffs);
    } catch (error) {
        console.error('Error fetching cutoffs:', error);
        res.status(500).json({ error: 'Failed to fetch cutoff periods' });
    }
});

// 14. GET RECENT ACTIVITY FOR DASHBOARD
router.get('/recent-activity', async (req, res) => {
    try {
        // Get recent requests
        const [recentRequests] = await payrollDB.query(`
            SELECT 
                request_id,
                request_type as type,
                request_description as description,
                date_filed,
                status,
                employee_id
            FROM Requests
            ORDER BY date_filed DESC
            LIMIT 5
        `);

        // Enrich with employee names
        const enrichedRequests = await Promise.all(recentRequests.map(async (req) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name
                     FROM employees WHERE employee_id = ?`,
                    [req.employee_id]
                );
                return {
                    ...req,
                    employee_name: empRows[0]?.employee_name || `Employee ${req.employee_id}`,
                    title: `${req.type} Request`
                };
            } catch (_err) {
                return {
                    ...req,
                    employee_name: `Employee ${req.employee_id}`,
                    title: `${req.type} Request`
                };
            }
        }));

        // Get recent payroll activities
        const [recentPayrolls] = await payrollDB.query(`
            SELECT 
                payroll_id,
                cutoff_start_date,
                cutoff_end_date,
                pay_date,
                status,
                employee_id
            FROM Payroll
            ORDER BY pay_date DESC
            LIMIT 3
        `);

        const payrollActivities = recentPayrolls.map(p => ({
            type: 'payroll',
            title: 'Payroll Period',
            description: `${new Date(p.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(p.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            status: p.status,
            date: p.pay_date
        }));

        // Combine and sort by date
        const allActivities = [
            ...enrichedRequests.map(r => ({
                type: 'request',
                title: r.title,
                description: `${r.employee_name} - ${r.description}`,
                status: r.status,
                date: r.date_filed
            })),
            ...payrollActivities
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

        res.json(allActivities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
});

// 15. APPROVE PAYSLIP
router.put('/payroll/:id/approve', async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log(`📝 Approving payslip ID: ${id}`);
        const [result] = await payrollDB.query(
            `UPDATE Payroll SET status = 'Approved' WHERE payroll_id = ?`,
            [id]
        );
        console.log(`✅ Payslip ${id} approved. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Payslip approved successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error approving payslip:', error);
        res.status(500).json({ error: 'Failed to approve payslip', details: error.message });
    }
});

// 16. REJECT PAYSLIP
router.put('/payroll/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { comments } = req.body;
    
    try {
        console.log(`📝 Rejecting payslip ID: ${id} with reason: ${comments}`);
        const [result] = await payrollDB.query(
            `UPDATE Payroll SET status = 'Rejected', comments = ? WHERE payroll_id = ?`,
            [comments || 'Rejected', id]
        );
        console.log(`✅ Payslip ${id} rejected. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Payslip rejected successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error rejecting payslip:', error);
        res.status(500).json({ error: 'Failed to reject payslip', details: error.message });
    }
});

// 17. RELEASE PAYOUTS (bulk) - Must be before /:id routes
router.put('/payroll-release', async (req, res) => {
    const { payrollIds } = req.body;
    
    try {
        console.log(`📝 Releasing payouts for IDs: ${payrollIds}`);
        if (!payrollIds || payrollIds.length === 0) {
            return res.status(400).json({ error: 'No payroll IDs provided' });
        }
        
        // Use placeholders for each ID
        const placeholders = payrollIds.map(() => '?').join(',');
        const [result] = await payrollDB.query(
            `UPDATE Payroll SET status = 'Released' WHERE payroll_id IN (${placeholders}) AND status = 'Approved'`,
            payrollIds
        );
        console.log(`✅ Payouts released. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Payouts released successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error releasing payouts:', error);
        res.status(500).json({ error: 'Failed to release payouts', details: error.message });
    }
});

// 18. CREATE NEW REQUEST
router.post('/requests', async (req, res) => {
    const { employee_id, request_type, request_description } = req.body;
    
    try {
        const [result] = await payrollDB.query(
            `INSERT INTO Requests (employee_id, request_type, request_description, date_filed, status)
             VALUES (?, ?, ?, CURDATE(), 'Pending')`,
            [employee_id, request_type, request_description]
        );
        console.log(`✅ Request created with ID: ${result.insertId}`);
        res.json({ success: true, message: 'Request created successfully', requestId: result.insertId });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create request', details: error.message });
    }
});

// 19. UPDATE PAYROLL RECORD
router.put('/payroll/:id', async (req, res) => {
    const { id } = req.params;
    const { basic_pay, overtime_pay, bonuses, deductions, net_pay, status, comments } = req.body;
    
    try {
        console.log(`📝 Updating payroll ID: ${id}`);
        const [result] = await payrollDB.query(
            `UPDATE Payroll 
             SET basic_pay = COALESCE(?, basic_pay),
                 overtime_pay = COALESCE(?, overtime_pay),
                 bonuses = COALESCE(?, bonuses),
                 deductions = COALESCE(?, deductions),
                 net_pay = COALESCE(?, net_pay),
                 status = COALESCE(?, status),
                 comments = COALESCE(?, comments)
             WHERE payroll_id = ?`,
            [basic_pay, overtime_pay, bonuses, deductions, net_pay, status, comments, id]
        );
        console.log(`✅ Payroll ${id} updated. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Payroll updated successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error updating payroll:', error);
        res.status(500).json({ error: 'Failed to update payroll', details: error.message });
    }
});

// 20. CREATE NEW PAYROLL RECORD
router.post('/payroll', async (req, res) => {
    const { 
        employee_id, cutoff_start_date, cutoff_end_date, pay_date, 
        payroll_frequency, prepared_by, basic_pay, overtime_pay, 
        bonuses, deductions, net_pay 
    } = req.body;
    
    try {
        // Generate payslip reference number
        const refNum = `PAY-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
        
        const [result] = await payrollDB.query(
            `INSERT INTO Payroll 
             (employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency, 
              prepared_by, basic_pay, overtime_pay, bonuses, deductions, net_pay, status, payslip_reference_number)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
            [employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency || 'Bi-Monthly',
             prepared_by, basic_pay, overtime_pay || 0, bonuses || 0, deductions || 0, net_pay, refNum]
        );
        console.log(`✅ Payroll created with ID: ${result.insertId}`);
        res.json({ success: true, message: 'Payroll created successfully', payrollId: result.insertId, referenceNumber: refNum });
    } catch (error) {
        console.error('Error creating payroll:', error);
        res.status(500).json({ error: 'Failed to create payroll', details: error.message });
    }
});

// 21. GET SINGLE PAYROLL RECORD
router.get('/payroll/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [payroll] = await payrollDB.query(
            `SELECT * FROM Payroll WHERE payroll_id = ?`,
            [id]
        );
        
        if (payroll.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }
        
        // Get employee info
        try {
            const [empRows] = await hrDB.query(
                `SELECT 
                    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                    e.email_address,
                    p.position_title as position,
                    d.department_name as department
                 FROM employees e
                 LEFT JOIN Positions p ON e.position_id = p.position_id
                 LEFT JOIN Departments d ON e.department_id = d.department_id
                 WHERE e.employee_id = ?`,
                [payroll[0].employee_id]
            );
            
            res.json({
                ...payroll[0],
                employee_name: empRows[0]?.employee_name || `Employee ${payroll[0].employee_id}`,
                email: empRows[0]?.email_address || '',
                position: empRows[0]?.position || 'N/A',
                department: empRows[0]?.department || 'N/A'
            });
        } catch (_err) {
            res.json({
                ...payroll[0],
                employee_name: `Employee ${payroll[0].employee_id}`,
                position: 'N/A',
                department: 'N/A'
            });
        }
    } catch (error) {
        console.error('Error fetching payroll:', error);
        res.status(500).json({ error: 'Failed to fetch payroll', details: error.message });
    }
});

export default router;