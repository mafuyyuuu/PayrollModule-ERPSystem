import {Box, Typography, useTheme} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { useEffect, useState } from "react";

const PayrollDashboard = () => {
    const theme = useTheme();

    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        totalEmployees: 0,
        processedPayouts: 0,
        pendingPayouts: 0,
        upcomingSchedule: "Loading..."
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/payroll/dashboard-stats');

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();
                console.log('✅ Dashboard data:', data);

                // Format the upcoming schedule date
                const formattedSchedule = data.upcomingSchedule
                    ? new Date(data.upcomingSchedule).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })
                    : "No upcoming schedule";

                setDashboardData({
                    totalEmployees: data.totalEmployees,
                    processedPayouts: data.processedPayouts,
                    pendingPayouts: data.pendingPayouts,
                    upcomingSchedule: formattedSchedule
                });

                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching dashboard data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <Box width="100%" height="80%">
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="20px"
                marginBottom="30px"
            >
                <DashboardCard
                    icon="ri-group-line"
                    title="Total Employees"
                    value={loading ? "..." : dashboardData.totalEmployees}
                />
                <DashboardCard
                    icon="ri-group-line"
                    title="Processed Payouts"
                    value={loading ? "..." : dashboardData.processedPayouts}
                />
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="Pending Payouts"
                    value={loading ? "..." : dashboardData.pendingPayouts}
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Upcoming Schedules"
                    value={loading ? "Loading..." : dashboardData.upcomingSchedule}
                />
            </Box>

            {/* PAYOUT SCHEDULE TIMELINE */}
            <Box
                sx={{
                    backgroundColor: theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    p: "24px",
                    color: theme.palette.text.primary,
                    height: "97.5%",
                    backdropFilter: "blur(12px)",
                    fontFamily: theme.typography.fontFamily,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                    gap: "10px",
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        mb: 2,
                        fontSize: "18px",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        color: error ? 'error.main' : 'inherit',
                    }}
                >
                    {!error && (
                        <i
                            className="ri-calendar-2-line"
                            style={{ fontSize: 18, marginRight: "10px" }}
                        ></i>
                    )}
                    {error ? `Error loading dashboard: ${error}` : "Payout Schedule Timeline"}
                </Typography>
            </Box>
        </Box>
    );
};

export default PayrollDashboard;