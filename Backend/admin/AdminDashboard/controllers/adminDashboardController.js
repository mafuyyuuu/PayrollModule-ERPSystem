// backend/admin/AdminDashboard/controllers/dashboardControllers.js
import {
    getTotalEmployees,
    getProcessedPayouts,
    getPendingPayouts,
    getUpcomingSchedule
} from "../models/adminDashboardModel.js";

export const getDashboardSummary = async (req, res) => {
    try {
        const totalEmployees = await getTotalEmployees();
        const processedPayouts = await getProcessedPayouts();
        const pendingPayouts = await getPendingPayouts();
        const upcomingSchedule = await getUpcomingSchedule();

        res.json({
            success: true,
            data: {
                totalEmployees,
                processedPayouts,
                pendingPayouts,
                upcomingSchedule
            }
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
