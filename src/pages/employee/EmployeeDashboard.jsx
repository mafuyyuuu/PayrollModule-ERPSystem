import {
    InputAdornment,
    IconButton,
    Box,
    Typography,
    TextField,
    Button,
    useTheme
} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useRef } from "react";
import { FaRegCalendar } from "react-icons/fa";

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
        <Box width="100%" height="100%">

            {/* TOP CARDS */}
            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                }}
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
                    showHideButton
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Salary Release"
                    value="₱19,500.00"
                    showHideButton
                />
            </Box>

            {/* MAIN CONTENT AREA */}
            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    md: "2fr 1fr",
                }}
                gap="20px"
                mt="25px"
                alignItems="stretch"
            >
                {/* EARNINGS CHART */}
                <Box
                    borderRadius="12px"
                    p="24px"
                    sx={{
                        backgroundColor:
                            theme.palette.mode === "dark"
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
                        height: { xs: "350px", sm: "380px", md: "100%" }
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
                        <i
                            className="ri-bar-chart-2-line"
                            style={{ fontSize: 18, marginRight: "10px" }}
                        ></i>
                        Total Earnings Overview
                    </Typography>

                    <ResponsiveContainer width="100%" height="80%">
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

                {/* APPLY FOR LEAVE */}
                <Box
                    sx={{
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        p: "24px",
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                        height: "fit-content"
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
                        <i
                            className="ri-calendar-2-line"
                            style={{ fontSize: 18, marginRight: "10px" }}
                        ></i>
                        Apply for Leave
                    </Typography>

                    <form
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {/* Leave Types */}
                        <Box display="flex" flexDirection="column" gap="10px">
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
                                        backgroundColor:
                                        theme.palette.background.default,
                                        borderRadius: "10px",
                                        p: "12px 16px",
                                        transition: "0.3s",
                                        "&:hover": {
                                            transform: "scale(1.02)",
                                            boxShadow:
                                                "0 4px 20px rgba(0,0,0,0.15)",
                                        },
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontFamily: "'TTHoves-Bold', sans-serif",
                                                fontSize: "15px",
                                            }}
                                        >
                                            {leave.type}
                                        </Typography>
                                        <Typography sx={{ fontSize: "13px" }}>
                                            {leave.remaining} leaves remaining
                                        </Typography>
                                    </Box>
                                    <input type="radio" name="leaveType" />
                                </Box>
                            ))}
                        </Box>

                        {/* Dates */}
                        <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            gap="20px"
                        >
                            {/* From */}
                            <Box display="flex" flexDirection="column" width="100%">
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        fontSize: "13px",
                                        mb: "3px",
                                        ml: "10px",
                                    }}
                                >
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
                                                    <FaRegCalendar style={{ fontSize: "18px" }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            height: "45px",
                                            borderRadius: "25px",
                                            backgroundColor: theme.palette.background.default,
                                            "& input::-webkit-calendar-picker-indicator": {
                                                display: "none",
                                            },
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                        },
                                    }}
                                />

                            </Box>

                            {/* To */}
                            <Box display="flex" flexDirection="column" width="100%">
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        fontSize: "13px",
                                        mb: "3px",
                                        ml: "10px",
                                    }}
                                >
                                    To
                                </Typography>

                                <TextField
                                    inputRef={toRef}
                                    type="date"
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={openToPicker}>
                                                    <FaRegCalendar style={{ fontSize: "18px" }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            height: "45px",
                                            borderRadius: "25px",
                                            backgroundColor:
                                            theme.palette.background.default,
                                            "& input::-webkit-calendar-picker-indicator": {
                                                display: "none",
                                            },
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Reason */}
                        <Box display="flex" flexDirection="column" width="100%">
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    fontSize: "13px",
                                    mb: "3px",
                                    ml: "10px",
                                }}
                            >
                                Reason
                            </Typography>

                            <TextField
                                placeholder="Type your reason..."
                                multiline
                                rows={2}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    borderRadius: "12px",
                                    backgroundColor:
                                    theme.palette.background.default,
                                    "& .MuiInputBase-input": {
                                        color: theme.palette.text.primary,
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                }}
                            />
                        </Box>

                        {/* Submit */}
                        <Button
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#172224",
                                color: "#fff",
                                padding: "10px 0",
                                borderRadius: "20px",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                "&:hover": {
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.1)"
                                            : "#1f2f31",
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
