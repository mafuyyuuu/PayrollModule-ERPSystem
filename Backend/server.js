/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { payrollDB, hrDB } from './db.js';
import payrollRoutes from './routes/payrollRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== API ROUTES (MUST BE BEFORE STATIC FILES) ====================

// Import routes
app.use('/api/payroll', payrollRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);

// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const roleMap = {
        1: 'admin',
        2: 'manager',
        3: 'payroll',
        4: 'employee'
    };

    try {
        const [userRows] = await payrollDB.execute(
            `SELECT user_id, employee_id, username, email_address, role_id, status
             FROM UserAccounts
             WHERE username = ? AND password = ?`,
            [username, password]
        );

        if (userRows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = userRows[0];
        let employeeData = null;

        if (user.employee_id) {
            try {
                const [empRows] = await hrDB.execute(
                    `SELECT
                         e.employee_id,
                         e.first_name,
                         e.middle_name,
                         e.last_name,
                         e.date_of_birth,
                         e.sex,
                         e.marital_status,
                         e.address,
                         e.contact_number,
                         et.employee_type_name as employment_type,
                         p.position_name as position_title,
                         d.department_name,
                         ec.contact_name as emergency_contact_name,
                         ec.contact_number as emergency_contact_number
                     FROM employees e
                              LEFT JOIN positions p ON e.position_id = p.position_id
                              LEFT JOIN departments d ON e.department_id = d.department_id
                              LEFT JOIN employeetype et ON e.employee_type_id = et.employee_type_id
                              LEFT JOIN emergencycontacts ec ON e.employee_id = ec.employee_id
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
            response.birthday = employeeData.date_of_birth;
            response.sex = employeeData.sex;
            response.maritalStatus = employeeData.marital_status;
            response.address = employeeData.address;
            response.contactNumber = employeeData.contact_number;
            response.emergencyContactName = employeeData.emergency_contact_name;
            response.emergencyContactNumber = employeeData.emergency_contact_number;
        }

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
                const [empRows] = await hrDB.execute(
                    `SELECT employee_id FROM employees WHERE employee_id = ?`,
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

        await payrollDB.execute(
            `INSERT INTO UserAccounts (employee_id, username, email_address, password, role_id, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [employee_id || null, username, email, password, role_id, 'Active']
        );

        res.json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET ALL EMPLOYEES
app.get('/api/employees', async (req, res) => {
    try {
        const [employees] = await hrDB.execute(
            `SELECT 
                e.employee_id,
                CONCAT(e.first_name, ' ', IFNULL(e.middle_name, ''), ' ', e.last_name) as full_name,
                e.first_name,
                e.middle_name,
                e.last_name,
                e.date_of_birth,
                e.sex,
                e.marital_status,
                e.email,
                e.contact_number,
                e.address,
                et.employee_type_name as employment_type,
                e.salary,
                p.position_name as position,
                d.department_name as department
             FROM employees e
             LEFT JOIN positions p ON e.position_id = p.position_id
             LEFT JOIN departments d ON e.department_id = d.department_id
             LEFT JOIN employeetype et ON e.employee_type_id = et.employee_type_id
             ORDER BY e.employee_id`
        );

        res.json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ message: 'Error fetching employee data (VPN may be down)', error: err.message });
    }
});

// GET SINGLE EMPLOYEE BY ID
app.get('/api/employees/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [employees] = await hrDB.execute(
            `SELECT
                 e.*,
                 p.position_name,
                 d.department_name,
                 et.employee_type_name
             FROM employees e
                      LEFT JOIN positions p ON e.position_id = p.position_id
                      LEFT JOIN departments d ON e.department_id = d.department_id
                      LEFT JOIN employeetype et ON e.employee_type_id = et.employee_type_id
             WHERE e.employee_id = ?`,
            [id]
        );

        if (employees.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const [contacts] = await hrDB.execute(
            `SELECT * FROM emergencycontacts WHERE employee_id = ?`,
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

// GET DEPARTMENTS
app.get('/api/departments', async (req, res) => {
    try {
        const [departments] = await hrDB.execute(
            `SELECT * FROM departments ORDER BY department_name`
        );
        res.json(departments);
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ message: 'Error fetching departments', error: err.message });
    }
});

// GET POSITIONS
app.get('/api/positions', async (req, res) => {
    try {
        const [positions] = await hrDB.execute(
            `SELECT p.position_id, p.position_name, p.position_description, 
                    p.position_min_salary, p.position_max_salary
             FROM positions p
             ORDER BY p.position_name`
        );
        res.json(positions);
    } catch (err) {
        console.error('Error fetching positions:', err);
        res.status(500).json({ message: 'Error fetching positions', error: err.message });
    }
});

// Note: Dashboard stats, payroll, cutoffs, pending-requests, tax-contributions, etc. 
// are now handled by payrollRoutes.js mounted at /api/payroll
// See: Backend/routes/payrollRoutes.js

// =====================================================
// EMPLOYEE TYPES
// =====================================================
app.get('/api/employee-types', async (req, res) => {
    try {
        const [types] = await hrDB.execute(
            `SELECT employee_type_id, employee_type_name FROM employeetype ORDER BY employee_type_id`
        );
        res.json(types);
    } catch (err) {
        console.error('Error fetching employee types:', err);
        // Return fallback data
        res.json([
            { employee_type_id: 1, employee_type_name: "Full Time" },
            { employee_type_id: 2, employee_type_name: "Part Time" },
            { employee_type_id: 3, employee_type_name: "Contract" }
        ]);
    }
});

// =====================================================
// CREATE DEPARTMENT
// =====================================================
app.post('/api/departments', async (req, res) => {
    const { department_name } = req.body;

    if (!department_name || !department_name.trim()) {
        return res.status(400).json({ message: 'Department name is required' });
    }

    try {
        const [result] = await hrDB.execute(
            `INSERT INTO departments (department_name) VALUES (?)`,
            [department_name.trim()]
        );
        res.status(201).json({ 
            success: true, 
            department_id: result.insertId,
            message: 'Department created successfully' 
        });
    } catch (err) {
        console.error('Error creating department:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Department already exists' });
        }
        res.status(500).json({ message: 'Error creating department', error: err.message });
    }
});

// =====================================================
// CREATE POSITION
// =====================================================
app.post('/api/positions', async (req, res) => {
    const { position_name, position_description, position_min_salary, position_max_salary } = req.body;

    if (!position_name || !position_name.trim()) {
        return res.status(400).json({ message: 'Position name is required' });
    }

    try {
        const [result] = await hrDB.execute(
            `INSERT INTO positions (position_name, position_description, position_min_salary, position_max_salary) 
             VALUES (?, ?, ?, ?)`,
            [position_name.trim(), position_description || null, position_min_salary || null, position_max_salary || null]
        );
        res.status(201).json({ 
            success: true, 
            position_id: result.insertId,
            message: 'Position created successfully' 
        });
    } catch (err) {
        console.error('Error creating position:', err);
        res.status(500).json({ message: 'Error creating position', error: err.message });
    }
});

// =====================================================
// GET ALL USERS
// =====================================================
app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await payrollDB.execute(`
            SELECT 
                ua.user_id as id,
                ua.employee_id,
                ua.username,
                ua.email_address as email,
                ua.role_id,
                r.role_name as role,
                ua.status,
                CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.middle_name, ''), ' ', COALESCE(e.last_name, '')) as name
            FROM UserAccounts ua
            LEFT JOIN Roles r ON ua.role_id = r.role_id
            LEFT JOIN employeedb.employees e ON ua.employee_id = e.employee_id
            ORDER BY ua.user_id DESC
        `);
        
        // Clean up name field (remove extra spaces)
        const cleanedUsers = users.map(u => ({
            ...u,
            name: u.name?.replace(/\s+/g, ' ').trim() || u.username
        }));
        
        res.json(cleanedUsers);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

// =====================================================
// CREATE EMPLOYEE WITH USER ACCOUNT
// =====================================================
app.post('/api/admin/users', async (req, res) => {
    const { 
        username, email, password, role_id, status,
        first_name, middle_name, last_name,
        employee_type_id, department_id, position_id
    } = req.body;

    console.log('Creating user with data:', req.body);

    // Validate required fields
    if (!username || !email || !role_id) {
        return res.status(400).json({ message: 'Username, email, and role are required' });
    }

    try {
        let employee_id = null;
        const roleIdNum = parseInt(role_id);

        // If role is Employee (4), create employee record first
        if (roleIdNum === 4 && first_name && last_name) {
            const [empResult] = await hrDB.execute(
                `INSERT INTO employees (first_name, middle_name, last_name, employee_type_id, department_id, position_id, date_hired)
                 VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
                [first_name, middle_name || null, last_name, employee_type_id || null, department_id || null, position_id || null]
            );
            employee_id = empResult.insertId;
        } else if (first_name && last_name) {
            // For non-employee roles (Admin, Manager, Payroll), still create employee record for name storage
            const [empResult] = await hrDB.execute(
                `INSERT INTO employees (first_name, middle_name, last_name, date_hired)
                 VALUES (?, ?, ?, CURDATE())`,
                [first_name, middle_name || null, last_name]
            );
            employee_id = empResult.insertId;
        }

        // Create user account
        const [userResult] = await payrollDB.execute(
            `INSERT INTO UserAccounts (employee_id, username, email_address, password, role_id, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [employee_id, username, email, password || 'password123', roleIdNum, status || 'Active']
        );

        // Log the activity
        await payrollDB.execute(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, description, processed_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            ['CREATE', 'User', userResult.insertId, `New user "${username}" created with role ID ${roleIdNum}`, null]
        );

        res.status(201).json({ 
            success: true, 
            user_id: userResult.insertId,
            employee_id: employee_id,
            message: 'User created successfully' 
        });
    } catch (err) {
        console.error('Error creating user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});

// =====================================================
// UPDATE USER
// =====================================================
app.put('/api/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        username, email, role_id, status,
        first_name, middle_name, last_name,
        employee_type_id, department_id, position_id
    } = req.body;

    try {
        const roleIdNum = parseInt(role_id);
        
        // Get current user to find employee_id
        const [currentUser] = await payrollDB.execute(
            'SELECT employee_id FROM UserAccounts WHERE user_id = ?',
            [id]
        );
        
        if (currentUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const employee_id = currentUser[0].employee_id;
        
        // Update employee record if exists
        if (employee_id && first_name && last_name) {
            await hrDB.execute(
                `UPDATE employees SET 
                    first_name = ?, middle_name = ?, last_name = ?,
                    employee_type_id = ?, department_id = ?, position_id = ?
                 WHERE employee_id = ?`,
                [first_name, middle_name || null, last_name, 
                 employee_type_id || null, department_id || null, position_id || null,
                 employee_id]
            );
        }
        
        // Update user account
        await payrollDB.execute(
            `UPDATE UserAccounts SET 
                username = ?, email_address = ?, role_id = ?, status = ?
             WHERE user_id = ?`,
            [username, email, roleIdNum, status || 'Active', id]
        );

        // Log the activity
        await payrollDB.execute(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, description, processed_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            ['UPDATE', 'User', id, `User "${username}" (ID: ${id}) updated`, null]
        );

        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});

// =====================================================
// DELETE USER
// =====================================================
app.delete('/api/admin/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Get user info for logging
        const [user] = await payrollDB.execute(
            'SELECT username, employee_id FROM UserAccounts WHERE user_id = ?',
            [id]
        );
        
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const username = user[0].username;
        
        // Delete user account
        await payrollDB.execute('DELETE FROM UserAccounts WHERE user_id = ?', [id]);

        // Log the activity
        await payrollDB.execute(
            `INSERT INTO ActivityLogs (action_type, entity_type, entity_id, description, processed_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            ['DELETE', 'User', id, `User "${username}" (ID: ${id}) deleted`, null]
        );

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
});

// =====================================================
// UPLOAD EMPLOYEE PHOTOS
// =====================================================

// Configure multer for photo uploads
const photoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', 'employee-photos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `employee-${req.body.employee_id}-${uniqueSuffix}${ext}`);
    }
});

const uploadPhotos = multer({ 
    storage: photoStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

app.post('/api/admin/users/photos', uploadPhotos.array('photos', 10), async (req, res) => {
    try {
        const { employee_id } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No photos uploaded' });
        }

        // Update employee profile path with the first photo
        if (employee_id && files.length > 0) {
            await hrDB.execute(
                `UPDATE employees SET profile_path = ? WHERE employee_id = ?`,
                [files[0].filename, employee_id]
            );
        }

        res.json({ 
            success: true, 
            message: `${files.length} photos uploaded successfully`,
            files: files.map(f => f.filename)
        });
    } catch (err) {
        console.error('Error uploading photos:', err);
        res.status(500).json({ message: 'Error uploading photos', error: err.message });
    }
});

// GET TIMESHEETS (legacy route - keep for now)
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

        const [timesheets] = await payrollDB.execute(query, params);

        const enrichedTimesheets = await Promise.all(timesheets.map(async (timesheet) => {
            try {
                const [empRows] = await hrDB.execute(
                    `SELECT CONCAT(first_name, ' ', last_name) as employee_name, 
                            p.position_name as position
                     FROM employees e
                     LEFT JOIN positions p ON e.position_id = p.position_id
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