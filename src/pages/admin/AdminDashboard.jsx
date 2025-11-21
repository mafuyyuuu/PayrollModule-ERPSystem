import { Box, useTheme } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { BarChart3 } from "lucide-react";

const AdminDashboard = () => {
    const theme = useTheme();

    const notifications = [
        {
            title: "Payroll Updated",
            message: "The payroll for October 2025 has been successfully processed.",
        },
        {
            title: "System Maintenance",
            message:
                "Scheduled maintenance will occur on November 15, 2025, from 12 AM to 2 AM.",
        },
        {
            title: "New Employee Added",
            message: "A new employee has been successfully added to the HR database.",
        },
        {
            title: "Policy Reminder",
            message: "Please review the updated attendance policy by November 20, 2025.",
        },
    ];

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                width: "100%",
                height: "100%",
                fontFamily: theme.typography.fontFamily,
            }}
        >
            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                gap={2}
            >
                <DashboardCard icon="ri-group-line" title="Total Employees" value="55" />
                <DashboardCard
                    icon="ri-refund-2-line"
                    title="Processed Payouts"
                    value="₱120,000.00"
                    showHideButton
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Pending Payouts"
                    value="₱30,000.00"
                    showHideButton
                />
                <DashboardCard
                    icon="ri-calendar-schedule-line"
                    title="Upcoming Schedules"
                    value="October 31, 2025"
                />
            </Box>

            <Box
                sx={{
                    flex: 1,
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    p: 3,
                    color: theme.palette.text.primary,
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <BarChart3 size={20} color={theme.palette.text.primary} />
                        <span
                            style={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                fontSize: "18px",
                                color: theme.palette.text.primary,
                            }}
                        >
              System Alerts and Notifications
            </span>
                    </Box>
                    <button
                        style={{
                            background: "transparent",
                            color: theme.palette.text.primary,
                            padding: "6px 14px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            fontSize: "18px",
                        }}
                    >
                        Clear All
                    </button>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": { width: 0, height: 0 },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {notifications.map((notif, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                bgcolor: "#fff",
                                p: 2,
                                borderRadius: "10px",
                                border: `1px solid ${theme.palette.divider}`,
                                backdropFilter: "blur(12px)",
                                transition: "all 0.3s ease",
                                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "20px",
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#1b2223",
                                    margin: "0 0 5px 0",
                                    paddingLeft: "8px",
                                }}
                            >
                                {notif.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: "16px",
                                    lineHeight: 1.4,
                                    color: "#333",
                                    margin: 0,
                                    paddingLeft: "8px",
                                }}
                            >
                                {notif.message}
                            </p>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
