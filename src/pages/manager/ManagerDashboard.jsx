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
        <Box  mr="20px" ml="20px" >
            {/* DASHBOARD CARDS */}
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px">
                <DashboardCard
                    icon="ri-user-2-line"
                    title="Active Employees"
                    value="55"
                />
                <DashboardCard
                    icon="ri-pass-pending-line"
                    title="Pending Approvals"
                    value="XXXX"
                />
                <DashboardCard
                    icon="ri-briefcase-4-line"
                    title="Total Department Payroll"
                    value="₱520,000"
                />
                <DashboardCard
                    icon="ri-percent-fill"
                    title="Attendance Rate"
                    value="96%" />
            </Box>

            {/* LOWER SECTION: PERFORMANCE + EARNINGS */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(2, 1fr)"
                gap="20px"
                mt="30px"
            >
                {/* Top Performing Employees */}
                <Box
                    borderRadius="12px"
                    p="20px"
                    minHeight="550px"
                    width="980px"
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

                    <Typography fontFamily="'TTHoves-Demibold', sans-serif" fontSize="18px">
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
                    <Typography fontFamily="'TTHoves-Demibold', sans-serif" fontSize="18px" mb={"30px"}>
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
