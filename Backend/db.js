import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Payroll Management System Database (our database)
export const payrollDB = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'payrollsystem',
    password: process.env.DB_PASSWORD || 'payroll',
    database: process.env.DB_NAME || 'payrollmanagementsystem',
    port: process.env.DB_PORT || 3306
});

// This is the HR database with employee data
export const hrDB = mysql.createPool({
    host: process.env.EMP_DB_HOST || 'localhost',
    user: process.env.EMP_DB_USER || 'root',
    password: process.env.EMP_DB_PASSWORD || 'root',
    database: process.env.EMP_DB_NAME || 'employee_management_system',
    port: process.env.EMP_DB_PORT || 3306
});

// Test connections on startup
(async () => {
    try {
        const conn = await payrollDB.getConnection();
        console.log('✅ [db.js] Connected to Payroll database');
        conn.release();
    } catch (err) {
        console.error('❌ [db.js] Payroll database connection failed:', err.message);
    }

    try {
        const conn = await hrDB.getConnection();
        console.log('✅ [db.js] Connected to Employee Management (HR) database');
        conn.release();
    } catch (err) {
        console.error('⚠️ [db.js] HR database connection failed (VPN may not be active):', err.message);
    }
})();