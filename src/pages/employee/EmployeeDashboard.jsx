import {Box, Typography, TextField, useTheme} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import {useState} from "react";

const earningsData = [
    { month: "Jan", earnings: 20000 },
    { month: "Feb", earnings: 23000 },
    { month: "Mar", earnings: 21000 },
    { month: "Apr", earnings: 26000 },
    { month: "May", earnings: 24000 },
];

const EmployeeDashboard = () => {
    const theme = useTheme();

    const [selectedLeave, setSelectedLeave] = useState("");

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
                mt="25px"
                alignItems="stretch"
                height="97.5%"
            >
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
                            className="ri-bar-chart-2-line"
                            style={{ fontSize: 18, marginRight: "10px", color: theme.palette.text.primary }}
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
                            className="ri-calendar-2-line"
                            style={{ fontSize: 18, color: theme.palette.text.primary, marginRight: "10px" }}
                        ></i>
                        Apply for Leave
                    </Typography>

                    <form
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        {[
                            { type: "Sick Leave", remaining: 6 },
                            { type: "Vacation Leave", remaining: 5 },
                            { type: "Emergency Leave", remaining: 3 },
                        ].map((leave, index) => (
                            <Box
                                key={index}
                                onClick={() => setSelectedLeave(leave.type)}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    backgroundColor: theme.palette.background.default,
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
                                            fontFamily: "'TTHoves-Bold', sans-serif",
                                            color: theme.palette.text.primary,
                                            fontSize: "15px",
                                        }}
                                    >
                                        {leave.type}
                                    </Typography>
                                    <Typography sx={{ fontSize: "13px", color: theme.palette.text.primary }}>
                                        {leave.remaining} leaves remaining
                                    </Typography>
                                </Box>
                                <input
                                    type="radio"
                                    name="leaveType"
                                    value={leave.type}
                                    checked={selectedLeave === leave.type}
                                    onChange={() => setSelectedLeave(leave.type)}
                                />
                            </Box>
                        ))}

                        <Box
                            display="flex"
                            justifyContent="space-between"
                            gap="25px"
                        >
                            <Box
                                display = "flex" flexDirection = "column" width= "100%">
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: theme.palette.text.primary,
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
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "25px",
                                            backgroundColor: theme.palette.background.default,
                                            color: theme.palette.text.primary,
                                            fontSize: "18px",
                                        },
                                        "& fieldset": {
                                            border: "none",
                                        },
                                        "&:hover fieldset": {
                                            border: "none",
                                        },
                                        "&.Mui-focused fieldset": {
                                            border: "none",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontSize: "18px",
                                            color: theme.palette.text.primary,
                                            border: "none",
                                        },
                                    }}
                                />
                            </Box>

                            <Box
                                display = "flex" flexDirection = "column" width= "100%">
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: theme.palette.text.primary,
                                        fontSize: "13px",
                                        marginLeft: "10px",
                                        mb: "3px"
                                    }}>
                                    To
                                </Typography>

                                <TextField
                                    type="date"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "25px",
                                            backgroundColor: theme.palette.background.default,
                                            color: theme.palette.text.primary,
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        },
                                        "& .MuiInputBase-input": {
                                            fontSize: "18px",
                                            color: theme.palette.text.primary,
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box
                            display = "flex" flexDirection = "column" width= "100%">
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: theme.palette.text.primary,
                                    fontSize: "13px",
                                    marginLeft: "10px",
                                    mb: "3px"
                                }}>
                                Reason
                            </Typography>
                            <TextField
                                placeholder="Type your reason..."
                                multiline
                                fullWidth
                                variant="outlined"
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    borderRadius: "12px",
                                    backgroundColor: theme.palette.background.default,
                                    "& .MuiInputBase-root": {
                                        minHeight: "100px",
                                        alignItems: "flex-start",
                                        paddingTop: "12px",
                                    },
                                    "& .MuiInputBase-input": {
                                        color: theme.palette.text.primary,
                                    },
                                    "& fieldset": {
                                        border: "none",
                                    },
                                    "&:hover fieldset": {
                                        border: "none",
                                    },
                                    "&.Mui-focused fieldset": {
                                        border: "none",
                                    },
                                }}
                            />
                        </Box>

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
