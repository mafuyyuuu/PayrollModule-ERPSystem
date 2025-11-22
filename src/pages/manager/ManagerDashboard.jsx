import { Box, Typography, useTheme } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import {Line, LineChart, ResponsiveContainer} from "recharts";

const earningsData = [
    { month: "Jan", earnings: 20000 },
    { month: "Feb", earnings: 23000 },
    { month: "Mar", earnings: 21000 },
    { month: "Apr", earnings: 26000 },
    { month: "May", earnings: 24000 },
];

const ManagerDashboard = () => {
    const theme = useTheme();
    return (
        <Box width="100%" height="80%">
            {/* DASHBOARD CARDS */}
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px">
                <DashboardCard
                    icon="ri-user-3-fill"
                    title="Active Employees"
                    value="55"
                />
                <DashboardCard
                    icon="ri-pass-pending-fill"
                    title="Pending Approvals"
                    value="XXXX"
                />
                <DashboardCard
                    icon="ri-briefcase-4-fill"
                    title="Total Department Payroll"
                    value="₱520,000"
                />
                <DashboardCard
                    icon="ri-percent-line"
                    title="Attendance Rate"
                    value="96%"
                />
            </Box>

            {/* LOWER SECTION: PERFORMANCE + EARNINGS */}
            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
                gap="20px"
                mt="25px"
                alignItems="stretch"
                height="97.5%"
            >
                {/* Top Performing Employees */}
                <Box
                    borderRadius="12px"
                    p="24px"
                    sx={{
                        backgroundColor: theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                        fontFamily: theme.typography.fontFamily,
                        color: theme.palette.text.primary,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 2,
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            color: theme.palette.text.primary,
                        }}
                    >
                        <i
                            className="ri-line-chart-line"
                            style={{ fontSize: 18, marginRight: "10px", color: theme.palette.text.primary }}
                        ></i>
                        Top Performing Employees
                    </Typography>
                </Box>

                {/* Total Earning */}
                <Box
                    borderRadius="12px"
                    p="20px"
                    minHeight="550px"
                    sx={{
                        backgroundColor: theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 2,
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            color: theme.palette.text.primary,
                        }}
                    >
                        <i
                            className="ri-hand-coin-fill"
                            style={{ fontSize: 18, marginRight: "10px", color: theme.palette.text.primary }}
                        ></i>
                        Total Earning
                    </Typography>
                    <ResponsiveContainer width="100%" height={185} mt="10px">
                        <LineChart data={earningsData}>
                            <Line
                                type="monotone"
                                dataKey="earnings"
                                stroke="#3A4F50"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 1 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        </Box>
    );
};

export default ManagerDashboard;