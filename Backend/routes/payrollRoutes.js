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
        
        // Get request details first
        const [requestDetails] = await payrollDB.query(
            `SELECT employee_id, request_type FROM Requests WHERE request_id = ?`,
            [id]
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Approved', approved_by = ?, remarks = ?, updated_at = NOW()
             WHERE request_id = ?`,
            [approved_by, remarks || 'Approved', id]
        );

        // Log activity
        if (result.affectedRows > 0 && requestDetails.length > 0) {
            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['APPROVE', 'Request', id, requestDetails[0].employee_id, approved_by, 
                 `${requestDetails[0].request_type} request approved`]
            );
        }

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
        
        // Get request details first
        const [requestDetails] = await payrollDB.query(
            `SELECT employee_id, request_type FROM Requests WHERE request_id = ?`,
            [id]
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Rejected', approved_by = ?, remarks = ?, updated_at = NOW()
             WHERE request_id = ?`,
            [approved_by, remarks || 'Rejected', id]
        );

        // Log activity
        if (result.affectedRows > 0 && requestDetails.length > 0) {
            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['REJECT', 'Request', id, requestDetails[0].employee_id, approved_by, 
                 `${requestDetails[0].request_type} request rejected: ${remarks || 'No reason provided'}`]
            );
        }

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
        // Get recent activities from ActivityLogs table
        const [activityLogs] = await payrollDB.query(`
            SELECT 
                log_id,
                action_type,
                entity_type,
                entity_id,
                employee_id,
                processed_by,
                description,
                created_at
            FROM ActivityLogs
            ORDER BY created_at DESC
            LIMIT 10
        `);

        // Enrich with employee and processor names
        const enrichedActivities = await Promise.all(activityLogs.map(async (log) => {
            let employeeName = `Employee ${log.employee_id}`;
            let processedByName = 'System';

            try {
                // Get employee name
                if (log.employee_id) {
                    const [empRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as employee_name
                         FROM employees WHERE employee_id = ?`,
                        [log.employee_id]
                    );
                    employeeName = empRows[0]?.employee_name || employeeName;
                }

                // Get processor name
                if (log.processed_by) {
                    const [procRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as processor_name
                         FROM employees WHERE employee_id = ?`,
                        [log.processed_by]
                    );
                    processedByName = procRows[0]?.processor_name || `User ${log.processed_by}`;
                }
            } catch (_err) {
                console.error('Error enriching activity log:', _err);
            }

            // Determine status based on action_type
            let status = 'Completed';
            if (log.action_type.includes('APPROVE')) status = 'Approved';
            else if (log.action_type.includes('REJECT')) status = 'Rejected';
            else if (log.action_type.includes('PROCESS')) status = 'Processed';
            else if (log.action_type.includes('RELEASE')) status = 'Released';

            return {
                type: log.entity_type?.toLowerCase() || 'activity',
                title: `${log.entity_type || 'Activity'} ${log.action_type.replace(/_/g, ' ').toLowerCase()}`,
                description: log.description || `${employeeName} - ${log.action_type}`,
                status: status,
                date: log.created_at,
                processedBy: processedByName,
                processedAt: new Date(log.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
        }));

        // If no activity logs, fall back to recent payroll/requests
        if (enrichedActivities.length === 0) {
            // Fallback to recent requests
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

            const fallbackActivities = await Promise.all(recentRequests.map(async (req) => {
                try {
                    const [empRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as employee_name
                         FROM employees WHERE employee_id = ?`,
                        [req.employee_id]
                    );
                    return {
                        type: 'request',
                        title: `${req.type} Request`,
                        description: `${empRows[0]?.employee_name || `Employee ${req.employee_id}`} - ${req.description}`,
                        status: req.status,
                        date: req.date_filed,
                        processedBy: 'System',
                        processedAt: new Date(req.date_filed).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })
                    };
                } catch (_err) {
                    return {
                        type: 'request',
                        title: `${req.type} Request`,
                        description: `Employee ${req.employee_id} - ${req.description}`,
                        status: req.status,
                        date: req.date_filed,
                        processedBy: 'System',
                        processedAt: new Date(req.date_filed).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })
                    };
                }
            }));

            return res.json(fallbackActivities);
        }

        res.json(enrichedActivities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
});

// 15. APPROVE PAYSLIP
router.put('/payroll/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { approved_by } = req.body;
    
    try {
        console.log(`📝 Approving payslip ID: ${id}`);
        
        // Get payroll details first
        const [payrollDetails] = await payrollDB.query(
            `SELECT employee_id FROM Payroll WHERE payroll_id = ?`,
            [id]
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Payroll SET status = 'Approved', updated_at = NOW() WHERE payroll_id = ?`,
            [id]
        );
        
        // Log activity
        if (result.affectedRows > 0 && payrollDetails.length > 0) {
            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['APPROVE', 'Payroll', id, payrollDetails[0].employee_id, approved_by || null, 
                 `Payslip approved for Employee ID ${payrollDetails[0].employee_id}`]
            );
        }
        
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
    const { comments, rejected_by } = req.body;
    
    try {
        console.log(`📝 Rejecting payslip ID: ${id} with reason: ${comments}`);
        
        // Get payroll details first
        const [payrollDetails] = await payrollDB.query(
            `SELECT employee_id FROM Payroll WHERE payroll_id = ?`,
            [id]
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Payroll SET status = 'Rejected', comments = ?, updated_at = NOW() WHERE payroll_id = ?`,
            [comments || 'Rejected', id]
        );
        
        // Log activity
        if (result.affectedRows > 0 && payrollDetails.length > 0) {
            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['REJECT', 'Payroll', id, payrollDetails[0].employee_id, rejected_by || null, 
                 `Payslip rejected: ${comments || 'No reason provided'}`]
            );
        }
        
        console.log(`✅ Payslip ${id} rejected. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Payslip rejected successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error rejecting payslip:', error);
        res.status(500).json({ error: 'Failed to reject payslip', details: error.message });
    }
});

// 17. RELEASE PAYOUTS (bulk) - Must be before /:id routes
router.put('/payroll-release', async (req, res) => {
    const { payrollIds, released_by } = req.body;
    
    try {
        console.log(`📝 Releasing payouts for IDs: ${payrollIds}`);
        if (!payrollIds || payrollIds.length === 0) {
            return res.status(400).json({ error: 'No payroll IDs provided' });
        }
        
        // Get payroll details first for logging
        const placeholders = payrollIds.map(() => '?').join(',');
        const [payrollDetails] = await payrollDB.query(
            `SELECT payroll_id, employee_id FROM Payroll WHERE payroll_id IN (${placeholders})`,
            payrollIds
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Payroll SET status = 'Released', updated_at = NOW() WHERE payroll_id IN (${placeholders}) AND status = 'Approved'`,
            payrollIds
        );
        
        // Log activity for each released payroll
        if (result.affectedRows > 0) {
            for (const payroll of payrollDetails) {
                await payrollDB.query(
                    `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    ['RELEASE', 'Payroll', payroll.payroll_id, payroll.employee_id, released_by || null, 
                     `Payroll released for Employee ID ${payroll.employee_id}`]
                );
            }
        }
        
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
        
        // Log activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['CREATE', 'Payroll', result.insertId, employee_id, prepared_by, 
             `Payroll record created for Employee ID ${employee_id}`]
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

// =====================================================
// SALARY CALCULATION ENDPOINTS
// =====================================================

// Helper function: Calculate SSS contribution based on 2024 table
function calculateSSS(monthlySalary) {
    const sssTable = [
        { min: 0, max: 4249.99, ee: 180 },
        { min: 4250, max: 4749.99, ee: 202.50 },
        { min: 4750, max: 5249.99, ee: 225 },
        { min: 5250, max: 5749.99, ee: 247.50 },
        { min: 5750, max: 6249.99, ee: 270 },
        { min: 6250, max: 6749.99, ee: 292.50 },
        { min: 6750, max: 7249.99, ee: 315 },
        { min: 7250, max: 7749.99, ee: 337.50 },
        { min: 7750, max: 8249.99, ee: 360 },
        { min: 8250, max: 8749.99, ee: 382.50 },
        { min: 8750, max: 9249.99, ee: 405 },
        { min: 9250, max: 9749.99, ee: 427.50 },
        { min: 9750, max: 10249.99, ee: 450 },
        { min: 10250, max: 10749.99, ee: 472.50 },
        { min: 10750, max: 11249.99, ee: 495 },
        { min: 11250, max: 11749.99, ee: 517.50 },
        { min: 11750, max: 12249.99, ee: 540 },
        { min: 12250, max: 12749.99, ee: 562.50 },
        { min: 12750, max: 13249.99, ee: 585 },
        { min: 13250, max: 13749.99, ee: 607.50 },
        { min: 13750, max: 14249.99, ee: 630 },
        { min: 14250, max: 14749.99, ee: 652.50 },
        { min: 14750, max: 15249.99, ee: 675 },
        { min: 15250, max: 15749.99, ee: 697.50 },
        { min: 15750, max: 16249.99, ee: 720 },
        { min: 16250, max: 16749.99, ee: 742.50 },
        { min: 16750, max: 17249.99, ee: 765 },
        { min: 17250, max: 17749.99, ee: 787.50 },
        { min: 17750, max: 18249.99, ee: 810 },
        { min: 18250, max: 18749.99, ee: 832.50 },
        { min: 18750, max: 19249.99, ee: 855 },
        { min: 19250, max: 19749.99, ee: 877.50 },
        { min: 19750, max: 20249.99, ee: 900 },
        { min: 20250, max: 20749.99, ee: 922.50 },
        { min: 20750, max: 21249.99, ee: 945 },
        { min: 21250, max: 21749.99, ee: 967.50 },
        { min: 21750, max: 22249.99, ee: 990 },
        { min: 22250, max: 22749.99, ee: 1012.50 },
        { min: 22750, max: 23249.99, ee: 1035 },
        { min: 23250, max: 23749.99, ee: 1057.50 },
        { min: 23750, max: 24249.99, ee: 1080 },
        { min: 24250, max: 24749.99, ee: 1102.50 },
        { min: 24750, max: 29999.99, ee: 1125 },
        { min: 30000, max: Infinity, ee: 1350 }
    ];
    
    const bracket = sssTable.find(b => monthlySalary >= b.min && monthlySalary <= b.max);
    return bracket ? bracket.ee : 1350; // Max contribution
}

// Helper function: Calculate PhilHealth contribution (2024 rate: 5% of salary, employee pays half)
function calculatePhilHealth(monthlySalary) {
    const rate = 0.05; // 5% total
    const contribution = monthlySalary * rate;
    const employeeShare = contribution / 2; // Employee pays half
    
    // PhilHealth has min and max limits
    const minContribution = 500 / 2; // Minimum monthly
    const maxContribution = 5000 / 2; // Maximum monthly (for salaries > 100,000)
    
    return Math.min(Math.max(employeeShare, minContribution), maxContribution);
}

// Helper function: Calculate Pag-IBIG contribution
function calculatePagIBIG(monthlySalary) {
    if (monthlySalary <= 1500) {
        return monthlySalary * 0.01; // 1% for salaries <= 1500
    } else if (monthlySalary > 1500 && monthlySalary <= 5000) {
        return monthlySalary * 0.02; // 2% for salaries 1501-5000
    } else {
        return 200; // Max contribution is 200 for salaries > 5000
    }
}

// Helper function: Calculate withholding tax based on BIR 2024 tax table (monthly)
function calculateWithholdingTax(taxableIncome) {
    // BIR Tax Table for monthly income (effective 2024)
    if (taxableIncome <= 20833) {
        return 0;
    } else if (taxableIncome <= 33332) {
        return (taxableIncome - 20833) * 0.15;
    } else if (taxableIncome <= 66666) {
        return 1875 + (taxableIncome - 33332) * 0.20;
    } else if (taxableIncome <= 166666) {
        return 8541.67 + (taxableIncome - 66666) * 0.25;
    } else if (taxableIncome <= 666666) {
        return 33541.67 + (taxableIncome - 166666) * 0.30;
    } else {
        return 183541.67 + (taxableIncome - 666666) * 0.35;
    }
}

// 22. GET APPROVED TIMESHEETS FOR PAYROLL CALCULATION
router.get('/timesheets-for-payroll', async (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    try {
        console.log(`📅 Fetching timesheets from ${startDate} to ${endDate}`);
        
        // Get approved timesheets for the period
        const [timesheets] = await payrollDB.query(`
            SELECT 
                employee_id,
                date,
                time_in,
                time_out,
                break_duration,
                overtime_hours,
                remarks
            FROM Timesheets
            WHERE date BETWEEN ? AND ?
            AND (remarks = 'Approved' OR remarks = 'Regular' OR remarks = 'Overtime' OR approved_by IS NOT NULL)
            ORDER BY employee_id, date
        `, [startDate, endDate]);
        
        console.log(`📋 Found ${timesheets.length} approved timesheets`);
        
        // Group timesheets by employee
        const employeeTimesheets = {};
        timesheets.forEach(ts => {
            if (!employeeTimesheets[ts.employee_id]) {
                employeeTimesheets[ts.employee_id] = [];
            }
            employeeTimesheets[ts.employee_id].push(ts);
        });
        
        // Calculate hours for each employee
        const employeeSummaries = [];
        
        for (const [employeeId, sheets] of Object.entries(employeeTimesheets)) {
            let totalRegularHours = 0;
            let totalOvertimeHours = 0;
            let daysWorked = sheets.length;
            
            sheets.forEach(ts => {
                // Calculate hours worked
                const timeIn = new Date(`2000-01-01 ${ts.time_in}`);
                const timeOut = new Date(`2000-01-01 ${ts.time_out}`);
                let hoursWorked = (timeOut - timeIn) / (1000 * 60 * 60); // Convert to hours
                
                // Subtract break duration
                const breakHours = parseFloat(ts.break_duration) || 1;
                hoursWorked -= breakHours;
                
                // Regular hours capped at 8, rest is overtime
                const regularHours = Math.min(hoursWorked, 8);
                const overtimeHours = Math.max(hoursWorked - 8, 0) + (parseFloat(ts.overtime_hours) || 0);
                
                totalRegularHours += regularHours;
                totalOvertimeHours += overtimeHours;
            });
            
            // Get employee details from HR
            try {
                const [empDetails] = await hrDB.query(`
                    SELECT 
                        e.employee_id,
                        e.employee_number,
                        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                        e.email_address,
                        p.position_title as position,
                        d.department_name as department
                    FROM employees e
                    LEFT JOIN Positions p ON e.position_id = p.position_id
                    LEFT JOIN Departments d ON e.department_id = d.department_id
                    WHERE e.employee_id = ?
                `, [employeeId]);
                
                // Get salary details
                const [salaryDetails] = await payrollDB.query(`
                    SELECT basic_rate, overtime_rate
                    FROM SalaryDetails
                    WHERE employee_id = ?
                `, [employeeId]);
                
                const basicRate = salaryDetails[0]?.basic_rate || 0;
                const overtimeRate = salaryDetails[0]?.overtime_rate || (basicRate / 22 / 8 * 1.25);
                
                employeeSummaries.push({
                    employeeId: parseInt(employeeId),
                    employeeNumber: empDetails[0]?.employee_number || `EMP-${employeeId}`,
                    employeeName: empDetails[0]?.employee_name || `Employee ${employeeId}`,
                    email: empDetails[0]?.email_address || '',
                    position: empDetails[0]?.position || 'N/A',
                    department: empDetails[0]?.department || 'N/A',
                    daysWorked,
                    totalRegularHours: Math.round(totalRegularHours * 100) / 100,
                    totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
                    basicRate: parseFloat(basicRate),
                    overtimeRate: parseFloat(overtimeRate),
                    timesheets: sheets
                });
            } catch (err) {
                console.error(`Error getting employee ${employeeId} details:`, err);
                employeeSummaries.push({
                    employeeId: parseInt(employeeId),
                    employeeNumber: `EMP-${employeeId}`,
                    employeeName: `Employee ${employeeId}`,
                    email: '',
                    position: 'N/A',
                    department: 'N/A',
                    daysWorked,
                    totalRegularHours: Math.round(totalRegularHours * 100) / 100,
                    totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
                    basicRate: 0,
                    overtimeRate: 0,
                    timesheets: sheets
                });
            }
        }
        
        res.json(employeeSummaries);
    } catch (error) {
        console.error('Error fetching timesheets for payroll:', error);
        res.status(500).json({ error: 'Failed to fetch timesheets', details: error.message });
    }
});

// 23. CALCULATE PAYROLL FOR EMPLOYEES
router.post('/calculate-payroll', async (req, res) => {
    const { employees, cutoffStartDate, cutoffEndDate, payDate, preparedBy } = req.body;
    
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
        return res.status(400).json({ error: 'No employees provided for payroll calculation' });
    }
    
    try {
        console.log(`💰 Calculating payroll for ${employees.length} employees`);
        
        const calculatedPayrolls = [];
        
        for (const emp of employees) {
            const { employeeId, totalRegularHours, totalOvertimeHours, basicRate, overtimeRate } = emp;
            
            // Calculate basic pay based on hours worked
            // If basicRate is monthly, convert to hourly: monthly / 22 days / 8 hours
            const hourlyRate = basicRate / 22 / 8;
            const basicPay = totalRegularHours * hourlyRate;
            
            // Calculate overtime pay (1.25x for regular overtime)
            const overtimePay = totalOvertimeHours * (overtimeRate || hourlyRate * 1.25);
            
            // Gross pay
            const grossPay = basicPay + overtimePay;
            
            // Calculate deductions based on monthly equivalent
            // For bi-monthly, we calculate based on half-month
            const monthlyEquivalent = grossPay * 2; // Estimate monthly for deduction calculation
            
            const sssContribution = calculateSSS(monthlyEquivalent) / 2; // Half for bi-monthly
            const philhealthContribution = calculatePhilHealth(monthlyEquivalent) / 2;
            const pagibigContribution = calculatePagIBIG(monthlyEquivalent) / 2;
            
            // Calculate taxable income (gross - mandatory contributions)
            const mandatoryDeductions = sssContribution + philhealthContribution + pagibigContribution;
            const taxableIncome = (grossPay - mandatoryDeductions) * 2; // Monthly equivalent for tax
            const withholdingTax = calculateWithholdingTax(taxableIncome) / 2; // Half for bi-monthly
            
            // Total deductions
            const totalDeductions = mandatoryDeductions + withholdingTax;
            
            // Net pay
            const netPay = grossPay - totalDeductions;
            
            calculatedPayrolls.push({
                employeeId,
                employeeName: emp.employeeName,
                employeeNumber: emp.employeeNumber,
                email: emp.email,
                position: emp.position,
                department: emp.department,
                daysWorked: emp.daysWorked,
                regularHours: totalRegularHours,
                overtimeHours: totalOvertimeHours,
                basicPay: Math.round(basicPay * 100) / 100,
                overtimePay: Math.round(overtimePay * 100) / 100,
                grossPay: Math.round(grossPay * 100) / 100,
                deductions: {
                    sss: Math.round(sssContribution * 100) / 100,
                    philhealth: Math.round(philhealthContribution * 100) / 100,
                    pagibig: Math.round(pagibigContribution * 100) / 100,
                    tax: Math.round(withholdingTax * 100) / 100,
                    total: Math.round(totalDeductions * 100) / 100
                },
                netPay: Math.round(netPay * 100) / 100,
                cutoffStartDate,
                cutoffEndDate,
                payDate
            });
        }
        
        console.log(`✅ Calculated payroll for ${calculatedPayrolls.length} employees`);
        res.json(calculatedPayrolls);
    } catch (error) {
        console.error('Error calculating payroll:', error);
        res.status(500).json({ error: 'Failed to calculate payroll', details: error.message });
    }
});

// 24. SAVE CALCULATED PAYROLL TO DATABASE
router.post('/save-payroll-batch', async (req, res) => {
    const { payrolls, preparedBy } = req.body;
    
    if (!payrolls || !Array.isArray(payrolls) || payrolls.length === 0) {
        return res.status(400).json({ error: 'No payroll data provided' });
    }
    
    try {
        console.log(`💾 Saving ${payrolls.length} payroll records`);
        
        const savedPayrolls = [];
        
        for (const payroll of payrolls) {
            // Generate reference number
            const refNum = `PAY-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
            
            // Insert payroll record
            const [result] = await payrollDB.query(`
                INSERT INTO Payroll 
                (employee_id, cutoff_start_date, cutoff_end_date, pay_date, payroll_frequency, 
                 prepared_by, basic_pay, overtime_pay, bonuses, deductions, net_pay, status, payslip_reference_number)
                VALUES (?, ?, ?, ?, 'Bi-Monthly', ?, ?, ?, 0, ?, ?, 'Pending', ?)
            `, [
                payroll.employeeId,
                payroll.cutoffStartDate,
                payroll.cutoffEndDate,
                payroll.payDate,
                preparedBy || null,
                payroll.basicPay,
                payroll.overtimePay,
                payroll.deductions.total,
                payroll.netPay,
                refNum
            ]);
            
            const payrollId = result.insertId;
            
            // Insert tax contributions
            await payrollDB.query(`
                INSERT INTO TaxContributions 
                (payroll_id, employee_id, sss_contribution, philhealth_contribution, pagibig_contribution, withholding_tax, total_contributions)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                payrollId,
                payroll.employeeId,
                payroll.deductions.sss,
                payroll.deductions.philhealth,
                payroll.deductions.pagibig,
                payroll.deductions.tax,
                payroll.deductions.total
            ]);
            
            // Log activity
            await payrollDB.query(`
                INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                VALUES ('CREATE', 'Payroll', ?, ?, ?, ?)
            `, [payrollId, payroll.employeeId, preparedBy, `Payroll calculated for ${payroll.employeeName}`]);
            
            savedPayrolls.push({
                ...payroll,
                payrollId,
                referenceNumber: refNum
            });
        }
        
        console.log(`✅ Saved ${savedPayrolls.length} payroll records`);
        res.json({ success: true, savedPayrolls });
    } catch (error) {
        console.error('Error saving payroll batch:', error);
        res.status(500).json({ error: 'Failed to save payroll', details: error.message });
    }
});

// 25. GET SALARY DETAILS FOR AN EMPLOYEE
router.get('/salary-details/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    
    try {
        const [salaryDetails] = await payrollDB.query(`
            SELECT * FROM SalaryDetails WHERE employee_id = ?
        `, [employeeId]);
        
        if (salaryDetails.length === 0) {
            return res.status(404).json({ error: 'Salary details not found' });
        }
        
        res.json(salaryDetails[0]);
    } catch (error) {
        console.error('Error fetching salary details:', error);
        res.status(500).json({ error: 'Failed to fetch salary details', details: error.message });
    }
});

// 26. UPDATE SALARY DETAILS
router.put('/salary-details/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions } = req.body;
    
    try {
        // Check if record exists
        const [existing] = await payrollDB.query(`
            SELECT * FROM SalaryDetails WHERE employee_id = ?
        `, [employeeId]);
        
        if (existing.length === 0) {
            // Insert new record
            await payrollDB.query(`
                INSERT INTO SalaryDetails (employee_id, basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [employeeId, basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions]);
        } else {
            // Update existing record
            await payrollDB.query(`
                UPDATE SalaryDetails 
                SET basic_rate = COALESCE(?, basic_rate),
                    overtime_rate = COALESCE(?, overtime_rate),
                    holiday_rate = COALESCE(?, holiday_rate),
                    loan_deductions = COALESCE(?, loan_deductions),
                    other_deductions = COALESCE(?, other_deductions)
                WHERE employee_id = ?
            `, [basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions, employeeId]);
        }
        
        res.json({ success: true, message: 'Salary details updated successfully' });
    } catch (error) {
        console.error('Error updating salary details:', error);
        res.status(500).json({ error: 'Failed to update salary details', details: error.message });
    }
});

// 27. GET ALL EMPLOYEES WITH SALARY DETAILS (for payroll processing)
router.get('/employees-with-salary', async (req, res) => {
    try {
        // Get all active employees from HR
        const [employees] = await hrDB.query(`
            SELECT 
                e.employee_id,
                e.employee_number,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.email_address,
                p.position_title as position,
                d.department_name as department
            FROM employees e
            LEFT JOIN Positions p ON e.position_id = p.position_id
            LEFT JOIN Departments d ON e.department_id = d.department_id
            WHERE e.employment_status = 'Active'
            ORDER BY e.employee_id
        `);
        
        // Enrich with salary details
        const enrichedEmployees = await Promise.all(employees.map(async (emp) => {
            try {
                const [salaryDetails] = await payrollDB.query(`
                    SELECT basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions
                    FROM SalaryDetails WHERE employee_id = ?
                `, [emp.employee_id]);
                
                return {
                    ...emp,
                    basicRate: salaryDetails[0]?.basic_rate || 0,
                    overtimeRate: salaryDetails[0]?.overtime_rate || 0,
                    holidayRate: salaryDetails[0]?.holiday_rate || 0,
                    loanDeductions: salaryDetails[0]?.loan_deductions || 0,
                    otherDeductions: salaryDetails[0]?.other_deductions || 0
                };
            } catch (err) {
                return {
                    ...emp,
                    basicRate: 0,
                    overtimeRate: 0,
                    holidayRate: 0,
                    loanDeductions: 0,
                    otherDeductions: 0
                };
            }
        }));
        
        res.json(enrichedEmployees);
    } catch (error) {
        console.error('Error fetching employees with salary:', error);
        res.status(500).json({ error: 'Failed to fetch employees', details: error.message });
    }
});

// 28. GET DETAILED ACTIVITY LOGS FOR REPORTS
router.get('/detailed-activity-logs', async (req, res) => {
    try {
        const { limit = 50, entityType, actionType, startDate, endDate } = req.query;
        
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
        
        if (entityType) {
            query += ` AND entity_type = ?`;
            params.push(entityType);
        }
        
        if (actionType) {
            query += ` AND action_type LIKE ?`;
            params.push(`%${actionType}%`);
        }
        
        if (startDate && endDate) {
            query += ` AND DATE(created_at) BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }
        
        query += ` ORDER BY created_at DESC LIMIT ?`;
        params.push(parseInt(limit));
        
        const [activityLogs] = await payrollDB.query(query, params);
        
        // Enrich with employee and processor names
        const enrichedActivities = await Promise.all(activityLogs.map(async (log) => {
            let employeeName = log.employee_id ? `Employee ${log.employee_id}` : 'N/A';
            let processedByName = 'System';
            
            try {
                // Get employee name
                if (log.employee_id) {
                    const [empRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as employee_name
                         FROM employees WHERE employee_id = ?`,
                        [log.employee_id]
                    );
                    employeeName = empRows[0]?.employee_name || employeeName;
                }
                
                // Get processor name
                if (log.processed_by) {
                    const [procRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as processor_name
                         FROM employees WHERE employee_id = ?`,
                        [log.processed_by]
                    );
                    processedByName = procRows[0]?.processor_name || `User ${log.processed_by}`;
                }
            } catch (_err) {
                console.error('Error enriching activity log:', _err);
            }
            
            // Determine status based on action_type
            let status = 'Completed';
            const actionUpper = log.action_type.toUpperCase();
            if (actionUpper.includes('APPROVE') || actionUpper === 'APPROVED') status = 'Approved';
            else if (actionUpper.includes('REJECT') || actionUpper === 'REJECTED') status = 'Rejected';
            else if (actionUpper.includes('PROCESS') || actionUpper === 'PROCESSED') status = 'Processed';
            else if (actionUpper.includes('RELEASE') || actionUpper === 'RELEASED') status = 'Released';
            else if (actionUpper.includes('CREATE') || actionUpper === 'CREATED') status = 'Created';
            else if (actionUpper.includes('UPDATE') || actionUpper === 'UPDATED') status = 'Updated';
            else if (actionUpper.includes('DELETE') || actionUpper === 'DELETED') status = 'Deleted';
            
            return {
                id: log.log_id,
                actionType: log.action_type,
                entityType: log.entity_type,
                entityId: log.entity_id,
                employeeId: log.employee_id,
                employeeName: employeeName,
                processedById: log.processed_by,
                processedByName: processedByName,
                description: log.description,
                status: status,
                oldValues: log.old_values,
                newValues: log.new_values,
                createdAt: log.created_at,
                formattedDate: new Date(log.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                formattedTime: new Date(log.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                formattedDateTime: new Date(log.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
        }));
        
        res.json(enrichedActivities);
    } catch (error) {
        console.error('Error fetching detailed activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs', details: error.message });
    }
});

export default router;