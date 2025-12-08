/* eslint-disable no-unused-vars */
import {Box, Typography, useTheme, ToggleButtonGroup, ToggleButton, Chip} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/UserContext.jsx";

const PayrollDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useUser();
    const [timeRange, setTimeRange] = useState("90d");

    // State for dashboard data from database
    const [dashboardData, setDashboardData] = useState({
        totalEmployees: 0,
        processedPayouts: 0,
        pendingPayouts: 0,
        upcomingSchedule: "Loading..."
    });
    const [timelineData, setTimelineData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all dashboard data from database
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch dashboard stats
                const statsResponse = await fetch('http://localhost:8080/api/payroll/dashboard-stats');
                if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    const formattedSchedule = stats.upcomingSchedule
                        ? new Date(stats.upcomingSchedule).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                        })
                        : "No upcoming schedule";
                    
                    setDashboardData({
                        totalEmployees: stats.totalEmployees ?? 0,
                        processedPayouts: stats.processedPayouts ?? 0,
                        pendingPayouts: stats.pendingPayouts ?? 0,
                        upcomingSchedule: formattedSchedule
                    });
                }

                // Fetch timeline data
                const timelineResponse = await fetch(`http://localhost:8080/api/payroll/timeline?days=90`);
                if (timelineResponse.ok) {
                    const timeline = await timelineResponse.json();
                    setTimelineData(timeline);
                }

                // Fetch recent activity (filtered by current user)
                const payrollUserId = user?.employeeId || user?.employee_id;
                const activityUrl = payrollUserId 
                    ? `http://localhost:8080/api/payroll/recent-activity?userId=${payrollUserId}`
                    : 'http://localhost:8080/api/payroll/recent-activity';
                const activityResponse = await fetch(activityUrl);
                if (activityResponse.ok) {
                    const activity = await activityResponse.json();
                    setRecentActivity(activity);
                }

                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching dashboard data:', err);
                setError(err.message);
                setLoading(false);
                
                // Use fallback data if API fails
                setDashboardData({
                    totalEmployees: 0,
                    processedPayouts: 0,
                    pendingPayouts: 0,
                    upcomingSchedule: "No upcoming schedule"
                });
            }
        };

        fetchAllData();
    }, []);

    // Filter timeline data based on selected time range
    const getFilteredData = () => {
        if (!timelineData || timelineData.length === 0) return [];
        
        const now = new Date();
        let daysToSubtract = 90;
        if (timeRange === "30d") daysToSubtract = 30;
        else if (timeRange === "7d") daysToSubtract = 7;
        
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        
        return timelineData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate;
        });
    };

    const filteredData = getFilteredData();

    const handleTimeRangeChange = (event, newValue) => {
        if (newValue !== null) {
            setTimeRange(newValue);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: "8px",
                        p: 1.5,
                        boxShadow: theme.shadows[4],
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: ₱{parseFloat(entry.value).toLocaleString()}
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case "Approved":
            case "Released":
            case "Completed":
                return "success";
            case "Pending":
            case "Processing":
                return "warning";
            case "Rejected":
                return "error";
            default:
                return "default";
        }
    };

    return (
        <Box width="100%" height="100%">
            {/* Dashboard Cards */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="20px"
                marginBottom="20px"
            >
                <DashboardCard
                    icon="ri-group-line"
                    title="Total Employees"
                    value={loading ? "..." : dashboardData.totalEmployees}
                    onClick={() => navigate('/payroll/employee')}
                />
                <DashboardCard
                    icon="ri-check-double-line"
                    title="Processed Payouts"
                    value={loading ? "..." : dashboardData.processedPayouts}
                    onClick={() => navigate('/payroll/reports')}
                />
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="Pending Items"
                    value={loading ? "..." : dashboardData.pendingPayouts}
                    onClick={() => navigate('/payroll/pending')}
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Upcoming Schedule"
                    value={loading ? "Loading..." : dashboardData.upcomingSchedule}
                    onClick={() => navigate('/payroll/payroll')}
                />
            </Box>

            {/* Main Content Grid */}
            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
                gap="20px"
                height="calc(100% - 140px)"
                overflow="hidden"
            >
                {/* PAYOUT SCHEDULE TIMELINE */}
                <Box
                    sx={{
                        backgroundColor: theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        p: "24px",
                        color: theme.palette.text.primary,
                        backdropFilter: "blur(12px)",
                        fontFamily: theme.typography.fontFamily,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 1,
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        <i className="ri-line-chart-line" style={{ fontSize: 18, marginRight: "10px" }}></i>
                        Payroll Timeline
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        Total net pay and deductions by pay date (all employees combined)
                    </Typography>

                    {/* Time Range Toggle */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                        <ToggleButtonGroup
                            value={timeRange}
                            exclusive
                            onChange={handleTimeRangeChange}
                            size="small"
                            sx={{
                                '& .MuiToggleButton-root': {
                                    px: 2,
                                    py: 0.5,
                                    fontSize: '12px',
                                    textTransform: 'none',
                                    borderColor: theme.palette.divider,
                                    color: theme.palette.text.primary,
                                    '&.Mui-selected': {
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.dark,
                                        },
                                    },
                                },
                            }}
                        >
                            <ToggleButton value="90d">3 Months</ToggleButton>
                            <ToggleButton value="30d">30 Days</ToggleButton>
                            <ToggleButton value="7d">7 Days</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Area Chart */}
                    <Box sx={{ width: '100%', flex: 1, minHeight: 0 }}>
                        {filteredData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="fillPayouts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="fillDeductions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                        }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                        tickFormatter={(value) => `₱${(value/1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area
                                        dataKey="payouts"
                                        name="Net Pay"
                                        type="monotone"
                                        fill="url(#fillPayouts)"
                                        stroke={theme.palette.primary.main}
                                        strokeWidth={2}
                                    />
                                    <Area
                                        dataKey="deductions"
                                        name="Deductions"
                                        type="monotone"
                                        fill="url(#fillDeductions)"
                                        stroke={theme.palette.error.main}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {loading ? "Loading timeline data..." : "No payroll data available for this period"}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* RECENT ACTIVITY */}
                <Box
                    sx={{
                        backgroundColor: theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        p: "24px",
                        color: theme.palette.text.primary,
                        backdropFilter: "blur(12px)",
                        fontFamily: theme.typography.fontFamily,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 2,
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        <i className="ri-history-line" style={{ fontSize: 18, marginRight: "10px" }}></i>
                        Recent Activity
                    </Typography>

                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            overflowX: "hidden",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}
                    >
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 2,
                                        mb: 1.5,
                                        backgroundColor: theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.03)"
                                            : "rgba(255, 255, 255, 0.5)",
                                        borderRadius: "8px",
                                        border: `1px solid ${theme.palette.divider}`,
                                        transition: "all 0.2s ease",
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.08)"
                                                : "rgba(255, 255, 255, 0.8)",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        },
                                    }}
                                    onClick={() => {
                                        if (activity.type === "request") {
                                            navigate('/payroll/pending');
                                        } else {
                                            navigate('/payroll/payroll');
                                        }
                                    }}
                                >
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                                fontSize: "14px",
                                            }}
                                        >
                                            {activity.title}
                                        </Typography>
                                        <Chip
                                            label={activity.status}
                                            size="small"
                                            color={getStatusColor(activity.status)}
                                            sx={{ height: 20, fontSize: "10px" }}
                                        />
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: theme.palette.text.primary,
                                            fontSize: "13px",
                                        }}
                                    >
                                        {activity.description}
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: theme.palette.text.primary,
                                                fontSize: "11px",
                                            }}
                                        >
                                            {activity.processedAt || new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Typography>
                                        {activity.processedBy && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: theme.palette.text.primary,
                                                    fontSize: "10px",
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                by {activity.processedBy}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {loading ? "Loading..." : "No recent activity"}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Quick Actions */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                fontSize: "14px",
                                mb: 1,
                            }}
                        >
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Chip
                                label="Process Payroll"
                                onClick={() => navigate('/payroll/payroll')}
                                sx={{ cursor: "pointer" }}
                                icon={<i className="ri-money-dollar-circle-line" style={{ fontSize: 14 }}></i>}
                            />
                            <Chip
                                label="View Requests"
                                onClick={() => navigate('/payroll/pending')}
                                sx={{ cursor: "pointer" }}
                                icon={<i className="ri-file-list-line" style={{ fontSize: 14 }}></i>}
                            />
                            <Chip
                                label="Reports"
                                onClick={() => navigate('/payroll/reports')}
                                sx={{ cursor: "pointer" }}
                                icon={<i className="ri-bar-chart-line" style={{ fontSize: 14 }}></i>}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default PayrollDashboard;