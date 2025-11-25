import { Box, useTheme } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
    const theme = useTheme();

    // === STATE FOR BACKEND DATA ===
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [processedPayouts, setProcessedPayouts] = useState(0);
    const [pendingPayouts, setPendingPayouts] = useState(0);
    const [upcomingSchedule, setUpcomingSchedule] = useState("Loading...");

    // === FETCH DATA FROM BACKEND ===
    useEffect(() => {
        const fetchData = async () => {
            try {
                const emp = await axios.get("http://localhost:8080/api/dashboard/total-employees");
                const released = await axios.get("http://localhost:8080/api/dashboard/processed-payouts");
                const pending = await axios.get("http://localhost:8080/api/dashboard/pending-payouts");
                const schedule = await axios.get("http://localhost:8080/api/dashboard/upcoming-schedule");

                setTotalEmployees(emp.data.total || 0);
                setProcessedPayouts(released.data.total || 0);
                setPendingPayouts(pending.data.total || 0);
                setUpcomingSchedule(schedule.data.schedule || "No schedule");
            } catch (error) {
                console.log("Dashboard loading error:", error);
            }
        };

        fetchData();
    }, []);

    // === UI NOTIFICATIONS (static for now) ===
    const notifications = [
        { title: "Payroll Updated", message: "The payroll for October 2025 has been successfully processed." },
        { title: "System Maintenance", message: "Scheduled maintenance will occur on November 15, 2025, from 12 AM to 2 AM." },
        { title: "New Employee Added", message: "A new employee has been successfully added to the HR database." },
        { title: "Policy Reminder", message: "Please review the updated attendance policy by November 20, 2025." },
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
            {/* === DASHBOARD CARDS === */}
            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                gap={2}
            >
                <DashboardCard
                    icon="ri-group-line"
                    title="Total Employees"
                    value={totalEmployees}
                />
                <DashboardCard
                    icon="ri-refund-2-line"
                    title="Processed Payouts"
                    value={`₱ ${processedPayouts.toLocaleString()}`}
                    showHideButton
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Pending Payouts"
                    value={`₱ ${pendingPayouts.toLocaleString()}`}
                    showHideButton
                />
                <DashboardCard
                    icon="ri-calendar-schedule-line"
                    title="Upcoming Schedules"
                    value={upcomingSchedule}
                />
            </Box>

            {/* === NOTIFICATIONS PANEL === */}
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
