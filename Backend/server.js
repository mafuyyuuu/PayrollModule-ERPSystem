import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Create MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Testdb',
    port: 3306
});

// ✅ Test database connection
try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL: Testdb');
    conn.release();
} catch (err) {
    console.error('❌ Database connection failed:', err);
}

// ---------------------- LOGIN ROUTE ----------------------
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const roleMap = {
        1: 'admin',
        2: 'manager',
        3: 'payroll',
        4: 'employee'
    };

    try {
        const [rows] = await pool.execute(
            `SELECT ua.user_id, ua.username, ua.email_address, ua.role_id, ua.status,
                    e.first_name, e.last_name
             FROM UserAccounts ua
             LEFT JOIN Employees e ON ua.employee_id = e.employee_id
             WHERE ua.email_address = ? AND ua.password = ?`,
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        res.json({
            id: user.user_id,
            username: user.username,
            email: user.email_address,
            role: roleMap[Number(user.role_id)] || 'Unknown',
            name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null,
            status: user.status
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ---------------------- CREATE USER ROUTE ----------------------
app.post('/create-user', async (req, res) => {
    const { username, email, password, role_id, employee_id } = req.body;

    const nonEmployeeRoles = [1, 3]; // Admin, Payroll
    const employeeRoles = [2, 4];    // Manager, Employee

    if (nonEmployeeRoles.includes(role_id) && employee_id) {
        return res.status(400).json({ message: 'This role should not be linked to an employee' });
    }

    if (employeeRoles.includes(role_id) && !employee_id) {
        return res.status(400).json({ message: 'This role must be linked to an employee' });
    }

    try {
        await pool.execute(
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

// ---------------------- START SERVER ----------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
