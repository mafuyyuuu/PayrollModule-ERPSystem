import { db } from "../db.js";

// Controller for Admin Dashboard summary
export const getDashboardSummary = async (req, res) => {
    try {
        // Total employees
        const [employees] = await db.query("SELECT COUNT(*) AS totalEmployees FROM Employees");

        // Processed payouts
        const [processed] = await db.query(
            "SELECT IFNULL(SUM(net_pay),0) AS processedPayouts FROM Payroll WHERE status='Processed'"
        );

        // Pending payouts
        const [pending] = await db.query(
            "SELECT IFNULL(SUM(net_pay),0) AS pendingPayouts FROM Payroll WHERE status='Pending'"
        );

        // Upcoming schedule: for simplicity, we assume semi-monthly cutoffs
        const [nextSchedule] = await db.query(
            "SELECT MIN(cutoff_end_date) AS upcomingSchedule FROM Payroll WHERE cutoff_end_date >= CURDATE()"
        );

        res.json({
            success: true,
            data: {
                totalEmployees: employees[0].totalEmployees,
                processedPayouts: processed[0].processedPayouts,
                pendingPayouts: pending[0].pendingPayouts,
                upcomingSchedule: nextSchedule[0].upcomingSchedule
                    ? new Date(nextSchedule[0].upcomingSchedule).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })
                    : "No schedule"
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
