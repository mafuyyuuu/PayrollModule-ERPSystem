import db from "../db.js";

// Get total employees
export const getTotalEmployees = async () => {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM Employees");
    return rows[0].total;
};

// Get processed payouts
export const getProcessedPayouts = async () => {
    const [rows] = await db.query(`
        SELECT SUM(net_pay) AS total 
        FROM Payroll 
        WHERE status = 'Processed'
    `);
    return rows[0].total || 0;
};

// Get pending payouts
export const getPendingPayouts = async () => {
    const [rows] = await db.query(`
        SELECT SUM(net_pay) AS total 
        FROM Payroll 
        WHERE status = 'Pending'
    `);
    return rows[0].total || 0;
};

// Compute upcoming semi-monthly schedule
export const getUpcomingSchedule = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();

    const firstCutoff = new Date(year, month, 15);
    const secondCutoff = new Date(year, month + 1, 0);

    let upcoming;

    if (today <= firstCutoff) {
        upcoming = firstCutoff;
    } else {
        upcoming = secondCutoff;
    }

    return upcoming.toISOString().split("T")[0];
};