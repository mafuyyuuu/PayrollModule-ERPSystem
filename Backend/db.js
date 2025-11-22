import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const payrollDB = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export const hrDB = mysql.createPool({
    host: process.env.HR_DB_HOST,
    user: process.env.HR_DB_USER,
    password: process.env.HR_DB_PASSWORD,
    database: process.env.HR_DB_NAME
});