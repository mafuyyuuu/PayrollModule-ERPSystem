/* eslint-disable no-unused-vars */
import express from 'express';
import { payrollDB, hrDB } from '../db.js';

const router = express.Router();

// =====================================================
// EMPLOYEE PROFILE ROUTE
// =====================================================

// GET EMPLOYEE PROFILE
router.get('/profile/:employeeId', async (req, res) => {
    const { employeeId } = req. params;

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
                console.log('⚠️ Could not fetch position:', e.  message);
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
                console.log('⚠️ Could not fetch department:', e.  message);
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
        console.error('❌ Error fetching profile:', error. message);
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
        console. error('❌ Error fetching leave balances:', error.message);
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

        const description = `${leaveTypeName}: ${reason || 'No reason provided'} (${start_date} to ${end_date}, ${total_days} days)`;

        // Insert into Requests table
        const [result] = await payrollDB.query(
            `INSERT INTO Requests 
             (employee_id, request_type, request_description, date_filed, status)
             VALUES (?, 'Leave', ?, CURDATE(), 'Pending')`,
            [employee_id, description]
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
router. get('/payroll-history/:employeeId', async (req, res) => {
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

        console.log('✅ Found', payrolls. length, 'payroll records');
        res.json(payrolls);
    } catch (error) {
        console. error('❌ Error fetching payroll history:', error.message);
        res.status(500). json({ error: 'Failed to fetch payroll history', details: error.message });
    }
});

// GET SINGLE PAYSLIP DETAILS
router.get('/payslip/:payrollId', async (req, res) => {
    const { payrollId } = req. params;
    const { employeeId } = req. query;

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
        console.error('Error fetching payslip:', error. message);
        res.status(500).json({ error: 'Failed to fetch payslip' });
    }
});

// =====================================================
// EMPLOYEE ATTENDANCE ROUTES
// =====================================================

// GET EMPLOYEE ATTENDANCE RECORDS
router.get('/attendance/:employeeId', async (req, res) => {
    const { employeeId } = req. params;
    const { start_date, end_date, month, year } = req. query;

    try {
        let query = `SELECT * FROM Timesheets WHERE employee_id = ?`;
        const params = [employeeId];

        if (start_date && end_date) {
            query += ` AND date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        } else if (month && year) {
            query += ` AND MONTH(date) = ?  AND YEAR(date) = ?`;
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
    const { month, year } = req. query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date(). getFullYear();

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

        res. json(summary[0] || {
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

        // Get latest payslip
        let latestPayslip = null;
        try {
            const [payslips] = await payrollDB.query(
                `SELECT payroll_id, pay_date, net_pay, status
                 FROM Payroll
                 WHERE employee_id = ?
                 ORDER BY pay_date DESC LIMIT 1`,
                [employeeId]
            );
            latestPayslip = payslips[0] || null;
        } catch (err) {
            console.log('⚠️ Could not fetch payslip:', err.message);
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
            latestPayslip,
            attendanceSummary
        });
    } catch (error) {
        console.error('Error fetching employee dashboard:', error.message);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// =====================================================
// TAX CONTRIBUTIONS ROUTES
// =====================================================

// GET EMPLOYEE TAX CONTRIBUTIONS
router.get('/tax-contributions/:employeeId', async (req, res) => {
    const { employeeId } = req. params;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    console.log('📋 Fetching tax contributions for employee:', employeeId, 'year:', currentYear);

    try {
        // ✅ Using TaxContributions table (correct case!)
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
            LEFT JOIN Payroll p ON tc. payroll_id = p.payroll_id
            WHERE tc. employee_id = ? AND YEAR(p.pay_date) = ? 
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
            pagibig: Number(record. pagibig) || 0,
            wtax: Number(record.wtax) || 0,
            total: Number(record. total) || 0
        }));

        // Calculate totals
        const totals = contributions.reduce((acc, curr) => {
            acc. sss += curr.sss;
            acc.philhealth += curr.philhealth;
            acc.pagibig += curr. pagibig;
            acc. wtax += curr.wtax;
            acc.total += curr. total;
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
        console.error('❌ Error fetching tax contributions:', error. message);
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
    const { employeeId } = req. params;
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

export default router;