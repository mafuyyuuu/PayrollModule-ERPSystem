/* eslint-disable no-unused-vars */
import express from 'express';
import { payrollDB, hrDB } from '../db.js';

const router = express.Router();

// =====================================================
// HELPER: Sync EMS/HR Approvals - deduct leave when HR approves
// =====================================================
const syncEmsApprovals = async () => {
    try {
        // Find leave requests that HR has approved (emsRemarks indicates HR processed it)
        // These are requests where payroll set emsStatus = 'APPROVED' and HR has added emsRemarks
        const [approvedLeaveRequests] = await payrollDB.query(
            `SELECT request_id, employee_id, request_type, request_description, total_days, emsStatus, emsRemarks
             FROM Requests 
             WHERE status = 'Approved' 
               AND emsStatus = 'APPROVED'
               AND emsRemarks IS NOT NULL
               AND emsRemarks != ''
               AND emsRemarks NOT LIKE '%[PROCESSED]%'`
        );

        for (const request of approvedLeaveRequests) {
            // If Leave request (not Overtime, Bonus, Reimbursement), deduct from balance
            if (request.request_type && !['Overtime', 'Bonus', 'Reimbursement'].includes(request.request_type)) {
                try {
                    // Use total_days column, fallback to parsing description for old records
                    let totalDays = request.total_days;
                    if (!totalDays) {
                        const description = request.request_description || '';
                        const daysMatch = description.match(/(\d+)\s*days?\)/i);
                        totalDays = daysMatch ? parseInt(daysMatch[1]) : 1;
                    }
                    
                    // request_type is the leave type name (e.g., "Vacation Leave")
                    const leaveTypeName = request.request_type;
                    
                    const [leaveTypes] = await hrDB.query(
                        `SELECT leave_type_id FROM leavetype WHERE leave_name = ?`,
                        [leaveTypeName]
                    );
                    
                    if (leaveTypes.length > 0) {
                        await hrDB.query(
                            `UPDATE remainingleaves 
                             SET num_of_leaves = GREATEST(0, num_of_leaves - ?)
                             WHERE employee_id = ? AND leave_type_id = ?`,
                            [totalDays, request.employee_id, leaveTypes[0].leave_type_id]
                        );
                        
                        // Mark as processed so we don't deduct again
                        await payrollDB.query(
                            `UPDATE Requests SET emsRemarks = CONCAT(COALESCE(emsRemarks, ''), ' [PROCESSED]') WHERE request_id = ?`,
                            [request.request_id]
                        );
                        
                        console.log(`[SYNC] Deducted ${totalDays} days from employee ${request.employee_id}'s ${leaveTypeName} balance`);
                    }
                } catch (leaveError) {
                    console.error(`[SYNC ERROR] Failed to deduct leave:`, leaveError.message);
                }
            }
        }

        // Check for HR rejections
        const [rejectedRequests] = await payrollDB.query(
            `SELECT request_id, employee_id, request_type, emsRemarks
             FROM Requests 
             WHERE status = 'Approved'
               AND emsStatus = 'REJECTED'`
        );

        for (const request of rejectedRequests) {
            await payrollDB.query(
                `UPDATE Requests 
                 SET status = 'Rejected', 
                     remarks = CONCAT(COALESCE(remarks, ''), ' | HR Rejected: ', COALESCE(emsRemarks, 'No remarks')),
                     updated_at = NOW()
                 WHERE request_id = ?`,
                [request.request_id]
            );
            console.log(`[SYNC] Request ${request.request_id} rejected by HR`);
        }
    } catch (error) {
        console.error('[SYNC ERROR] Failed to sync EMS approvals:', error.message);
    }
};

// =====================================================
// EMPLOYEE PROFILE ROUTE
// =====================================================

// GET EMPLOYEE PROFILE
router.get('/profile/:employeeId', async (req, res) => {
    const { employeeId } = req.params;

    console.log('📋 Fetching profile for employee:', employeeId);

    try {
        // ✅ Get employee data
        const [employees] = await hrDB.query(
            `SELECT * FROM employees WHERE employee_id = ?`,
            [employeeId]
        );

        if (employees.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const emp = employees[0];

        // ✅ Get position
        let positionTitle = "—";
        if (emp.position_id) {
            try {
                const [positions] = await hrDB.query(
                    `SELECT position_name FROM positions WHERE position_id = ?`,
                    [emp.position_id]
                );
                positionTitle = positions[0]?.position_name || "—";
            } catch (e) {
                console.log('⚠️ Could not fetch position:', e.message);
            }
        }

        // ✅ Get department
        let departmentName = "—";
        if (emp.department_id) {
            try {
                const [departments] = await hrDB.query(
                    `SELECT department_name FROM departments WHERE department_id = ?`,
                    [emp.department_id]
                );
                departmentName = departments[0]?.department_name || "—";
            } catch (e) {
                console.log('⚠️ Could not fetch department:', e.message);
            }
        }

        // ✅ Get employee type
        let employeeTypeName = "—";
        if (emp.employee_type_id) {
            try {
                const [types] = await hrDB.query(
                    `SELECT employee_type_name FROM employeetype WHERE employee_type_id = ?`,
                    [emp.employee_type_id]
                );
                employeeTypeName = types[0]?.employee_type_name || "—";
            } catch (e) {
                console.log('⚠️ Could not fetch employee type:', e.message);
            }
        }

        // ✅ Get emergency contact from emergencycontacts table
        let emergencyContact = {
            name: "—",
            relationship: "—",
            contactNumber: "—"
        };
        try {
            const [contacts] = await hrDB.query(
                `SELECT * FROM emergencycontacts WHERE employee_id = ? LIMIT 1`,
                [employeeId]
            );
            if (contacts.length > 0) {
                const contact = contacts[0];
                emergencyContact = {
                    name: contact.contact_name || "—",
                    relationship: contact.relationship || "—",
                    contactNumber: contact.contact_number || "—"
                };
            }
        } catch (e) {
            console.log('⚠️ Could not fetch emergency contact:', e.message);
        }

        // Calculate age
        let age = "—";
        if (emp.date_of_birth) {
            const today = new Date();
            const birthDate = new Date(emp.date_of_birth);
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        // ✅ Map to frontend fields
        const profileData = {
            // Basic info
            employeeId: emp.employee_id,
            firstName: emp.first_name,
            middleName: emp.middle_name,
            lastName: emp.last_name,
            suffix: emp.suffix,
            name: `${emp.first_name || ''} ${emp.middle_name || ''} ${emp.last_name || ''} ${emp.suffix || ''}`.trim().replace(/\s+/g, ' '),
            email: emp.email,

            // Personal info
            address: emp.address || "—",
            birthday: emp.date_of_birth,
            age: age,
            sex: emp.sex,
            maritalStatus: emp.marital_status,
            contactNumber: emp.contact_number || "—",
            salary: emp.salary,

            // ✅ Emergency contact from emergencycontacts table
            emergencyContactName: emergencyContact.name,
            emergencyContactRelationship: emergencyContact.relationship,
            emergencyContactNumber: emergencyContact.contactNumber,

            // Employment info
            department: departmentName,
            departmentId: emp.department_id,
            position: positionTitle,
            positionId: emp.position_id,
            employmentType: employeeTypeName,
            employeeTypeId: emp.employee_type_id,
            roleId: emp.role_id,
            employeeScheduleId: emp.employee_schedule_id,
            profilePath: emp.profile_path
        };

        console.log('✅ Profile data ready for employee:', emp.first_name, emp.last_name);
        res.json(profileData);
    } catch (error) {
        console.error('❌ Error fetching profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }
});

// =====================================================
// LEAVE MANAGEMENT ROUTES
// =====================================================

// GET ALL LEAVE TYPES
router.get('/leave-types', async (req, res) => {
    try {
        const [leaveTypes] = await hrDB.query(
            `SELECT 
                leave_type_id,
                leave_name as leave_type_name,
                leave_amount as max_days_per_year
             FROM leavetype
             ORDER BY leave_type_id`
        );

        res.json(leaveTypes);
    } catch (error) {
        console.error('Error fetching leave types:', error.message);
        res.status(500).json({ error: 'Failed to fetch leave types' });
    }
});

// GET EMPLOYEE LEAVE BALANCES
router.get('/leave-balances/:employeeId', async (req, res) => {
    const { employeeId } = req.params;

    console.log('📋 Fetching leave balances for employee:', employeeId);

    try {
        const [balances] = await hrDB.query(
            `SELECT 
                rl.leave_id as balance_id,
                rl.employee_id,
                rl.leave_type_id,
                lt.leave_name as leave_type_name,
                lt.leave_amount as total_days,
                rl.num_of_leaves as remaining_days,
                (lt.leave_amount - rl.num_of_leaves) as used_days
             FROM remainingleaves rl
             JOIN leavetype lt ON rl.leave_type_id = lt.leave_type_id
             WHERE rl.employee_id = ?
             ORDER BY rl.leave_type_id`,
            [employeeId]
        );

        console.log('✅ Found', balances.length, 'leave balances');
        res.json(balances);
    } catch (error) {
        console.error('❌ Error fetching leave balances:', error.message);
        res.status(500).json({ error: 'Failed to fetch leave balances' });
    }
});

// GET EMPLOYEE LEAVE REQUESTS (from Payroll DB Requests table)
router.get('/leave-requests/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { status } = req.query;

    try {
        let query = `
            SELECT 
                request_id,
                employee_id,
                request_type as leave_type_name,
                request_description as reason,
                date_filed as start_date,
                status,
                approved_by,
                remarks,
                created_at
             FROM Requests
             WHERE employee_id = ? AND request_type = 'Leave'
        `;

        const params = [employeeId];

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const [requests] = await payrollDB.query(query, params);

        res.json(requests);
    } catch (error) {
        console.error('Error fetching leave requests:', error.message);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
});

// CREATE NEW LEAVE REQUEST (in Payroll DB Requests table)
router.post('/leave-requests', async (req, res) => {
    const { employee_id, leave_type_id, start_date, end_date, total_days, reason } = req.body;

    try {
        if (!employee_id || !start_date || !end_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get leave type name
        let leaveTypeName = 'Leave';
        if (leave_type_id) {
            try {
                const [leaveTypes] = await hrDB.query(
                    `SELECT leave_name FROM leavetype WHERE leave_type_id = ?`,
                    [leave_type_id]
                );
                leaveTypeName = leaveTypes[0]?.leave_name || 'Leave';
            } catch (e) {
                console.log('Could not fetch leave type name');
            }
        }

        const description = reason || 'No reason provided';

        // Insert into Requests table with date columns
        const [result] = await payrollDB.query(
            `INSERT INTO Requests 
             (employee_id, request_type, request_description, start_date, end_date, total_days, date_filed, status)
             VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'Pending')`,
            [employee_id, leaveTypeName, description, start_date, end_date, total_days || 1]
        );

        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            request_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating leave request:', error.message);
        res.status(500).json({ error: 'Failed to create leave request' });
    }
});

// =====================================================
// OVERTIME REQUEST ROUTES - Using 'requests' & 'timesheets' tables
// =====================================================

// CREATE OVERTIME REQUEST
router.post('/overtime-request', async (req, res) => {
    const { employeeId, date, startTime, endTime, hours, reason } = req.body;

    console.log('⏰ Overtime request from employee:', employeeId);

    // Validation
    if (!employeeId || !date || !startTime || !endTime || !reason) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // ✅ Insert into requests table
        const description = `Overtime Request: ${date} from ${startTime} to ${endTime} (${hours} hours) - ${reason}`;

        const [result] = await payrollDB.query(
            `INSERT INTO requests 
            (employee_id, request_type, request_description, date_filed, status)
            VALUES (?, 'Overtime', ?, CURDATE(), 'Pending')`,
            [employeeId, description]
        );

        // ✅ Also insert into timesheets table for record
        await payrollDB.query(
            `INSERT INTO timesheets 
            (employee_id, date, time_in, time_out, overtime_hours, remarks)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [employeeId, date, startTime, endTime, hours, `Pending Approval - ${reason}`]
        );

        console.log('✅ Overtime request created with ID:', result.insertId);
        res.json({
            success: true,
            message: 'Overtime request submitted successfully',
            requestId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error creating overtime request:', error.message);
        res.status(500).json({ message: 'Failed to submit overtime request', details: error.message });
    }
});

// GET OVERTIME REQUESTS FOR EMPLOYEE
router.get('/overtime-requests/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { status } = req.query;

    console.log('📋 Fetching overtime requests for employee:', employeeId);

    try {
        let query = `
            SELECT 
                request_id,
                employee_id,
                request_type,
                request_description,
                date_filed,
                status,
                approved_by,
                remarks
            FROM requests
            WHERE employee_id = ? AND request_type = 'Overtime'
        `;

        const params = [employeeId];

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY date_filed DESC`;

        const [requests] = await payrollDB.query(query, params);

        console.log('✅ Found', requests.length, 'overtime requests');
        res.json(requests);
    } catch (error) {
        console.error('❌ Error fetching overtime requests:', error.message);
        res.status(500).json({ error: 'Failed to fetch overtime requests', details: error.message });
    }
});

// =====================================================
// MANUAL TIME IN/OUT ROUTES - Using 'timesheets' table
// =====================================================

// CREATE MANUAL TIME ENTRY
router.post('/manual-time', async (req, res) => {
    const { employeeId, date, timeIn, timeOut, remarks } = req.body;

    console.log('🕐 Manual time entry from employee:', employeeId);

    // Validation
    if (!employeeId || !date || !timeIn || !timeOut) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Calculate overtime if any (assuming 8 hour workday)
        const start = new Date(`2000-01-01T${timeIn}`);
        const end = new Date(`2000-01-01T${timeOut}`);
        const diffHours = (end - start) / (1000 * 60 * 60);
        const overtimeHours = Math.max(0, diffHours - 8).toFixed(2);

        // ✅ Insert into timesheets table
        const [result] = await payrollDB.query(
            `INSERT INTO timesheets 
            (employee_id, date, time_in, time_out, overtime_hours, remarks)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [employeeId, date, timeIn, timeOut, overtimeHours, remarks || 'Manual Entry - Pending Approval']
        );

        // ✅ Also create a request for approval
        const description = `Manual Time Entry: ${date} - In: ${timeIn}, Out: ${timeOut}${remarks ? ` - ${remarks}` : ''}`;

        await payrollDB.query(
            `INSERT INTO requests 
            (employee_id, request_type, request_description, date_filed, status)
            VALUES (?, 'Manual Time Entry', ?, CURDATE(), 'Pending')`,
            [employeeId, description]
        );

        console.log('✅ Manual time entry created with ID:', result.insertId);
        res.json({
            success: true,
            message: 'Manual time entry submitted successfully',
            timesheetId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error creating manual time entry:', error.message);
        res.status(500).json({ message: 'Failed to submit manual time entry', details: error.message });
    }
});

// GET TIMESHEETS FOR EMPLOYEE
router.get('/timesheets/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    console.log('⏰ Fetching timesheets for employee:', employeeId);

    try {
        let query = `
            SELECT 
                timesheet_id,
                employee_id,
                date,
                time_in,
                time_out,
                break_duration,
                overtime_hours,
                remarks,
                approved_by
            FROM timesheets
            WHERE employee_id = ? 
        `;
        const params = [employeeId];

        // Optional date filter
        if (startDate && endDate) {
            query += ` AND date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY date DESC`;

        const [timesheets] = await payrollDB.query(query, params);

        console.log('✅ Found', timesheets.length, 'timesheets');
        res.json(timesheets);
    } catch (error) {
        console.error('❌ Error fetching timesheets:', error.message);
        res.status(500).json({ error: 'Failed to fetch timesheets', details: error.message });
    }
});

// =====================================================
// GET ALL REQUESTS FOR AN EMPLOYEE
// =====================================================

router.get('/requests/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { type, status } = req.query;

    console.log('📋 Fetching all requests for employee:', employeeId);

    try {
        let query = `
            SELECT 
                request_id,
                employee_id,
                request_type,
                request_description,
                date_filed,
                status,
                approved_by,
                remarks
            FROM requests
            WHERE employee_id = ?
        `;

        const params = [employeeId];

        if (type) {
            query += ` AND request_type = ?`;
            params.push(type);
        }

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY date_filed DESC`;

        const [requests] = await payrollDB.query(query, params);

        console.log('✅ Found', requests.length, 'requests');
        res.json(requests);
    } catch (error) {
        console.error('❌ Error fetching requests:', error.message);
        res.status(500).json({ error: 'Failed to fetch requests', details: error.message });
    }
});

// CANCEL LEAVE REQUEST
router.put('/leave-requests/:requestId/cancel', async (req, res) => {
    const { requestId } = req.params;
    const { employee_id } = req.body;

    try {
        const [requests] = await payrollDB.query(
            `SELECT * FROM Requests WHERE request_id = ? AND employee_id = ?`,
            [requestId, employee_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        if (requests[0].status !== 'Pending') {
            return res.status(400).json({ error: 'Only pending requests can be cancelled' });
        }

        await payrollDB.query(
            `UPDATE Requests SET status = 'Cancelled' WHERE request_id = ?`,
            [requestId]
        );

        res.json({ success: true, message: 'Leave request cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling leave request:', error.message);
        res.status(500).json({ error: 'Failed to cancel leave request' });
    }
});

// =====================================================
// EMPLOYEE PAYROLL ROUTES
// =====================================================

// GET EMPLOYEE PAYROLL HISTORY
router.get('/payroll-history/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { year, limit } = req.query;

    console.log('📋 Fetching payroll history for employee:', employeeId);

    try {
        let query = `
            SELECT 
                payroll_id,
                employee_id,
                cutoff_start_date,
                cutoff_end_date,
                pay_date,
                payroll_frequency,
                prepared_by,
                basic_pay,
                overtime_pay,
                bonuses,
                status,
                comments,
                deductions,
                net_pay,
                payslip_reference_number
            FROM Payroll
            WHERE employee_id = ? 
              AND LOWER(status) IN ('released', 'paid', 'completed')
        `;

        const params = [employeeId];

        if (year) {
            query += ` AND YEAR(pay_date) = ? `;
            params.push(year);
        }

        query += ` ORDER BY pay_date DESC`;

        if (limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(limit));
        }

        const [payrolls] = await payrollDB.query(query, params);

        console.log('✅ Found', payrolls.length, 'payroll records');
        res.json(payrolls);
    } catch (error) {
        console.error('❌ Error fetching payroll history:', error.message);
        res.status(500).json({ error: 'Failed to fetch payroll history', details: error.message });
    }
});

// GET SINGLE PAYSLIP DETAILS
router.get('/payslip/:payrollId', async (req, res) => {
    const { payrollId } = req.params;
    const { employeeId } = req.query;

    try {
        let query = `
            SELECT
                payroll_id,
                employee_id,
                cutoff_start_date,
                cutoff_end_date,
                pay_date,
                payroll_frequency,
                prepared_by,
                basic_pay,
                overtime_pay,
                bonuses,
                status,
                comments,
                deductions,
                net_pay,
                payslip_reference_number
            FROM Payroll
            WHERE payroll_id = ?
        `;
        const params = [payrollId];

        if (employeeId) {
            query += ` AND employee_id = ?`;
            params.push(employeeId);
        }

        const [payroll] = await payrollDB.query(query, params);

        if (payroll.length === 0) {
            return res.status(404).json({ error: 'Payslip not found' });
        }

        const [employee] = await hrDB.query(
            `SELECT
                 e.employee_id,
                 CONCAT(e.first_name, ' ', e.last_name) as full_name,
                 e.email,
                 e.salary,
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
        console.error('Error fetching payslip:', error.message);
        res.status(500).json({ error: 'Failed to fetch payslip' });
    }
});

// =====================================================
// EMPLOYEE ATTENDANCE ROUTES
// =====================================================

// GET EMPLOYEE ATTENDANCE RECORDS
router.get('/attendance/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { start_date, end_date, month, year } = req.query;

    try {
        let query = `SELECT * FROM Timesheets WHERE employee_id = ?`;
        const params = [employeeId];

        if (start_date && end_date) {
            query += ` AND date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        } else if (month && year) {
            query += ` AND MONTH(date) = ? AND YEAR(date) = ?`;
            params.push(month, year);
        }

        query += ` ORDER BY date DESC`;

        const [timesheets] = await payrollDB.query(query, params);

        res.json(timesheets);
    } catch (error) {
        console.error('Error fetching attendance:', error.message);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

// GET EMPLOYEE ATTENDANCE SUMMARY
router.get('/attendance-summary/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    try {
        const [summary] = await payrollDB.query(
            `SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days,
                SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) as leave_days,
                SUM(TIMESTAMPDIFF(HOUR, time_in, time_out)) as total_hours,
                SUM(overtime_hours) as total_overtime
             FROM Timesheets 
             WHERE employee_id = ? 
             AND MONTH(date) = ? 
             AND YEAR(date) = ?`,
            [employeeId, currentMonth, currentYear]
        );

        res.json(summary[0] || {
            total_days: 0,
            present_days: 0,
            absent_days: 0,
            late_days: 0,
            leave_days: 0,
            total_hours: 0,
            total_overtime: 0
        });
    } catch (error) {
        console.error('Error fetching attendance summary:', error.message);
        res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }
});

// =====================================================
// EMPLOYEE DASHBOARD
// =====================================================

// GET EMPLOYEE DASHBOARD DATA
router.get('/dashboard/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    try {
        // Get leave balances summary from HR database
        const [leaveBalances] = await hrDB.query(
            `SELECT 
                lt.leave_name as leave_type_name,
                rl.num_of_leaves as remaining_days
             FROM remainingleaves rl
             JOIN leavetype lt ON rl.leave_type_id = lt.leave_type_id
             WHERE rl.employee_id = ?`,
            [employeeId]
        );

        // Get pending leave requests count from Payroll DB
        const [pendingLeaves] = await payrollDB.query(
            `SELECT COUNT(*) as count FROM Requests 
             WHERE employee_id = ? AND status = 'Pending' AND request_type = 'Leave'`,
            [employeeId]
        );

        // ✅ Get pending requests count from requests table (all types)
        let pendingRequests = { total_pending: 0, pending_overtime: 0, pending_manual_time: 0 };
        try {
            const [requests] = await payrollDB.query(
                `SELECT
                     COUNT(*) as total_pending,
                     SUM(CASE WHEN request_type = 'Overtime' THEN 1 ELSE 0 END) as pending_overtime,
                     SUM(CASE WHEN request_type = 'Manual Time Entry' THEN 1 ELSE 0 END) as pending_manual_time
                 FROM requests
                 WHERE employee_id = ? AND status = 'Pending'`,
                [employeeId]
            );
            pendingRequests = requests[0] || pendingRequests;
        } catch (err) {
            console.log('⚠️ Could not fetch pending requests:', err.message);
        }

        // Get latest released payslip
        let latestPayslip = null;
        try {
            const [payslips] = await payrollDB.query(
                `SELECT payroll_id, pay_date, net_pay, status
                 FROM Payroll
                 WHERE employee_id = ? AND LOWER(status) IN ('released', 'paid', 'completed', 'processed')
                 ORDER BY pay_date DESC LIMIT 1`,
                [employeeId]
            );
            latestPayslip = payslips[0] || null;
        } catch (err) {
            console.log('⚠️ Could not fetch payslip:', err.message);
        }

        // Get upcoming/expected payroll (pending payrolls not yet released)
        let upcomingPayroll = null;
        try {
            const [upcoming] = await payrollDB.query(
                `SELECT payroll_id, pay_date, net_pay, basic_pay, overtime_pay, bonuses, deductions, status,
                        cutoff_start_date, cutoff_end_date
                 FROM Payroll
                 WHERE employee_id = ? AND LOWER(status) IN ('pending', 'processing', 'processed')
                   AND pay_date >= CURDATE()
                 ORDER BY pay_date ASC LIMIT 1`,
                [employeeId]
            );
            upcomingPayroll = upcoming[0] || null;
        } catch (err) {
            console.log('⚠️ Could not fetch upcoming payroll:', err.message);
        }

        // Get attendance summary for current month
        let attendanceSummary = null;
        try {
            const [attendance] = await payrollDB.query(
                `SELECT 
                    COUNT(*) as total_days,
                    SUM(CASE WHEN remarks = 'Regular' OR remarks = 'Approved' THEN 1 ELSE 0 END) as present_days,
                    SUM(CASE WHEN remarks LIKE '%Late%' THEN 1 ELSE 0 END) as late_days
                 FROM Timesheets 
                 WHERE employee_id = ? 
                 AND MONTH(date) = ? 
                 AND YEAR(date) = ?`,
                [employeeId, currentMonth, currentYear]
            );
            attendanceSummary = attendance[0] || null;
        } catch (err) {
            console.log('⚠️ Could not fetch attendance:', err.message);
        }

        res.json({
            leaveBalances,
            pendingLeaveRequests: pendingLeaves[0]?.count || 0,
            pendingOvertimeRequests: pendingRequests.pending_overtime || 0,
            pendingManualTimeRequests: pendingRequests.pending_manual_time || 0,
            totalPendingRequests: pendingRequests.total_pending || 0,
            latestPayslip,
            upcomingPayroll,
            attendanceSummary
        });
    } catch (error) {
        console.error('Error fetching employee dashboard:', error.message);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// =====================================================
// EARNINGS OVERVIEW (For Dashboard Chart)
// =====================================================

router.get('/earnings-overview/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { months = 6 } = req.query;

    console.log('📊 Fetching earnings overview for employee:', employeeId, 'months:', months);

    try {
        const [earnings] = await payrollDB.query(
            `SELECT
                 DATE_FORMAT(pay_date, '%b') as month,
                DATE_FORMAT(pay_date, '%Y-%m') as yearMonth,
                MONTH(pay_date) as monthNum,
                YEAR(pay_date) as year,
                net_pay as earnings,
                basic_pay,
                overtime_pay,
                bonuses,
                deductions,
                cutoff_start_date,
                cutoff_end_date,
                pay_date,
                payroll_frequency
             FROM Payroll
             WHERE employee_id = ? 
               AND pay_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
               AND LOWER(status) IN ('released', 'paid', 'completed')
             ORDER BY pay_date ASC`,
            [employeeId, parseInt(months)]
        );

        if (earnings.length === 0) {
            console.log('⚠️ No earnings data found for employee:', employeeId);
            return res.json([]);
        }

        const chartData = earnings.map(item => ({
            month: item.month,
            earnings: parseFloat(item.earnings) || 0,
            basicPay: parseFloat(item.basic_pay) || 0,
            overtimePay: parseFloat(item.overtime_pay) || 0,
            bonuses: parseFloat(item.bonuses) || 0,
            deductions: parseFloat(item.deductions) || 0,
            payDate: item.pay_date
        }));

        console.log('✅ Found', chartData.length, 'months of earnings data');
        res.json(chartData);
    } catch (error) {
        console.error('❌ Error fetching earnings overview:', error.message);
        res.status(500).json({ error: 'Failed to fetch earnings overview', details: error.message });
    }
});

// Alias route for frontend compatibility
router.get('/earnings/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { months = 6 } = req.query;

    try {
        const [earnings] = await payrollDB.query(
            `SELECT
                 DATE_FORMAT(pay_date, '%b') as month,
                net_pay as earnings,
                basic_pay,
                overtime_pay,
                bonuses,
                deductions,
                pay_date
             FROM Payroll
             WHERE employee_id = ? 
               AND pay_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
               AND LOWER(status) IN ('released', 'paid', 'completed')
             ORDER BY pay_date ASC`,
            [employeeId, parseInt(months)]
        );

        const chartData = earnings.map(item => ({
            month: item.month,
            earnings: parseFloat(item.earnings) || 0,
            basicPay: parseFloat(item.basic_pay) || 0,
            overtimePay: parseFloat(item.overtime_pay) || 0,
            bonuses: parseFloat(item.bonuses) || 0,
            deductions: parseFloat(item.deductions) || 0,
            payDate: item.pay_date
        }));

        res.json(chartData);
    } catch (error) {
        console.error('❌ Error fetching earnings:', error.message);
        res.status(500).json({ error: 'Failed to fetch earnings', details: error.message });
    }
});

// =====================================================
// TAX CONTRIBUTIONS ROUTES
// =====================================================

// GET EMPLOYEE TAX CONTRIBUTIONS
router.get('/tax-contributions/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    console.log('📋 Fetching tax contributions for employee:', employeeId, 'year:', currentYear);

    try {
        // ✅ Using TaxContributions table - only show released/completed payrolls
        const [contributionRecords] = await payrollDB.query(
            `SELECT 
                tc.contribution_id as id,
                tc.payroll_id,
                tc.employee_id,
                tc.sss_contribution as sss,
                tc.philhealth_contribution as philhealth,
                tc.pagibig_contribution as pagibig,
                tc.withholding_tax as wtax,
                tc.total_contributions as total,
                p.pay_date,
                p.cutoff_start_date,
                p.cutoff_end_date
            FROM TaxContributions tc
            LEFT JOIN Payroll p ON tc.payroll_id = p.payroll_id
            WHERE tc.employee_id = ? 
              AND YEAR(p.pay_date) = ?
              AND LOWER(p.status) IN ('released', 'paid', 'completed')
            ORDER BY p.pay_date DESC`,
            [employeeId, currentYear]
        );

        console.log('🔍 Found records:', contributionRecords.length);

        // Format contributions with duration string
        const contributions = contributionRecords.map(record => ({
            id: record.id,
            payroll_id: record.payroll_id,
            duration: formatPayrollDuration(record.cutoff_start_date, record.cutoff_end_date),
            pay_date: record.pay_date,
            sss: Number(record.sss) || 0,
            philhealth: Number(record.philhealth) || 0,
            pagibig: Number(record.pagibig) || 0,
            wtax: Number(record.wtax) || 0,
            total: Number(record.total) || 0
        }));

        // Calculate totals
        const totals = contributions.reduce((acc, curr) => {
            acc.sss += curr.sss;
            acc.philhealth += curr.philhealth;
            acc.pagibig += curr.pagibig;
            acc.wtax += curr.wtax;
            acc.total += curr.total;
            return acc;
        }, { sss: 0, philhealth: 0, pagibig: 0, wtax: 0, total: 0 });

        // Get unique payroll periods for dropdown
        const payrollPeriods = contributions.map(c => ({
            duration: c.duration
        }));

        console.log('✅ Found', contributions.length, 'contribution records');

        res.json({
            year: currentYear,
            contributions,
            totals,
            payrollPeriods
        });
    } catch (error) {
        console.error('❌ Error fetching tax contributions:', error.message);
        res.status(500).json({ error: 'Failed to fetch tax contributions', details: error.message });
    }
});

// Helper function to format payroll duration
function formatPayrollDuration(startDate, endDate) {
    if (!startDate || !endDate) return "N/A";

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// GET EMPLOYEE TAX CONTRIBUTIONS SUMMARY (simpler endpoint)
router.get('/tax-summary/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    console.log('📋 Fetching tax summary for employee:', employeeId);

    try {
        const [summary] = await payrollDB.query(
            `SELECT 
                YEAR(pay_date) as year,
                SUM(deductions) as total_deductions,
                SUM(basic_pay) as total_basic_pay,
                SUM(net_pay) as total_net_pay,
                COUNT(*) as total_payrolls
            FROM Payroll
            WHERE employee_id = ? AND YEAR(pay_date) = ?
            GROUP BY YEAR(pay_date)`,
            [employeeId, currentYear]
        );

        res.json(summary[0] || {
            year: currentYear,
            total_deductions: 0,
            total_basic_pay: 0,
            total_net_pay: 0,
            total_payrolls: 0
        });
    } catch (error) {
        console.error('❌ Error fetching tax summary:', error.message);
        res.status(500).json({ error: 'Failed to fetch tax summary', details: error.message });
    }
});

// =====================================================
// BONUS REQUEST ROUTES
// =====================================================

// CREATE BONUS REQUEST
router.post('/bonus-request', async (req, res) => {
    const { employeeId, bonusType, amount, reason } = req.body;

    console.log('[INFO] Bonus request from employee:', employeeId);

    if (!employeeId || !bonusType || !amount || !reason) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const bonusTypeLabels = {
            'performance': 'Performance Bonus',
            'project': 'Project Completion Bonus',
            'referral': 'Referral Bonus',
            'other': 'Other Bonus'
        };

        const bonusLabel = bonusTypeLabels[bonusType] || bonusType;
        const description = `${bonusLabel} Request: PHP ${parseFloat(amount).toLocaleString()} - ${reason}`;

        const [result] = await payrollDB.query(
            `INSERT INTO requests 
            (employee_id, request_type, request_description, date_filed, status)
            VALUES (?, 'Bonus', ?, CURDATE(), 'Pending')`,
            [employeeId, description]
        );

        console.log('[SUCCESS] Bonus request created with ID:', result.insertId);
        res.json({
            success: true,
            message: 'Bonus request submitted successfully',
            requestId: result.insertId
        });
    } catch (error) {
        console.error('[ERROR] Error creating bonus request:', error.message);
        res.status(500).json({ message: 'Failed to submit bonus request', details: error.message });
    }
});

// GET BONUS REQUESTS FOR EMPLOYEE
router.get('/bonus-requests/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { status } = req.query;

    console.log('[INFO] Fetching bonus requests for employee:', employeeId);

    try {
        let query = `
            SELECT 
                request_id,
                employee_id,
                request_type,
                request_description,
                date_filed,
                status,
                approved_by,
                remarks
            FROM requests
            WHERE employee_id = ? AND request_type = 'Bonus'
        `;

        const params = [employeeId];

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY date_filed DESC`;

        const [requests] = await payrollDB.query(query, params);

        console.log('[SUCCESS] Found', requests.length, 'bonus requests');
        res.json(requests);
    } catch (error) {
        console.error('[ERROR] Error fetching bonus requests:', error.message);
        res.status(500).json({ error: 'Failed to fetch bonus requests', details: error.message });
    }
});

// =====================================================
// REIMBURSEMENT REQUEST ROUTES
// =====================================================

// CREATE REIMBURSEMENT REQUEST
router.post('/reimbursement-request', async (req, res) => {
    const { employeeId, expenseType, amount, date, description, receiptNumber } = req.body;

    console.log('[INFO] Reimbursement request from employee:', employeeId);

    if (!employeeId || !expenseType || !amount || !date || !description) {
        return res.status(400).json({ message: 'All required fields must be provided' });
    }

    try {
        const expenseTypeLabels = {
            'travel': 'Travel Expenses',
            'medical': 'Medical Expenses',
            'training': 'Training/Education',
            'equipment': 'Equipment/Supplies',
            'meal': 'Meal Allowance',
            'other': 'Other Expenses'
        };

        const expenseLabel = expenseTypeLabels[expenseType] || expenseType;
        const receiptInfo = receiptNumber ? ` (Receipt: ${receiptNumber})` : '';
        const requestDescription = `${expenseLabel} Reimbursement: PHP ${parseFloat(amount).toLocaleString()} on ${date}${receiptInfo} - ${description}`;

        const [result] = await payrollDB.query(
            `INSERT INTO requests 
            (employee_id, request_type, request_description, date_filed, status)
            VALUES (?, 'Reimbursement', ?, CURDATE(), 'Pending')`,
            [employeeId, requestDescription]
        );

        console.log('[SUCCESS] Reimbursement request created with ID:', result.insertId);
        res.json({
            success: true,
            message: 'Reimbursement request submitted successfully',
            requestId: result.insertId
        });
    } catch (error) {
        console.error('[ERROR] Error creating reimbursement request:', error.message);
        res.status(500).json({ message: 'Failed to submit reimbursement request', details: error.message });
    }
});

// GET REIMBURSEMENT REQUESTS FOR EMPLOYEE
router.get('/reimbursement-requests/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { status } = req.query;

    console.log('[INFO] Fetching reimbursement requests for employee:', employeeId);

    try {
        let query = `
            SELECT 
                request_id,
                employee_id,
                request_type,
                request_description,
                date_filed,
                status,
                approved_by,
                remarks
            FROM requests
            WHERE employee_id = ? AND request_type = 'Reimbursement'
        `;

        const params = [employeeId];

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY date_filed DESC`;

        const [requests] = await payrollDB.query(query, params);

        console.log('[SUCCESS] Found', requests.length, 'reimbursement requests');
        res.json(requests);
    } catch (error) {
        console.error('[ERROR] Error fetching reimbursement requests:', error.message);
        res.status(500).json({ error: 'Failed to fetch reimbursement requests', details: error.message });
    }
});

// =====================================================
// PENDING REQUESTS - Get all pending requests for employee
// =====================================================
router.get('/pending-requests/:employeeId', async (req, res) => {
    const { employeeId } = req.params;

    try {
        // First, sync any HR approvals/rejections (deduct leave if HR approved)
        await syncEmsApprovals();

        // Query requests in approval flow:
        // - status = 'Pending' → awaiting manager
        // - status = 'Approved' + emsStatus = 'PENDING' + payroll_approved = 0 → awaiting payroll
        // - status = 'Approved' + emsStatus = 'PENDING' + payroll_approved = 1 → awaiting HR
        const [requests] = await payrollDB.query(`
            SELECT 
                request_id,
                request_type as type,
                date_filed as date,
                status,
                emsStatus,
                payroll_approved,
                request_description as details,
                CASE 
                    WHEN status = 'Pending' THEN 'Awaiting Manager'
                    WHEN status = 'Approved' AND emsStatus = 'PENDING' AND (payroll_approved = 0 OR payroll_approved IS NULL) THEN 'Awaiting Payroll'
                    WHEN status = 'Approved' AND emsStatus = 'PENDING' AND payroll_approved = 1 THEN 'Awaiting HR Approval'
                    ELSE status
                END as displayStatus
            FROM Requests
            WHERE employee_id = ? 
              AND (
                  status = 'Pending' 
                  OR (status = 'Approved' AND emsStatus = 'PENDING')
              )
            ORDER BY date_filed DESC
            LIMIT 10
        `, [employeeId]);

        res.json(requests);
    } catch (error) {
        console.error('[ERROR] Error fetching pending requests:', error.message);
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
});

// =====================================================
// RECENT PAYSLIPS - Get recent payslips for employee
// =====================================================
router.get('/recent-payslips/:employeeId', async (req, res) => {
    const { employeeId } = req.params;

    try {
        const [payslips] = await payrollDB.query(`
            SELECT 
                payroll_id,
                pay_date,
                net_pay,
                CONCAT(
                    DATE_FORMAT(cutoff_start_date, '%b %d'),
                    ' - ',
                    DATE_FORMAT(cutoff_end_date, '%b %d, %Y')
                ) as period,
                status
            FROM Payroll
            WHERE employee_id = ? AND LOWER(status) IN ('released', 'paid', 'completed')
            ORDER BY pay_date DESC
            LIMIT 5
        `, [employeeId]);

        res.json(payslips);
    } catch (error) {
        console.error('[ERROR] Error fetching recent payslips:', error.message);
        res.status(500).json({ error: 'Failed to fetch recent payslips' });
    }
});

// =====================================================
// NOTIFICATIONS - Get employee notifications
// =====================================================
router.get('/notifications/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { unreadOnly } = req.query;

    try {
        let query = `
            SELECT notification_id, employee_id, title, message, type, is_read, created_at, read_at
            FROM Notifications
            WHERE employee_id = ?
        `;
        
        if (unreadOnly === 'true') {
            query += ` AND is_read = 0`;
        }
        
        query += ` ORDER BY created_at DESC LIMIT 50`;

        const [notifications] = await payrollDB.query(query, [employeeId]);
        
        // Get unread count
        const [unreadCount] = await payrollDB.query(
            `SELECT COUNT(*) as count FROM Notifications WHERE employee_id = ? AND is_read = 0`,
            [employeeId]
        );

        res.json({
            notifications,
            unreadCount: unreadCount[0]?.count || 0
        });
    } catch (error) {
        console.error('[ERROR] Error fetching notifications:', error.message);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', async (req, res) => {
    const { notificationId } = req.params;

    try {
        await payrollDB.query(
            `UPDATE Notifications SET is_read = 1, read_at = NOW() WHERE notification_id = ?`,
            [notificationId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Error marking notification as read:', error.message);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.put('/notifications/:employeeId/read-all', async (req, res) => {
    const { employeeId } = req.params;

    try {
        await payrollDB.query(
            `UPDATE Notifications SET is_read = 1, read_at = NOW() WHERE employee_id = ? AND is_read = 0`,
            [employeeId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Error marking all notifications as read:', error.message);
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});

export default router;