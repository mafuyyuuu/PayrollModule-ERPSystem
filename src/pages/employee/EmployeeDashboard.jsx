import {
    InputAdornment,
    IconButton,
    Box,
    Typography,
    TextField,
    Button,
    useTheme,
    CircularProgress,
    Modal,
    Chip,
    LinearProgress,
    Avatar,
    Divider
} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { useRef, useState, useEffect } from "react";
import { FaRegCalendar, FaClock } from "react-icons/fa";
import { useUser } from "../../components/UserContext.jsx";

const EmployeeDashboard = () => {
    const theme = useTheme();
    const { user } = useUser();
    const fromRef = useRef(null);
    const toRef = useRef(null);
    const overtimeDateRef = useRef(null);
    const reimbursementDateRef = useRef(null);

    // Get employee ID from either property name (supports both login methods)
    const employeeId = user?.employee_id || user?.employeeId;

    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        upcomingDisbursement: null,
        pendingSalary: null,
        SalaryRelease: null,
        ytdEarnings: null,
        pendingRequestsCount: 0,
        totalLeaveBalance: 0
    });
    const [dashboardLoading, setDashboardLoading] = useState(true);

    // State for earnings chart
    const [earningsData, setEarningsData] = useState([]);
    const [earningsLoading, setEarningsLoading] = useState(true);

    // State for pending requests
    const [pendingRequests, setPendingRequests] = useState([]);
    const [pendingRequestsLoading, setPendingRequestsLoading] = useState(true);

    // State for recent payslips
    const [recentPayslips, setRecentPayslips] = useState([]);
    const [payslipsLoading, setPayslipsLoading] = useState(true);

    // State for leave data
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Modal state for request forms
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [requestModalType, setRequestModalType] = useState(null); // "leave", "overtime", "bonus", "reimbursement"

    // Overtime form state
    const [overtimeData, setOvertimeData] = useState({
        date: "",
        startTime: "",
        endTime: "",
        hours: "",
        reason: "",
    });
    const [overtimeSubmitting, setOvertimeSubmitting] = useState(false);
    const [overtimeMessage, setOvertimeMessage] = useState({ text: '', type: '' });

    // Bonus form state
    const [bonusData, setBonusData] = useState({
        bonusType: "",
        amount: "",
        reason: "",
    });
    const [bonusSubmitting, setBonusSubmitting] = useState(false);
    const [bonusMessage, setBonusMessage] = useState({ text: '', type: '' });

    // Reimbursement form state
    const [reimbursementData, setReimbursementData] = useState({
        expenseType: "",
        amount: "",
        date: "",
        description: "",
        receiptNumber: "",
    });
    const [reimbursementSubmitting, setReimbursementSubmitting] = useState(false);
    const [reimbursementMessage, setReimbursementMessage] = useState({ text: '', type: '' });

    // Fetch data on component mount
    useEffect(() => {
        if (employeeId) {
            console.log('Current user:', user);
            console.log('Using employee ID:', employeeId);
            fetchDashboardData();
            fetchLeaveBalances();
            fetchEarningsData();
            fetchPendingRequests();
            fetchRecentPayslips();
        } else {
            console.log('No employee ID found in user:', user);
            setDashboardLoading(false);
            setLoading(false);
            setEarningsLoading(false);
            setPendingRequestsLoading(false);
            setPayslipsLoading(false);
        }
    }, [employeeId]);

    // Fetch dashboard card data
    const fetchDashboardData = async () => {
        if (!employeeId) {
            setDashboardLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/employee/dashboard/${employeeId}`
            );
            if (response.ok) {
                const data = await response.json();
                setDashboardData(prev => ({
                    ...prev,
                    upcomingDisbursement: data.latestPayslip?.pay_date || null,
                    pendingSalary: data.latestPayslip?.net_pay || null,
                    SalaryRelease: data.latestPayslip?.net_pay || null,
                    ytdEarnings: data.ytdEarnings || null
                }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setDashboardLoading(false);
        }
    };

    // Fetch pending requests
    const fetchPendingRequests = async () => {
        if (!employeeId) {
            setPendingRequestsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/employee/pending-requests/${employeeId}`
            );
            if (response.ok) {
                const data = await response.json();
                setPendingRequests(data);
                setDashboardData(prev => ({
                    ...prev,
                    pendingRequestsCount: data.length
                }));
            }
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setPendingRequestsLoading(false);
        }
    };

    // Fetch recent payslips
    const fetchRecentPayslips = async () => {
        if (!employeeId) {
            setPayslipsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/employee/recent-payslips/${employeeId}`
            );
            if (response.ok) {
                const data = await response.json();
                setRecentPayslips(data);
            }
        } catch (error) {
            console.error('Error fetching recent payslips:', error);
        } finally {
            setPayslipsLoading(false);
        }
    };

    // Fetch earnings overview data
    const fetchEarningsData = async () => {
        if (!employeeId) {
            setEarningsLoading(false);
            return;
        }

        try {
            const url = `http://localhost:8080/api/employee/earnings/${employeeId}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                setEarningsData(data);
                // Calculate YTD earnings
                const ytd = data.reduce((sum, item) => sum + (item.earnings || 0), 0);
                setDashboardData(prev => ({
                    ...prev,
                    ytdEarnings: ytd
                }));
            }
        } catch (error) {
            console.error('Error fetching earnings data:', error);
        } finally {
            setEarningsLoading(false);
        }
    };

    // Fetch leave balances
    const fetchLeaveBalances = async () => {
        if (!employeeId) {
            setLoading(false);
            return;
        }

        try {
            const url = `http://localhost:8080/api/employee/leave-balances/${employeeId}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                setLeaveBalances(data);
                // Calculate total leave balance
                const totalLeave = data.reduce((sum, item) => sum + (item.remaining_days || 0), 0);
                setDashboardData(prev => ({
                    ...prev,
                    totalLeaveBalance: totalLeave
                }));
            }
        } catch (error) {
            console.error('Error fetching leave balances:', error);
        } finally {
            setLoading(false);
        }
    };

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
        const diffTime = Math.abs(endDate - startDate);
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
            // ✅ Updated URL to match employeeRoutes.js
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
                setMessage({ text: 'Leave request submitted successfully!', type: 'success' });
                // Reset form
                setSelectedLeaveType(null);
                setFromDate('');
                setToDate('');
                setReason('');
                // Refresh leave balances and pending requests
                fetchLeaveBalances();
                fetchPendingRequests();

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
                const end = new Date(`2000-01-01T${updated.endTime}`);
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
        if (!overtimeData.startTime || !overtimeData.endTime) {
            setOvertimeMessage({ text: 'Please select start and end times', type: 'error' });
            return;
        }
        if (!overtimeData.hours || parseFloat(overtimeData.hours) <= 0) {
            setOvertimeMessage({ text: 'End time must be after start time', type: 'error' });
            return;
        }
        if (!overtimeData.reason) {
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
                setOvertimeMessage({ text: 'Overtime request submitted successfully!', type: 'success' });
                resetOvertimeForm();
                fetchPendingRequests();
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

    // =====================================================
    // BONUS HANDLERS
    // =====================================================

    const handleBonusInputChange = (e) => {
        const { name, value } = e.target;
        setBonusData(prev => ({ ...prev, [name]: value }));
    };

    const resetBonusForm = () => {
        setBonusData({
            bonusType: "",
            amount: "",
            reason: "",
        });
        setTimeout(() => {
            setBonusMessage({ text: '', type: '' });
        }, 5000);
    };

    const handleBonusSubmit = async (e) => {
        e.preventDefault();

        if (!bonusData.bonusType) {
            setBonusMessage({ text: 'Please select a bonus type', type: 'error' });
            return;
        }
        if (!bonusData.amount || parseFloat(bonusData.amount) <= 0) {
            setBonusMessage({ text: 'Please enter a valid amount', type: 'error' });
            return;
        }
        if (!bonusData.reason) {
            setBonusMessage({ text: 'Please provide a reason', type: 'error' });
            return;
        }

        setBonusSubmitting(true);
        setBonusMessage({ text: '', type: '' });

        try {
            const response = await fetch('http://localhost:8080/api/employee/bonus-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: employeeId,
                    bonusType: bonusData.bonusType,
                    amount: parseFloat(bonusData.amount),
                    reason: bonusData.reason,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setBonusMessage({ text: 'Bonus request submitted successfully!', type: 'success' });
                resetBonusForm();
                fetchPendingRequests();
            } else {
                setBonusMessage({ text: data.message || 'Failed to submit bonus request', type: 'error' });
            }
        } catch (error) {
            console.error('Error submitting bonus request:', error);
            setBonusMessage({ text: 'Error connecting to server', type: 'error' });
        } finally {
            setBonusSubmitting(false);
        }
    };

    // =====================================================
    // REIMBURSEMENT HANDLERS
    // =====================================================

    const handleReimbursementInputChange = (e) => {
        const { name, value } = e.target;
        setReimbursementData(prev => ({ ...prev, [name]: value }));
    };

    const resetReimbursementForm = () => {
        setReimbursementData({
            expenseType: "",
            amount: "",
            date: "",
            description: "",
            receiptNumber: "",
        });
        setTimeout(() => {
            setReimbursementMessage({ text: '', type: '' });
        }, 5000);
    };

    const handleReimbursementSubmit = async (e) => {
        e.preventDefault();

        if (!reimbursementData.expenseType) {
            setReimbursementMessage({ text: 'Please select an expense type', type: 'error' });
            return;
        }
        if (!reimbursementData.amount || parseFloat(reimbursementData.amount) <= 0) {
            setReimbursementMessage({ text: 'Please enter a valid amount', type: 'error' });
            return;
        }
        if (!reimbursementData.date) {
            setReimbursementMessage({ text: 'Please select a date', type: 'error' });
            return;
        }
        if (!reimbursementData.description) {
            setReimbursementMessage({ text: 'Please provide a description', type: 'error' });
            return;
        }

        setReimbursementSubmitting(true);
        setReimbursementMessage({ text: '', type: '' });

        try {
            const response = await fetch('http://localhost:8080/api/employee/reimbursement-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: employeeId,
                    expenseType: reimbursementData.expenseType,
                    amount: parseFloat(reimbursementData.amount),
                    date: reimbursementData.date,
                    description: reimbursementData.description,
                    receiptNumber: reimbursementData.receiptNumber,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setReimbursementMessage({ text: 'Reimbursement request submitted successfully!', type: 'success' });
                resetReimbursementForm();
                fetchPendingRequests();
            } else {
                setReimbursementMessage({ text: data.message || 'Failed to submit reimbursement request', type: 'error' });
            }
        } catch (error) {
            console.error('Error submitting reimbursement request:', error);
            setReimbursementMessage({ text: 'Error connecting to server', type: 'error' });
        } finally {
            setReimbursementSubmitting(false);
        }
    };

    // Open request modal
    const openRequestModal = (type) => {
        setRequestModalType(type);
        setRequestModalOpen(true);
        // Clear any previous messages
        setMessage({ text: '', type: '' });
        setOvertimeMessage({ text: '', type: '' });
        setBonusMessage({ text: '', type: '' });
        setReimbursementMessage({ text: '', type: '' });
    };

    // Close request modal
    const closeRequestModal = () => {
        setRequestModalOpen(false);
        setRequestModalType(null);
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' };
            case 'pending':
                return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' };
            case 'rejected':
                return { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336' };
            default:
                return { bg: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e' };
        }
    };

    // Format short date
    const formatShortDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate days until pay date
    const getDaysUntilPay = () => {
        if (!dashboardData.upcomingDisbursement) return null;
        const payDate = new Date(dashboardData.upcomingDisbursement);
        const today = new Date();
        const diffTime = payDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const openReimbursementDatePicker = () => reimbursementDateRef.current?.showPicker();

    // Card styling helper - Glassy design with animation (consistent with other pages)
    const cardStyle = {
        backgroundColor:
            theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.2)",
        borderRadius: "12px",
        border: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(12px)",
        transition: "all 0.3s ease",
        "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        },
    };

    // Icon style helper - Black outline style
    const iconStyle = {
        fontSize: 20,
        color: theme.palette.text.primary,
        strokeWidth: 1,
    };

    return (
        <Box width="100%" height="100%">
            {/* TOP CARDS - 4 columns */}
            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                }}
                gap="16px"
                mb={3}
            >
                {dashboardLoading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <Box key={i} sx={{ ...cardStyle, p: 3, display: "flex", justifyContent: "center", alignItems: "center", height: "120px" }}>
                                <CircularProgress size={24} />
                            </Box>
                        ))}
                    </>
                ) : (
                    <>
                        {/* Next Pay Day Card */}
                        <Box sx={{ ...cardStyle, p: 2.5 }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "10px",
                                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <i className="ri-calendar-check-line" style={{ fontSize: 20, color: theme.palette.text.primary }}></i>
                                </Box>
                                <Typography sx={{ fontSize: "13px", color: theme.palette.text.secondary }}>
                                    Next Pay Day
                                </Typography>
                            </Box>
                            <Typography sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "20px", mb: 0.5 }}>
                                {formatDate(dashboardData.upcomingDisbursement)}
                            </Typography>
                            {getDaysUntilPay() !== null && (
                                <Chip
                                    label={`${getDaysUntilPay()} days away`}
                                    size="small"
                                    sx={{
                                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                                        color: theme.palette.text.secondary,
                                        fontSize: "11px",
                                        height: "22px"
                                    }}
                                />
                            )}
                        </Box>

                        {/* Expected Salary Card */}
                        <Box sx={{ ...cardStyle, p: 2.5 }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "10px",
                                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <i className="ri-money-dollar-circle-line" style={{ fontSize: 20, color: theme.palette.text.primary }}></i>
                                </Box>
                                <Typography sx={{ fontSize: "13px", color: theme.palette.text.secondary }}>
                                    Expected Salary
                                </Typography>
                            </Box>
                            <Typography sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "22px" }}>
                                {formatCurrency(dashboardData.pendingSalary)}
                            </Typography>
                        </Box>

                        {/* Leave Balance Card */}
                        <Box sx={{ ...cardStyle, p: 2.5 }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "10px",
                                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <i className="ri-calendar-todo-line" style={{ fontSize: 20, color: theme.palette.text.primary }}></i>
                                </Box>
                                <Typography sx={{ fontSize: "13px", color: theme.palette.text.secondary }}>
                                    Leave Balance
                                </Typography>
                            </Box>
                            <Typography sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "22px" }}>
                                {dashboardData.totalLeaveBalance} days
                            </Typography>
                        </Box>

                        {/* YTD Earnings Card */}
                        <Box sx={{ ...cardStyle, p: 2.5 }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "10px",
                                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <i className="ri-bar-chart-grouped-line" style={{ fontSize: 20, color: theme.palette.text.primary }}></i>
                                </Box>
                                <Typography sx={{ fontSize: "13px", color: theme.palette.text.secondary }}>
                                    YTD Earnings
                                </Typography>
                            </Box>
                            <Typography sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "22px" }}>
                                {formatCurrency(dashboardData.ytdEarnings)}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>

            {/* MAIN CONTENT - 3 column layout */}
            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    lg: "2fr 1fr 1fr",
                }}
                gap="16px"
            >
                {/* EARNINGS CHART */}
                <Box sx={{ ...cardStyle, p: 3 }}>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            fontSize: "16px",
                            mb: 2
                        }}
                    >
                        <i className="ri-line-chart-line" style={{ marginRight: "8px", color: theme.palette.text.primary }}></i>
                        Earnings Overview
                    </Typography>

                    <Box sx={{ height: "280px" }}>
                        {earningsLoading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress size={32} />
                            </Box>
                        ) : earningsData.length === 0 ? (
                            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
                                <i className="ri-bar-chart-box-line" style={{ fontSize: 48, color: theme.palette.text.disabled, marginBottom: 8 }}></i>
                                <Typography sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}>
                                    No earnings data yet
                                </Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={earningsData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        stroke={theme.palette.text.secondary}
                                        style={{ fontSize: '11px' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke={theme.palette.text.secondary}
                                        style={{ fontSize: '11px' }}
                                        tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#fff",
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: "8px",
                                            fontSize: "12px"
                                        }}
                                        formatter={(value) => [`${formatCurrency(value)}`, 'Net Pay']}
                                    />
                                    <Bar
                                        dataKey="earnings"
                                        fill="#3A4F50"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Box>

                    {/* YTD Summary */}
                    {dashboardData.ytdEarnings > 0 && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                                borderRadius: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                border: `1px solid ${theme.palette.divider}`,
                                backdropFilter: "blur(8px)"
                            }}
                        >
                            <Typography sx={{ fontSize: "13px", color: theme.palette.text.secondary }}>
                                Year-to-Date Earnings
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "16px" }}>
                                {formatCurrency(dashboardData.ytdEarnings)}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* QUICK ACTIONS */}
                <Box sx={{ ...cardStyle, p: 3 }}>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            fontSize: "16px",
                            mb: 2
                        }}
                    >
                        <i className="ri-add-circle-line" style={{ marginRight: "8px", color: theme.palette.text.primary }}></i>
                        Quick Actions
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={1.5}>
                        {[
                            { type: 'leave', icon: 'ri-calendar-check-line', label: 'Request Leave' },
                            { type: 'overtime', icon: 'ri-timer-flash-line', label: 'Log Overtime' },
                            { type: 'bonus', icon: 'ri-gift-line', label: 'Request Bonus' },
                            { type: 'reimbursement', icon: 'ri-refund-2-line', label: 'Reimbursement' },
                        ].map((action) => (
                            <Button
                                key={action.type}
                                onClick={() => openRequestModal(action.type)}
                                sx={{
                                    justifyContent: "flex-start",
                                    textTransform: "none",
                                    p: 1.5,
                                    borderRadius: "10px",
                                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                    color: theme.palette.text.primary,
                                    border: `1px solid ${theme.palette.divider}`,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                                        borderColor: theme.palette.text.secondary,
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: "8px",
                                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 1.5,
                                        border: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <i className={action.icon} style={{ fontSize: 18, color: theme.palette.text.primary }}></i>
                                </Box>
                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px" }}>
                                    {action.label}
                                </Typography>
                            </Button>
                        ))}
                    </Box>

                    {/* Leave Balance Summary */}
                    <Divider sx={{ my: 2 }} />
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            fontSize: "14px",
                            mb: 1.5,
                            color: theme.palette.text.secondary
                        }}
                    >
                        Leave Balances
                    </Typography>
                    {loading ? (
                        <CircularProgress size={20} />
                    ) : leaveBalances.length === 0 ? (
                        <Typography sx={{ fontSize: "13px", color: theme.palette.text.disabled }}>
                            No leave balances
                        </Typography>
                    ) : (
                        <Box display="flex" flexDirection="column" gap={1}>
                            {leaveBalances.slice(0, 3).map((leave) => (
                                <Box key={leave.leave_type_id}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography sx={{ fontSize: "12px" }}>{leave.leave_type_name}</Typography>
                                        <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                                            {leave.remaining_days}/{leave.total_days || leave.remaining_days}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(leave.remaining_days / (leave.total_days || leave.remaining_days)) * 100}
                                        sx={{
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                                            "& .MuiLinearProgress-bar": {
                                                backgroundColor: "#3A4F50",
                                                borderRadius: 2
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* PENDING REQUESTS & RECENT PAYSLIPS */}
                <Box display="flex" flexDirection="column" gap={2}>
                    {/* Pending Requests */}
                    <Box sx={{ ...cardStyle, p: 3, flex: 1 }}>
                        <Typography
                            sx={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                fontSize: "16px",
                                mb: 2
                            }}
                        >
                            <i className="ri-time-line" style={{ marginRight: "8px", color: theme.palette.text.primary }}></i>
                            Pending Requests
                        </Typography>

                        {pendingRequestsLoading ? (
                            <Box display="flex" justifyContent="center" py={2}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : pendingRequests.length === 0 ? (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                py={3}
                            >
                                <i className="ri-checkbox-circle-line" style={{ fontSize: 36, color: theme.palette.text.disabled, marginBottom: 8 }}></i>
                                <Typography sx={{ fontSize: "13px", color: theme.palette.text.secondary }}>
                                    No pending requests
                                </Typography>
                            </Box>
                        ) : (
                            <Box display="flex" flexDirection="column" gap={1}>
                                {pendingRequests.slice(0, 3).map((request, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: "8px",
                                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                                                {request.type}
                                            </Typography>
                                            <Chip
                                                label={request.status}
                                                size="small"
                                                sx={{
                                                    ...getStatusColor(request.status),
                                                    backgroundColor: getStatusColor(request.status).bg,
                                                    fontSize: "10px",
                                                    height: "20px"
                                                }}
                                            />
                                        </Box>
                                        <Typography sx={{ fontSize: "11px", color: theme.palette.text.secondary, mt: 0.5 }}>
                                            {formatShortDate(request.date)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Recent Payslips */}
                    <Box sx={{ ...cardStyle, p: 3, flex: 1 }}>
                        <Typography
                            sx={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                fontSize: "16px",
                                mb: 2
                            }}
                        >
                            <i className="ri-file-list-3-line" style={{ marginRight: "8px", color: theme.palette.text.primary }}></i>
                            Recent Payslips
                        </Typography>

                        {payslipsLoading ? (
                            <Box display="flex" justifyContent="center" py={2}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : recentPayslips.length === 0 ? (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                py={3}
                            >
                                <i className="ri-file-list-line" style={{ fontSize: 36, color: theme.palette.text.disabled, marginBottom: 8 }}></i>
                                <Typography sx={{ fontSize: "13px", color: theme.palette.text.secondary }}>
                                    No payslips yet
                                </Typography>
                            </Box>
                        ) : (
                            <Box display="flex" flexDirection="column" gap={1}>
                                {recentPayslips.slice(0, 3).map((payslip, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: "8px",
                                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                            cursor: "pointer",
                                            "&:hover": {
                                                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                                            }
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                                                {payslip.period || formatShortDate(payslip.pay_date)}
                                            </Typography>
                                            <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                                                {formatCurrency(payslip.net_pay)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* REQUEST MODAL */}
            <Modal
                open={requestModalOpen}
                onClose={closeRequestModal}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "16px",
                        p: 3,
                        width: { xs: "95%", sm: "500px" },
                        maxHeight: "90vh",
                        overflowY: "auto",
                        outline: "none",
                    }}
                >
                    {/* Modal Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "20px" }}>
                            {requestModalType === 'leave' && 'Request Leave'}
                            {requestModalType === 'overtime' && 'Log Overtime'}
                            {requestModalType === 'bonus' && 'Request Bonus'}
                            {requestModalType === 'reimbursement' && 'Request Reimbursement'}
                        </Typography>
                        <IconButton onClick={closeRequestModal} size="small">
                            <i className="ri-close-line" style={{ fontSize: 20 }}></i>
                        </IconButton>
                    </Box>

                    {/* LEAVE FORM */}
                    {requestModalType === 'leave' && (
                        <>
                            {message.text && (
                                <Box
                                    sx={{
                                        mb: 2,
                                        p: "12px",
                                        borderRadius: "8px",
                                        backgroundColor: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                        color: message.type === 'success' ? '#4caf50' : '#f44336',
                                    }}
                                >
                                    <Typography sx={{ fontSize: '14px' }}>{message.text}</Typography>
                                </Box>
                            )}
                            <form onSubmit={handleSubmitLeave}>
                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1.5 }}>
                                    Leave Type
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                                    {loading ? (
                                        <CircularProgress size={24} />
                                    ) : leaveBalances.map((leave) => (
                                        <Box
                                            key={leave.leave_type_id}
                                            onClick={() => setSelectedLeaveType(leave.leave_type_id)}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                p: "12px 16px",
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                backgroundColor: selectedLeaveType === leave.leave_type_id
                                                    ? "rgba(58, 79, 80, 0.15)"
                                                    : theme.palette.background.default,
                                                border: selectedLeaveType === leave.leave_type_id
                                                    ? "2px solid #3A4F50"
                                                    : "2px solid transparent",
                                                transition: "0.2s",
                                            }}
                                        >
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                                                    {leave.leave_type_name}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: theme.palette.text.secondary }}>
                                                    {leave.remaining_days} days remaining
                                                </Typography>
                                            </Box>
                                            <input
                                                type="radio"
                                                checked={selectedLeaveType === leave.leave_type_id}
                                                onChange={() => setSelectedLeaveType(leave.leave_type_id)}
                                            />
                                        </Box>
                                    ))}
                                </Box>

                                <Box display="flex" gap={2} mb={2}>
                                    <Box flex={1}>
                                        <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                            From
                                        </Typography>
                                        <TextField
                                            inputRef={fromRef}
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            fullWidth
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => fromRef.current?.showPicker()} size="small">
                                                            <FaRegCalendar style={{ fontSize: "14px" }} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                            To
                                        </Typography>
                                        <TextField
                                            inputRef={toRef}
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            fullWidth
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => toRef.current?.showPicker()} size="small">
                                                            <FaRegCalendar style={{ fontSize: "14px" }} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                    Reason
                                </Typography>
                                <TextField
                                    placeholder="Describe your reason..."
                                    multiline
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    fullWidth
                                    sx={{ mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    fullWidth
                                    sx={{
                                        backgroundColor: "#172224",
                                        color: "#fff",
                                        py: 1.5,
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        "&:hover": { backgroundColor: "#1f2f31" },
                                        "&:disabled": { backgroundColor: "#ccc" }
                                    }}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </form>
                        </>
                    )}

                    {/* OVERTIME FORM */}
                    {requestModalType === 'overtime' && (
                        <>
                            {overtimeMessage.text && (
                                <Box
                                    sx={{
                                        mb: 2,
                                        p: "12px",
                                        borderRadius: "8px",
                                        backgroundColor: overtimeMessage.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                        color: overtimeMessage.type === 'success' ? '#4caf50' : '#f44336',
                                    }}
                                >
                                    <Typography sx={{ fontSize: '14px' }}>{overtimeMessage.text}</Typography>
                                </Box>
                            )}
                            <form onSubmit={handleOvertimeSubmit}>
                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                    Date
                                </Typography>
                                <TextField
                                    inputRef={overtimeDateRef}
                                    type="date"
                                    name="date"
                                    value={overtimeData.date}
                                    onChange={handleOvertimeInputChange}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => overtimeDateRef.current?.showPicker()} size="small">
                                                    <FaRegCalendar style={{ fontSize: "14px" }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Box display="flex" gap={2} mb={2}>
                                    <Box flex={1}>
                                        <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                            Start Time
                                        </Typography>
                                        <TextField
                                            type="time"
                                            name="startTime"
                                            value={overtimeData.startTime}
                                            onChange={handleOvertimeInputChange}
                                            fullWidth
                                            size="small"
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                            End Time
                                        </Typography>
                                        <TextField
                                            type="time"
                                            name="endTime"
                                            value={overtimeData.endTime}
                                            onChange={handleOvertimeInputChange}
                                            fullWidth
                                            size="small"
                                        />
                                    </Box>
                                </Box>

                                {overtimeData.hours && parseFloat(overtimeData.hours) > 0 && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            mb: 2,
                                            borderRadius: "10px",
                                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                                            textAlign: "center"
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: 600, color: "#2196f3" }}>
                                            Total: {overtimeData.hours} hours
                                        </Typography>
                                    </Box>
                                )}

                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                    Reason
                                </Typography>
                                <TextField
                                    placeholder="Describe the reason for overtime..."
                                    multiline
                                    rows={3}
                                    name="reason"
                                    value={overtimeData.reason}
                                    onChange={handleOvertimeInputChange}
                                    fullWidth
                                    sx={{ mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    disabled={overtimeSubmitting}
                                    fullWidth
                                    sx={{
                                        backgroundColor: "#172224",
                                        color: "#fff",
                                        py: 1.5,
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        "&:hover": { backgroundColor: "#1f2f31" },
                                        "&:disabled": { backgroundColor: "#ccc" }
                                    }}
                                >
                                    {overtimeSubmitting ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </form>
                        </>
                    )}

                    {/* BONUS FORM */}
                    {requestModalType === 'bonus' && (
                        <>
                            {bonusMessage.text && (
                                <Box
                                    sx={{
                                        mb: 2,
                                        p: "12px",
                                        borderRadius: "8px",
                                        backgroundColor: bonusMessage.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                        color: bonusMessage.type === 'success' ? '#4caf50' : '#f44336',
                                    }}
                                >
                                    <Typography sx={{ fontSize: '14px' }}>{bonusMessage.text}</Typography>
                                </Box>
                            )}
                            <form onSubmit={handleBonusSubmit}>
                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1.5 }}>
                                    Bonus Type
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                                    {[
                                        { id: "performance", label: "Performance Bonus", icon: "ri-medal-line" },
                                        { id: "project", label: "Project Completion", icon: "ri-flag-line" },
                                        { id: "referral", label: "Referral Bonus", icon: "ri-user-add-line" },
                                        { id: "other", label: "Other", icon: "ri-gift-line" },
                                    ].map((bonus) => (
                                        <Box
                                            key={bonus.id}
                                            onClick={() => setBonusData(prev => ({ ...prev, bonusType: bonus.id }))}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                p: "12px 16px",
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                backgroundColor: bonusData.bonusType === bonus.id
                                                    ? "rgba(58, 79, 80, 0.15)"
                                                    : theme.palette.background.default,
                                                border: bonusData.bonusType === bonus.id
                                                    ? "2px solid #3A4F50"
                                                    : "2px solid transparent",
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <i className={bonus.icon} style={{ fontSize: 18 }}></i>
                                                <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
                                                    {bonus.label}
                                                </Typography>
                                            </Box>
                                            <input
                                                type="radio"
                                                checked={bonusData.bonusType === bonus.id}
                                                onChange={() => setBonusData(prev => ({ ...prev, bonusType: bonus.id }))}
                                            />
                                        </Box>
                                    ))}
                                </Box>

                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                    Requested Amount (₱)
                                </Typography>
                                <TextField
                                    type="number"
                                    name="amount"
                                    placeholder="Enter amount"
                                    value={bonusData.amount}
                                    onChange={handleBonusInputChange}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                />

                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                    Justification
                                </Typography>
                                <TextField
                                    placeholder="Explain why you deserve this bonus..."
                                    multiline
                                    rows={3}
                                    name="reason"
                                    value={bonusData.reason}
                                    onChange={handleBonusInputChange}
                                    fullWidth
                                    sx={{ mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    disabled={bonusSubmitting}
                                    fullWidth
                                    sx={{
                                        backgroundColor: "#172224",
                                        color: "#fff",
                                        py: 1.5,
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        "&:hover": { backgroundColor: "#1f2f31" },
                                        "&:disabled": { backgroundColor: "#ccc" }
                                    }}
                                >
                                    {bonusSubmitting ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </form>
                        </>
                    )}

                    {/* REIMBURSEMENT FORM */}
                    {requestModalType === 'reimbursement' && (
                        <>
                            {reimbursementMessage.text && (
                                <Box
                                    sx={{
                                        mb: 2,
                                        p: "12px",
                                        borderRadius: "8px",
                                        backgroundColor: reimbursementMessage.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                        color: reimbursementMessage.type === 'success' ? '#4caf50' : '#f44336',
                                    }}
                                >
                                    <Typography sx={{ fontSize: '14px' }}>{reimbursementMessage.text}</Typography>
                                </Box>
                            )}
                            <form onSubmit={handleReimbursementSubmit}>
                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1.5 }}>
                                    Expense Type
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                                    {[
                                        { id: "travel", label: "Travel", icon: "ri-plane-line" },
                                        { id: "medical", label: "Medical", icon: "ri-hospital-line" },
                                        { id: "training", label: "Training", icon: "ri-book-open-line" },
                                        { id: "equipment", label: "Equipment", icon: "ri-computer-line" },
                                        { id: "meal", label: "Meal", icon: "ri-restaurant-line" },
                                        { id: "other", label: "Other", icon: "ri-file-list-line" },
                                    ].map((expense) => (
                                        <Box
                                            key={expense.id}
                                            onClick={() => setReimbursementData(prev => ({ ...prev, expenseType: expense.id }))}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                p: "10px 14px",
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                backgroundColor: reimbursementData.expenseType === expense.id
                                                    ? "rgba(58, 79, 80, 0.15)"
                                                    : theme.palette.background.default,
                                                border: reimbursementData.expenseType === expense.id
                                                    ? "2px solid #3A4F50"
                                                    : "2px solid transparent",
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <i className={expense.icon} style={{ fontSize: 16 }}></i>
                                                <Typography sx={{ fontWeight: 500, fontSize: "13px" }}>
                                                    {expense.label}
                                                </Typography>
                                            </Box>
                                            <input
                                                type="radio"
                                                checked={reimbursementData.expenseType === expense.id}
                                                onChange={() => setReimbursementData(prev => ({ ...prev, expenseType: expense.id }))}
                                            />
                                        </Box>
                                    ))}
                                </Box>

                                <Box display="flex" gap={2} mb={2}>
                                    <Box flex={1}>
                                        <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                            Amount (₱)
                                        </Typography>
                                        <TextField
                                            type="number"
                                            name="amount"
                                            placeholder="Amount"
                                            value={reimbursementData.amount}
                                            onChange={handleReimbursementInputChange}
                                            fullWidth
                                            size="small"
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                            Date
                                        </Typography>
                                        <TextField
                                            inputRef={reimbursementDateRef}
                                            type="date"
                                            name="date"
                                            value={reimbursementData.date}
                                            onChange={handleReimbursementInputChange}
                                            fullWidth
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={openReimbursementDatePicker} size="small">
                                                            <FaRegCalendar style={{ fontSize: "14px" }} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                    Receipt Number (Optional)
                                </Typography>
                                <TextField
                                    name="receiptNumber"
                                    placeholder="Receipt or invoice number"
                                    value={reimbursementData.receiptNumber}
                                    onChange={handleReimbursementInputChange}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                />

                                <Typography sx={{ fontFamily: "'TTHoves-Medium', sans-serif", fontSize: "14px", mb: 1 }}>
                                    Description
                                </Typography>
                                <TextField
                                    placeholder="Describe the expense..."
                                    multiline
                                    rows={2}
                                    name="description"
                                    value={reimbursementData.description}
                                    onChange={handleReimbursementInputChange}
                                    fullWidth
                                    sx={{ mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    disabled={reimbursementSubmitting}
                                    fullWidth
                                    sx={{
                                        backgroundColor: "#172224",
                                        color: "#fff",
                                        py: 1.5,
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        "&:hover": { backgroundColor: "#1f2f31" },
                                        "&:disabled": { backgroundColor: "#ccc" }
                                    }}
                                >
                                    {reimbursementSubmitting ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </form>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default EmployeeDashboard;