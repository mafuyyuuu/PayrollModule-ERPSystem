import { Box, Typography, useTheme } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import {Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts";
import { useState, useEffect } from "react";

const ManagerDashboard = () => {
    const theme = useTheme();
    const [stats, setStats] = useState({
        activeEmployees: 0,
        pendingApprovals: 0,
        totalDepartmentPayroll: 0,
        attendanceRate: 0
    });
    const [earningsData, setEarningsData] = useState([]);
    const [topEmployees, setTopEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch dashboard stats
                const statsResponse = await fetch('http://localhost:8080/api/manager/dashboard-stats');
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                // Fetch earnings chart data
                const earningsResponse = await fetch('http://localhost:8080/api/manager/earnings-chart');
                if (earningsResponse.ok) {
                    const earningsResult = await earningsResponse.json();
                    if (earningsResult.length > 0) {
                        setEarningsData(earningsResult.map(item => ({
                            month: item.month,
                            earnings: parseFloat(item.earnings) || 0
                        })));
                    }
                }

                // Fetch top performing employees
                const topResponse = await fetch('http://localhost:8080/api/manager/top-employees');
                if (topResponse.ok) {
                    const topData = await topResponse.json();
                    setTopEmployees(topData);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <Box width="100%" height="80%">
            {/* DASHBOARD CARDS */}
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px">
                <DashboardCard
                    icon="ri-user-3-fill"
                    title="Active Employees"
                    value={loading ? "..." : stats.activeEmployees.toString()}
                />
                <DashboardCard
                    icon="ri-pass-pending-fill"
                    title="Pending Approvals"
                    value={loading ? "..." : stats.pendingApprovals.toString()}
                />
                <DashboardCard
                    icon="ri-briefcase-4-fill"
                    title="Total Department Payroll"
                    value={loading ? "..." : formatCurrency(stats.totalDepartmentPayroll)}
                />
                <DashboardCard
                    icon="ri-percent-line"
                    title="Attendance Rate"
                    value={loading ? "..." : `${stats.attendanceRate}%`}
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
                    
                    {/* Table Header */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "50px 2fr 1.5fr 1fr 1fr 1fr",
                            fontWeight: 700,
                            p: "8px 0",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            fontSize: "14px",
                        }}
                    >
                        <span>#</span>
                        <span>Employee</span>
                        <span>Position</span>
                        <span>Days Present</span>
                        <span>Avg Hours</span>
                        <span>Overtime</span>
                    </Box>

                    {/* Table Body */}
                    <Box sx={{ mt: 1 }}>
                        {loading ? (
                            <Box sx={{ p: 2, textAlign: 'center' }}>Loading...</Box>
                        ) : topEmployees.length === 0 ? (
                            <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.text.secondary }}>
                                No employee data available
                            </Box>
                        ) : (
                            topEmployees.map((emp) => (
                                <Box
                                    key={emp.rank}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "50px 2fr 1.5fr 1fr 1fr 1fr",
                                        p: "12px 0",
                                        borderBottom: `1px solid ${theme.palette.divider}`,
                                        fontSize: "14px",
                                        alignItems: "center",
                                        "&:hover": {
                                            backgroundColor: theme.palette.mode === "dark" 
                                                ? "rgba(255,255,255,0.05)" 
                                                : "rgba(0,0,0,0.02)",
                                        },
                                    }}
                                >
                                    <span style={{ fontWeight: 700, color: emp.rank <= 3 ? "#4CAF50" : "inherit" }}>
                                        {emp.rank}
                                    </span>
                                    <span style={{ fontWeight: 500 }}>{emp.name}</span>
                                    <span style={{ color: theme.palette.text.secondary }}>{emp.position}</span>
                                    <span>{emp.daysPresent} days</span>
                                    <span>{emp.avgHours}h</span>
                                    <span style={{ color: parseFloat(emp.overtime) > 0 ? "#FF9800" : "inherit" }}>
                                        {emp.overtime}h
                                    </span>
                                </Box>
                            ))
                        )}
                    </Box>
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
                        Monthly Earnings
                    </Typography>
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>Loading chart...</Box>
                    ) : earningsData.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                            No earnings data available
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={earningsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis 
                                    dataKey="month" 
                                    stroke={theme.palette.text.primary}
                                    fontSize={12}
                                />
                                <YAxis 
                                    stroke={theme.palette.text.primary}
                                    fontSize={12}
                                    tickFormatter={(value) => `₱${(value/1000).toFixed(0)}k`}
                                />
                                <Tooltip 
                                    formatter={(value) => [formatCurrency(value), "Earnings"]}
                                    contentStyle={{
                                        backgroundColor: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: "8px",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#4CAF50"
                                    strokeWidth={3}
                                    dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    
                    {/* Summary below chart */}
                    {earningsData.length > 0 && (
                        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                                Total (Last {earningsData.length} months)
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#4CAF50" }}>
                                {formatCurrency(earningsData.reduce((sum, item) => sum + item.earnings, 0))}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ManagerDashboard;