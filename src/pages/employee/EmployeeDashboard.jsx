import {
    InputAdornment,
    IconButton,
    Box,
    Typography,
    TextField,
    Button,
    useTheme,
    CircularProgress
} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useRef, useState, useEffect } from "react";
import { FaRegCalendar } from "react-icons/fa";
import { useUser } from "../../components/UserContext.jsx";

const earningsData = [
    { month: "Jan", earnings: 20000 },
    { month: "Feb", earnings: 23000 },
    { month: "Mar", earnings: 21000 },
    { month: "Apr", earnings: 26000 },
    { month: "May", earnings: 24000 },
];

const EmployeeDashboard = () => {
    const theme = useTheme();
    const { user } = useUser();
    const fromRef = useRef(null);
    const toRef = useRef(null);

    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        upcomingDisbursement: null,
        pendingSalary: null,
        SalaryRelease: null
    });
    const [dashboardLoading, setDashboardLoading] = useState(true);

    // State for leave data
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch leave balances on component mount
    useEffect(() => {
        fetchDashboardData();
        fetchLeaveBalances();
    }, [user?.employeeId]);

    // Fetch dashboard card data
    const fetchDashboardData = async () => {
        if (!user?. employeeId) {
            setDashboardLoading(false);
            return;
        }

        try {
            // ✅ Updated URL to match employeeRoutes.js
            const response = await fetch(
                `http://localhost:8080/api/employee/dashboard/${user.employeeId}`
            );
            if (response.ok) {
                const data = await response. json();
                setDashboardData({
                    upcomingDisbursement: data.latestPayslip?.pay_date || null,
                    pendingSalary: data. latestPayslip?.net_pay || null,
                    SalaryRelease: data.latestPayslip?.net_pay || null
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setDashboardLoading(false);
        }
    };

    // ✅ Updated URL to match employeeRoutes.js
    const fetchLeaveBalances = async () => {
        console.log('🔍 User object:', user);  // Debug log
        console.log('🔍 Employee ID:', user?. employeeId);  // Debug log

        if (!user?. employeeId) {
            console.log('❌ No employeeId found! ');  // Debug log
            setLoading(false);
            return;
        }

        try {
            const url = `http://localhost:8080/api/employee/leave-balances/${user.employeeId}`;
            console.log('🔍 Fetching from:', url);  // Debug log

            const response = await fetch(url);
            console.log('🔍 Response status:', response.status);  // Debug log

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Leave balances data:', data);  // Debug log
                setLeaveBalances(data);
            } else {
                console.log('❌ Response not OK:', await response.text());
            }
        } catch (error) {
            console.error('❌ Error fetching leave balances:', error);
        } finally {
            setLoading(false);
        }
    };

    const openFromPicker = () => fromRef.current?. showPicker();
    const openToPicker = () => toRef.current?. showPicker();

    // Format currency
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "—";
        return `₱${Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // ✅ Calculate days between dates
    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math. abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Handle leave submission
    const handleSubmitLeave = async (e) => {
        e.preventDefault();

        if (!selectedLeaveType) {
            setMessage({ text: 'Please select a leave type', type: 'error' });
            return;
        }
        if (!fromDate || ! toDate) {
            setMessage({ text: 'Please select dates', type: 'error' });
            return;
        }
        if (new Date(fromDate) > new Date(toDate)) {
            setMessage({ text: 'End date must be after start date', type: 'error' });
            return;
        }

        setSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            // ✅ Updated URL to match employeeRoutes.js
            const response = await fetch('http://localhost:8080/api/employee/leave-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: user.employeeId,
                    leave_type_id: selectedLeaveType,
                    start_date: fromDate,
                    end_date: toDate,
                    total_days: calculateDays(fromDate, toDate),
                    reason: reason
                })
            });

            const data = await response. json();

            if (response.ok) {
                setMessage({ text: 'Leave request submitted successfully! ', type: 'success' });
                // Reset form
                setSelectedLeaveType(null);
                setFromDate('');
                setToDate('');
                setReason('');
                // Refresh leave balances
                fetchLeaveBalances();
            } else {
                setMessage({ text: data.error || 'Failed to submit leave request', type: 'error' });
            }
        } catch (error) {
            console.error('Error submitting leave:', error);
            setMessage({ text: 'Error connecting to server', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

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
                {dashboardLoading ? (

                    <>
                        {[1, 2, 3]. map((i) => (
                            <Box key={i} display="flex" justifyContent="center" alignItems="center" height="120px">
                                <CircularProgress size={24} />
                            </Box>
                        ))}
                    </>
                ) : (
                    <>
                        <DashboardCard
                            icon="ri-group-line"
                            title="Upcoming Disbursement"
                            value={formatDate(dashboardData. upcomingDisbursement)}
                        />
                        <DashboardCard
                            icon="ri-hand-coin-line"
                            title="Pending Salary"
                            value={formatCurrency(dashboardData.pendingSalary)}
                            showHideButton
                        />
                        <DashboardCard
                            icon="ri-timer-line"
                            title="Salary Release"
                            value={formatCurrency(dashboardData.SalaryRelease)}
                            showHideButton
                        />
                    </>
                )}
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
                            theme. palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0. 05)"
                                : "rgba(255, 255, 255, 0. 2)",
                        fontFamily: theme.typography.fontFamily,
                        color: theme.palette. text.primary,
                        border: `1px solid ${theme.palette. divider}`,
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
                        border: `1px solid ${theme.palette. divider}`,
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

                    {/* Status Message */}
                    {message.text && (
                        <Typography
                            sx={{
                                mb: 2,
                                p: "10px",
                                borderRadius: "8px",
                                backgroundColor: message.type === 'success'
                                    ?  'rgba(76, 175, 80, 0. 1)'
                                    : 'rgba(244, 67, 54, 0.1)',
                                color: message.type === 'success' ?  '#4caf50' : '#f44336',
                                fontSize: '14px',
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                            }}
                        >
                            {message.text}
                        </Typography>
                    )}

                    <form
                        onSubmit={handleSubmitLeave}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {/* Leave Types - FROM DATABASE */}
                        <Box display="flex" flexDirection="column" gap="10px">
                            {loading ?  (
                                <Box display="flex" justifyContent="center" p={2}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : leaveBalances.length > 0 ?  (
                                leaveBalances.map((leave) => (
                                    <Box
                                        key={leave.leave_type_id}
                                        onClick={() => setSelectedLeaveType(leave. leave_type_id)}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            backgroundColor:
                                                selectedLeaveType === leave.leave_type_id
                                                    ? theme.palette.mode === "dark"
                                                        ?  "rgba(58, 79, 80, 0.5)"
                                                        : "rgba(58, 79, 80, 0.15)"
                                                    : theme.palette.background.default,
                                            borderRadius: "10px",
                                            p: "12px 16px",
                                            cursor: "pointer",
                                            transition: "0.3s",
                                            border: selectedLeaveType === leave.leave_type_id
                                                ? "2px solid #3A4F50"
                                                : "2px solid transparent",
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
                                                    fontSize: "15px",
                                                }}
                                            >
                                                {leave.leave_type_name}
                                            </Typography>
                                            <Typography sx={{ fontSize: "13px" }}>
                                                {leave.remaining_days} leaves remaining
                                            </Typography>
                                        </Box>
                                        <input
                                            type="radio"
                                            name="leaveType"
                                            checked={selectedLeaveType === leave.leave_type_id}
                                            onChange={() => setSelectedLeaveType(leave.leave_type_id)}
                                        />
                                    </Box>
                                ))
                            ) : (
                                <Typography sx={{ fontSize: "14px", color: "gray", textAlign: "center", p: 2 }}>
                                    No leave balances found.  Please contact HR.
                                </Typography>
                            )}
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
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
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
                                            "&. Mui-focused . MuiOutlinedInput-notchedOutline": {
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
                                    value={toDate}
                                    onChange={(e) => setToDate(e. target.value)}
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
                                            backgroundColor: theme.palette. background.default,
                                            "& input::-webkit-calendar-picker-indicator": {
                                                display: "none",
                                            },
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&:hover . MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&. Mui-focused . MuiOutlinedInput-notchedOutline": {
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
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    borderRadius: "12px",
                                    backgroundColor: theme.palette. background.default,
                                    "& .MuiInputBase-input": {
                                        color: theme.palette. text.primary,
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                }}
                            />
                        </Box>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={submitting || loading}
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
                                "&:disabled": {
                                    backgroundColor: "#ccc",
                                    color: "#666"
                                }
                            }}
                        >
                            {submitting ?  'Submitting.. .' : 'Submit'}
                        </Button>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default EmployeeDashboard;