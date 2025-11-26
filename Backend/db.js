import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Payroll DB
export const payrollDB = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'payrollmanagementsystem',
    port: process.env.DB_PORT || 3306
});

// HR / Employee DB
export const hrDB = mysql.createPool({
    host: process.env.EMP_DB_HOST || 'localhost',
    user: process.env.EMP_DB_USER || 'root',
    password: process.env.EMP_DB_PASSWORD || 'root',
    database: process.env.EMP_DB_NAME || 'employeemanagementsystem',
    port: process.env.EMP_DB_PORT || 3306
});
