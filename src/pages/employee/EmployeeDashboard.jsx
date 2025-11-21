import {InputAdornment, IconButton, Box, Typography, TextField, Button, useTheme} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useRef } from "react";
import { FaRegCalendar } from "react-icons/fa";

// Sample chart data (replace later with backend data)
const earningsData = [
    { month: "Jan", earnings: 20000 },
    { month: "Feb", earnings: 23000 },
    { month: "Mar", earnings: 21000 },
    { month: "Apr", earnings: 26000 },
    { month: "May", earnings: 24000 },
];

const EmployeeDashboard = () => {
    const theme = useTheme();
    const fromRef = useRef(null);
    const toRef = useRef(null);

    const openFromPicker = () => fromRef.current?.showPicker();
    const openToPicker = () => toRef.current?.showPicker();

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
                {/* --- EARNINGS CHART --- */}
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

                {/* --- APPLY FOR LEAVE --- */}
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
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
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
                            mb: 3,
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
                                    <input type="radio" name="leaveType" />
                                </Box>
                            ))}
                        </Box>

                        {/* Date Pickers */}
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
                                    inputRef={fromRef}
                                    type="date"
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={openFromPicker}>
                                                    <FaRegCalendar style={{ fontSize: "18px", color: theme.palette.text.primary }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            height: "45px",
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            color: theme.palette.text.primary,
                                            borderRadius: "25px",
                                            backgroundColor: theme.palette.background.default,

                                            "& input::-webkit-calendar-picker-indicator": {
                                                opacity: 0,
                                                display: "none",
                                            },
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
                                    inputRef={toRef}
                                    type="date"
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={openToPicker}>
                                                    <FaRegCalendar style={{ fontSize: "18px", color: theme.palette.text.primary }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            height: "45px",
                                            width: "100%",
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            color: theme.palette.text.primary,
                                            borderRadius: "25px",
                                            backgroundColor: theme.palette.background.default,

                                            "& input::-webkit-calendar-picker-indicator": {
                                                opacity: 0,
                                                display: "none",
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Reason Field */}
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
                            rows={2}
                            fullWidth
                            variant="outlined"
                            sx={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                borderRadius: "12px",
                                backgroundColor: theme.palette.background.default,

                                // Text color
                                "& .MuiInputBase-input": {
                                    color: theme.palette.text.primary,
                                },


                                // Remove outline on hover and focus
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                },
                            }}
                        />
                        </Box>    

                        {/* Submit Button */}
                        <Button
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
                        </Button>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default EmployeeDashboard;
