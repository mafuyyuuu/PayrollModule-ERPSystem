import db from '../../../db.js';

// Total employees
export const getTotalEmployees = async () => {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM Employees");
    return rows[0].total || 0;
};

// Processed payouts (Released)
export const getProcessedPayouts = async () => {
    const [rows] = await db.query(`
        SELECT IFNULL(SUM(net_pay),0) AS total 
        FROM Payroll 
        WHERE status='Released'
    `);
    return rows[0].total;
};

// Pending payouts
export const getPendingPayouts = async () => {
    const [rows] = await db.query(`
        SELECT IFNULL(SUM(net_pay),0) AS total 
        FROM Payroll 
        WHERE status='Pending'
    `);
    return rows[0].total;
};

// Upcoming schedule (from AdminConfig)
export const getUpcomingSchedule = async () => {
    const [rows] = await db.query(`
        SELECT default_cutoff_dates AS schedule 
        FROM AdminConfig 
        ORDER BY effective_date_of_changes DESC 
        LIMIT 1
    `);
    return rows[0] ? rows[0].schedule : "No schedule";
};