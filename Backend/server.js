import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import dashboardRoutes from './admin/routes/adminDashboardRoutes.js';
import adminAuditLogsRoutes from './admin/routes/adminAuditLogsRoutes.js';
import { recordAuditLog } from './admin/routes/adminAuditLogsRoutes.js';
import adminUserManagementRoutes from './admin/routes/adminUserManagementRoutes.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminAuditLogsRoutes);
app.use('/api/admin/users', adminUserManagementRoutes);


// ✅ MySQL connection for Payroll System
export const payrollPool = mysql.createPool({ // <--- ADDED 'export'
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'PayrollManagementSystem',
    port: process.env.DB_PORT || 3306
});

// ✅ MySQL connection for Employee Management System (via VPN)
export const employeePool = mysql.createPool({ // <--- ADDED 'export'
    host: process.env.EMP_DB_HOST || 'localhost',
    user: process.env.EMP_DB_USER || 'payroll_vpn',
    password: process.env.EMP_DB_PASSWORD || 'vpn_payroll_2025',
    database: process.env.EMP_DB_NAME || 'employeemanagementsystem',
    port: process.env.EMP_DB_PORT || 3306
});

// ✅ Test DB connections
try {
    const payrollConn = await payrollPool.getConnection();
    console.log('✅ Connected to Payroll Management System database');
    payrollConn.release();
} catch (err) {
    console.error('❌ Payroll database connection failed:', err);
}

try {
    const empConn = await employeePool.getConnection();
    console.log('✅ Connected to Employee Management System database');
    empConn.release();
} catch (err) {
    console.error('⚠️ Employee database connection failed (VPN may not be active):', err);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== API ROUTES (MUST BE BEFORE STATIC FILES) ====================

// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const roleMap = {
        1: 'admin',
        2: 'manager',
        3: 'payroll',
        4: 'employee'
    };

    try {
        const [userRows] = await payrollPool.execute(
            `SELECT user_id, employee_id, username, email_address, role_id, status
             FROM UserAccounts
             WHERE email_address = ? AND password = ?`,
            [email, password]
        );

        if (userRows.length === 0) {
            // ✅ ADDED: Audit log failed login
            recordAuditLog('SYSTEM/ATTEMPT', 'LOGIN_FAILURE', `Failed login attempt for email: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = userRows[0];
        let employeeData = null;

        if (user.employee_id) {
            try {
                const [empRows] = await employeePool.execute(
                    `SELECT
                         e.employee_id,
                         e.first_name,
                         e.middle_name,
                         e.last_name,
                         e.date_of_birth,
                         e.sex,
                         e.civil_status,
                         e.street_address,
                         e.city,
                         e.province,
                         e.mobile_number,
                         e.employment_type,
                         e.date_hired,
                         p.position_title,
                         d.department_name,
                         ec.contact_name as emergency_contact_name,
                         ec.mobile_number as emergency_contact_number
                     FROM Employees e
                              LEFT JOIN Positions p ON e.position_id = p.position_id
                              LEFT JOIN Departments d ON e.department_id = d.department_id
                              LEFT JOIN EmergencyContacts ec ON e.employee_id = ec.employee_id
                     WHERE e.employee_id = ?
                         LIMIT 1`,
                    [user.employee_id]
                );

                if (empRows.length > 0) {
                    employeeData = empRows[0];
                }
            } catch (empErr) {
                console.error('Error fetching employee data:', empErr);
            }
        }

        const response = {
            id: user.user_id,
            employeeId: user.employee_id,
            username: user.username,
            email: user.email_address,
            role: roleMap[Number(user.role_id)] || 'Unknown',
            status: user.status
        };

        if (employeeData) {
            response.name = `${employeeData.first_name} ${employeeData.last_name}`;
            response.firstName = employeeData.first_name;
            response.middleName = employeeData.middle_name;
            response.lastName = employeeData.last_name;
            response.position = employeeData.position_title;
            response.department = employeeData.department_name;
            response.employmentType = employeeData.employment_type;
            response.dateHired = employeeData.date_hired;
            response.birthday = employeeData.date_of_birth;
            response.sex = employeeData.sex;
            response.maritalStatus = employeeData.civil_status;
            response.address = `${employeeData.street_address}, ${employeeData.city}, ${employeeData.province}`;
            response.contactNumber = employeeData.mobile_number;
            response.emergencyContactName = employeeData.emergency_contact_name;
            response.emergencyContactNumber = employeeData.emergency_contact_number;
        }

        // ✅ ADDED: Audit log successful login
        recordAuditLog(
            user.username,
            'USER_LOGIN',
            `Successful login as ${response.role}`
        );

        res.json(response);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// CREATE USER ROUTE
app.post('/api/create-user', async (req, res) => {
    const { username, email, password, role_id, employee_id } = req.body;

    const nonEmployeeRoles = [1, 3];
    const employeeRoles = [2, 4];

    if (nonEmployeeRoles.includes(role_id) && employee_id) {
        return res.status(400).json({ message: 'This role should not be linked to an employee' });
    }

    if (employeeRoles.includes(role_id) && !employee_id) {
        return res.status(400).json({ message: 'This role must be linked to an employee' });
    }

    try {
        if (employee_id) {
            try {
                const [empRows] = await employeePool.execute(
                    `SELECT employee_id FROM Employees WHERE employee_id = ?`,
                    [employee_id]
                );

                if (empRows.length === 0) {
                    return res.status(400).json({ message: 'Employee ID not found in employee management system' });
                }
            } catch (empErr) {
                console.error('Error verifying employee:', empErr);
                return res.status(500).json({ message: 'Cannot verify employee (VPN connection may be down)' });
            }
        }

        await payrollPool.execute(
            `INSERT INTO UserAccounts (employee_id, username, email_address, password, role_id, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [employee_id || null, username, email, password, role_id, 'Active']
        );

        // ✅ ADDED: Audit log user creation
        const roleMap = { 1: 'Admin', 2: 'Manager', 3: 'Payroll', 4: 'Employee' };
        const roleName = roleMap[role_id] || 'Unknown Role';

        recordAuditLog(
            'SYSTEM/ADMIN', // Placeholder for the creating user
            'USER_CREATE',
            `Created new ${roleName} account: ${username} (Emp ID: ${employee_id || 'N/A'})`
        );

        res.json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== EMPLOYEE CRUD (CUD - Read already exists) ====================

// GET ALL EMPLOYEES (READ)
app.get('/api/employees', async (req, res) => {
    try {
        const [employees] = await employeePool.execute(
            `SELECT
                 e.employee_id,
                 e.employee_number,
                 CONCAT(e.first_name, ' ', IFNULL(e.middle_name, ''), ' ', e.last_name) as full_name,
                 e.first_name,
                 e.middle_name,
                 e.last_name,
                 e.date_of_birth,
                 e.sex,
                 e.civil_status,
                 e.email_address,
                 e.mobile_number,
                 CONCAT(e.street_address, ', ', e.city, ', ', e.province) as full_address,
                 e.employment_type,
                 e.employment_status,
                 e.date_hired,
                 e.sss_number,
                 e.philhealth_number,
                 e.pagibig_number,
                 e.tin_number,
                 p.position_title as position,
                d.department_name as department,
                d.department_code
             FROM Employees e
                 LEFT JOIN Positions p ON e.position_id = p.position_id
                 LEFT JOIN Departments d ON e.department_id = d.department_id
             WHERE e.employment_status = 'Active'
             ORDER BY e.employee_id`
        );

        res.json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ message: 'Error fetching employee data (VPN may be down)', error: err.message });
    }
});


// GET SINGLE EMPLOYEE BY ID (READ)
app.get('/api/employees/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [employees] = await employeePool.execute(
            `SELECT
                 e.*,
                 p.position_title,
                 d.department_name,
                 d.department_code
             FROM Employees e
                      LEFT JOIN Positions p ON e.position_id = p.position_id
                      LEFT JOIN Departments d ON e.department_id = d.department_id
             WHERE e.employee_id = ?`,
            [id]
        );

        if (employees.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const [contacts] = await employeePool.execute(
            `SELECT * FROM EmergencyContacts WHERE employee_id = ?`,
            [id]
        );

        res.json({
            ...employees[0],
            emergency_contacts: contacts
        });
    } catch (err) {
        console.error('Error fetching employee:', err);
        res.status(500).json({ message: 'Error fetching employee data', error: err.message });
    }
});

// ADD NEW EMPLOYEE (CREATE)
app.post('/api/employees', async (req, res) => {
    const {
        employee_number, first_name, middle_name, last_name, suffix, date_of_birth, sex, civil_status,
        nationality, religion, email_address, mobile_number, street_address, city,
        province, postal_code, country, position_id, department_id, employment_type,
        employment_status, date_hired, date_regularized, sss_number, philhealth_number,
        pagibig_number, tin_number
    } = req.body;

    if (!employee_number || !first_name || !last_name || !position_id || !department_id || !date_hired) {
        return res.status(400).json({ message: 'Missing required employee fields.' });
    }

    try {
        const sql = `
            INSERT INTO Employees (
                employee_number, first_name, middle_name, last_name, suffix, date_of_birth, sex, civil_status,
                nationality, religion, email_address, mobile_number, street_address, city,
                province, postal_code, country, position_id, department_id, employment_type,
                employment_status, date_hired, date_regularized, sss_number, philhealth_number,
                pagibig_number, tin_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            employee_number, first_name, middle_name, last_name, suffix, date_of_birth, sex, civil_status,
            nationality, religion, email_address, mobile_number, street_address, city,
            province, postal_code, country, position_id, department_id, employment_type,
            employment_status || 'Pending', date_hired, date_regularized || null, sss_number, philhealth_number,
            pagibig_number, tin_number
        ];

        const [result] = await employeePool.execute(sql, values);
        const newEmployeeId = result.insertId;

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'EMPLOYEE_CREATE',
            `Created new Employee ID: ${newEmployeeId} (${first_name} ${last_name})`
        );

        res.status(201).json({ message: 'Employee added successfully.', id: newEmployeeId });
    } catch (err) {
        console.error('Error adding employee:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Employee number already exists.', error: err.message });
        }
        res.status(500).json({ message: 'Failed to add employee.', error: err.message });
    }
});

// UPDATE EMPLOYEE DETAILS (UPDATE)
app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const {
        first_name, middle_name, last_name, suffix, date_of_birth, sex, civil_status,
        nationality, religion, email_address, mobile_number, street_address, city,
        province, postal_code, country, position_id, department_id, employment_type,
        employment_status, date_hired, date_regularized, date_separated,
        sss_number, philhealth_number, pagibig_number, tin_number
    } = req.body;

    if (!first_name || !last_name || !position_id || !department_id) {
        return res.status(400).json({ message: 'Missing required employee fields.' });
    }

    try {
        const sql = `
            UPDATE Employees SET
                first_name = ?, middle_name = ?, last_name = ?, suffix = ?, date_of_birth = ?,
                sex = ?, civil_status = ?, nationality = ?, religion = ?, email_address = ?,
                mobile_number = ?, street_address = ?, city = ?, province = ?, postal_code = ?,
                country = ?, position_id = ?, department_id = ?, employment_type = ?,
                employment_status = ?, date_hired = ?, date_regularized = ?, date_separated = ?,
                sss_number = ?, philhealth_number = ?, pagibig_number = ?, tin_number = ?
            WHERE employee_id = ?
        `;
        const values = [
            first_name, middle_name, last_name, suffix, date_of_birth, sex, civil_status,
            nationality, religion, email_address, mobile_number, street_address, city,
            province, postal_code, country, position_id, department_id, employment_type,
            employment_status, date_hired, date_regularized, date_separated,
            sss_number, philhealth_number, pagibig_number, tin_number, id
        ];

        const [result] = await employeePool.execute(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'EMPLOYEE_UPDATE',
            `Updated details for Employee ID: ${id} (${first_name} ${last_name})`
        );

        res.json({ message: 'Employee updated successfully.' });
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ message: 'Failed to update employee.', error: err.message });
    }
});

// DELETE EMPLOYEE (DELETE)
app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Delete dependent records first to satisfy Foreign Key constraints
        await employeePool.execute(`DELETE FROM EmergencyContacts WHERE employee_id = ?`, [id]);
        await employeePool.execute(`DELETE FROM EducationalBackground WHERE employee_id = ?`, [id]);
        await employeePool.execute(`DELETE FROM WorkExperience WHERE employee_id = ?`, [id]);

        // Delete the main employee record
        const [result] = await employeePool.execute(`DELETE FROM Employees WHERE employee_id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'EMPLOYEE_DELETE',
            `Deleted Employee ID: ${id}`
        );

        res.json({ message: 'Employee and related records deleted successfully.' });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ message: 'Failed to delete employee.', error: err.message });
    }
});

// ==================== DEPARTMENT CRUD (CUD) ====================

// GET DEPARTMENTS (READ)
app.get('/api/departments', async (req, res) => {
    try {
        const [departments] = await employeePool.execute(
            `SELECT * FROM Departments ORDER BY department_name`
        );
        res.json(departments);
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ message: 'Error fetching departments', error: err.message });
    }
});

// ADD NEW DEPARTMENT (CREATE)
app.post('/api/departments', async (req, res) => {
    const { department_name, department_code, description } = req.body;

    if (!department_name || !department_code) {
        return res.status(400).json({ message: 'Department name and code are required.' });
    }

    try {
        await employeePool.execute(
            `INSERT INTO Departments (department_name, department_code, description) VALUES (?, ?, ?)`,
            [department_name, department_code, description]
        );

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'DEPARTMENT_CREATE',
            `Created department: ${department_name} (${department_code})`
        );

        res.status(201).json({ message: 'Department added successfully.' });
    } catch (err) {
        console.error('Error adding department:', err);
        res.status(500).json({ message: 'Failed to add department.', error: err.message });
    }
});

// UPDATE DEPARTMENT (UPDATE)
app.put('/api/departments/:id', async (req, res) => {
    const { id } = req.params;
    const { department_name, department_code, description } = req.body;

    if (!department_name || !department_code) {
        return res.status(400).json({ message: 'Department name and code are required.' });
    }

    try {
        const [result] = await employeePool.execute(
            `UPDATE Departments SET department_name = ?, department_code = ?, description = ? WHERE department_id = ?`,
            [department_name, department_code, description, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'DEPARTMENT_UPDATE',
            `Updated Department ID: ${id} to ${department_name}`
        );

        res.json({ message: 'Department updated successfully.' });
    } catch (err) {
        console.error('Error updating department:', err);
        res.status(500).json({ message: 'Failed to update department.', error: err.message });
    }
});

// DELETE DEPARTMENT (DELETE)
app.delete('/api/departments/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // IMPORTANT: Check for dependent positions/employees before deletion!
        const [positionCount] = await employeePool.execute(
            `SELECT COUNT(*) as count FROM Positions WHERE department_id = ?`,
            [id]
        );
        if (positionCount[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete department: Positions are currently linked to it.' });
        }

        const [result] = await employeePool.execute(
            `DELETE FROM Departments WHERE department_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'DEPARTMENT_DELETE',
            `Deleted Department ID: ${id}`
        );

        res.json({ message: 'Department deleted successfully.' });
    } catch (err) {
        console.error('Error deleting department:', err);
        res.status(500).json({ message: 'Failed to delete department.', error: err.message });
    }
});

// ==================== POSITION CRUD (CUD) ====================

// GET POSITIONS (READ)
app.get('/api/positions', async (req, res) => {
    try {
        const [positions] = await employeePool.execute(
            `SELECT p.*, d.department_name
             FROM Positions p
                      LEFT JOIN Departments d ON p.department_id = d.department_id
             ORDER BY p.position_title`
        );
        res.json(positions);
    } catch (err) {
        console.error('Error fetching positions:', err);
        res.status(500).json({ message: 'Error fetching positions', error: err.message });
    }
});

// ADD NEW POSITION (CREATE)
app.post('/api/positions', async (req, res) => {
    const { position_title, department_id, salary_grade, min_salary, max_salary } = req.body;

    if (!position_title || !department_id) {
        return res.status(400).json({ message: 'Position title and department ID are required.' });
    }

    try {
        await employeePool.execute(
            `INSERT INTO Positions (position_title, department_id, salary_grade, min_salary, max_salary) VALUES (?, ?, ?, ?, ?)`,
            [position_title, department_id, salary_grade, min_salary, max_salary]
        );

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'POSITION_CREATE',
            `Created position: ${position_title} (Dept ID: ${department_id})`
        );

        res.status(201).json({ message: 'Position added successfully.' });
    } catch (err) {
        console.error('Error adding position:', err);
        res.status(500).json({ message: 'Failed to add position.', error: err.message });
    }
});

// UPDATE POSITION (UPDATE)
app.put('/api/positions/:id', async (req, res) => {
    const { id } = req.params;
    const { position_title, department_id, salary_grade, min_salary, max_salary } = req.body;

    if (!position_title || !department_id) {
        return res.status(400).json({ message: 'Position title and department ID are required.' });
    }

    try {
        const [result] = await employeePool.execute(
            `UPDATE Positions SET position_title = ?, department_id = ?, salary_grade = ?, min_salary = ?, max_salary = ? WHERE position_id = ?`,
            [position_title, department_id, salary_grade, min_salary, max_salary, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Position not found.' });
        }

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'POSITION_UPDATE',
            `Updated Position ID: ${id} to ${position_title}`
        );

        res.json({ message: 'Position updated successfully.' });
    } catch (err) {
        console.error('Error updating position:', err);
        res.status(500).json({ message: 'Failed to update position.', error: err.message });
    }
});

// DELETE POSITION (DELETE)
app.delete('/api/positions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // IMPORTANT: Check for dependent employees before deletion!
        const [employeeCount] = await employeePool.execute(
            `SELECT COUNT(*) as count FROM Employees WHERE position_id = ?`,
            [id]
        );
        if (employeeCount[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete position: Employees are currently linked to it.' });
        }

        const [result] = await employeePool.execute(
            `DELETE FROM Positions WHERE position_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Position not found.' });
        }

        recordAuditLog(
            req.body.currentUser || 'SYSTEM/ADMIN',
            'POSITION_DELETE',
            `Deleted Position ID: ${id}`
        );

        res.json({ message: 'Position deleted successfully.' });
    } catch (err) {
        console.error('Error deleting position:', err);
        res.status(500).json({ message: 'Failed to delete position.', error: err.message });
    }
});



// ==================== PAYROLL & REQUEST ROUTES (UNCHANGED) ====================

// GET PAYROLL DASHBOARD STATS
app.get('/api/payroll/dashboard-stats', async (req, res) => {
    try {
        console.log('📊 Fetching dashboard stats...');

        const [totalEmployees] = await employeePool.execute(
            `SELECT COUNT(*) as count FROM Employees WHERE employment_status = "Active"`
        );
        console.log('Total Employees:', totalEmployees[0].count);

        let processedCount = 0;
        let pendingCount = 0;
        let upcomingDate = null;

        try {
            const [processedPayouts] = await payrollPool.execute(
                `SELECT COUNT(*) as count FROM Payroll WHERE status IN ("Completed", "Paid", "Released")`
            );
            processedCount = processedPayouts[0].count;
        } catch (err) {
            console.log('⚠️ Payroll table may not exist yet');
        }

        try {
            const [pendingPayouts] = await payrollPool.execute(
                `SELECT COUNT(*) as count FROM Payroll WHERE status IN ("Pending", "Processing")`
            );
            pendingCount = pendingPayouts[0].count;
        } catch (err) {
            console.log('⚠️ Payroll table may not exist yet');
        }

        try {
            const [upcomingSchedule] = await payrollPool.execute(
                `SELECT payout_date FROM Payroll WHERE status = "Scheduled" AND payout_date > NOW() ORDER BY payout_date ASC LIMIT 1`
            );
            upcomingDate = upcomingSchedule[0]?.payout_date;
        } catch (err) {
            console.log('⚠️ No upcoming schedule');
        }

        const stats = {
            totalEmployees: totalEmployees[0].count || 0,
            processedPayouts: processedCount,
            pendingPayouts: pendingCount,
            upcomingSchedule: upcomingDate
        };

        console.log('✅ Sending stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics', details: error.message });
    }
});

// GET PAYROLL RECORDS
app.get('/api/payroll', async (req, res) => {
    try {
        const [payrolls] = await payrollPool.execute(
            `SELECT p.*, u.username as prepared_by_name
             FROM Payroll p
                      LEFT JOIN UserAccounts u ON p.prepared_by = u.user_id
             ORDER BY p.pay_date DESC, p.employee_id`
        );

        const enrichedPayrolls = await Promise.all(payrolls.map(async (payroll) => {
            try {
                const [empRows] = await employeePool.execute(
                    `SELECT
                         CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                         p.position_title as position,
                        d.department_name as department
                     FROM Employees e
                         LEFT JOIN Positions p ON e.position_id = p.position_id
                         LEFT JOIN Departments d ON e.department_id = d.department_id
                     WHERE e.employee_id = ?`,
                    [payroll.employee_id]
                );

                if (empRows.length > 0) {
                    return {
                        ...payroll,
                        employee_name: empRows[0].employee_name,
                        position: empRows[0].position,
                        department: empRows[0].department
                    };
                }
            } catch (empErr) {
                console.error(`Error fetching employee ${payroll.employee_id}:`, empErr);
            }

            return {
                ...payroll,
                employee_name: `Employee ID: ${payroll.employee_id}`,
                position: 'N/A',
                department: 'N/A'
            };
        }));

        res.json(enrichedPayrolls);
    } catch (err) {
        console.error('Error fetching payroll:', err);
        res.status(500).json({ message: 'Error fetching payroll data', error: err.message });
    }
});

// GET CUTOFF PERIODS
app.get('/api/cutoffs', async (req, res) => {
    try {
        const [cutoffs] = await payrollPool.execute(
            `SELECT * FROM PayrollCutoffs ORDER BY cutoff_start_date DESC`
        );
        res.json(cutoffs);
    } catch (err) {
        console.error('Error fetching cutoffs:', err);
        res.status(500).json({ message: 'Error fetching cutoff periods', error: err.message });
    }
});

// GET PENDING REQUESTS
app.get('/api/pending-requests', async (req, res) => {
    try {
        console.log('📋 Fetching pending requests...');

        try {
            const [requests] = await payrollPool.execute(
                `SELECT * FROM PendingRequests WHERE status = 'Pending' ORDER BY request_date DESC`
            );

            const enrichedRequests = await Promise.all(requests.map(async (request) => {
                try {
                    const [empRows] = await employeePool.execute(
                        `SELECT CONCAT(first_name, ' ', last_name) as employee_name
                         FROM Employees WHERE employee_id = ?`,
                        [request.employee_id]
                    );

                    return {
                        ...request,
                        employee_name: empRows[0]?.employee_name || `Employee ${request.employee_id}`
                    };
                } catch (empErr) {
                    return {
                        ...request,
                        employee_name: `Employee ${request.employee_id}`
                    };
                }
            }));

            res.json(enrichedRequests);
        } catch (tableErr) {
            console.log('⚠️ PendingRequests table may not exist, returning empty array');
            res.json([]);
        }
    } catch (error) {
        console.error('❌ Error fetching pending requests:', error);
        res.status(500).json({ error: 'Failed to fetch pending requests', details: error.message });
    }
});

// APPROVE PENDING REQUEST
app.put('/api/pending-requests/:id/approve', async (req, res) => {
    const { id } = req.params;

    // NOTE: You should get the user_name of the admin/manager from the request (e.g., JWT)
    const approver_name = 'ADMIN_USER'; // Placeholder

    try {
        await payrollPool.execute(
            `UPDATE PendingRequests SET status = 'Approved' WHERE request_id = ?`,
            [id]
        );

        // ✅ ADDED: Audit log request approval
        recordAuditLog(
            approver_name,
            'REQUEST_APPROVED',
            `Approved pending request ID: ${id}`
        );

        res.json({ success: true, message: 'Request approved' });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

// REJECT PENDING REQUEST
app.put('/api/pending-requests/:id/reject', async (req, res) => {
    const { id } = req.params;

    // NOTE: You should get the user_name of the admin/manager from the request (e.g., JWT)
    const rejecter_name = 'ADMIN_USER'; // Placeholder

    try {
        await payrollPool.execute(
            `UPDATE PendingRequests SET status = 'Rejected' WHERE request_id = ?`,
            [id]
        );

        // ✅ ADDED: Audit log request rejection
        recordAuditLog(
            rejecter_name,
            'REQUEST_REJECTED',
            `Rejected pending request ID: ${id}`
        );

        res.json({ success: true, message: 'Request rejected' });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// GET PAYROLL REPORTS
app.get('/api/payroll-reports', async (req, res) => {
    try {
        console.log('📊 Fetching payroll reports...');

        try {
            const [reports] = await payrollPool.execute(
                `SELECT * FROM Payroll WHERE status IN ('Released', 'Completed', 'Paid') ORDER BY pay_date DESC LIMIT 50`
            );
            res.json(reports);
        } catch (tableErr) {
            console.log('⚠️ Payroll table may not exist, returning empty array');
            res.json([]);
        }
    } catch (error) {
        console.error('❌ Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
    }
});

// GET TAX CONTRIBUTIONS
app.get('/api/tax-contributions', async (req, res) => {
    try {
        console.log('💰 Fetching tax contributions...');

        let monthlyData = [];
        let upcomingDeadlines = [];

        try {
            const [monthly] = await payrollPool.execute(
                `SELECT DATE_FORMAT(pay_date, '%b') as month, SUM(total_deductions) as total_contributions
                 FROM Payroll
                 WHERE YEAR(pay_date) = YEAR(NOW())
                 GROUP BY MONTH(pay_date)
                 ORDER BY MONTH(pay_date)`
            );
            monthlyData = monthly;
        } catch (err) {
            console.log('⚠️ Could not fetch monthly data');
        }

        try {
            const [deadlines] = await payrollPool.execute(
                `SELECT * FROM ContributionDeadlines WHERE deadline_date >= NOW() ORDER BY deadline_date ASC LIMIT 10`
            );
            upcomingDeadlines = deadlines;
        } catch (err) {
            console.log('⚠️ Could not fetch deadlines');
        }

        res.json({ monthlyData, upcomingDeadlines });
    } catch (error) {
        console.error('❌ Error fetching tax data:', error);
        res.status(500).json({ error: 'Failed to fetch tax data', details: error.message });
    }
});

// GET TIMESHEETS
app.get('/api/timesheets', async (req, res) => {
    const { employee_id, start_date, end_date } = req.query;

    try {
        let query = `SELECT * FROM Timesheets WHERE 1=1`;
        const params = [];

        if (employee_id) {
            query += ` AND employee_id = ?`;
            params.push(employee_id);
        }

        if (start_date && end_date) {
            query += ` AND date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY date DESC, employee_id`;

        const [timesheets] = await payrollPool.execute(query, params);

        const enrichedTimesheets = await Promise.all(timesheets.map(async (timesheet) => {
            try {
                const [empRows] = await employeePool.execute(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name,
                            p.position_title as position
                     FROM Employees e
                         LEFT JOIN Positions p ON e.position_id = p.position_id
                     WHERE e.employee_id = ?`,
                    [timesheet.employee_id]
                );

                if (empRows.length > 0) {
                    return {
                        ...timesheet,
                        employee_name: empRows[0].employee_name,
                        position: empRows[0].position
                    };
                }
            } catch (empErr) {
                console.error(`Error fetching employee ${timesheet.employee_id}:`, empErr);
            }

            return {
                ...timesheet,
                employee_name: `Employee ID: ${timesheet.employee_id}`,
                position: 'N/A'
            };
        }));

        res.json(enrichedTimesheets);
    } catch (err) {
        console.error('Error fetching timesheets:', err);
        res.status(500).json({ message: 'Error fetching timesheet data', error: err.message });
    }
});

// ==================== STATIC FILES (AFTER API ROUTES) ====================

app.use(express.static(path.join(__dirname, '../dist')));

// ==================== CATCH-ALL ROUTE (MUST BE LAST) ====================

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});