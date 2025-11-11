import { Box } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { tokens } from "../../theme.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import NotificationItem from "../../components/NotificationItem.jsx";
import { BarChart3 } from "lucide-react";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box m="20px">
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px">
                <DashboardCard icon="ri-group-line" title="Total Employees" value="55" />
                <DashboardCard icon="ri-refund-2-line" title="Processed Payouts" value="₱120,000" />
                <DashboardCard icon="ri-timer-line" title="Pending Payouts" value="₱30,000" />
                <DashboardCard icon="ri-calendar-schedule-line" title="Upcoming Schedules" value="10/31/25" />
            </Box>

            <section
                className="notifications glass"
                style={{
                    marginTop: "30px",
                    padding: "20px",
                    borderRadius: "12px",
                    background: alpha(colors.white[100] || "#FFFFFF", 0.25),
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
            >
                <div
                    className="notifications-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                    }}
                >
                    <div
                        className="notif-title"
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <BarChart3 size={20} color="#3A4F50" />
                        <h2
                            style={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                color: "#1B2223",
                            }}
                        >
                            System Alerts and Notifications
                        </h2>
                    </div>
                    <button
                        className="view-all-btn"
                        style={{
                            background: "#1B2223",
                            color: "#fff",
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                        }}
                    >
                        View All
                    </button>
                </div>

                <div
                    className="notifications-list"
                    style={{
                        maxHeight: "370px",
                        overflowY: "auto",
                        paddingRight: "1px",
                    }}
                >
                    <NotificationItem
                        title="Payroll Updated"
                        description="The payroll for October 2025 has been successfully processed."
                    />
                    <NotificationItem
                        title="New Employee Added"
                        description="A new staff member has been added to the system."
                    />
                    <NotificationItem
                        title="System Maintenance"
                        description="Scheduled maintenance on November 1, 2025, at 10:00 PM."
                    />
                    <NotificationItem
                        title="Policy Reminder"
                        description="Please review the updated company policy effective next week."
                    />
                    <NotificationItem
                        title="Security Alert"
                        description="Multiple failed login attempts detected. Please verify your account security."
                    />
                    <NotificationItem
                        title="Backup Successful"
                        description="Database backup completed successfully on October 23, 2025."
                    />
                </div>
            </section>
        </Box>
    );
};

export default AdminDashboard;
