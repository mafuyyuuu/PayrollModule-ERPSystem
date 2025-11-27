import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

// ✅ Employee Management System DB
const employeePool = mysql. createPool({
    host: process.env.EMP_DB_HOST || 'localhost',
    user: process.env.EMP_DB_USER || 'payroll_vpn',
    password: process.env. EMP_DB_PASSWORD || 'vpn_payroll_2025',
    database: process.env.EMP_DB_NAME || 'employeemanagementsystem',
    port: process.env. EMP_DB_PORT || 3306
});

// ✅ Payroll Management System DB
const payrollPool = mysql.createPool({
    host: process.env. DB_HOST || 'localhost',
    user: process.env. DB_USER || 'payrollsystem',
    password: process.env. DB_PASSWORD || 'payroll',
    database: process.env.DB_NAME || 'payrollmanagementsystem',
    port: process.env.DB_PORT || 3306
});

// ✅ Test BOTH connections at startup
(async () => {
    try {
        const conn1 = await employeePool.getConnection();
        console.log('✅ employeeRoutes: Connected to Employee Management System');
        conn1.release();
    } catch (err) {
        console.error('❌ employeeRoutes: Employee DB failed:', err. message);
    }

    try {
        const conn2 = await payrollPool.getConnection();
        console.log('✅ employeeRoutes: Connected to Payroll Management System');
        conn2.release();
    } catch (err) {
        console. error('❌ employeeRoutes: Payroll DB failed:', err.message);
    }
})();

// =====================================================
// EMPLOYEE PROFILE ROUTE
// =====================================================

// GET EMPLOYEE PROFILE
router.get('/profile/:employeeId', async (req, res) => {
    const { employeeId } = req. params;

    console.log('📋 Fetching profile for employee:', employeeId);

    try {
        // ✅ Get employee data
        const [employees] = await employeePool.query(
            `SELECT * FROM Employees WHERE employee_id = ?`,
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
                const [positions] = await employeePool.query(
                    `SELECT position_title FROM Positions WHERE position_id = ?`,
                    [emp.position_id]
                );
                positionTitle = positions[0]?.position_title || "—";
            } catch (e) {
                console.log('⚠️ Could not fetch position:', e.  message);
            }
        }

        // ✅ Get department
        let departmentName = "—";
        if (emp.department_id) {
            try {
                const [departments] = await employeePool.query(
                    `SELECT department_name FROM Departments WHERE department_id = ?`,
                    [emp.department_id]
                );
                departmentName = departments[0]?.department_name || "—";
            } catch (e) {
                console.log('⚠️ Could not fetch position:', e.  message);
            }
        }

        // ✅ Get emergency contact from emergencycontacts table
        let emergencyContact = {
            name: "—",
            relationship: "—",
            phoneNumber: "—",
            mobileNumber: "—",
            address: "—"
        };
        try {
            const [contacts] = await employeePool.query(
                `SELECT * FROM emergencycontacts WHERE employee_id = ?  LIMIT 1`,
                [employeeId]
            );
            if (contacts.length > 0) {
                const contact = contacts[0];
                emergencyContact = {
                    name: contact.contact_name || "—",
                    relationship: contact.relationship || "—",
                    phoneNumber: contact.phone_number || "—",
                    mobileNumber: contact.mobile_number || "—",
                    address: contact.address || "—"
                };
            }
        } catch (e) {
            console.log('⚠️ Could not fetch emergency contact:', e.message);
        }

        // Calculate age
        let age = "—";
        if (emp. date_of_birth) {
            const today = new Date();
            const birthDate = new Date(emp.date_of_birth);
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        // Build full address
        const fullAddress = [
            emp.street_address,
            emp.city,
            emp.province,
            emp.postal_code,
            emp.country
        ].filter(Boolean). join(', ') || "—";

        // ✅ Map to frontend fields
        const profileData = {
            // Basic info
            employeeId: emp.employee_id,
            employeeNumber: emp.employee_number,
            firstName: emp.first_name,
            middleName: emp.middle_name,
            lastName: emp.last_name,
            suffix: emp.suffix,
            name: `${emp.first_name || ''} ${emp.middle_name || ''} ${emp.last_name || ''} ${emp.suffix || ''}`. trim().replace(/\s+/g, ' '),
            email: emp.email_address,

            // Personal info
            address: fullAddress,
            streetAddress: emp.street_address,
            city: emp.city,
            province: emp.province,
            postalCode: emp. postal_code,
            country: emp.country,
            birthday: emp.date_of_birth,
            age: age,
            sex: emp.sex,
            maritalStatus: emp.civil_status,
            nationality: emp. nationality,
            religion: emp. religion,
            contactNumber: emp.mobile_number || "—",
            phoneNumber: emp.phone_number || "—",

            // ✅ Emergency contact from emergencycontacts table
            emergencyContactName: emergencyContact.name,
            emergencyContactRelationship: emergencyContact.relationship,
            emergencyContactNumber: emergencyContact.mobileNumber || emergencyContact.phoneNumber,
            emergencyContactAddress: emergencyContact.address,

            // Employment info
            department: departmentName,
            departmentId: emp.department_id,
            position: positionTitle,
            positionId: emp.position_id,
            employmentType: emp.employment_type || "—",
            employmentStatus: emp.employment_status || "—",
            dateHired: emp. date_hired,
            dateRegularized: emp.date_regularized,
            dateSeparated: emp.date_separated,

            // Government IDs
            sssNumber: emp.sss_number || "—",
            philhealthNumber: emp. philhealth_number || "—",
            pagibigNumber: emp.pagibig_number || "—",
            tinNumber: emp.tin_number || "—"
        };

        console. log('✅ Profile data ready for employee:', emp.first_name, emp.last_name);
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
        const [leaveTypes] = await employeePool.query(
            `SELECT 
                leave_type_id,
                leave_type_name,
                description,
                max_days_per_year,
                created_at
             FROM LeaveTypes
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
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    console.log('📋 Fetching leave balances for employee:', employeeId, 'year:', currentYear);

    try {
        const [balances] = await employeePool.query(
            `SELECT 
                lb.balance_id,
                lb. employee_id,
                lb.leave_type_id,
                lt.leave_type_name,
                lt.description as leave_description,
                lb. year,
                lb. total_days,
                lb. used_days,
                lb.remaining_days,
                lb. updated_at
             FROM LeaveBalances lb
             JOIN LeaveTypes lt ON lb.leave_type_id = lt.leave_type_id
             WHERE lb.employee_id = ?  AND lb.year = ? 
             ORDER BY lb. leave_type_id`,
            [employeeId, currentYear]
        );

        console.log('✅ Found', balances.length, 'leave balances');
        res.json(balances);
    } catch (error) {
        console. error('❌ Error fetching leave balances:', error.message);
        res.status(500).json({ error: 'Failed to fetch leave balances' });
    }
});

// GET EMPLOYEE LEAVE REQUESTS
router.get('/leave-requests/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const { status, year } = req.query;

    try {
        let query = `
            SELECT 
                lr.request_id,
                lr.employee_id,
                lr.leave_type_id,
                lt.leave_type_name,
                lr.start_date,
                lr.end_date,
                lr. total_days,
                lr.reason,
                lr. status,
                lr.approved_by,
                lr.approved_at,
                lr. remarks,
                lr.created_at
             FROM LeaveRequests lr
             JOIN LeaveTypes lt ON lr.leave_type_id = lt.leave_type_id
             WHERE lr.employee_id = ? 
        `;

        const params = [employeeId];

        if (status) {
            query += ` AND lr.status = ?`;
            params.push(status);
        }

        if (year) {
            query += ` AND YEAR(lr.start_date) = ? `;
            params. push(year);
        }

        query += ` ORDER BY lr.created_at DESC`;

        const [requests] = await employeePool.query(query, params);

        res.json(requests);
    } catch (error) {
        console.error('Error fetching leave requests:', error.message);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
});

// CREATE NEW LEAVE REQUEST
router.post('/leave-requests', async (req, res) => {
    const { employee_id, leave_type_id, start_date, end_date, total_days, reason } = req.body;

    try {
        if (!employee_id || !leave_type_id || !start_date || !end_date || !total_days) {
            return res.status(400). json({ error: 'Missing required fields' });
        }

        // Check leave balance
        const currentYear = new Date(start_date).getFullYear();
        const [balances] = await employeePool.query(
            `SELECT remaining_days FROM LeaveBalances 
             WHERE employee_id = ? AND leave_type_id = ? AND year = ? `,
            [employee_id, leave_type_id, currentYear]
        );

        if (balances.length === 0) {
            return res.status(400).json({ error: 'No leave balance found for this leave type' });
        }

        if (balances[0].remaining_days < total_days) {
            return res. status(400).json({
                error: 'Insufficient leave balance',
                remaining_days: balances[0].remaining_days,
                requested_days: total_days
            });
        }

        // Check for overlapping requests
        const [overlapping] = await employeePool.query(
            `SELECT request_id FROM LeaveRequests 
             WHERE employee_id = ? 
             AND status IN ('Pending', 'Approved')
             AND ((start_date <= ? AND end_date >= ?) 
                  OR (start_date <= ? AND end_date >= ?)
                  OR (start_date >= ? AND end_date <= ? ))`,
            [employee_id, start_date, start_date, end_date, end_date, start_date, end_date]
        );

        if (overlapping.length > 0) {
            return res. status(400).json({ error: 'You already have a leave request for these dates' });
        }

        // Insert leave request
        const [result] = await employeePool.query(
            `INSERT INTO LeaveRequests 
             (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
            [employee_id, leave_type_id, start_date, end_date, total_days, reason]
        );

        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            request_id: result. insertId
        });
    } catch (error) {
        console.error('Error creating leave request:', error. message);
        res.status(500). json({ error: 'Failed to create leave request' });
    }
});

// CANCEL LEAVE REQUEST
router.put('/leave-requests/:requestId/cancel', async (req, res) => {
    const { requestId } = req. params;
    const { employee_id } = req.body;

    try {
        const [requests] = await employeePool.query(
            `SELECT * FROM LeaveRequests WHERE request_id = ?  AND employee_id = ?`,
            [requestId, employee_id]
        );

        if (requests.length === 0) {
            return res. status(404).json({ error: 'Leave request not found' });
        }

        if (requests[0]. status !== 'Pending') {
            return res.status(400).json({ error: 'Only pending requests can be cancelled' });
        }

        await employeePool.query(
            `UPDATE LeaveRequests SET status = 'Cancelled' WHERE request_id = ? `,
            [requestId]
        );

        res.json({ success: true, message: 'Leave request cancelled successfully' });
    } catch (error) {
        console. error('Error cancelling leave request:', error. message);
        res.status(500). json({ error: 'Failed to cancel leave request' });
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

        const [payrolls] = await payrollPool.query(query, params);

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

        const [payroll] = await payrollPool.query(query, params);

        if (payroll.length === 0) {
            return res.status(404).json({ error: 'Payslip not found' });
        }

        const [employee] = await employeePool.query(
            `SELECT
                 e.employee_id,
                 e.employee_number,
                 CONCAT(e.first_name, ' ', e.last_name) as full_name,
                 e.sss_number,
                 e. philhealth_number,
                 e.pagibig_number,
                 e.tin_number,
                 p.position_title,
                 d.department_name
             FROM Employees e
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

        const [timesheets] = await payrollPool.query(query, params);

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
        const [summary] = await payrollPool.query(
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
    const { employeeId } = req. params;
    const currentYear = new Date(). getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    try {
        // Get leave balances summary
        const [leaveBalances] = await employeePool. query(
            `SELECT 
                lt.leave_type_name,
                lb.remaining_days
             FROM LeaveBalances lb
             JOIN LeaveTypes lt ON lb.leave_type_id = lt. leave_type_id
             WHERE lb. employee_id = ?  AND lb.year = ?`,
            [employeeId, currentYear]
        );

        // Get pending leave requests count
        const [pendingLeaves] = await employeePool.query(
            `SELECT COUNT(*) as count FROM LeaveRequests 
             WHERE employee_id = ? AND status = 'Pending'`,
            [employeeId]
        );

        // In the dashboard route, update the payslip query:
        let latestPayslip = null;
        try {
            const [payslips] = await payrollPool.query(
                `SELECT payroll_id, pay_date, net_pay, status
                 FROM Payroll
                 WHERE employee_id = ?
                 ORDER BY pay_date DESC LIMIT 1`,
                [employeeId]
            );
            latestPayslip = payslips[0] || null;
        } catch (err) {
            console.log('⚠️ Could not fetch position:', err.message);
        }

        // Get attendance summary for current month
        let attendanceSummary = null;
        try {
            const [attendance] = await payrollPool.query(
                `SELECT 
                    COUNT(*) as total_days,
                    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
                    SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days
                 FROM Timesheets 
                 WHERE employee_id = ? 
                 AND MONTH(date) = ? 
                 AND YEAR(date) = ?`,
                [employeeId, currentMonth, currentYear]
            );
            attendanceSummary = attendance[0] || null;
        } catch (err) {
            console.log('⚠️ Could not fetch position:', err.message);
        }

        res. json({
            leaveBalances,
            pendingLeaveRequests: pendingLeaves[0]?.count || 0,
            latestPayslip,
            attendanceSummary
        });
    } catch (error) {
        console.error('Error fetching employee dashboard:', error.message);
        res. status(500).json({ error: 'Failed to fetch dashboard data' });
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
        const [contributionRecords] = await payrollPool.query(
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
        const [summary] = await payrollPool.query(
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