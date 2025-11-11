import { Box, Typography } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { LineChart, Line, ResponsiveContainer } from "recharts";

// Sample chart data (replace later with backend data)
const earningsData = [
    { month: "Jan", earnings: 20000 },
    { month: "Feb", earnings: 23000 },
    { month: "Mar", earnings: 21000 },
    { month: "Apr", earnings: 26000 },
    { month: "May", earnings: 24000 },
];

const EmployeeDashboard = () => {
    return (
        <Box
            width="100%"
            height="80%">
            <Box
                display="grid"
                gridTemplateColumns="repeat(3, 1fr)"
                gap="20px"
            >
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
                gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}                gap="20px"
                mt="30px"
                alignItems="stretch"
                height="97.5%"
            >
                <Box
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                    borderRadius="12px"
                    p="24px"
                    color="#222"
                    sx={{
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        }
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 2,
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            color: "#222",
                        }}
                    >
                        <i
                            className="ri-bar-chart-2-line"
                            style={{ fontSize: 18, color: "#222", marginRight: "10px" }}
                        ></i>
                        Total Earnings Overview
                    </Typography>

                    <ResponsiveContainer width="100%" height={250}>
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

                <Box
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                    borderRadius="12px"
                    p="24px"
                    color="#222"
                    sx={{
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        }
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 4,
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            color: "#222",
                        }}
                    >
                        <i
                            className="ri-calendar-2-line"
                            style={{ fontSize: 18, color: "#222", marginRight: "10px" }}
                        ></i>
                        Apply for Leave
                    </Typography>

                    <form
                        className="leave-form"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px",
                        }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                            }}
                        >
                            <select
                                style={{
                                    appearance: "none",
                                    WebkitAppearance: "none",
                                    MozAppearance: "none",
                                    width: "100%",
                                    padding: "10px 40px 10px 12px",
                                    borderRadius: "15px",
                                    border: "none",
                                    backgroundColor: "#bdbdbd",
                                    color: "#222",
                                    fontFamily: "inherit",
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
                                    color: "#222",
                                    fontSize: "18px",
                                }}
                            ></i>
                        </Box>

                        <Box display="flex" gap="19px">
                            <input
                                type="date"
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "15px",
                                    border: "none",
                                    backgroundColor: "#bdbdbd",
                                    color: "#222",
                                    fontFamily: "'TTHoves-Medium', sans-serif'",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                            />
                            <input
                                type="date"
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "15px",
                                    border: "none",
                                    backgroundColor: "#bdbdbd",
                                    color: "#222",
                                    fontFamily: "'TTHoves-Medium', sans-serif'",
                                    fontSize: "14px",
                                    outline: "none",
                                }}
                            />
                        </Box>

                        <textarea
                            placeholder="Type your reason..."
                            style={{
                                padding: "10px",
                                borderRadius: "15px",
                                border: "none",
                                backgroundColor: "#fff",
                                color: "#222",
                                minHeight: "110px",
                                fontFamily: "'TTHoves-Medium', sans-serif",
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
                                backgroundColor: "#172224",
                                color: "#fff",
                                padding: "10px 0",
                                borderRadius: "20px",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                cursor: "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    backgroundColor: "#1f2f31",
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