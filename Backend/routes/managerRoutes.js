/* eslint-disable no-unused-vars */
import express from 'express';
import { payrollDB, hrDB } from '../db.js';

const router = express.Router();

// =====================================================
// 1. MANAGER DASHBOARD STATS
// =====================================================
router.get('/dashboard-stats', async (req, res) => {
    try {
        // Get active employees count
        const [activeEmployees] = await hrDB.query(
            "SELECT COUNT(*) as count FROM employees"
        );

        // Get pending approvals (timesheets + requests)
        const [pendingTimesheets] = await payrollDB.query(
            "SELECT COUNT(*) as count FROM Timesheets WHERE approved_by IS NULL"
        );
        const [pendingRequests] = await payrollDB.query(
            "SELECT COUNT(*) as count FROM Requests WHERE status = 'Pending'"
        );

        // Get total department payroll (sum of net_pay for all time or current month)
        const [totalPayroll] = await payrollDB.query(
            `SELECT COALESCE(SUM(net_pay), 0) as total FROM Payroll`
        );

        // Calculate attendance rate based on timesheets
        const employeeCount = activeEmployees[0]?.count || 1;
        const [timesheetCount] = await payrollDB.query(
            `SELECT COUNT(DISTINCT CONCAT(employee_id, '-', date)) as count
             FROM Timesheets 
             WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())`
        );
        
        // Assume ~22 working days per month
        const expectedDays = employeeCount * 22;
        const actualDays = timesheetCount[0]?.count || 0;
        const attendanceRate = expectedDays > 0 
            ? Math.min(Math.round((actualDays / expectedDays) * 100), 100)
            : 96;

        res.json({
            activeEmployees: activeEmployees[0]?.count || 0,
            pendingApprovals: (pendingTimesheets[0]?.count || 0) + (pendingRequests[0]?.count || 0),
            totalDepartmentPayroll: parseFloat(totalPayroll[0]?.total) || 0,
            attendanceRate: attendanceRate
        });
    } catch (error) {
        console.error('Error fetching manager dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// =====================================================
// 2. TIMESHEETS - GET ALL WITH FILTERS
// =====================================================
router.get('/timesheets', async (req, res) => {
    try {
        const { search, status, startDate, endDate } = req.query;

        let query = `
            SELECT 
                t.timesheet_id,
                t.employee_id,
                t.date,
                t.time_in,
                t.time_out,
                t.break_duration,
                t.overtime_hours,
                t.remarks,
                t.approved_by,
                CASE 
                    WHEN t.approved_by IS NULL THEN 'Pending'
                    WHEN t.remarks = 'Rejected' THEN 'Rejected'
                    ELSE 'Approved'
                END as status
            FROM Timesheets t
            WHERE 1=1
        `;

        const params = [];

        if (startDate && endDate) {
            query += ` AND t.date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY t.date DESC, t.employee_id`;

        const [timesheets] = await payrollDB.query(query, params);
        console.log(`📋 Found ${timesheets.length} timesheets`);

        // Enrich with employee data
        const enrichedTimesheets = await Promise.all(timesheets.map(async (timesheet) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name,
                            p.position_name as position,
                            d.department_name as department
                     FROM employees e
                     LEFT JOIN positions p ON e.position_id = p.position_id
                     LEFT JOIN departments d ON e.department_id = d.department_id
                     WHERE e.employee_id = ?`,
                    [timesheet.employee_id]
                );

                // Calculate total hours
                let totalHours = 0;
                if (timesheet.time_in && timesheet.time_out) {
                    const timeIn = new Date(`2000-01-01 ${timesheet.time_in}`);
                    const timeOut = new Date(`2000-01-01 ${timesheet.time_out}`);
                    totalHours = (timeOut - timeIn) / (1000 * 60 * 60) - (timesheet.break_duration || 0);
                }

                return {
                    ...timesheet,
                    employee_name: empRows[0]?.employee_name || `Employee ${timesheet.employee_id}`,
                    position: empRows[0]?.position || 'N/A',
                    department: empRows[0]?.department || 'N/A',
                    total_hours: totalHours.toFixed(1)
                };
            } catch (_err) {
                return {
                    ...timesheet,
                    employee_name: `Employee ${timesheet.employee_id}`,
                    position: 'N/A',
                    department: 'N/A',
                    total_hours: '0'
                };
            }
        }));

        // Filter by search term
        let results = enrichedTimesheets;
        if (search) {
            results = enrichedTimesheets.filter(t =>
                t.employee_name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filter by status
        if (status && status !== 'all') {
            results = results.filter(t => t.status === status);
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching timesheets:', error);
        res.status(500).json({ error: 'Failed to fetch timesheets' });
    }
});

// =====================================================
// 3. TIMESHEETS - APPROVE
// =====================================================
router.put('/timesheets/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { approved_by } = req.body;

    try {
        console.log(`📝 Approving timesheet ID: ${id}`);
        
        // Get timesheet info for logging
        const [timesheetInfo] = await payrollDB.query(
            `SELECT employee_id FROM Timesheets WHERE timesheet_id = ?`, [id]
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Timesheets SET approved_by = ?, remarks = 'Approved' WHERE timesheet_id = ?`,
            [approved_by || 1, id]
        );

        // Log activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
             VALUES ('Approved', 'Timesheet', ?, ?, ?, ?)`,
            [id, timesheetInfo[0]?.employee_id, approved_by || 1, `Timesheet #${id} approved`]
        );

        console.log(`✅ Timesheet ${id} approved. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Timesheet approved successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error approving timesheet:', error);
        res.status(500).json({ error: 'Failed to approve timesheet', details: error.message });
    }
});

// =====================================================
// 4. TIMESHEETS - REJECT
// =====================================================
router.put('/timesheets/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { approved_by, reason, remarks } = req.body;

    try {
        console.log(`📝 Rejecting timesheet ID: ${id} with reason: ${reason || remarks}`);
        
        // Get timesheet info for logging
        const [timesheetInfo] = await payrollDB.query(
            `SELECT employee_id FROM Timesheets WHERE timesheet_id = ?`, [id]
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Timesheets SET approved_by = ?, remarks = ? WHERE timesheet_id = ?`,
            [approved_by || 1, `Rejected: ${reason || remarks || 'No reason provided'}`, id]
        );

        // Log activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
             VALUES ('Rejected', 'Timesheet', ?, ?, ?, ?)`,
            [id, timesheetInfo[0]?.employee_id, approved_by || 1, `Timesheet #${id} rejected: ${reason || remarks || 'No reason provided'}`]
        );

        console.log(`✅ Timesheet ${id} rejected. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Timesheet rejected successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error rejecting timesheet:', error);
        res.status(500).json({ error: 'Failed to reject timesheet', details: error.message });
    }
});

// =====================================================
// 5. TIMESHEETS - UPDATE (EDIT)
// =====================================================
router.put('/timesheets/:id', async (req, res) => {
    const { id } = req.params;
    const { time_in, time_out, break_duration, overtime_hours, total_hours, remarks, processed_by } = req.body;

    try {
        console.log(`📝 Updating timesheet ID: ${id}`);
        
        // Get old values for logging
        const [oldData] = await payrollDB.query(
            `SELECT * FROM Timesheets WHERE timesheet_id = ?`, [id]
        );
        
        const [result] = await payrollDB.query(
            `UPDATE Timesheets 
             SET time_in = COALESCE(?, time_in),
                 time_out = COALESCE(?, time_out),
                 break_duration = COALESCE(?, break_duration),
                 overtime_hours = COALESCE(?, overtime_hours),
                 remarks = COALESCE(?, remarks)
             WHERE timesheet_id = ?`,
            [time_in, time_out, break_duration, overtime_hours, remarks, id]
        );

        // Log activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description, old_values, new_values)
             VALUES ('Updated', 'Timesheet', ?, ?, ?, ?, ?, ?)`,
            [
                id, 
                oldData[0]?.employee_id, 
                processed_by || 1, 
                `Timesheet #${id} updated`,
                JSON.stringify({ time_in: oldData[0]?.time_in, time_out: oldData[0]?.time_out }),
                JSON.stringify({ time_in, time_out, overtime_hours })
            ]
        );

        console.log(`✅ Timesheet ${id} updated. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Timesheet updated successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error updating timesheet:', error);
        res.status(500).json({ error: 'Failed to update timesheet', details: error.message });
    }
});

// =====================================================
// 6. TIMESHEETS - CREATE MANUAL ENTRY
// =====================================================
router.post('/timesheets', async (req, res) => {
    const { employee_id, date, time_in, time_out, break_duration, overtime_hours, remarks, processed_by } = req.body;

    try {
        console.log(`📝 Creating manual timesheet for employee ${employee_id}`);
        
        // Check if entry already exists for this employee on this date
        const [existing] = await payrollDB.query(
            `SELECT timesheet_id FROM Timesheets WHERE employee_id = ? AND date = ?`,
            [employee_id, date]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Timesheet entry already exists for this employee on this date' });
        }

        const [result] = await payrollDB.query(
            `INSERT INTO Timesheets (employee_id, date, time_in, time_out, break_duration, overtime_hours, remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [employee_id, date, time_in, time_out, break_duration || 1.00, overtime_hours || 0, remarks || 'Manual Entry']
        );

        // Log activity
        await payrollDB.query(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
             VALUES ('Created', 'Timesheet', ?, ?, ?, ?)`,
            [result.insertId, employee_id, processed_by || 1, `Manual timesheet entry created for ${date}`]
        );

        console.log(`✅ Timesheet created with ID: ${result.insertId}`);
        res.json({ success: true, message: 'Timesheet created successfully', timesheetId: result.insertId });
    } catch (error) {
        console.error('Error creating timesheet:', error);
        res.status(500).json({ error: 'Failed to create timesheet', details: error.message });
    }
});

// =====================================================
// 7. PENDING REQUESTS - GET ALL
// =====================================================
router.get('/pending-requests', async (req, res) => {
    try {
        const { search, type, status } = req.query;

        let query = `SELECT * FROM Requests WHERE 1=1`;
        const params = [];

        if (status && status !== 'all') {
            query += ` AND status = ?`;
            params.push(status);
        }

        if (type && type !== 'all') {
            query += ` AND request_type = ?`;
            params.push(type);
        }

        query += ` ORDER BY COALESCE(updated_at, date_filed) DESC, date_filed DESC`;

        const [requests] = await payrollDB.query(query, params);
        console.log(`📋 Found ${requests.length} requests`);

        // Enrich with employee data
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

// =====================================================
// 8. PENDING REQUESTS - APPROVE
// =====================================================
router.put('/pending-requests/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { approved_by, remarks } = req.body;

    try {
        console.log(`📝 Approving request ID: ${id}`);
        const [result] = await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Approved', approved_by = ?, remarks = ?
             WHERE request_id = ?`,
            [approved_by || 1, remarks || 'Approved', id]
        );

        console.log(`✅ Request ${id} approved. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Request approved successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Failed to approve request', details: error.message });
    }
});

// =====================================================
// 9. PENDING REQUESTS - REJECT
// =====================================================
router.put('/pending-requests/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { approved_by, remarks } = req.body;

    try {
        console.log(`📝 Rejecting request ID: ${id}`);
        const [result] = await payrollDB.query(
            `UPDATE Requests 
             SET status = 'Rejected', approved_by = ?, remarks = ?
             WHERE request_id = ?`,
            [approved_by || 1, remarks || 'Rejected', id]
        );

        console.log(`✅ Request ${id} rejected. Affected rows: ${result.affectedRows}`);
        res.json({ success: true, message: 'Request rejected successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request', details: error.message });
    }
});

// =====================================================
// 10. PAYROLL MANAGEMENT - GET EMPLOYEE PAYROLL DATA
// =====================================================
router.get('/payroll', async (req, res) => {
    try {
        const { search } = req.query;

        const [payrolls] = await payrollDB.query(`
            SELECT 
                p.payroll_id,
                p.employee_id,
                p.basic_pay,
                p.overtime_pay,
                p.bonuses,
                p.deductions,
                p.net_pay,
                p.status,
                p.pay_date,
                p.cutoff_start_date,
                p.cutoff_end_date
            FROM Payroll p
            ORDER BY p.pay_date DESC, p.employee_id
        `);

        // Enrich with employee data
        const enrichedPayrolls = await Promise.all(payrolls.map(async (payroll) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name,
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
                    department: empRows[0]?.department || 'N/A',
                    gross: payroll.basic_pay + payroll.overtime_pay + payroll.bonuses,
                    benefits: payroll.bonuses
                };
            } catch (_err) {
                return {
                    ...payroll,
                    employee_name: `Employee ${payroll.employee_id}`,
                    position: 'N/A',
                    department: 'N/A',
                    gross: payroll.basic_pay + payroll.overtime_pay + payroll.bonuses,
                    benefits: payroll.bonuses
                };
            }
        }));

        // Filter by search
        let results = enrichedPayrolls;
        if (search) {
            results = enrichedPayrolls.filter(p =>
                p.employee_name.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching payroll data:', error);
        res.status(500).json({ error: 'Failed to fetch payroll data' });
    }
});

// =====================================================
// 11. REPORTS - GET DEDUCTION DATA
// =====================================================
router.get('/reports/deductions', async (req, res) => {
    try {
        const [deductions] = await payrollDB.query(`
            SELECT 
                tc.employee_id,
                SUM(tc.withholding_tax) as tax,
                SUM(tc.sss_contribution) as sss,
                SUM(tc.philhealth_contribution) as philhealth,
                SUM(tc.pagibig_contribution) as pagibig,
                SUM(tc.total_contributions) as total
            FROM TaxContributions tc
            GROUP BY tc.employee_id
            ORDER BY tc.employee_id
        `);

        // Enrich with employee names
        const enrichedDeductions = await Promise.all(deductions.map(async (ded) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name
                     FROM employees WHERE employee_id = ?`,
                    [ded.employee_id]
                );

                return {
                    ...ded,
                    employee_name: empRows[0]?.employee_name || `Employee ${ded.employee_id}`
                };
            } catch (_err) {
                return {
                    ...ded,
                    employee_name: `Employee ${ded.employee_id}`
                };
            }
        }));

        res.json(enrichedDeductions);
    } catch (error) {
        console.error('Error fetching deduction data:', error);
        res.status(500).json({ error: 'Failed to fetch deduction data' });
    }
});

// =====================================================
// 12. GET EMPLOYEES LIST (for dropdowns)
// =====================================================
router.get('/employees', async (req, res) => {
    try {
        const [employees] = await hrDB.query(
            `SELECT 
                e.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as full_name,
                p.position_name as position,
                d.department_name as department
             FROM employees e
             LEFT JOIN positions p ON e.position_id = p.position_id
             LEFT JOIN departments d ON e.department_id = d.department_id
             ORDER BY e.first_name, e.last_name`
        );

        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// =====================================================
// 13. GET SINGLE TIMESHEET
// =====================================================
router.get('/timesheets/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [timesheets] = await payrollDB.query(
            `SELECT * FROM Timesheets WHERE timesheet_id = ?`,
            [id]
        );

        if (timesheets.length === 0) {
            return res.status(404).json({ error: 'Timesheet not found' });
        }

        const timesheet = timesheets[0];

        // Get employee info
        try {
            const [empRows] = await hrDB.query(
                `SELECT CONCAT(first_name, ' ', last_name) as employee_name,
                        p.position_name as position,
                        d.department_name as department
                 FROM employees e
                 LEFT JOIN positions p ON e.position_id = p.position_id
                 LEFT JOIN departments d ON e.department_id = d.department_id
                 WHERE e.employee_id = ?`,
                [timesheet.employee_id]
            );

            res.json({
                ...timesheet,
                employee_name: empRows[0]?.employee_name || `Employee ${timesheet.employee_id}`,
                position: empRows[0]?.position || 'N/A',
                department: empRows[0]?.department || 'N/A'
            });
        } catch (_err) {
            res.json({
                ...timesheet,
                employee_name: `Employee ${timesheet.employee_id}`,
                position: 'N/A',
                department: 'N/A'
            });
        }
    } catch (error) {
        console.error('Error fetching timesheet:', error);
        res.status(500).json({ error: 'Failed to fetch timesheet', details: error.message });
    }
});

// =====================================================
// 14. ACTIVITY LOGS - GET RECENT ACTIVITY
// =====================================================
router.get('/activity-logs', async (req, res) => {
    try {
        // Get recent activities from ActivityLogs table
        const [activities] = await payrollDB.query(`
            SELECT 
                log_id as id,
                action_type,
                entity_type as type,
                entity_id,
                employee_id,
                processed_by as processed_by_id,
                description,
                created_at as date_time
            FROM ActivityLogs
            ORDER BY created_at DESC
            LIMIT 20
        `);

        // Enrich with names
        const enrichedActivities = await Promise.all(activities.map(async (activity) => {
            let employeeName = `Employee ${activity.employee_id}`;
            let processedBy = 'System';

            try {
                // Get employee name
                if (activity.employee_id) {
                    const [empRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as name FROM employees WHERE employee_id = ?`,
                        [activity.employee_id]
                    );
                    if (empRows.length > 0) employeeName = empRows[0].name;
                }

                // Get processed by name
                if (activity.processed_by_id) {
                    const [empRows] = await hrDB.query(
                        `SELECT CONCAT(first_name, ' ', last_name) as name FROM employees WHERE employee_id = ?`,
                        [activity.processed_by_id]
                    );
                    if (empRows.length > 0) processedBy = empRows[0].name;
                }
            } catch (_err) {
                // Keep defaults
            }

            return {
                id: activity.id,
                type: activity.type,
                action: `${activity.type} ${activity.action_type}`,
                employee: employeeName,
                processedBy: processedBy,
                dateTime: activity.date_time,
                description: activity.description,
                status: activity.action_type
            };
        }));

        res.json(enrichedActivities);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

// =====================================================
// 15. TOP PERFORMING EMPLOYEES
// =====================================================
router.get('/top-employees', async (req, res) => {
    try {
        // Get employees with most work hours and attendance
        const [topEmployees] = await payrollDB.query(`
            SELECT 
                employee_id,
                COUNT(*) as days_present,
                SUM(overtime_hours) as total_overtime,
                AVG(TIMESTAMPDIFF(HOUR, time_in, time_out) - break_duration) as avg_hours
            FROM Timesheets
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY employee_id
            ORDER BY days_present DESC, total_overtime DESC
            LIMIT 5
        `);

        // Enrich with employee names
        const enrichedEmployees = await Promise.all(topEmployees.map(async (emp, index) => {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT CONCAT(first_name, ' ', last_name) as name, 
                            p.position_name as position
                     FROM employees e
                     LEFT JOIN positions p ON e.position_id = p.position_id
                     WHERE e.employee_id = ?`,
                    [emp.employee_id]
                );
                return {
                    rank: index + 1,
                    name: empRows[0]?.name || `Employee ${emp.employee_id}`,
                    position: empRows[0]?.position || 'N/A',
                    daysPresent: emp.days_present,
                    avgHours: parseFloat(emp.avg_hours || 0).toFixed(1),
                    overtime: parseFloat(emp.total_overtime || 0).toFixed(1)
                };
            } catch (_err) {
                return {
                    rank: index + 1,
                    name: `Employee ${emp.employee_id}`,
                    position: 'N/A',
                    daysPresent: emp.days_present,
                    avgHours: '0',
                    overtime: '0'
                };
            }
        }));

        res.json(enrichedEmployees);
    } catch (error) {
        console.error('Error fetching top employees:', error);
        res.status(500).json({ error: 'Failed to fetch top employees' });
    }
});

// =====================================================
// 16. EARNINGS DATA FOR CHART
// =====================================================
router.get('/earnings-chart', async (req, res) => {
    try {
        const [earningsData] = await payrollDB.query(`
            SELECT 
                DATE_FORMAT(MIN(pay_date), '%b') as month,
                DATE_FORMAT(MIN(pay_date), '%Y-%m') as month_year,
                SUM(net_pay) as earnings
            FROM Payroll
            WHERE pay_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(pay_date), MONTH(pay_date)
            ORDER BY month_year ASC
        `);

        res.json(earningsData);
    } catch (error) {
        console.error('Error fetching earnings data:', error);
        res.status(500).json({ error: 'Failed to fetch earnings data' });
    }
});

// =====================================================
// 17. DEPARTMENT SUMMARY FOR REPORTS
// =====================================================
router.get('/reports/department-summary', async (req, res) => {
    try {
        // Get payroll totals and group by department
        const [payrollData] = await payrollDB.query(`
            SELECT 
                p.employee_id,
                SUM(p.net_pay) as total_pay,
                SUM(p.deductions) as total_deductions
            FROM Payroll p
            WHERE p.pay_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
            GROUP BY p.employee_id
        `);

        // Group by department
        const deptTotals = {};
        for (const row of payrollData) {
            try {
                const [empRows] = await hrDB.query(
                    `SELECT d.department_name as department
                     FROM employees e
                     LEFT JOIN departments d ON e.department_id = d.department_id
                     WHERE e.employee_id = ?`,
                    [row.employee_id]
                );
                const dept = empRows[0]?.department || 'Unknown';
                if (!deptTotals[dept]) {
                    deptTotals[dept] = { name: dept, totalPay: 0, employees: 0 };
                }
                deptTotals[dept].totalPay += parseFloat(row.total_pay) || 0;
                deptTotals[dept].employees += 1;
            } catch (_err) {
                // Skip
            }
        }

        res.json(Object.values(deptTotals));
    } catch (error) {
        console.error('Error fetching department summary:', error);
        res.status(500).json({ error: 'Failed to fetch department summary' });
    }
});

// =====================================================
// 18. TAX COMPLIANCE SUMMARY
// =====================================================
router.get('/reports/tax-summary', async (req, res) => {
    try {
        const [taxData] = await payrollDB.query(`
            SELECT 
                DATE_FORMAT(MIN(p.pay_date), '%b %Y') as period,
                SUM(tc.sss_contribution) as sss,
                SUM(tc.philhealth_contribution) as philhealth,
                SUM(tc.pagibig_contribution) as pagibig,
                SUM(tc.withholding_tax) as tax
            FROM TaxContributions tc
            JOIN Payroll p ON tc.payroll_id = p.payroll_id
            WHERE p.pay_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(p.pay_date), MONTH(p.pay_date)
            ORDER BY MIN(p.pay_date) ASC
        `);

        res.json(taxData);
    } catch (error) {
        console.error('Error fetching tax summary:', error);
        res.status(500).json({ error: 'Failed to fetch tax summary' });
    }
});

// =====================================================
// 19. SALARY CALCULATION ENDPOINT
// =====================================================
router.post('/calculate-salary', async (req, res) => {
    const { employee_id, cutoff_start, cutoff_end } = req.body;

    try {
        // Get employee salary info from HR database
        const [empInfo] = await hrDB.query(`
            SELECT 
                e.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as name,
                e.salary,
                p.position_name,
                e.department_id
            FROM employees e
            LEFT JOIN positions p ON e.position_id = p.position_id
            WHERE e.employee_id = ?
        `, [employee_id]);

        if (empInfo.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employee = empInfo[0];
        const monthlySalary = parseFloat(employee.salary) || 25000;

        // Get active payroll rules from PayrollRules table
        const [payrollRules] = await payrollDB.query(`
            SELECT rule_id, rule_name, rule_type, formula, fixed_amount, applies_to
            FROM PayrollRules
            WHERE is_active = 1
            ORDER BY rule_type, rule_name
        `);

        // Get timesheets for the cutoff period
        const [timesheets] = await payrollDB.query(`
            SELECT 
                date,
                time_in,
                time_out,
                break_duration,
                overtime_hours
            FROM Timesheets
            WHERE employee_id = ? 
              AND date BETWEEN ? AND ?
              AND remarks = 'Approved'
        `, [employee_id, cutoff_start, cutoff_end]);

        // Calculate work hours and overtime
        let totalRegularHours = 0;
        let totalOvertimeHours = 0;
        let daysWorked = timesheets.length;

        timesheets.forEach(ts => {
            const breakHours = parseFloat(ts.break_duration) || 1;
            const overtimeHrs = parseFloat(ts.overtime_hours) || 0;
            
            if (ts.time_in && ts.time_out) {
                const timeIn = new Date(`1970-01-01T${ts.time_in}`);
                const timeOut = new Date(`1970-01-01T${ts.time_out}`);
                const workedHours = (timeOut - timeIn) / (1000 * 60 * 60) - breakHours;
                
                const regularHrs = Math.min(workedHours, 8);
                totalRegularHours += regularHrs;
                totalOvertimeHours += overtimeHrs;
            }
        });

        // Philippine Payroll Calculation
        const workingDaysPerMonth = 22;
        const regularHoursPerDay = 8;
        
        const dailyRate = monthlySalary / workingDaysPerMonth;
        const hourlyRate = dailyRate / regularHoursPerDay;
        
        // Base Earnings
        const basicPay = daysWorked * dailyRate;
        
        // Apply earning rules from PayrollRules
        let overtimePay = 0;
        let additionalEarnings = 0;
        let earningsBreakdown = [];

        // Find overtime rule or use default 25%
        const overtimeRule = payrollRules.find(r => 
            r.rule_name.toLowerCase().includes('overtime') && r.rule_type === 'earning'
        );
        const overtimeMultiplier = overtimeRule && overtimeRule.formula 
            ? 1 + (parseFloat(overtimeRule.formula) / 100)
            : 1.25; // Default 25% OT premium
        
        overtimePay = totalOvertimeHours * hourlyRate * overtimeMultiplier;
        
        // Apply other earning rules
        payrollRules.filter(r => r.rule_type === 'earning' && !r.rule_name.toLowerCase().includes('overtime'))
            .forEach(rule => {
                let amount = 0;
                if (rule.fixed_amount) {
                    amount = parseFloat(rule.fixed_amount);
                } else if (rule.formula) {
                    // Formula is percentage of basic pay
                    amount = basicPay * (parseFloat(rule.formula) / 100);
                }
                if (amount > 0) {
                    additionalEarnings += amount;
                    earningsBreakdown.push({ name: rule.rule_name, amount: amount.toFixed(2) });
                }
            });

        const grossPay = basicPay + overtimePay + additionalEarnings;

        // Apply deduction rules from PayrollRules
        let sssContribution = 0;
        let philhealthContribution = 0;
        let pagibigContribution = 0;
        let withholdingTax = 0;
        let otherDeductions = 0;
        let deductionsBreakdown = [];

        // Check for SSS rule
        const sssRule = payrollRules.find(r => 
            r.rule_name.toLowerCase().includes('sss') && r.rule_type === 'deduction'
        );
        if (sssRule) {
            if (sssRule.fixed_amount) {
                sssContribution = parseFloat(sssRule.fixed_amount);
            } else if (sssRule.formula) {
                sssContribution = Math.min(monthlySalary * (parseFloat(sssRule.formula) / 100), 1350);
            }
        } else {
            // Default SSS: 4.5% of salary, max 1350
            sssContribution = Math.min(monthlySalary * 0.045, 1350);
        }
        deductionsBreakdown.push({ name: 'SSS', amount: sssContribution.toFixed(2) });

        // Check for PhilHealth rule
        const philhealthRule = payrollRules.find(r => 
            r.rule_name.toLowerCase().includes('philhealth') && r.rule_type === 'deduction'
        );
        if (philhealthRule) {
            if (philhealthRule.fixed_amount) {
                philhealthContribution = parseFloat(philhealthRule.fixed_amount);
            } else if (philhealthRule.formula) {
                philhealthContribution = monthlySalary * (parseFloat(philhealthRule.formula) / 100);
            }
        } else {
            // Default PhilHealth: 2.5% employee share
            philhealthContribution = monthlySalary * 0.025;
        }
        deductionsBreakdown.push({ name: 'PhilHealth', amount: philhealthContribution.toFixed(2) });

        // Check for Pag-IBIG rule
        const pagibigRule = payrollRules.find(r => 
            (r.rule_name.toLowerCase().includes('pagibig') || r.rule_name.toLowerCase().includes('pag-ibig') || r.rule_name.toLowerCase().includes('hdmf')) 
            && r.rule_type === 'deduction'
        );
        if (pagibigRule) {
            if (pagibigRule.fixed_amount) {
                pagibigContribution = parseFloat(pagibigRule.fixed_amount);
            } else if (pagibigRule.formula) {
                pagibigContribution = Math.min(monthlySalary * (parseFloat(pagibigRule.formula) / 100), 100);
            }
        } else {
            // Default Pag-IBIG: 2% up to 100 max
            pagibigContribution = Math.min(monthlySalary * 0.02, 100);
        }
        deductionsBreakdown.push({ name: 'Pag-IBIG', amount: pagibigContribution.toFixed(2) });

        // Withholding Tax (progressive tax - usually not in rules, computed based on taxable income)
        const taxableIncome = grossPay - sssContribution - philhealthContribution - pagibigContribution;
        
        if (taxableIncome > 20833) { // Above 250k annual
            if (taxableIncome <= 33333) {
                withholdingTax = (taxableIncome - 20833) * 0.15;
            } else if (taxableIncome <= 66667) {
                withholdingTax = 1875 + (taxableIncome - 33333) * 0.20;
            } else if (taxableIncome <= 166667) {
                withholdingTax = 8541.67 + (taxableIncome - 66667) * 0.25;
            } else if (taxableIncome <= 666667) {
                withholdingTax = 33541.67 + (taxableIncome - 166667) * 0.30;
            } else {
                withholdingTax = 183541.67 + (taxableIncome - 666667) * 0.35;
            }
        }
        deductionsBreakdown.push({ name: 'Withholding Tax', amount: withholdingTax.toFixed(2) });

        // Apply other deduction rules
        payrollRules.filter(r => 
            r.rule_type === 'deduction' && 
            !r.rule_name.toLowerCase().includes('sss') &&
            !r.rule_name.toLowerCase().includes('philhealth') &&
            !r.rule_name.toLowerCase().includes('pagibig') &&
            !r.rule_name.toLowerCase().includes('pag-ibig') &&
            !r.rule_name.toLowerCase().includes('hdmf')
        ).forEach(rule => {
            let amount = 0;
            if (rule.fixed_amount) {
                amount = parseFloat(rule.fixed_amount);
            } else if (rule.formula) {
                amount = grossPay * (parseFloat(rule.formula) / 100);
            }
            if (amount > 0) {
                otherDeductions += amount;
                deductionsBreakdown.push({ name: rule.rule_name, amount: amount.toFixed(2) });
            }
        });

        const totalDeductions = sssContribution + philhealthContribution + pagibigContribution + withholdingTax + otherDeductions;
        const netPay = grossPay - totalDeductions;

        res.json({
            employee: {
                id: employee.employee_id,
                name: employee.name,
                position: employee.position_name,
                monthlySalary: monthlySalary
            },
            period: {
                start: cutoff_start,
                end: cutoff_end,
                daysWorked: daysWorked
            },
            workHours: {
                regularHours: totalRegularHours.toFixed(2),
                overtimeHours: totalOvertimeHours.toFixed(2)
            },
            rates: {
                dailyRate: dailyRate.toFixed(2),
                hourlyRate: hourlyRate.toFixed(2),
                overtimeRate: (hourlyRate * overtimeMultiplier).toFixed(2)
            },
            earnings: {
                basicPay: basicPay.toFixed(2),
                overtimePay: overtimePay.toFixed(2),
                additionalEarnings: additionalEarnings.toFixed(2),
                grossPay: grossPay.toFixed(2),
                breakdown: earningsBreakdown
            },
            deductions: {
                sss: sssContribution.toFixed(2),
                philhealth: philhealthContribution.toFixed(2),
                pagibig: pagibigContribution.toFixed(2),
                withholdingTax: withholdingTax.toFixed(2),
                otherDeductions: otherDeductions.toFixed(2),
                totalDeductions: totalDeductions.toFixed(2),
                breakdown: deductionsBreakdown
            },
            netPay: netPay.toFixed(2),
            appliedRules: payrollRules.map(r => ({ id: r.rule_id, name: r.rule_name, type: r.rule_type }))
        });
    } catch (error) {
        console.error('Error calculating salary:', error);
        res.status(500).json({ error: 'Failed to calculate salary', details: error.message });
    }
});

// =====================================================
// 20. GENERATE PAYROLL FOR EMPLOYEE
// =====================================================
router.post('/generate-payroll', async (req, res) => {
    const { employee_id, cutoff_start, cutoff_end, pay_date, prepared_by } = req.body;

    try {
        // First calculate salary
        const [empInfo] = await hrDB.query(`
            SELECT 
                e.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as name,
                e.salary
            FROM employees e
            WHERE e.employee_id = ?
        `, [employee_id]);

        if (empInfo.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const monthlySalary = parseFloat(empInfo[0].salary) || 25000;

        // Get approved timesheets
        const [timesheets] = await payrollDB.query(`
            SELECT overtime_hours FROM Timesheets
            WHERE employee_id = ? AND date BETWEEN ? AND ? AND remarks = 'Approved'
        `, [employee_id, cutoff_start, cutoff_end]);

        const daysWorked = timesheets.length;
        const totalOvertimeHours = timesheets.reduce((sum, ts) => sum + (parseFloat(ts.overtime_hours) || 0), 0);

        const dailyRate = monthlySalary / 22;
        const hourlyRate = dailyRate / 8;
        
        const basicPay = daysWorked * dailyRate;
        const overtimePay = totalOvertimeHours * hourlyRate * 1.25;
        const grossPay = basicPay + overtimePay;

        // Deductions
        const sss = Math.min(monthlySalary * 0.045, 1350);
        const philhealth = monthlySalary * 0.025;
        const pagibig = Math.min(monthlySalary * 0.02, 100);
        const totalDeductions = sss + philhealth + pagibig;
        const netPay = grossPay - totalDeductions;

        // Insert payroll record
        const [result] = await payrollDB.query(`
            INSERT INTO Payroll (
                employee_id, cutoff_start_date, cutoff_end_date, pay_date,
                payroll_frequency, prepared_by, basic_pay, overtime_pay,
                bonuses, status, deductions, net_pay, payslip_reference_number
            ) VALUES (?, ?, ?, ?, 'Semi-Monthly', ?, ?, ?, 0, 'Pending', ?, ?, ?)
        `, [
            employee_id, cutoff_start, cutoff_end, pay_date,
            prepared_by || 1, basicPay, overtimePay, totalDeductions, netPay,
            `PAY-${Date.now()}`
        ]);

        // Log activity
        await payrollDB.query(`
            INSERT INTO ActivityLogs (action_type, entity_type, entity_id, employee_id, processed_by, description)
            VALUES ('Created', 'Payroll', ?, ?, ?, ?)
        `, [result.insertId, employee_id, prepared_by || 1, `Payroll generated for ${empInfo[0].name}`]);

        res.json({
            success: true,
            payrollId: result.insertId,
            message: 'Payroll generated successfully',
            summary: {
                grossPay: grossPay.toFixed(2),
                deductions: totalDeductions.toFixed(2),
                netPay: netPay.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error generating payroll:', error);
        res.status(500).json({ error: 'Failed to generate payroll', details: error.message });
    }
});

export default router;
