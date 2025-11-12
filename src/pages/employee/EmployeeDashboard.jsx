import { Box, Typography, useTheme } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const earningsData = [
    { month: "Jan", earnings: 20000 },
    { month: "Feb", earnings: 23000 },
    { month: "Mar", earnings: 21000 },
    { month: "Apr", earnings: 26000 },
    { month: "May", earnings: 24000 },
];

const EmployeeDashboard = () => {
    const theme = useTheme();

    return (
        <Box width="100%" height="80%">
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="20px">
                <DashboardCard
                    icon="ri-group-line"
                    title="Upcoming Disbursement"
                    value="October 30, 2025"
                />
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="Pending Salary"
                    value="₱20,500.00"
                    showHideButton={true}
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Salary Release"
                    value="₱19,500.00"
                    showHideButton={true}
                />
            </Box>

            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
                gap="20px"
                mt="30px"
                alignItems="stretch"
                height="97.5%"
            >
                <Box
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "12px",
                        p: "24px",
                        color: theme.palette.text.primary,
                        fontFamily: theme.typography.fontFamily,
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
                            fontFamily: theme.typography.fontFamily,
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                        }}
                    >
                        <i
                            className="ri-bar-chart-2-line"
                            style={{
                                fontSize: 18,
                                color: theme.palette.text.primary,
                                marginRight: "10px",
                            }}
                        />
                        Total Earnings Overview
                    </Typography>

                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={earningsData}>
                            <Line
                                type="monotone"
                                dataKey="earnings"
                                stroke={theme.palette.success.main} // dynamic color
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 1 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>

                <Box
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "12px",
                        p: "24px",
                        color: theme.palette.text.primary,
                        fontFamily: theme.typography.fontFamily,
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
                            mb: 4,
                            fontFamily: theme.typography.fontFamily,
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                        }}
                    >
                        <i
                            className="ri-calendar-2-line"
                            style={{
                                fontSize: 18,
                                color: theme.palette.text.primary,
                                marginRight: "10px",
                            }}
                        />
                        Apply for Leave
                    </Typography>

                    <form style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <Box sx={{ position: "relative", width: "100%" }}>
                            <select
                                style={{
                                    appearance: "none",
                                    width: "100%",
                                    padding: "10px 40px 10px 12px",
                                    borderRadius: "15px",
                                    border: "none",
                                    backgroundColor: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                    fontFamily: theme.typography.fontFamily,
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    outline: "none",
                                }}
                            >
                                <option value="">Type of Leave</option>
                                <option value="sick">Sick Leave</option>
                                <option value="vacation">Vacation Leave</option>
                                <option value="emergency">Emergency Leave</option>
                            </select>
                            <i
                                className="ri-arrow-down-s-line"
                                style={{
                                    position: "absolute",
                                    right: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                    color: theme.palette.text.primary,
                                    fontSize: "18px",
                                }}
                            />
                        </Box>

                        <Box display="flex" gap="19px">
                            {[...Array(2)].map((_, i) => (
                                <input
                                    key={i}
                                    type="date"
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "15px",
                                        border: "none",
                                        backgroundColor: theme.palette.background.default,
                                        color: theme.palette.text.primary,
                                        fontFamily: theme.typography.fontFamily,
                                        fontSize: "14px",
                                        outline: "none",
                                    }}
                                />
                            ))}
                        </Box>

                        <textarea
                            placeholder="Type your reason..."
                            style={{
                                padding: "10px",
                                borderRadius: "15px",
                                border: "none",
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.text.primary,
                                minHeight: "110px",
                                fontFamily: theme.typography.fontFamily,
                                fontSize: "14px",
                                resize: "none",
                                overflowY: "auto",
                                outline: "none",
                            }}
                        />

                        <Box
                            component="button"
                            sx={{
                                mt: "16px",
                                fontSize: "16px",
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.text.secondary,
                                padding: "10px 0",
                                borderRadius: "20px",
                                fontFamily: theme.typography.fontFamily,
                                cursor: "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    backgroundColor: theme.palette.success.dark,
                                },
                            }}
                        >
                            Submit
                        </Box>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default EmployeeDashboard;