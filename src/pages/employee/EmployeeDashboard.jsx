import { Box, Typography, TextField } from "@mui/material";
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
        <Box width="100%" height="80%">
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
                gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
                gap="20px"
                mt="30px"
                alignItems="stretch"
                height="97.5%"
            >
                {/* --- EARNINGS CHART --- */}
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
                        },
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

                {/* --- APPLY FOR LEAVE --- */}
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
                        },
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 3,
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
                        {/* Leave Type Options */}
                        <Box
                            sx={{
                                display: "flex",
                                backgroundColor: "#BDBDBD",
                                flexDirection: "column",
                                padding: "20px 18px",
                                gap: "10px",
                                borderRadius: "15px",
                            }}
                        >
                            {[
                                { type: "Sick Leave", remaining: 6 },
                                { type: "Vacation Leave", remaining: 5 },
                                { type: "Emergency Leave", remaining: 3 },
                            ].map((leave, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        backgroundColor: "rgba(245, 245, 245, 0.7)",
                                        borderRadius: "10px",
                                        padding: "12px 16px",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "scale(1.02)",
                                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                        },
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                                color: "#222",
                                                fontSize: "15px",
                                            }}
                                        >
                                            {leave.type}
                                        </Typography>
                                        <Typography sx={{ fontSize: "13px", color: "#172224" }}>
                                            {leave.remaining} leaves remaining
                                        </Typography>
                                    </Box>
                                    <input type="radio" name="leaveType" />
                                </Box>
                            ))}
                        </Box>

                        {/* Date Pickers */}
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            gap="25px"
                            mb={1}
                        >
                            <Box
                                display = "flex" flexDirection = "column" width= "100%">
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#222",
                                    fontSize: "13px",
                                    marginLeft: "10px",
                                    mb: "3px"
                                }}>
                                From
                            </Typography>
                            <TextField
                                type="date"
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        height: "50px",
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: "#222",
                                        borderRadius: "25px",
                                        backgroundColor: "#BDBDBD",
                                    },
                                }}
                            />
                            </Box>

                            <Box
                                display = "flex" flexDirection = "column" width= "100%">
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: "#222",
                                        fontSize: "13px",
                                        marginLeft: "10px",
                                        mb: "3px"
                                    }}>
                                    To
                                </Typography>
                                <TextField
                                    type="date"
                                    variant="outlined"
                                    InputProps={{
                                        sx: {
                                            height: "50px",
                                            width: "100%",
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            color: "#222",
                                            borderRadius: "25px",
                                            backgroundColor: "#BDBDBD",
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Reason Field */}
                        <TextField
                            placeholder="Type your reason..."
                            multiline
                            rows={2}
                            fullWidth
                            variant="outlined"
                            sx={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                borderRadius: "12px",
                                backgroundColor: "#f7f7f7",
                            }}
                        />

                        {/* Submit Button */}
                        <Box
                            component="button"
                            sx={{
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
