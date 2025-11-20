import {Box, useTheme} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import {BarChart3} from "lucide-react";

const AdminDashboard = () => {
    const theme = useTheme();

    const notifications = [{
        title: "Payroll Updated", message: "The payroll for October 2025 has been successfully processed."
    }, {
        title: "System Maintenance",
        message: "Scheduled maintenance will occur on November 15, 2025, from 12 AM to 2 AM."
    }, {
        title: "New Employee Added", message: "A new employee has been successfully added to the HR database."
    }, {title: "Policy Reminder", message: "Please review the updated attendance policy by November 20, 2025."},];

    return (<Box width="100%" height="80%">
        <Box
            display="grid"
            gridTemplateColumns="repeat(4, 1fr)"
            gap="20px"
            marginBottom="30px"
        >
            <DashboardCard
                icon="ri-group-line"
                title="Total Employees"
                value="55"
            />
            <DashboardCard
                icon="ri-refund-2-line"
                title="Processed Payouts"
                value="₱120,000.00"
                showHideButton={true}
            />
            <DashboardCard
                icon="ri-timer-line"
                title="Pending Payouts"
                value="₱30,000.00"
                showHideButton={true}
            />
            <DashboardCard
                icon="ri-calendar-schedule-line"
                title="Upcoming Schedules"
                value="October 31, 2025"
            />
        </Box>

        <Box
            sx={{
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                p: "24px",
                color: theme.palette.text.primary,
                height: "97.5%",
                backdropFilter: "blur(12px)",
                fontFamily: theme.typography.fontFamily,
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
                gap: "10px",
            }}
        >
            <Box
                sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px",
                }}
            >
                <Box
                    className="notif-title"
                    sx={{display: "flex", alignItems: "center", gap: "8px"}}
                >
                    <BarChart3 size={20} color={theme.palette.text.primary}/>
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
                    maxHeight: "90%",
                    overflowY: "auto",
                    pr: "8px",
                    display: "flex",
                    flexDirection: "column",
                    mt: "5px",
                    gap: "10px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": {
                        width: 0, height: 0,
                    },
                }}
            >
                {notifications.map((notif, index) => (<Box
                    key={index}
                    sx={{
                        display: "grid",
                        width: "100%",
                        gridTemplateColumns: "1fr",
                        alignItems: "start",
                        justifyItems: "start",
                        bgcolor: "#fff",
                        padding: "6px",
                        backdropFilter: "blur(12px)",
                        borderRadius: "10px",
                        marginTop: "16px",
                        transition: "all 0.3s ease",
                        border: `1px solid ${theme.palette.divider}`,
                        "&:hover": {
                            transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        },
                    }}
                >
                    <Box
                        sx={{
                            "& h3": {
                                paddingLeft: "16px",
                                fontSize: "20px",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                color: "#1b2223",
                                marginTop: "15px",
                                marginBottom: "1px",
                            }, "& p": {
                                paddingLeft: "16px", marginTop: "5px", fontSize: "18px", lineHeight: 1.4, color: "#333",
                            }
                        }}
                    >
                        <h3>{notif.title}</h3>
                        <p>{notif.message}</p>
                    </Box>
                </Box>))}
            </Box>
        </Box>
    </Box>);
};

export default AdminDashboard;
