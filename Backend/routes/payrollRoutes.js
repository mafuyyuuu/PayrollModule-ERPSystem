/* eslint-disable no-unused-vars */
import express from 'express';
import { payrollDB, hrDB } from '../db.js';
import nodemailer from 'nodemailer';

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

// 1. GET PAYROLL DASHBOARD STATS
router.get('/dashboard-stats', async (req, res) => {
    try {
        // First get registered employee IDs from our local payroll database
        const [registeredEmployees] = await payrollDB.query(
            `SELECT employee_id FROM UserAccounts WHERE employee_id IS NOT NULL AND role_id = 4`
        );
        const employeeIds = registeredEmployees.map(e => e.employee_id);
        
        let totalCount = 0;
        if (employeeIds.length > 0) {
            const [totalEmployees] = await hrDB.query(
                `SELECT COUNT(*) as count FROM employees WHERE employee_id IN (?)`,
                [employeeIds]
            );
            totalCount = totalEmployees[0]?.count || 0;
        }

        const [processedPayouts] = await payrollDB.query(
            "SELECT COUNT(*) as count FROM Payroll WHERE status IN ('Completed', 'Paid', 'Released')"
        );

        const [pendingPayouts] = await payrollDB.query(
            "SELECT COUNT(*) as count FROM Payroll WHERE status IN ('Pending', 'Processing')"
        );

        // Count requests ready for payroll processing (Manager_Approved)
        const [pendingRequests] = await payrollDB.query(
            "SELECT COUNT(*) as count FROM Requests WHERE status = 'Manager_Approved'"
        );

        // Get upcoming schedule from PayrollCutoffs
        const [upcomingSchedule] = await payrollDB.query(
            "SELECT pay_date FROM PayrollCutoffs WHERE pay_date >= CURDATE() ORDER BY pay_date ASC LIMIT 1"
        );

        res.json({
            totalEmployees: totalCount,
            processedPayouts: processedPayouts[0]?.count || 0,
            pendingPayouts: pendingPayouts[0]?.count || 0,
            pendingRequests: pendingRequests[0]?.count || 0,
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
        const { search, department, position } = req.query;

        // First get registered employee IDs from our local payroll database
        const [registeredEmployees] = await payrollDB.query(
            `SELECT employee_id FROM UserAccounts WHERE employee_id IS NOT NULL AND role_id = 4`
        );
        const employeeIds = registeredEmployees.map(e => e.employee_id);
        
        if (employeeIds.length === 0) {
            return res.json([]);
        }

        let query = `
            SELECT 
                e.employee_id,
                CONCAT(e.first_name, ' ', IFNULL(e.middle_name, ''), ' ', e.last_name) as full_name,
                e.first_name,
                e.middle_name,
                e.last_name,
                e.email,
                e.contact_number,
                e.salary,
                et.employee_type_name as employment_type,
                p.position_name as position,
                d.department_name as department
            FROM employees e
            LEFT JOIN positions p ON e.position_id = p.position_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN employeetype et ON e.employee_type_id = et.employee_type_id
            WHERE e.employee_id IN (?)
        `;

        const params = [employeeIds];

        if (search) {
            query += ` AND (CONCAT(e.first_name, ' ', e.last_name) LIKE ?)`;
            params.push(`%${search}%`);
        }

        if (department) {
            query += ` AND d.department_name = ?`;
            params.push(department);
        }

        if (position) {
            query += ` AND p.position_name = ?`;
            params.push(position);
        }

        query += ` ORDER BY e.employee_id`;

        const [employees] = await hrDB.query(query, params);
        
        // Enrich with salary details from payroll database
        const enrichedEmployees = await Promise.all(employees.map(async (emp) => {
            try {
                const [salaryDetails] = await payrollDB.query(
                    `SELECT basic_rate, overtime_rate FROM SalaryDetails WHERE employee_id = ?`,
                    [emp.employee_id]
                );
                return {
                    ...emp,
                    basic_rate: salaryDetails[0]?.basic_rate || null,
                    overtime_rate: salaryDetails[0]?.overtime_rate || null
                };
            } catch (_err) {
                return emp;
            }
        }));
        
        res.json(enrichedEmployees);
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
                        p.position_name as position,
                        d.department_name as department
                     FROM employees e
                     LEFT JOIN positions p ON e.position_id = p.position_id
                     LEFT JOIN departments d ON e.department_id = d.department_id
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
// Payroll sees: Manager_Approved (ready for processing) and Approved/Rejected (their history)
router.get('/pending-requests', async (req, res) => {
    try {
        const { search, type, status, showAll } = req.query;

        // Payroll sees requests that are Approved with emsStatus = 'PENDING' and payroll_approved = 0
        // or all approved requests for history view
        let query = `SELECT * FROM Requests`;
        const params = [];

        if (showAll === 'true') {
            // Show all approved requests (both pending and processed)
            query += ` WHERE status = 'Approved'`;
        } else if (status && status !== 'all') {
            query += ` WHERE status = ?`;
            params.push(status);
        } else {
            // Default: show requests awaiting payroll approval (payroll_approved = 0)
            query += ` WHERE status = 'Approved' AND emsStatus = 'PENDING' AND (payroll_approved = 0 OR payroll_approved IS NULL)`;
        }

        if (type) {
            query += ` AND request_type = ?`;
            params.push(type);
        }

        query += ` ORDER BY COALESCE(updated_at, date_filed) DESC, date_filed DESC`;

        const [requests] = await payrollDB.query(query, params);
        console.log(`📋 Found ${requests.length} requests`);

        const enrichedRequests = await Promise.all(requests.map(async (request) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name, 
                            p.position_name as position,
                            d.department_name as department
                     FROM employees e
                     LEFT JOIN positions p ON e.position_id = p.position_id
                     LEFT JOIN departments d ON e.department_id = d.department_id
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

// 5. PAYROLL APPROVE REQUEST (Second-Level - Final Approval)
router.put('/pending-requests/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { approved_by, remarks } = req.body;

    try {
        console.log(`[INFO] Payroll approving request ID: ${id} - sending to HR/EMS`);
        
        // Get request details first
        const [requestDetails] = await payrollDB.query(
            `SELECT employee_id, request_type, request_description, status, emsStatus, payroll_approved FROM Requests WHERE request_id = ?`,
            [id]
        );

        if (!requestDetails.length) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Payroll can only approve requests with status = 'Approved', emsStatus = 'PENDING', and not yet payroll approved
        if (requestDetails[0].status !== 'Approved' || requestDetails[0].emsStatus !== 'PENDING' || requestDetails[0].payroll_approved === 1) {
            return res.status(400).json({ 
                error: 'Invalid request status',
                message: 'Only manager-approved requests awaiting payroll can be processed',
                currentStatus: requestDetails[0].status,
                emsStatus: requestDetails[0].emsStatus,
                payrollApproved: requestDetails[0].payroll_approved
            });
        }
        
        // Payroll approval - set payroll_approved = 1, emsStatus stays PENDING (awaiting HR)
        const [result] = await payrollDB.query(
            `UPDATE Requests 
             SET payroll_approved = 1,
                 approved_by = ?, 
                 remarks = ?, 
                 updated_at = NOW()
             WHERE request_id = ? AND status = 'Approved' AND emsStatus = 'PENDING'`,
            [approved_by, remarks || 'Approved by payroll - awaiting HR approval', id]
        );

        // Log activity
        if (result.affectedRows > 0) {
            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['PAYROLL_APPROVE', 'Request', id, requestDetails[0].employee_id, approved_by, 
                 `${requestDetails[0].request_type} request approved by payroll - sent to HR`]
            );
        }

        console.log(`[SUCCESS] Request ${id} approved by payroll, sent to HR. Affected rows: ${result.affectedRows}`);
        res.json({ 
            success: true, 
            message: 'Request approved by payroll - awaiting HR approval', 
            affectedRows: result.affectedRows,
            emsStatus: 'PENDING'
        });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Failed to approve request', details: error.message });
    }
});

// 6. PAYROLL REJECT REQUEST
router.put('/pending-requests/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { approved_by, remarks } = req.body;

    try {
        console.log(`[INFO] Payroll rejecting request ID: ${id}`);
        
        // Get request details first
        const [requestDetails] = await payrollDB.query(
            `SELECT employee_id, request_type, status, emsStatus FROM Requests WHERE request_id = ?`,
            [id]
        );

        if (!requestDetails.length) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Payroll can only reject requests with status = 'Approved' and emsStatus = 'PENDING'
        if (requestDetails[0].status !== 'Approved' || requestDetails[0].emsStatus !== 'PENDING') {
            return res.status(400).json({ 
                error: 'Invalid request status',
                message: 'Only manager-approved requests awaiting payroll can be rejected',
                currentStatus: requestDetails[0].status
            });
        }
        
        const [result] = await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Rejected',
                 emsStatus = 'REJECTED', 
                 approved_by = ?, 
                 remarks = ?, 
                 updated_at = NOW()
             WHERE request_id = ? AND status = 'Approved' AND emsStatus = 'PENDING'`,
            [approved_by, remarks || 'Rejected by payroll team', id]
        );

        // Log activity
        if (result.affectedRows > 0) {
            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['PAYROLL_REJECT', 'Request', id, requestDetails[0].employee_id, approved_by, 
                 `${requestDetails[0].request_type} request rejected by payroll: ${remarks || 'No reason provided'}`]
            );
        }

        console.log(`[SUCCESS] Request ${id} rejected by payroll. Affected rows: ${result.affectedRows}`);
        res.json({ 
            success: true, 
            message: 'Request rejected by payroll', 
            affectedRows: result.affectedRows,
            newStatus: 'Rejected'
        });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request', details: error.message });
    }
});

// 6b. SYNC HR/EMS APPROVALS - Check for EMS-approved requests and update status + deduct leave
router.post('/sync-ems-approvals', async (req, res) => {
    try {
        console.log('[INFO] Syncing HR/EMS approvals...');
        
        // Find requests that have been approved by EMS but not yet processed
        const [pendingEmsApprovals] = await payrollDB.query(
            `SELECT request_id, employee_id, request_type, request_description, emsStatus, emsRemarks
             FROM Requests 
             WHERE status = 'Payroll_Approved' 
               AND emsStatus = 'APPROVED'`
        );

        console.log(`[INFO] Found ${pendingEmsApprovals.length} EMS-approved requests to process`);

        let processed = 0;
        let leaveDeducted = 0;

        for (const request of pendingEmsApprovals) {
            // Update status to Approved
            await payrollDB.query(
                `UPDATE Requests 
                 SET status = 'Approved', 
                     remarks = CONCAT(COALESCE(remarks, ''), ' | EMS Approved: ', COALESCE(emsRemarks, 'No remarks')),
                     updated_at = NOW()
                 WHERE request_id = ?`,
                [request.request_id]
            );

            // If Leave request (request_type is now the leave type name), deduct from balance
            // Skip non-leave types like Overtime, Bonus, Reimbursement
            if (request.request_type && !['Overtime', 'Bonus', 'Reimbursement'].includes(request.request_type)) {
                try {
                    const description = request.request_description || '';
                    const daysMatch = description.match(/(\d+)\s*days?\)/i);
                    const totalDays = daysMatch ? parseInt(daysMatch[1]) : 1;
                    
                    // request_type is now the leave type name (e.g., "Vacation Leave", "Sick Leave")
                    const leaveTypeName = request.request_type;
                    
                    const [leaveTypes] = await hrDB.query(
                        `SELECT leave_type_id FROM leavetype WHERE leave_name = ?`,
                        [leaveTypeName]
                    );
                    
                    if (leaveTypes.length > 0) {
                        const [updateResult] = await hrDB.query(
                            `UPDATE remainingleaves 
                             SET num_of_leaves = GREATEST(0, num_of_leaves - ?)
                             WHERE employee_id = ? AND leave_type_id = ?`,
                            [totalDays, request.employee_id, leaveTypes[0].leave_type_id]
                        );
                        
                        if (updateResult.affectedRows > 0) {
                            leaveDeducted++;
                            console.log(`[INFO] Deducted ${totalDays} days from employee ${request.employee_id}'s ${leaveTypeName} balance`);
                        }
                    }
                } catch (leaveError) {
                    console.error(`[ERROR] Failed to deduct leave for request ${request.request_id}:`, leaveError.message);
                }
            }

            // Log activity
            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, description)
                 VALUES (?, ?, ?, ?, ?)`,
                ['EMS_SYNC', 'Request', request.request_id, request.employee_id, 
                 `${request.request_type} request approved by HR/EMS`]
            );

            processed++;
        }

        // Also check for EMS rejections
        const [pendingEmsRejections] = await payrollDB.query(
            `SELECT request_id, employee_id, request_type, emsRemarks
             FROM Requests 
             WHERE status = 'Payroll_Approved' 
               AND emsStatus = 'REJECTED'`
        );

        for (const request of pendingEmsRejections) {
            await payrollDB.query(
                `UPDATE Requests 
                 SET status = 'Rejected', 
                     remarks = CONCAT(COALESCE(remarks, ''), ' | EMS Rejected: ', COALESCE(emsRemarks, 'No remarks')),
                     updated_at = NOW()
                 WHERE request_id = ?`,
                [request.request_id]
            );

            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, description)
                 VALUES (?, ?, ?, ?, ?)`,
                ['EMS_SYNC', 'Request', request.request_id, request.employee_id, 
                 `${request.request_type} request rejected by HR/EMS: ${request.emsRemarks || 'No reason'}`]
            );

            processed++;
        }

        console.log(`[SUCCESS] Synced ${processed} requests (${leaveDeducted} leave balances updated)`);
        res.json({ 
            success: true, 
            message: `Synced ${processed} EMS decisions`,
            processed,
            leaveDeducted,
            rejections: pendingEmsRejections.length
        });
    } catch (error) {
        console.error('Error syncing EMS approvals:', error);
        res.status(500).json({ error: 'Failed to sync EMS approvals', details: error.message });
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
            'SELECT DISTINCT position_name FROM positions ORDER BY position_name'
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
                p.position_name,
                d.department_name
             FROM employees e
             LEFT JOIN positions p ON e.position_id = p.position_id
             LEFT JOIN departments d ON e.department_id = d.department_id
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
                         LEFT JOIN departments d ON e.department_id = d.department_id
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
                start_date,
                end_date,
                pay_date,
                frequency,
                status,
                (SELECT SUM(net_pay) FROM Payroll 
                 WHERE cutoff_start_date = pc.start_date 
                 AND cutoff_end_date = pc.end_date) as total_amount
            FROM PayrollCutoffs pc
            ORDER BY start_date DESC
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
        const { userId } = req.query;
        
        // Get recent activities from ActivityLogs table, filtered by user if provided
        let query = `
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
        `;
        const params = [];
        
        if (userId) {
            query += ` WHERE processed_by = ?`;
            params.push(userId);
        }
        
        query += ` ORDER BY created_at DESC LIMIT 10`;
        
        const [activityLogs] = await payrollDB.query(query, params);

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
            `SELECT employee_id, net_pay, cutoff_start_date, cutoff_end_date FROM Payroll WHERE payroll_id = ?`,
            [id]
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Payroll SET status = 'Processed', updated_at = NOW() WHERE payroll_id = ?`,
            [id]
        );
        
        // Log activity and create notification
        if (result.affectedRows > 0 && payrollDetails.length > 0) {
            const payroll = payrollDetails[0];
            
            await payrollDB.query(
                `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['PROCESS', 'Payroll', id, payroll.employee_id, approved_by || null, 
                 `Payslip marked as processed for Employee ID ${payroll.employee_id}`]
            );

            // Create notification for the employee
            const periodStart = new Date(payroll.cutoff_start_date).toLocaleDateString();
            const periodEnd = new Date(payroll.cutoff_end_date).toLocaleDateString();
            const netPay = parseFloat(payroll.net_pay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
            
            await payrollDB.query(
                `INSERT INTO Notifications (employee_id, title, message, type) VALUES (?, ?, ?, ?)`,
                [
                    payroll.employee_id,
                    'Payroll Processed',
                    `Your payroll for ${periodStart} - ${periodEnd} has been processed and is pending release. Expected: ₱${netPay}`,
                    'payroll'
                ]
            );
        }
        
        console.log(`[SUCCESS] Payslip ${id} marked as processed. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Payslip marked as processed successfully', affectedRows: result.affectedRows });
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
        console.log(`[INFO] Rejecting payslip ID: ${id} with reason: ${comments}`);
        
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
        
        console.log(`[SUCCESS] Payslip ${id} rejected. Affected rows: ${result.affectedRows}`);
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
        console.log(`[INFO] Releasing payouts for IDs: ${payrollIds}`);
        if (!payrollIds || payrollIds.length === 0) {
            return res.status(400).json({ error: 'No payroll IDs provided' });
        }
        
        // Get payroll details first for logging and notifications
        const placeholders = payrollIds.map(() => '?').join(',');
        const [payrollDetails] = await payrollDB.query(
            `SELECT payroll_id, employee_id, net_pay, cutoff_start_date, cutoff_end_date FROM Payroll WHERE payroll_id IN (${placeholders})`,
            payrollIds
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Payroll SET status = 'Released', updated_at = NOW() WHERE payroll_id IN (${placeholders}) AND status = 'Processed'`,
            payrollIds
        );
        
        // Log activity for each released payroll and create notifications
        if (result.affectedRows > 0) {
            for (const payroll of payrollDetails) {
                await payrollDB.query(
                    `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    ['RELEASE', 'Payroll', payroll.payroll_id, payroll.employee_id, released_by || null, 
                     `Payroll released for Employee ID ${payroll.employee_id}`]
                );

                // Create notification for the employee
                const periodStart = new Date(payroll.cutoff_start_date).toLocaleDateString();
                const periodEnd = new Date(payroll.cutoff_end_date).toLocaleDateString();
                const netPay = parseFloat(payroll.net_pay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
                
                await payrollDB.query(
                    `INSERT INTO Notifications (employee_id, title, message, type) VALUES (?, ?, ?, ?)`,
                    [
                        payroll.employee_id,
                        'Salary Released',
                        `Your salary for the period ${periodStart} - ${periodEnd} has been released. Net Pay: ₱${netPay}`,
                        'payroll'
                    ]
                );
            }
        }
        
        console.log(`[SUCCESS] Payouts released. Affected rows: ${result.affectedRows}`);
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
                    e.email,
                    p.position_name as position,
                    d.department_name as department
                 FROM employees e
                 LEFT JOIN positions p ON e.position_id = p.position_id
                 LEFT JOIN departments d ON e.department_id = d.department_id
                 WHERE e.employee_id = ?`,
                [payroll[0].employee_id]
            );
            
            res.json({
                ...payroll[0],
                employee_name: empRows[0]?.employee_name || `Employee ${payroll[0].employee_id}`,
                email: empRows[0]?.email || '',
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
// Helper function: Calculate SSS contribution (2024)
// Employee share: 4.5% of Monthly Salary Credit (MSC)
// MSC ranges from ₱4,000 to ₱30,000
function calculateSSS(monthlySalary) {
    // 2024 SSS Contribution Table - Employee Share (4.5% of MSC)
    const sssTable = [
        { min: 0, max: 4249.99, msc: 4000, ee: 180 },
        { min: 4250, max: 4749.99, msc: 4500, ee: 202.50 },
        { min: 4750, max: 5249.99, msc: 5000, ee: 225 },
        { min: 5250, max: 5749.99, msc: 5500, ee: 247.50 },
        { min: 5750, max: 6249.99, msc: 6000, ee: 270 },
        { min: 6250, max: 6749.99, msc: 6500, ee: 292.50 },
        { min: 6750, max: 7249.99, msc: 7000, ee: 315 },
        { min: 7250, max: 7749.99, msc: 7500, ee: 337.50 },
        { min: 7750, max: 8249.99, msc: 8000, ee: 360 },
        { min: 8250, max: 8749.99, msc: 8500, ee: 382.50 },
        { min: 8750, max: 9249.99, msc: 9000, ee: 405 },
        { min: 9250, max: 9749.99, msc: 9500, ee: 427.50 },
        { min: 9750, max: 10249.99, msc: 10000, ee: 450 },
        { min: 10250, max: 10749.99, msc: 10500, ee: 472.50 },
        { min: 10750, max: 11249.99, msc: 11000, ee: 495 },
        { min: 11250, max: 11749.99, msc: 11500, ee: 517.50 },
        { min: 11750, max: 12249.99, msc: 12000, ee: 540 },
        { min: 12250, max: 12749.99, msc: 12500, ee: 562.50 },
        { min: 12750, max: 13249.99, msc: 13000, ee: 585 },
        { min: 13250, max: 13749.99, msc: 13500, ee: 607.50 },
        { min: 13750, max: 14249.99, msc: 14000, ee: 630 },
        { min: 14250, max: 14749.99, msc: 14500, ee: 652.50 },
        { min: 14750, max: 15249.99, msc: 15000, ee: 675 },
        { min: 15250, max: 15749.99, msc: 15500, ee: 697.50 },
        { min: 15750, max: 16249.99, msc: 16000, ee: 720 },
        { min: 16250, max: 16749.99, msc: 16500, ee: 742.50 },
        { min: 16750, max: 17249.99, msc: 17000, ee: 765 },
        { min: 17250, max: 17749.99, msc: 17500, ee: 787.50 },
        { min: 17750, max: 18249.99, msc: 18000, ee: 810 },
        { min: 18250, max: 18749.99, msc: 18500, ee: 832.50 },
        { min: 18750, max: 19249.99, msc: 19000, ee: 855 },
        { min: 19250, max: 19749.99, msc: 19500, ee: 877.50 },
        { min: 19750, max: 20249.99, msc: 20000, ee: 900 },
        { min: 20250, max: 20749.99, msc: 20500, ee: 922.50 },
        { min: 20750, max: 21249.99, msc: 21000, ee: 945 },
        { min: 21250, max: 21749.99, msc: 21500, ee: 967.50 },
        { min: 21750, max: 22249.99, msc: 22000, ee: 990 },
        { min: 22250, max: 22749.99, msc: 22500, ee: 1012.50 },
        { min: 22750, max: 23249.99, msc: 23000, ee: 1035 },
        { min: 23250, max: 23749.99, msc: 23500, ee: 1057.50 },
        { min: 23750, max: 24249.99, msc: 24000, ee: 1080 },
        { min: 24250, max: 24749.99, msc: 24500, ee: 1102.50 },
        { min: 24750, max: 25249.99, msc: 25000, ee: 1125 },
        { min: 25250, max: 25749.99, msc: 25500, ee: 1147.50 },
        { min: 25750, max: 26249.99, msc: 26000, ee: 1170 },
        { min: 26250, max: 26749.99, msc: 26500, ee: 1192.50 },
        { min: 26750, max: 27249.99, msc: 27000, ee: 1215 },
        { min: 27250, max: 27749.99, msc: 27500, ee: 1237.50 },
        { min: 27750, max: 28249.99, msc: 28000, ee: 1260 },
        { min: 28250, max: 28749.99, msc: 28500, ee: 1282.50 },
        { min: 28750, max: 29249.99, msc: 29000, ee: 1305 },
        { min: 29250, max: 29749.99, msc: 29500, ee: 1327.50 },
        { min: 29750, max: Infinity, msc: 30000, ee: 1350 }  // Maximum MSC: ₱30,000
    ];
    
    const bracket = sssTable.find(b => monthlySalary >= b.min && monthlySalary <= b.max);
    return bracket ? bracket.ee : 1350; // Max contribution (₱30,000 MSC × 4.5%)
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

// Helper function: Calculate Pag-IBIG contribution (2024)
// Employee share: 2% of basic salary, max ₱100
// For salary ≤ ₱1,500: Employee pays 1%
// For salary > ₱1,500: Employee pays 2% (capped at ₱100)
function calculatePagIBIG(monthlySalary) {
    if (monthlySalary <= 1500) {
        return monthlySalary * 0.01; // 1% for salaries <= 1500
    } else {
        // 2% for salaries > 1500, capped at ₱100
        return Math.min(monthlySalary * 0.02, 100);
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
                // Calculate hours worked from time in/out
                const timeIn = new Date(`2000-01-01 ${ts.time_in}`);
                const timeOut = new Date(`2000-01-01 ${ts.time_out}`);
                let hoursWorked = (timeOut - timeIn) / (1000 * 60 * 60); // Convert to hours
                
                // Subtract break duration
                const breakHours = parseFloat(ts.break_duration) || 1;
                hoursWorked -= breakHours;
                
                // Regular hours capped at 8
                const regularHours = Math.min(hoursWorked, 8);
                
                // Overtime: use explicit overtime_hours if set, otherwise calculate from excess hours
                // The overtime_hours column represents the TOTAL overtime, not additional
                const explicitOvertime = parseFloat(ts.overtime_hours) || 0;
                const calculatedOvertime = Math.max(hoursWorked - 8, 0);
                const overtimeHours = explicitOvertime > 0 ? explicitOvertime : calculatedOvertime;
                
                totalRegularHours += regularHours;
                totalOvertimeHours += overtimeHours;
            });
            
            // Get employee details from HR
            try {
                const [empDetails] = await hrDB.query(`
                    SELECT 
                        e.employee_id,
                        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                        e.email,
                        e.salary,
                        p.position_name as position,
                        d.department_name as department
                    FROM employees e
                    LEFT JOIN positions p ON e.position_id = p.position_id
                    LEFT JOIN departments d ON e.department_id = d.department_id
                    WHERE e.employee_id = ?
                `, [employeeId]);
                
                // Get salary details from payroll DB, fallback to HR salary
                const [salaryDetails] = await payrollDB.query(`
                    SELECT basic_rate, overtime_rate
                    FROM SalaryDetails
                    WHERE employee_id = ?
                `, [employeeId]);
                
                const basicRate = salaryDetails[0]?.basic_rate || empDetails[0]?.salary || 0;
                const overtimeRate = salaryDetails[0]?.overtime_rate || (basicRate / 22 / 8 * 1.25);
                
                employeeSummaries.push({
                    employeeId: parseInt(employeeId),
                    employeeName: empDetails[0]?.employee_name || `Employee ${employeeId}`,
                    email: empDetails[0]?.email || '',
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
        
        // Get active payroll rules
        const [payrollRules] = await payrollDB.query(`
            SELECT rule_id, rule_name, rule_type, formula, fixed_amount, applies_to
            FROM PayrollRules
            WHERE is_active = 1
            ORDER BY rule_type, rule_name
        `);
        
        // Find specific rules
        const overtimeRule = payrollRules.find(r => 
            r.rule_name.toLowerCase().includes('overtime') && r.rule_type === 'earning'
        );
        const sssRule = payrollRules.find(r => 
            r.rule_name.toLowerCase().includes('sss') && r.rule_type === 'deduction'
        );
        const philhealthRule = payrollRules.find(r => 
            r.rule_name.toLowerCase().includes('philhealth') && r.rule_type === 'deduction'
        );
        const pagibigRule = payrollRules.find(r => 
            (r.rule_name.toLowerCase().includes('pagibig') || 
             r.rule_name.toLowerCase().includes('pag-ibig') || 
             r.rule_name.toLowerCase().includes('hdmf')) && r.rule_type === 'deduction'
        );
        
        // Get overtime multiplier from rule or use default
        // Try to extract multiplier from formula like "hourly_rate * 1.25 * overtime_hours"
        let overtimeMultiplier = 1.25; // Default 25% OT premium
        if (overtimeRule && overtimeRule.formula) {
            const match = overtimeRule.formula.match(/\*\s*([\d.]+)\s*\*/);
            if (match) {
                overtimeMultiplier = parseFloat(match[1]) || 1.25;
            }
        }
        
        const calculatedPayrolls = [];
        
        for (const emp of employees) {
            const { employeeId, totalRegularHours, totalOvertimeHours, basicRate, overtimeRate } = emp;
            
            // Calculate basic pay based on hours worked
            // If basicRate is monthly, convert to hourly: monthly / 22 days / 8 hours
            const hourlyRate = basicRate / 22 / 8;
            const basicPay = totalRegularHours * hourlyRate;
            
            // Calculate overtime pay using rule multiplier
            const overtimePay = totalOvertimeHours * hourlyRate * overtimeMultiplier;
            
            // Calculate additional earnings from rules (only fixed amounts, skip formula-based)
            let additionalEarnings = 0;
            payrollRules.filter(r => r.rule_type === 'earning' && !r.rule_name.toLowerCase().includes('overtime'))
                .forEach(rule => {
                    if (rule.fixed_amount) {
                        additionalEarnings += parseFloat(rule.fixed_amount);
                    }
                    // Skip formula-based earnings as they're text descriptions, not calculable
                });
            
            // Gross pay
            const grossPay = basicPay + overtimePay + additionalEarnings;
            
            // Calculate deductions based on monthly equivalent
            // For bi-monthly, we calculate based on half-month
            const monthlyEquivalent = grossPay * 2; // Estimate monthly for deduction calculation
            
            // Calculate SSS - always use calculation function (formula is text description)
            const sssContribution = calculateSSS(monthlyEquivalent) / 2;
            
            // Calculate PhilHealth - always use calculation function
            const philhealthContribution = calculatePhilHealth(monthlyEquivalent) / 2;
            
            // Calculate Pag-IBIG - always use calculation function  
            const pagibigContribution = calculatePagIBIG(monthlyEquivalent) / 2;
            
            // Calculate other deductions from rules (only fixed amounts)
            let otherDeductions = 0;
            payrollRules.filter(r => 
                r.rule_type === 'deduction' && 
                !r.rule_name.toLowerCase().includes('sss') &&
                !r.rule_name.toLowerCase().includes('philhealth') &&
                !r.rule_name.toLowerCase().includes('pagibig') &&
                !r.rule_name.toLowerCase().includes('pag-ibig') &&
                !r.rule_name.toLowerCase().includes('hdmf') &&
                !r.rule_name.toLowerCase().includes('withholding') &&
                !r.rule_name.toLowerCase().includes('tax')
            ).forEach(rule => {
                if (rule.fixed_amount) {
                    otherDeductions += parseFloat(rule.fixed_amount);
                }
                // Skip formula-based deductions as they're text descriptions
            });
            
            // Calculate taxable income (gross - mandatory contributions)
            const mandatoryDeductions = sssContribution + philhealthContribution + pagibigContribution;
            const taxableIncome = (grossPay - mandatoryDeductions) * 2; // Monthly equivalent for tax
            const withholdingTax = calculateWithholdingTax(taxableIncome) / 2; // Half for bi-monthly
            
            // Total deductions (include other deductions from rules)
            const totalDeductions = mandatoryDeductions + withholdingTax + otherDeductions;
            
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
                additionalEarnings: Math.round(additionalEarnings * 100) / 100,
                grossPay: Math.round(grossPay * 100) / 100,
                deductions: {
                    sss: Math.round(sssContribution * 100) / 100,
                    philhealth: Math.round(philhealthContribution * 100) / 100,
                    pagibig: Math.round(pagibigContribution * 100) / 100,
                    tax: Math.round(withholdingTax * 100) / 100,
                    other: Math.round(otherDeductions * 100) / 100,
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
        console.log('📋 First payroll data:', JSON.stringify(payrolls[0], null, 2));
        
        const savedPayrolls = [];
        
        for (const payroll of payrolls) {
            // Generate reference number
            const refNum = `PAY-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
            
            // Calculate net_pay if not provided
            const netPay = payroll.netPay || (payroll.grossPay - (payroll.deductions?.total || payroll.deductions || 0));
            
            console.log(`💰 Employee ${payroll.employeeId}: basicPay=${payroll.basicPay}, overtimePay=${payroll.overtimePay}, deductions=${payroll.deductions?.total || payroll.deductions}, netPay=${netPay}`);
            
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
                payroll.basicPay || 0,
                payroll.overtimePay || 0,
                payroll.deductions?.total || payroll.deductions || 0,
                netPay,
                refNum
            ]);
            
            const payrollId = result.insertId;
            
            // Insert tax contributions (handle both object and flat structure)
            const deductions = payroll.deductions || {};
            await payrollDB.query(`
                INSERT INTO TaxContributions 
                (payroll_id, employee_id, sss_contribution, philhealth_contribution, pagibig_contribution, withholding_tax, total_contributions)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                payrollId,
                payroll.employeeId,
                deductions.sss || 0,
                deductions.philhealth || 0,
                deductions.pagibig || 0,
                deductions.tax || 0,
                deductions.total || 0
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
        // First get registered employee IDs from our local payroll database
        const [registeredEmployees] = await payrollDB.query(
            `SELECT employee_id FROM UserAccounts WHERE employee_id IS NOT NULL AND role_id = 4`
        );
        const employeeIds = registeredEmployees.map(e => e.employee_id);
        
        if (employeeIds.length === 0) {
            return res.json([]);
        }
        
        // Get employee data from HR
        const [employees] = await hrDB.query(`
            SELECT 
                e.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.email,
                e.salary,
                p.position_name as position,
                d.department_name as department
            FROM employees e
            LEFT JOIN positions p ON e.position_id = p.position_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE e.employee_id IN (?)
            ORDER BY e.employee_id
        `, [employeeIds]);
        
        // Enrich with salary details
        const enrichedEmployees = await Promise.all(employees.map(async (emp) => {
            try {
                const [salaryDetails] = await payrollDB.query(`
                    SELECT basic_rate, overtime_rate, holiday_rate, loan_deductions, other_deductions
                    FROM SalaryDetails WHERE employee_id = ?
                `, [emp.employee_id]);
                
                return {
                    ...emp,
                    basicRate: salaryDetails[0]?.basic_rate || emp.salary || 0,
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

// POST activity log (for frontend logging)
router.post('/detailed-activity-logs', async (req, res) => {
    try {
        const { action_type, entity_type, entity_id, description, employee_id, processed_by } = req.body;
        
        const [result] = await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, description, employee_id, processed_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [action_type, entity_type || 'System', entity_id || null, description, employee_id || null, processed_by || null]
        );
        
        res.json({ success: true, logId: result.insertId });
    } catch (error) {
        console.error('Error creating activity log:', error);
        res.status(500).json({ error: 'Failed to create activity log' });
    }
});

// =====================================================
// PAYROLL RULES ENDPOINTS
// =====================================================

// GET all payroll rules
router.get('/rules', async (req, res) => {
    try {
        // Get from PayrollRules table - return empty array if no rules exist
        const [rules] = await payrollDB.query(`
            SELECT 
                rule_id as id,
                rule_name as type,
                rule_type,
                formula,
                fixed_amount,
                description,
                is_active as active,
                applies_to,
                created_at,
                updated_at
            FROM PayrollRules
            ORDER BY rule_id
        `);

        res.json(rules);
    } catch (error) {
        console.error('Error fetching payroll rules:', error);
        res.status(500).json({ error: 'Failed to fetch payroll rules' });
    }
});

// CREATE payroll rule
router.post('/rules', async (req, res) => {
    const { type, rule_type, formula, fixed_amount, description, applies_to } = req.body;

    try {
        const [result] = await payrollDB.query(
            `INSERT INTO PayrollRules (rule_name, rule_type, formula, fixed_amount, description, applies_to, is_active)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [type, rule_type || 'earning', formula || null, fixed_amount || null, description || null, applies_to || 'all']
        );

        await logActivity('CREATE', 'PayrollRule', result.insertId, `Created payroll rule: ${type}`);
        res.status(201).json({ 
            success: true, 
            id: result.insertId,
            message: 'Payroll rule created successfully' 
        });
    } catch (error) {
        console.error('Error creating payroll rule:', error);
        res.status(500).json({ error: 'Failed to create payroll rule' });
    }
});

// UPDATE payroll rule
router.put('/rules/:id', async (req, res) => {
    const { id } = req.params;
    const { type, rule_type, formula, fixed_amount, description, active, applies_to } = req.body;

    try {
        await payrollDB.query(
            `UPDATE PayrollRules 
             SET rule_name = COALESCE(?, rule_name),
                 rule_type = COALESCE(?, rule_type),
                 formula = COALESCE(?, formula),
                 fixed_amount = COALESCE(?, fixed_amount),
                 description = COALESCE(?, description),
                 is_active = COALESCE(?, is_active),
                 applies_to = COALESCE(?, applies_to),
                 updated_at = NOW()
             WHERE rule_id = ?`,
            [type, rule_type, formula, fixed_amount, description, active, applies_to, id]
        );

        await logActivity('UPDATE', 'PayrollRule', id, `Updated payroll rule: ${type || 'Unknown'}`);
        res.json({ success: true, message: 'Payroll rule updated successfully' });
    } catch (error) {
        console.error('Error updating payroll rule:', error);
        res.status(500).json({ error: 'Failed to update payroll rule' });
    }
});

// DELETE payroll rule
router.delete('/rules/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`Attempting to delete payroll rule with id: ${id}`);
        const [result] = await payrollDB.query(`DELETE FROM PayrollRules WHERE rule_id = ?`, [id]);
        console.log('Delete result:', result);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Payroll rule not found' });
        }
        
        await logActivity('DELETE', 'PayrollRule', id, `Deleted payroll rule #${id}`);
        res.json({ success: true, message: 'Payroll rule deleted successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error deleting payroll rule:', error);
        res.status(500).json({ error: 'Failed to delete payroll rule', details: error.message });
    }
});

// TOGGLE payroll rule active status
router.patch('/rules/:id/toggle', async (req, res) => {
    const { id } = req.params;

    try {
        await payrollDB.query(
            `UPDATE PayrollRules SET is_active = NOT is_active, updated_at = NOW() WHERE rule_id = ?`,
            [id]
        );
        await logActivity('UPDATE', 'PayrollRule', id, `Toggled payroll rule #${id} active status`);
        res.json({ success: true, message: 'Payroll rule toggled successfully' });
    } catch (error) {
        console.error('Error toggling payroll rule:', error);
        res.status(500).json({ error: 'Failed to toggle payroll rule' });
    }
});

// =====================================================
// CUTOFF DATES ENDPOINTS
// =====================================================

// Note: GET /cutoffs is defined earlier at line 612 using PayrollCutoffs table

// CREATE cutoff period
router.post('/cutoffs', async (req, res) => {
    const { period_name, start_date, end_date, pay_date, frequency } = req.body;

    try {
        const [result] = await payrollDB.query(
            `INSERT INTO PayrollCutoffs (period_name, start_date, end_date, pay_date, frequency, status)
             VALUES (?, ?, ?, ?, ?, 'Active')`,
            [period_name, start_date, end_date, pay_date, frequency || 'Semi-Monthly']
        );

        await logActivity('CREATE', 'PayrollCutoff', result.insertId, `Created cutoff period: ${period_name}`);
        res.status(201).json({ 
            success: true, 
            cutoff_id: result.insertId,
            message: 'Cutoff period created successfully' 
        });
    } catch (error) {
        console.error('Error creating cutoff:', error);
        res.status(500).json({ error: 'Failed to create cutoff period' });
    }
});

// UPDATE cutoff period
router.put('/cutoffs/:id', async (req, res) => {
    const { id } = req.params;
    const { period_name, start_date, end_date, pay_date, frequency, status } = req.body;

    try {
        await payrollDB.query(
            `UPDATE PayrollCutoffs 
             SET period_name = COALESCE(?, period_name),
                 start_date = COALESCE(?, start_date),
                 end_date = COALESCE(?, end_date),
                 pay_date = COALESCE(?, pay_date),
                 frequency = COALESCE(?, frequency),
                 status = COALESCE(?, status)
             WHERE cutoff_id = ?`,
            [period_name, start_date, end_date, pay_date, frequency, status, id]
        );

        await logActivity('UPDATE', 'PayrollCutoff', id, `Updated cutoff period: ${period_name || 'Unknown'}`);
        res.json({ success: true, message: 'Cutoff period updated successfully' });
    } catch (error) {
        console.error('Error updating cutoff:', error);
        res.status(500).json({ error: 'Failed to update cutoff period' });
    }
});

// DELETE cutoff period
router.delete('/cutoffs/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`Attempting to delete cutoff period with id: ${id}`);
        const [result] = await payrollDB.query(`DELETE FROM PayrollCutoffs WHERE cutoff_id = ?`, [id]);
        console.log('Delete result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cutoff period not found' });
        }

        await logActivity('DELETE', 'PayrollCutoff', id, `Deleted cutoff period #${id}`);
        res.json({ success: true, message: 'Cutoff period deleted successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error deleting cutoff:', error);
        res.status(500).json({ error: 'Failed to delete cutoff period', details: error.message });
    }
});

// =====================================================
// EMAIL ENDPOINTS
// =====================================================

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// POST send payslip emails
router.post('/send-payslip-emails', async (req, res) => {
    const { payrollIds } = req.body;

    if (!payrollIds || !Array.isArray(payrollIds) || payrollIds.length === 0) {
        return res.status(400).json({ error: 'No payroll IDs provided' });
    }

    try {
        // Check if email is configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return res.status(500).json({ 
                error: 'Email not configured',
                message: 'Please configure SMTP settings in the .env file'
            });
        }

        const transporter = createTransporter();
        const results = { sent: [], failed: [] };

        for (const payrollId of payrollIds) {
            try {
                // Get payroll details
                const [payrollRows] = await payrollDB.query(
                    `SELECT p.*, pc.period_name, pc.start_date as cutoff_start_date, pc.end_date as cutoff_end_date
                     FROM Payroll p
                     LEFT JOIN PayrollCutoffs pc ON p.cutoff_start_date = pc.start_date AND p.cutoff_end_date = pc.end_date
                     WHERE p.payroll_id = ?`,
                    [payrollId]
                );

                if (!payrollRows.length) {
                    results.failed.push({ payrollId, reason: 'Payroll not found' });
                    continue;
                }

                const payroll = payrollRows[0];

                // Get employee details from HR database
                const [empRows] = await hrDB.query(
                    `SELECT e.*, 
                            CONCAT(e.first_name, ' ', e.last_name) as full_name,
                            p.position_name,
                            d.department_name
                     FROM employees e
                     LEFT JOIN positions p ON e.position_id = p.position_id
                     LEFT JOIN departments d ON e.department_id = d.department_id
                     WHERE e.employee_id = ?`,
                    [payroll.employee_id]
                );

                if (!empRows.length || !empRows[0].email) {
                    results.failed.push({ 
                        payrollId, 
                        employeeId: payroll.employee_id,
                        reason: 'Employee email not found' 
                    });
                    continue;
                }

                const employee = empRows[0];
                const periodStart = new Date(payroll.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const periodEnd = new Date(payroll.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                // Send email
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || process.env.SMTP_USER,
                    to: employee.email,
                    subject: `Payslip for ${periodStart} - ${periodEnd}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #1F2829;">Payslip Notification</h2>
                            <p>Dear ${employee.full_name},</p>
                            <p>Your payslip for the period <strong>${periodStart} - ${periodEnd}</strong> is now available.</p>
                            
                            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #1F2829;">Pay Summary</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">Basic Pay</td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">PHP ${parseFloat(payroll.basic_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">Overtime Pay</td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">PHP ${parseFloat(payroll.overtime_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">Bonuses</td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">PHP ${parseFloat(payroll.bonuses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">Deductions</td>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right; color: #d32f2f;">-PHP ${parseFloat(payroll.deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr style="font-weight: bold;">
                                        <td style="padding: 12px 0;">Net Pay</td>
                                        <td style="padding: 12px 0; text-align: right; color: #4CAF50; font-size: 18px;">PHP ${parseFloat(payroll.net_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="color: #666; font-size: 14px;">
                                This is an automated message from the Payroll Management System. 
                                Please log in to the system to view your full payslip and download a PDF copy.
                            </p>
                            
                            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                                If you have any questions regarding your payslip, please contact the HR or Payroll department.
                            </p>
                        </div>
                    `
                });

                // Create notification for the employee
                await payrollDB.query(
                    `INSERT INTO Notifications (employee_id, title, message, type) VALUES (?, ?, ?, ?)`,
                    [
                        payroll.employee_id,
                        'Payslip Released',
                        `Your payslip for the period ${new Date(payroll.cutoff_start_date).toLocaleDateString()} - ${new Date(payroll.cutoff_end_date).toLocaleDateString()} has been released. Net Pay: ₱${parseFloat(payroll.net_pay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
                        'payroll'
                    ]
                );

                results.sent.push({ 
                    payrollId, 
                    employeeId: payroll.employee_id,
                    employeeName: employee.full_name,
                    email: employee.email 
                });

                await logActivity('EMAIL_SENT', 'Payroll', payrollId, 
                    `Payslip email sent to ${employee.full_name} (${employee.email})`);

            } catch (emailError) {
                console.error(`Error sending email for payroll ${payrollId}:`, emailError);
                results.failed.push({ 
                    payrollId, 
                    reason: emailError.message 
                });
            }
        }

        res.json({
            success: true,
            message: `Sent ${results.sent.length} email(s), ${results.failed.length} failed`,
            results
        });

    } catch (error) {
        console.error('Error sending payslip emails:', error);
        res.status(500).json({ error: 'Failed to send emails', details: error.message });
    }
});

// GET payroll grouped by period with priority
router.get('/payroll-by-period', async (req, res) => {
    try {
        // Get all payroll records with cutoff info and tax contributions
        const [payrolls] = await payrollDB.query(`
            SELECT 
                p.payroll_id,
                p.employee_id,
                p.cutoff_start_date,
                p.cutoff_end_date,
                p.pay_date,
                p.basic_pay,
                p.overtime_pay,
                p.bonuses,
                p.deductions,
                p.net_pay,
                p.status,
                p.comments,
                p.created_at,
                p.updated_at,
                pc.period_name,
                pc.cutoff_id,
                tc.sss_contribution,
                tc.philhealth_contribution,
                tc.pagibig_contribution,
                tc.withholding_tax
            FROM Payroll p
            LEFT JOIN PayrollCutoffs pc ON p.cutoff_start_date = pc.start_date AND p.cutoff_end_date = pc.end_date
            LEFT JOIN TaxContributions tc ON p.payroll_id = tc.payroll_id
            ORDER BY p.pay_date ASC, p.created_at ASC
        `);

        // Group by period
        const periodMap = new Map();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const payroll of payrolls) {
            const periodKey = `${payroll.cutoff_start_date}_${payroll.cutoff_end_date}`;
            
            if (!periodMap.has(periodKey)) {
                const payDate = new Date(payroll.pay_date);
                payDate.setHours(0, 0, 0, 0);
                const daysUntilPayDate = Math.ceil((payDate - today) / (1000 * 60 * 60 * 24));
                
                periodMap.set(periodKey, {
                    periodKey,
                    periodName: payroll.period_name || `${new Date(payroll.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(payroll.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    cutoffStartDate: payroll.cutoff_start_date,
                    cutoffEndDate: payroll.cutoff_end_date,
                    payDate: payroll.pay_date,
                    daysUntilPayDate,
                    urgency: daysUntilPayDate <= 0 ? 'overdue' : daysUntilPayDate <= 3 ? 'urgent' : daysUntilPayDate <= 7 ? 'soon' : 'normal',
                    payrolls: [],
                    stats: {
                        total: 0,
                        pending: 0,
                        processed: 0,
                        released: 0,
                        rejected: 0,
                        totalAmount: 0
                    }
                });
            }

            // Get employee details
            let employeeName = `Employee ${payroll.employee_id}`;
            let email = '';
            let department = 'N/A';
            let position = 'N/A';

            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(e.first_name, ' ', e.last_name) as name, e.email,
                            d.department_name, p.position_name
                     FROM employees e
                     LEFT JOIN departments d ON e.department_id = d.department_id
                     LEFT JOIN positions p ON e.position_id = p.position_id
                     WHERE e.employee_id = ?`,
                    [payroll.employee_id]
                );
                if (empRows.length) {
                    employeeName = empRows[0].name;
                    email = empRows[0].email || '';
                    department = empRows[0].department_name || 'N/A';
                    position = empRows[0].position_name || 'N/A';
                }
            } catch (_e) { /* ignore */ }

            const period = periodMap.get(periodKey);
            const grossPay = parseFloat(payroll.basic_pay || 0) + parseFloat(payroll.overtime_pay || 0) + parseFloat(payroll.bonuses || 0);
            
            period.payrolls.push({
                payrollId: payroll.payroll_id,
                employeeId: payroll.employee_id,
                employeeNumber: `EMP-${String(payroll.employee_id).padStart(3, '0')}`,
                employeeName,
                email,
                department,
                position,
                basicPay: parseFloat(payroll.basic_pay || 0),
                overtimePay: parseFloat(payroll.overtime_pay || 0),
                bonuses: parseFloat(payroll.bonuses || 0),
                grossPay,
                deductions: parseFloat(payroll.deductions || 0),
                netPay: parseFloat(payroll.net_pay || 0),
                // Tax contributions breakdown
                sss: parseFloat(payroll.sss_contribution || 0),
                philhealth: parseFloat(payroll.philhealth_contribution || 0),
                pagibig: parseFloat(payroll.pagibig_contribution || 0),
                tax: parseFloat(payroll.withholding_tax || 0),
                status: payroll.status || 'Pending',
                comments: payroll.comments || '',
                createdAt: payroll.created_at,
                updatedAt: payroll.updated_at,
                waitingDays: Math.ceil((today - new Date(payroll.created_at)) / (1000 * 60 * 60 * 24))
            });

            // Update stats
            period.stats.total++;
            period.stats.totalAmount += parseFloat(payroll.net_pay || 0);
            switch ((payroll.status || 'Pending').toLowerCase()) {
                case 'pending': period.stats.pending++; break;
                case 'processed': period.stats.processed++; break;
                case 'released': period.stats.released++; break;
                case 'rejected': period.stats.rejected++; break;
            }
        }

        // Convert to array and calculate final urgency based on unreleased payrolls
        const periods = Array.from(periodMap.values())
            .map(period => {
                // Recalculate urgency - only consider unreleased payrolls
                const hasUnreleasedPayrolls = period.payrolls.some(p => 
                    !['released', 'paid', 'completed'].includes((p.status || '').toLowerCase())
                );
                
                // If all payrolls are released, set urgency to 'completed'
                if (!hasUnreleasedPayrolls && period.stats.total > 0) {
                    period.urgency = 'completed';
                } else if (hasUnreleasedPayrolls && period.daysUntilPayDate <= 0) {
                    period.urgency = 'overdue';
                } else if (hasUnreleasedPayrolls && period.daysUntilPayDate <= 3) {
                    period.urgency = 'urgent';
                } else if (hasUnreleasedPayrolls && period.daysUntilPayDate <= 7) {
                    period.urgency = 'soon';
                } else {
                    period.urgency = 'normal';
                }
                
                return period;
            })
            .sort((a, b) => {
                // Sort by urgency first, then by pay date
                const urgencyOrder = { overdue: 0, urgent: 1, soon: 2, normal: 3, completed: 4 };
                if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
                }
                return new Date(a.payDate) - new Date(b.payDate);
            });

        // Sort payrolls within each period by waiting time (longest first)
        periods.forEach(period => {
            period.payrolls.sort((a, b) => b.waitingDays - a.waitingDays);
        });

        res.json(periods);

    } catch (error) {
        console.error('Error fetching payroll by period:', error);
        res.status(500).json({ error: 'Failed to fetch payroll data', details: error.message });
    }
});

export default router;