import { Box, useTheme, CircularProgress } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        processedPayouts: 0,
        pendingPayouts: 0,
        upcomingSchedule: null
    });
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch dashboard stats
                const statsResponse = await fetch('http://localhost:8080/api/admin/dashboard-stats');
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                // Fetch recent activity (limit to 5 for dashboard)
                const notifResponse = await fetch('http://localhost:8080/api/admin/notifications?limit=5');
                if (notifResponse.ok) {
                    const notifData = await notifResponse.json();
                    setNotifications(notifData.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return `₱${Number(value || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No upcoming schedule";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

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
                <DashboardCard 
                    icon="ri-group-line" 
                    title="Total Employees" 
                    value={loading ? "..." : stats.totalEmployees.toString()} 
                />
                <DashboardCard
                    icon="ri-refund-2-line"
                    title="Processed Payouts"
                    value={loading ? "..." : formatCurrency(stats.processedPayouts)}
                    showHideButton
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Pending Payouts"
                    value={loading ? "..." : formatCurrency(stats.pendingPayouts)}
                    showHideButton
                />
                <DashboardCard
                    icon="ri-calendar-schedule-line"
                    title="Upcoming Schedules"
                    value={loading ? "..." : formatDate(stats.upcomingSchedule)}
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
                    display: "flex",
                    flexDirection: "column",
                    height: "60%",
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
                            Recent Activity
                        </span>
                    </Box>
                    <button
                        onClick={() => navigate('/admin/audit')}
                        style={{
                            background: "transparent",
                            color: theme.palette.text.primary,
                            padding: "6px 14px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            fontSize: "16px",
                            textDecoration: "none",
                        }}
                    >
                        View All
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
                        "&::-webkit-scrollbar": { display: "none" },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {notifications.length === 0 ? (
                        <Box sx={{ 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center", 
                            flex: 1,
                            color: theme.palette.text.secondary 
                        }}>
                            No recent activity
                        </Box>
                    ) : (
                        notifications.map((notif, index) => (
                            <Box
                                key={notif.id || index}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    bgcolor: "#fff",
                                    color: "#1b2223",
                                    p: 2,
                                    borderRadius: "10px",
                                    border: `1px solid ${theme.palette.divider}`,
                                    backdropFilter: "blur(12px)",
                                    transition: "all 0.3s ease",
                                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <h3
                                        style={{
                                            fontSize: "16px",
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            color: "#1b2223",
                                            margin: "0 0 5px 0",
                                            paddingLeft: "8px",
                                        }}
                                    >
                                        {notif.title}
                                    </h3>
                                    {notif.date && (
                                        <span style={{ 
                                            fontSize: "12px",
                                            color: "#1b2223",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {new Date(notif.date).toLocaleString()}
                                        </span>
                                    )}
                                </Box>
                                <p
                                    style={{
                                        fontSize: "14px",
                                        lineHeight: 1.4,
                                        color: "#1b2223",
                                        margin: 0,
                                        paddingLeft: "8px",
                                    }}
                                >
                                    {notif.message}
                                </p>
                                {notif.user && (
                                    <span style={{ 
                                        fontSize: "12px",
                                        color: "#1b2223",
                                        paddingLeft: "8px",
                                        marginTop: "4px"
                                    }}>
                                        By: {notif.user}
                                    </span>
                                )}
                            </Box>
                        ))
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
