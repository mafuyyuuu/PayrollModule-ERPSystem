// backend/admin/models/adminDashboardModel.js
import { payrollDB, hrDB } from '../../db.js';

// Total employees
export const getTotalEmployees = async () => {
    const [rows] = await hrDB.query("SELECT COUNT(*) AS total FROM Employees WHERE employment_status='Active'");
    return rows[0]?.total || 0;
};

// Processed payouts (Released)
export const getProcessedPayouts = async () => {
    const [rows] = await payrollDB.query(`
        SELECT IFNULL(SUM(net_pay),0) AS total
        FROM Payroll
        WHERE status='Released'
    `);
    return rows[0]?.total || 0;
};

// Pending payouts
export const getPendingPayouts = async () => {
    const [rows] = await payrollDB.query(`
        SELECT IFNULL(SUM(net_pay),0) AS total
        FROM Payroll
        WHERE status='Pending'
    `);
    return rows[0]?.total || 0;
};

// Upcoming schedule
export const getUpcomingSchedule = async () => {
    const [rows] = await payrollDB.query(`
        SELECT default_cutoff_dates AS schedule
        FROM AdminConfig
        ORDER BY effective_date_of_changes DESC
            LIMIT 1
    `);
    return rows[0]?.schedule || "No schedule";
};
