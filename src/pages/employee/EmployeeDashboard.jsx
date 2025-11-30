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
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useRef, useState, useEffect } from "react";
import { FaRegCalendar, FaClock } from "react-icons/fa";
import { useUser } from "../../components/UserContext.jsx";

const EmployeeDashboard = () => {
    const theme = useTheme();
    const { user } = useUser();
    const fromRef = useRef(null);
    const toRef = useRef(null);
    const overtimeDateRef = useRef(null);

    // Get employee ID from either property name (supports both login methods)
    const employeeId = user?.employee_id || user?.employeeId;

    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        upcomingDisbursement: null,
        pendingSalary: null,
        SalaryRelease: null
    });
    const [dashboardLoading, setDashboardLoading] = useState(true);

    // State for earnings chart
    const [earningsData, setEarningsData] = useState([]);
    const [earningsLoading, setEarningsLoading] = useState(true);

    // State for leave data
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // ✅ Tab state for Leave/Overtime
    const [requestTab, setRequestTab] = useState("leave"); // "leave" or "overtime"

    // ✅ Overtime form state
    const [overtimeData, setOvertimeData] = useState({
        date: "",
        startTime: "",
        endTime: "",
        hours: "",
        reason: "",
    });
    const [overtimeSubmitting, setOvertimeSubmitting] = useState(false);
    const [overtimeMessage, setOvertimeMessage] = useState({ text: '', type: '' });

    // Fetch data on component mount
    useEffect(() => {
        if (employeeId) {
            console.log('👤 Current user:', user);
            console.log('📍 Using employee ID:', employeeId);
            fetchDashboardData();
            fetchLeaveBalances();
            fetchEarningsData();
        } else {
            console.log('❌ No employee ID found in user:', user);
            setDashboardLoading(false);
            setLoading(false);
            setEarningsLoading(false);
        }
    }, [employeeId]);

    // Fetch dashboard card data
    const fetchDashboardData = async () => {
        if (!employeeId) {
            setDashboardLoading(false);
            return;
        }

        try {
            console.log('🔄 Fetching dashboard data for employee:', employeeId);
            const response = await fetch(
                `http://localhost:8080/api/employee/dashboard/${employeeId}`
            );
            if (response.ok) {
                const data = await response.json();
                setDashboardData({
                    upcomingDisbursement: data.latestPayslip?.pay_date || null,
                    pendingSalary: data.latestPayslip?.net_pay || null,
                    SalaryRelease: data.latestPayslip?.net_pay || null
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setDashboardLoading(false);
        }
    };

    // Fetch earnings overview data
    const fetchEarningsData = async () => {
        if (!employeeId) {
            console.log('❌ No employee ID found for earnings data');
            setEarningsLoading(false);
            return;
        }

        try {
            const url = `http://localhost:8080/api/employee/earnings-overview/${employeeId}? months=6`;
            console.log('🔍 Fetching earnings from:', url);

            const response = await fetch(url);
            console.log('🔍 Earnings response status:', response.status);

            if (response.ok) {
                const data = await response. json();
                console.log('✅ Earnings data received:', data);
                setEarningsData(data);
            } else {
                const errorText = await response.text();
                console.error('❌ Earnings response not OK:', errorText);
            }
        } catch (error) {
            console.error('❌ Error fetching earnings data:', error);
        } finally {
            setEarningsLoading(false);
        }
    };

    // Fetch leave balances
    const fetchLeaveBalances = async () => {
        if (!employeeId) {
            console.log('❌ No employee ID found for leave balances');
            setLoading(false);
            return;
        }

        try {
            const url = `http://localhost:8080/api/employee/leave-balances/${employeeId}`;
            console.log('🔍 Fetching leave balances from:', url);

            const response = await fetch(url);
            console. log('🔍 Leave balances response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Leave balances data:', data);
                setLeaveBalances(data);
            } else {
                const errorText = await response.text();
                console. error('❌ Leave balances response not OK:', errorText);
            }
        } catch (error) {
            console.error('❌ Error fetching leave balances:', error);
        } finally {
            setLoading(false);
        }
    };

    const openFromPicker = () => fromRef.current?.showPicker();
    const openToPicker = () => toRef. current?.showPicker();
    const openOvertimeDatePicker = () => overtimeDateRef.current?.showPicker();

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
        if (! dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Calculate days between dates
    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Handle leave submission
    const handleSubmitLeave = async (e) => {
        e. preventDefault();

        if (!selectedLeaveType) {
            setMessage({ text: 'Please select a leave type', type: 'error' });
            return;
        }
        if (!fromDate || !toDate) {
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
            const response = await fetch('http://localhost:8080/api/employee/leave-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employeeId,
                    leave_type_id: selectedLeaveType,
                    start_date: fromDate,
                    end_date: toDate,
                    total_days: calculateDays(fromDate, toDate),
                    reason: reason
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Leave request submitted successfully! ', type: 'success' });
                // Reset form
                setSelectedLeaveType(null);
                setFromDate('');
                setToDate('');
                setReason('');
                // Refresh leave balances
                fetchLeaveBalances();

                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                }, 5000);

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

    // =====================================================
    // OVERTIME HANDLERS
    // =====================================================

    // Handle overtime form input changes
    const handleOvertimeInputChange = (e) => {
        const { name, value } = e.target;
        setOvertimeData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate hours if both times are set
            if ((name === "startTime" || name === "endTime") && updated.startTime && updated.endTime) {
                const start = new Date(`2000-01-01T${updated.startTime}`);
                const end = new Date(`2000-01-01T${updated. endTime}`);
                const diffMs = end - start;
                const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
                if (diffHours > 0) {
                    updated.hours = diffHours;
                } else {
                    updated.hours = "";
                }
            }

            return updated;
        });
    };

    // Reset overtime form
    const resetOvertimeForm = () => {
        setOvertimeData({
            date: "",
            startTime: "",
            endTime: "",
            hours: "",
            reason: "",
        });

        setTimeout(() => {
            setOvertimeMessage({ text: '', type: '' });
        }, 5000);
    };

    // Submit overtime request
    const handleOvertimeSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!overtimeData.date) {
            setOvertimeMessage({ text: 'Please select a date', type: 'error' });
            return;
        }
        if (!overtimeData. startTime || !overtimeData. endTime) {
            setOvertimeMessage({ text: 'Please select start and end times', type: 'error' });
            return;
        }
        if (! overtimeData.hours || parseFloat(overtimeData.hours) <= 0) {
            setOvertimeMessage({ text: 'End time must be after start time', type: 'error' });
            return;
        }
        if (! overtimeData.reason) {
            setOvertimeMessage({ text: 'Please provide a reason', type: 'error' });
            return;
        }

        setOvertimeSubmitting(true);
        setOvertimeMessage({ text: '', type: '' });

        try {
            const response = await fetch('http://localhost:8080/api/employee/overtime-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: employeeId,
                    date: overtimeData.date,
                    startTime: overtimeData.startTime,
                    endTime: overtimeData.endTime,
                    hours: parseFloat(overtimeData.hours),
                    reason: overtimeData.reason,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setOvertimeMessage({ text: 'Overtime request submitted successfully! ', type: 'success' });
                resetOvertimeForm();
            } else {
                setOvertimeMessage({ text: data.message || 'Failed to submit overtime request', type: 'error' });
            }
        } catch (error) {
            console.error('Error submitting overtime request:', error);
            setOvertimeMessage({ text: 'Error connecting to server', type: 'error' });
        } finally {
            setOvertimeSubmitting(false);
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
                        {[1, 2, 3].map((i) => (
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
                            value={formatDate(dashboardData.upcomingDisbursement)}
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
                        // ✅ Fixed height for the chart container
                        height: { xs: "350px", sm: "350px", md: "590px" },
                        minHeight: "350px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 2,
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            flexShrink: 0, // ✅ Title won't shrink
                        }}
                    >
                        <i
                            className="ri-bar-chart-2-line"
                            style={{ fontSize: 18, marginRight: "10px" }}
                        ></i>
                        Total Earnings Overview
                    </Typography>

                    {/* ✅ Chart container with fixed height */}
                    <Box sx={{ flex: 1, minHeight: "400px", width: "100%" }}>
                        {earningsLoading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress size={40} />
                            </Box>
                        ) : earningsData. length === 0 ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <Typography sx={{ color: theme.palette.text.secondary }}>
                                    No earnings data available
                                </Typography>
                            </Box>
                        ) : (
                            // ✅ Use fixed height instead of percentage
                            <ResponsiveContainer width="100%" height={500}>
                                <LineChart data={earningsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={theme.palette.mode === "dark" ?  "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        stroke={theme.palette.text.secondary}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke={theme.palette.text.secondary}
                                        style={{ fontSize: '12px' }}
                                        tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#fff",
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: "8px"
                                        }}
                                        formatter={(value) => [`₱${Number(value). toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 'Earnings']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#3A4F50"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: "#3A4F50", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Box>
                </Box>

                {/* =====================================================
                    APPLY FOR LEAVE / REQUEST OVERTIME - TABBED CARD
                    ===================================================== */}
                <Box
                    sx={{
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        p: "20px",
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                        // ✅ Auto height that adjusts to content
                        height: "auto",
                        minHeight: { xs: "400px", sm: "450px", md: "500px" },
                        maxHeight: { xs: "600px", sm: "650px", md: "700px" },
                    }}
                >
                    {/* TAB BUTTONS */}
                    <Box
                        display="flex"
                        gap="8px"
                        mb={2}
                        sx={{
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ?  "rgba(255, 255, 255, 0.05)"
                                    : "rgba(0, 0, 0, 0.05)",
                            borderRadius: "25px",
                            padding: "6px",
                            flexShrink: 0,
                        }}
                    >
                        <Button
                            fullWidth
                            onClick={() => {
                                setRequestTab("leave");
                                setOvertimeMessage({ text: '', type: '' });
                            }}
                            sx={{
                                borderRadius: "20px",
                                textTransform: "none",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                padding: "10px 16px",
                                fontSize: "14px",
                                backgroundColor:
                                    requestTab === "leave"
                                        ? "#172224"
                                        : "transparent",
                                color:
                                    requestTab === "leave"
                                        ? "#fff"
                                        : theme. palette.text.primary,
                                "&:hover": {
                                    backgroundColor:
                                        requestTab === "leave"
                                            ? "#1f2f31"
                                            : theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.1)"
                                                : "rgba(0, 0, 0, 0.05)",
                                },
                            }}
                        >
                            <i className="ri-calendar-check-line" style={{ marginRight: "8px" }}></i>
                            Apply for Leave
                        </Button>
                        <Button
                            fullWidth
                            onClick={() => {
                                setRequestTab("overtime");
                                setMessage({ text: '', type: '' });
                            }}
                            sx={{
                                borderRadius: "20px",
                                textTransform: "none",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                padding: "10px 16px",
                                fontSize: "14px",
                                backgroundColor:
                                    requestTab === "overtime"
                                        ? "#172224"
                                        : "transparent",
                                color:
                                    requestTab === "overtime"
                                        ? "#fff"
                                        : theme.palette.text.primary,
                                "&:hover": {
                                    backgroundColor:
                                        requestTab === "overtime"
                                            ? "#1f2f31"
                                            : theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.1)"
                                                : "rgba(0, 0, 0, 0.05)",
                                },
                            }}
                        >
                            <i className="ri-timer-flash-line" style={{ marginRight: "8px" }}></i>
                            Request Overtime
                        </Button>
                    </Box>

                    {/* ===== LEAVE FORM TAB ===== */}
                    {requestTab === "leave" && (
                        <>
                            {/* Status Message */}
                            {message. text && (
                                <Typography
                                    sx={{
                                        mb: 2,
                                        p: "10px",
                                        borderRadius: "8px",
                                        backgroundColor: message.type === 'success'
                                            ? 'rgba(76, 175, 80, 0.1)'
                                            : 'rgba(244, 67, 54, 0.1)',
                                        color: message.type === 'success' ? '#4caf50' : '#f44336',
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
                                    {loading ? (
                                        <Box display="flex" justifyContent="center" p={2}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : leaveBalances.length > 0 ? (
                                        leaveBalances.map((leave) => (
                                            <Box
                                                key={leave.leave_type_id}
                                                onClick={() => setSelectedLeaveType(leave.leave_type_id)}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    backgroundColor:
                                                        selectedLeaveType === leave.leave_type_id
                                                            ? theme.palette.mode === "dark"
                                                                ? "rgba(58, 79, 80, 0.5)"
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
                                                    <Typography sx={{ fontSize: "13px"}}>
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
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
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
                                                    "&. Mui-focused .MuiOutlinedInput-notchedOutline": {
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
                                        rows={1.5}
                                        value={reason}
                                        onChange={(e) => setReason(e. target.value)}
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            borderRadius: "12px",
                                            backgroundColor: theme.palette.background.default,
                                            "& . MuiInputBase-input": {
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
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </form>
                        </>
                    )}

                    {/* ===== OVERTIME FORM TAB ===== */}
                    {requestTab === "overtime" && (
                        <>
                            {/* Status Message */}
                            {overtimeMessage.text && (
                                <Typography
                                    sx={{
                                        mb: 2,
                                        p: "10px",
                                        borderRadius: "8px",
                                        backgroundColor: overtimeMessage.type === 'success'
                                            ? 'rgba(76, 175, 80, 0.1)'
                                            : 'rgba(244, 67, 54, 0.1)',
                                        color: overtimeMessage.type === 'success' ? '#4caf50' : '#f44336',
                                        fontSize: '14px',
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    }}
                                >
                                    {overtimeMessage.text}
                                </Typography>
                            )}

                            <form
                                onSubmit={handleOvertimeSubmit}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                }}
                            >
                                {/* Date */}
                                <Box display="flex" flexDirection="column" width="100%">
                                    <Typography
                                        sx={{
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            fontSize: "13px",
                                            mb: "3px",
                                            ml: "10px",
                                        }}
                                    >
                                        Date
                                    </Typography>

                                    <TextField
                                        inputRef={overtimeDateRef}
                                        type="date"
                                        name="date"
                                        value={overtimeData.date}
                                        onChange={handleOvertimeInputChange}
                                        fullWidth
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={openOvertimeDatePicker}>
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
                                                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                {/* Time Fields */}
                                <Box
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    gap="20px"
                                >
                                    {/* Start Time */}
                                    <Box display="flex" flexDirection="column" width="100%">
                                        <Typography
                                            sx={{
                                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                                fontSize: "13px",
                                                mb: "3px",
                                                ml: "10px",
                                            }}
                                        >
                                            Time In
                                        </Typography>

                                        <TextField
                                            type="time"
                                            name="startTime"
                                            value={overtimeData.startTime}
                                            onChange={handleOvertimeInputChange}
                                            fullWidth
                                            variant="outlined"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <FaClock style={{ fontSize: "16px", color: theme.palette.text.secondary }} />
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    height: "45px",
                                                    borderRadius: "25px",
                                                    backgroundColor: theme.palette.background.default,
                                                    // ✅ Hide visually but still clickable
                                                    "& input::-webkit-calendar-picker-indicator": {
                                                        opacity: 0,
                                                        position: "absolute",
                                                        right: 0,
                                                        width: "100%",
                                                        height: "100%",
                                                        cursor: "pointer",
                                                    },
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: "none",
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>

                                    {/* End Time */}
                                    <Box display="flex" flexDirection="column" width="100%">
                                        <Typography
                                            sx={{
                                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                                fontSize: "13px",
                                                mb: "3px",
                                                ml: "10px",
                                            }}
                                        >
                                            Time Out
                                        </Typography>

                                        <TextField
                                            type="time"
                                            name="endTime"
                                            value={overtimeData.endTime}
                                            onChange={handleOvertimeInputChange}
                                            fullWidth
                                            variant="outlined"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <FaClock style={{ fontSize: "16px", color: theme.palette.text.secondary }} />
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    height: "45px",
                                                    borderRadius: "25px",
                                                    backgroundColor: theme.palette.background.default,
                                                    // ✅ Hide visually but still clickable
                                                    "& input::-webkit-calendar-picker-indicator": {
                                                        opacity: 0,
                                                        position: "absolute",
                                                        right: 0,
                                                        width: "100%",
                                                        height: "100%",
                                                        cursor: "pointer",
                                                    },
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: "none",
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* Calculated Hours Display */}
                                {overtimeData.hours && parseFloat(overtimeData.hours) > 0 && (
                                    <Box
                                        sx={{
                                            backgroundColor: theme.palette.background.default,
                                            borderRadius: "12px",
                                            p: "12px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 1,
                                            border: `1px solid ${theme.palette.divider}`,
                                        }}
                                    >
                                        <i className="ri-time-line" style={{ color: theme.palette.text.primary, fontSize: "18px" }}></i>
                                        <Typography
                                            sx={{
                                                fontFamily: "'TTHoves-Bold', sans-serif",
                                                color: theme.palette.text.primary,
                                                fontSize: "15px",
                                            }}
                                        >
                                            Total Overtime: {overtimeData.hours} hours
                                        </Typography>
                                    </Box>
                                )}

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
                                        placeholder="Please provide the reason for overtime work..."
                                        multiline
                                        rows={4}
                                        name="reason"
                                        value={overtimeData.reason}
                                        onChange={handleOvertimeInputChange}
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            borderRadius: "12px",
                                            backgroundColor: theme.palette.background.default,
                                            "& . MuiInputBase-input": {
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
                                    type="submit"
                                    disabled={overtimeSubmitting}
                                    sx={{
                                        marginTop: "10px",
                                        marginBottom: "40px",
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
                                    {overtimeSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </form>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default EmployeeDashboard;