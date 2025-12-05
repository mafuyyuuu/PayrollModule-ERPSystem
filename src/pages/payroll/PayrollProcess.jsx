/* eslint-disable no-unused-vars */
import React, {useState, useEffect} from "react";
import {
    Box,
    TextField,
    Typography,
    useTheme,
    Select,
    MenuItem,
    IconButton, Checkbox, Snackbar, Alert, Chip,
    Stepper, Step, StepLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Divider, Tooltip, Accordion, AccordionSummary, AccordionDetails, LinearProgress,
} from "@mui/material";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import {RiCheckFill, RiCloseFill, RiCloseLine, RiDownload2Line, RiEyeFill, RiCalculatorLine, RiSaveLine, RiArrowLeftLine, RiArrowRightLine, RiArrowDownSLine, RiMailSendLine, RiAlertLine, RiTimeLine} from "react-icons/ri";
import BoxModal from "../../components/BoxModal.jsx";
import {PayslipActions, PayslipDocument} from "../../components/PayslipPDF.jsx";
import {PDFViewer, pdf, PDFDownloadLink} from "@react-pdf/renderer";

const steps = ['Select Pay Period', 'Review Timesheets', 'Calculate Payroll', 'Review & Approve'];

export default function PayoutProcessing() {
    const theme = useTheme();

    // Step-based workflow state
    const [activeStep, setActiveStep] = useState(0);
    const [cutoffStartDate, setCutoffStartDate] = useState("");
    const [cutoffEndDate, setCutoffEndDate] = useState("");
    const [payDate, setPayDate] = useState("");
    const [timesheetData, setTimesheetData] = useState([]);
    const [calculatedPayrolls, setCalculatedPayrolls] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [filter, setFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedPayroll, setSelectedPayroll] = useState("");
    const [modalType, setModalType] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [rejectionReason, setRejectionReason] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [payrollHistory, setPayrollHistory] = useState([]);
    const [employeesProcess, setEmployeesProcess] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Period-based payroll data
    const [payrollPeriods, setPayrollPeriods] = useState([]);
    const [expandedPeriod, setExpandedPeriod] = useState(null);
    
    // Confirmation modal state
    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [downloadConfirmModalOpen, setDownloadConfirmModalOpen] = useState(false);
    const [emailConfirmModalOpen, setEmailConfirmModalOpen] = useState(false);
    const [pendingDownloadEmployee, setPendingDownloadEmployee] = useState(null);
    const [pendingEmailEmployees, setPendingEmailEmployees] = useState(null);
    const [error, setError] = useState(null);

    // Tab state for switching between new payroll and existing payroll
    const [currentTab, setCurrentTab] = useState(0); // 0 = Calculate New, 1 = Manage Existing

    // Filter options for status - Payroll processing statuses
    // Pending = calculated, awaiting review | Processed = reviewed, ready to release | Released = paid out | Rejected = needs recalculation
    const statusFilterOptions = [
        { value: '', label: 'All Status' },
        { value: 'Pending', label: 'Pending (Awaiting Review)' },
        { value: 'Processed', label: 'Processed (Ready to Release)' },
        { value: 'Released', label: 'Released (Paid)' },
        { value: 'Rejected', label: 'Rejected (Needs Review)' },
    ];

    // Urgency filter options
    const urgencyFilterOptions = [
        { value: '', label: 'All Urgency' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'urgent', label: 'Urgent (≤3 days)' },
        { value: 'soon', label: 'Soon (≤7 days)' },
        { value: 'normal', label: 'Normal' },
    ];

    const [urgencyFilter, setUrgencyFilter] = useState('');

    // Check if any filter is active
    const hasActiveFilters = filter || selectedPayroll || searchTerm || urgencyFilter;

    // Clear all filters
    const handleClearFilters = () => {
        setFilter("");
        setSelectedPayroll("");
        setSearchTerm("");
        setUrgencyFilter("");
    };

    // Fetch payroll cutoff periods
    useEffect(() => {
        const fetchPayrollHistory = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/payroll/cutoffs');
                if (!response.ok) throw new Error('Failed to fetch payroll history');

                const data = await response.json();
                const transformedData = data.map(cutoff => ({
                    id: cutoff.cutoff_id,
                    duration: `${new Date(cutoff.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${new Date(cutoff.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    amount: `₱${parseFloat(cutoff.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    status: cutoff.status,
                    ref: `REF${cutoff.cutoff_id}`
                }));
                setPayrollHistory(transformedData);
            } catch (err) {
                console.error('❌ Error fetching payroll history:', err);
                setPayrollHistory([
                    {id: 1, duration: "Nov 16–30, 2025", amount: "₱150,000.00", status: "Pending", ref: "REF001"},
                    {id: 2, duration: "Nov 1–15, 2025", amount: "₱145,000.00", status: "Processed", ref: "REF002"},
                ]);
            }
        };
        fetchPayrollHistory();
    }, []);

    // Fetch payroll data
    const fetchPayrollProcess = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/payroll/payroll');
            if (!response.ok) throw new Error('Failed to fetch payroll data');

            const data = await response.json();
            const transformedData = data.map(payroll => ({
                payrollId: payroll.payroll_id,
                id: `EMP-${String(payroll.employee_id).padStart(3, '0')}`,
                employeeId: payroll.employee_id,
                name: payroll.employee_name || `Employee ${payroll.employee_id}`,
                email: payroll.email || `employee${payroll.employee_id}@company.com`,
                earning: parseFloat(payroll.basic_pay) + parseFloat(payroll.overtime_pay || 0) + parseFloat(payroll.bonuses || 0),
                earningDisplay: `₱${(parseFloat(payroll.basic_pay) + parseFloat(payroll.overtime_pay || 0) + parseFloat(payroll.bonuses || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                deduction: parseFloat(payroll.deductions || 0),
                deductionDisplay: `₱${parseFloat(payroll.deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                netpay: parseFloat(payroll.net_pay || 0),
                netpayDisplay: `₱${parseFloat(payroll.net_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                status: payroll.status || "Pending",
                period: `${new Date(payroll.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${new Date(payroll.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                department: payroll.department || "N/A",
                position: payroll.position || "N/A",
                basicPay: parseFloat(payroll.basic_pay || 0),
                overtimePay: parseFloat(payroll.overtime_pay || 0),
                bonuses: parseFloat(payroll.bonuses || 0),
                comments: payroll.comments || "",
                updatedAt: payroll.updated_at ? new Date(payroll.updated_at) : new Date(payroll.created_at || 0),
                cutoffEndDate: new Date(payroll.cutoff_end_date)
            }))
            // Sort by most recent (updated_at or cutoff_end_date)
            .sort((a, b) => b.updatedAt - a.updatedAt || b.cutoffEndDate - a.cutoffEndDate);

            setEmployeesProcess(transformedData);
            setFilteredEmployees(transformedData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching payroll process:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    // Fetch payroll data grouped by period
    const fetchPayrollByPeriod = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/payroll/payroll-by-period');
            if (!response.ok) throw new Error('Failed to fetch payroll data');
            
            const data = await response.json();
            setPayrollPeriods(data);
            
            // Auto-expand the most urgent period
            if (data.length > 0 && !expandedPeriod) {
                setExpandedPeriod(data[0].periodKey);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching payroll by period:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrollProcess();
        fetchPayrollByPeriod();
    }, []);

    // Filter employees based on search and filter
    useEffect(() => {
        let filtered = employeesProcess;

        if (searchTerm) {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filter && filter !== 'all' && filter !== '') {
            // Filter by status only (status filter dropdown)
            filtered = filtered.filter(emp => emp.status === filter);
        }

        if (selectedPayroll) {
            filtered = filtered.filter(emp => emp.period === selectedPayroll);
        }

        setFilteredEmployees(filtered);
    }, [searchTerm, filter, selectedPayroll, employeesProcess]);

    // Filter periods based on urgency
    const filteredPeriods = payrollPeriods.filter(period => {
        if (urgencyFilter && period.urgency !== urgencyFilter) return false;
        if (selectedPayroll && period.periodName !== selectedPayroll) return false;
        return true;
    });

    // Get urgency color and icon
    const getUrgencyStyle = (urgency) => {
        switch (urgency) {
            case 'overdue': return { color: '#F44336', bg: 'rgba(244,67,54,0.1)', icon: <RiAlertLine /> };
            case 'urgent': return { color: '#FF9800', bg: 'rgba(255,152,0,0.1)', icon: <RiTimeLine /> };
            case 'soon': return { color: '#FFC107', bg: 'rgba(255,193,7,0.1)', icon: <RiTimeLine /> };
            default: return { color: '#4CAF50', bg: 'rgba(76,175,80,0.1)', icon: null };
        }
    };

    const handleClose = () => {
        setOpen(false);
        setRejectionReason("");
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedEmployees([...filteredEmployees]);
        } else {
            setSelectedEmployees([]);
        }
    };

    // API call to mark payslip as processed (reviewed and ready for release)
    const handleProcessPayslip = async (employee) => {
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/payroll/${employee.payrollId}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                // Refetch to ensure data consistency
                await fetchPayrollProcess();
                await fetchPayrollByPeriod();
                setSnackbar({ open: true, message: `Payslip marked as processed for ${employee.name}`, severity: 'success' });
            } else {
                throw new Error('Failed to process payslip');
            }
        } catch (err) {
            console.error('Error processing payslip:', err);
            setSnackbar({ open: true, message: `Failed to process payslip for ${employee.name}`, severity: 'error' });
        }
        setOpen(false);
    };

    // API call to reject payslip
    const handleRejectPayslip = async (employee, reason) => {
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/payroll/${employee.payrollId}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comments: reason })
            });

            if (response.ok) {
                // Refetch to ensure data consistency
                await fetchPayrollProcess();
                await fetchPayrollByPeriod();
                setSnackbar({ open: true, message: `Payslip rejected for ${employee.name}`, severity: 'warning' });
            } else {
                throw new Error('Failed to reject payslip');
            }
        } catch (err) {
            console.error('Error rejecting payslip:', err);
            setSnackbar({ open: true, message: `Failed to reject payslip for ${employee.name}`, severity: 'error' });
        }
        setOpen(false);
        setRejectionReason("");
    };

    // Bulk process selected payslips (mark as reviewed/processed)
    const handleBulkProcess = async () => {
        const pendingEmployees = selectedEmployees.filter(emp => emp.status === "Pending");
        if (pendingEmployees.length === 0) {
            setSnackbar({ open: true, message: 'No pending payslips selected', severity: 'warning' });
            return;
        }

        let successCount = 0;
        for (const emp of pendingEmployees) {
            try {
                const response = await fetch(`http://localhost:8080/api/payroll/payroll/${emp.payrollId}/approve`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    successCount++;
                }
            } catch (err) {
                console.error(`Error approving payslip for ${emp.name || emp.employeeName}:`, err);
            }
        }
        // Refetch to ensure data consistency
        await fetchPayrollProcess();
        await fetchPayrollByPeriod();
        setSelectedEmployees([]);
        setSnackbar({ open: true, message: `${successCount} payslips marked as processed`, severity: 'success' });
    };

    // Release processed payouts
    const handleReleasePayouts = async () => {
        // Only "Processed" status payslips can be released
        const processedEmployees = selectedEmployees.filter(emp => emp.status === "Processed");
        if (processedEmployees.length === 0) {
            setSnackbar({ open: true, message: 'No processed payslips to release. Mark payslips as processed first.', severity: 'warning' });
            return;
        }

        try {
            const payrollIds = processedEmployees.map(emp => emp.payrollId);
            const response = await fetch('http://localhost:8080/api/payroll/payroll-release', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payrollIds })
            });

            if (response.ok) {
                // Refetch to ensure data consistency
                await fetchPayrollProcess();
                await fetchPayrollByPeriod();
                setSnackbar({ open: true, message: `${processedEmployees.length} payouts released`, severity: 'success' });
            } else {
                throw new Error('Failed to release payouts');
            }
        } catch (err) {
            console.error('Error releasing payouts:', err);
            setSnackbar({ open: true, message: 'Failed to release payouts', severity: 'error' });
        }
        setSelectedEmployees([]);
        setOpen(false);
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "Processed": return "#4CAF50";  // Green - ready for release
            case "Released": return "#2196F3";   // Blue - paid out
            case "Rejected": return "#F44336";   // Red - needs review
            default: return "#FF9800";           // Orange - Pending
        }
    };

    // Step navigation
    const handleNext = () => {
        if (activeStep === 0 && (!cutoffStartDate || !cutoffEndDate || !payDate)) {
            setSnackbar({ open: true, message: 'Please fill in all date fields', severity: 'warning' });
            return;
        }
        if (activeStep === 1 && timesheetData.length === 0) {
            setSnackbar({ open: true, message: 'No timesheets found for the selected period', severity: 'warning' });
            return;
        }
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    // Fetch timesheets for selected period
    const fetchTimesheets = async () => {
        if (!cutoffStartDate || !cutoffEndDate) return;
        
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8080/api/payroll/timesheets-for-payroll?startDate=${cutoffStartDate}&endDate=${cutoffEndDate}`
            );
            if (!response.ok) throw new Error('Failed to fetch timesheets');
            
            const data = await response.json();
            setTimesheetData(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching timesheets:', err);
            setSnackbar({ open: true, message: 'Failed to fetch timesheets', severity: 'error' });
            setLoading(false);
        }
    };

    // Calculate payroll for all employees
    const handleCalculatePayroll = async () => {
        if (timesheetData.length === 0) {
            setSnackbar({ open: true, message: 'No timesheet data to calculate', severity: 'warning' });
            return;
        }
        
        try {
            setIsCalculating(true);
            const response = await fetch('http://localhost:8080/api/payroll/calculate-payroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employees: timesheetData,
                    cutoffStartDate,
                    cutoffEndDate,
                    payDate
                })
            });
            
            if (!response.ok) throw new Error('Failed to calculate payroll');
            
            const data = await response.json();
            setCalculatedPayrolls(data);
            setIsCalculating(false);
            setSnackbar({ open: true, message: `Payroll calculated for ${data.length} employees`, severity: 'success' });
            handleNext();
        } catch (err) {
            console.error('Error calculating payroll:', err);
            setSnackbar({ open: true, message: 'Failed to calculate payroll', severity: 'error' });
            setIsCalculating(false);
        }
    };

    // Show save confirmation modal
    const showSaveConfirmation = () => {
        if (calculatedPayrolls.length === 0) {
            setSnackbar({ open: true, message: 'No payroll data to save', severity: 'warning' });
            return;
        }
        setSaveConfirmModalOpen(true);
    };

    // Save calculated payroll to database
    const handleSavePayroll = async () => {
        setSaveConfirmModalOpen(false);
        
        try {
            setIsSaving(true);
            const response = await fetch('http://localhost:8080/api/payroll/save-payroll-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payrolls: calculatedPayrolls,
                    preparedBy: 4 // TODO: Get from auth context
                })
            });
            
            if (!response.ok) throw new Error('Failed to save payroll');
            
            const data = await response.json();
            setIsSaving(false);
            setSnackbar({ open: true, message: `${data.savedPayrolls.length} payroll records saved successfully`, severity: 'success' });
            
            // Reset and go back to existing payroll view
            setActiveStep(0);
            setCutoffStartDate("");
            setCutoffEndDate("");
            setPayDate("");
            setTimesheetData([]);
            setCalculatedPayrolls([]);
            await fetchPayrollProcess();
        } catch (err) {
            console.error('Error saving payroll:', err);
            setSnackbar({ open: true, message: 'Failed to save payroll', severity: 'error' });
            setIsSaving(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `₱${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    // Render step content
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ p: 2,}}>
                        <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary, fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                            Select Pay Period
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.primary}}>
                                    Cutoff Start Date
                                </Typography>
                                <TextField
                                    type="date"
                                    value={cutoffStartDate}
                                    onChange={(e) => setCutoffStartDate(e.target.value)}
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px",
                                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "#fff",
                                        },
                                        "& input::-webkit-calendar-picker-indicator": {
                                            filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                                        }
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.primary}}>
                                    Cutoff End Date
                                </Typography>
                                <TextField
                                    type="date"
                                    value={cutoffEndDate}
                                    onChange={(e) => setCutoffEndDate(e.target.value)}
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px",
                                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "#fff",
                                        },
                                        "& input::-webkit-calendar-picker-indicator": {
                                            filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                                        }
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.primary }}>
                                    Pay Date
                                </Typography>
                                <TextField
                                    type="date"
                                    value={payDate}
                                    onChange={(e) => setPayDate(e.target.value)}
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "12px",
                                            backgroundColor: theme.palette.mode === "dark" ? "rgba(251,251,251,0.05)" : "#fff",
                                        },
                                        "& input::-webkit-calendar-picker-indicator": {
                                            filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end'}}>
                            <ActionButton
                                sx={{
                                    width: "auto"
                                }}
                                text="Fetch Timesheets"
                                onClick={() => {
                                    fetchTimesheets();
                                    handleNext();
                                }}
                                disabled={!cutoffStartDate || !cutoffEndDate || !payDate}
                            />
                        </Box>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                            Review Timesheets ({timesheetData.length} employees)
                        </Typography>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} sx={{ borderRadius: '12px', maxHeight: '400px' }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Days Worked</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Regular Hours</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Overtime Hours</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Basic Rate</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {timesheetData.map((emp) => (
                                            <TableRow key={emp.employeeId} hover>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{emp.employeeName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{emp.employeeNumber}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{emp.department}</TableCell>
                                                <TableCell align="center">{emp.daysWorked}</TableCell>
                                                <TableCell align="center">{emp.totalRegularHours} hrs</TableCell>
                                                <TableCell align="center">{emp.totalOvertimeHours} hrs</TableCell>
                                                <TableCell align="right">{formatCurrency(emp.basicRate)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <ActionButton text="Back" onClick={handleBack} />
                            <ActionButton
                                text={isCalculating ? "Calculating..." : "Calculate Payroll"}
                                onClick={handleCalculatePayroll}
                                disabled={isCalculating || timesheetData.length === 0}
                                sx={{
                                    width: "auto"
                                }}
                            />
                        </Box>
                    </Box>
                );

            case 2:
                return (
                    <>
                        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                            Calculated Payroll ({calculatedPayrolls.length} employees)
                        </Typography>
                        <TableContainer
                            component={Paper}
                            sx={{
                                borderRadius: '12px',
                                maxHeight: '350px',
                                overflowY: "auto",

                                /* Hide scrollbar (Chrome, Edge, Safari) */
                                "&::-webkit-scrollbar": { display: "none" },

                                /* Hide scrollbar (Firefox) */
                                scrollbarWidth: "none",

                                /* Hide scrollbar (IE/Edge Legacy) */
                                msOverflowStyle: "none",
                            }}
                        >
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Basic Pay</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">OT Pay</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Gross</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">SSS</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">PhilHealth</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Pag-IBIG</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Tax</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Net Pay</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {calculatedPayrolls.map((payroll) => (
                                        <TableRow key={payroll.employeeId} hover>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{payroll.employeeName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{payroll.department}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.basicPay)}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.overtimePay)}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.grossPay)}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.deductions.sss)}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.deductions.philhealth)}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.deductions.pagibig)}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.deductions.tax)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                                {formatCurrency(payroll.netPay)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        
                        {/* Summary */}
                        <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "#f5f5f5", borderRadius: '12px' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, textAlign: 'center' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Total Gross</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(calculatedPayrolls.reduce((sum, p) => sum + p.grossPay, 0))}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Total Deductions</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                                        {formatCurrency(calculatedPayrolls.reduce((sum, p) => sum + p.deductions.total, 0))}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Total Net Pay</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                                        {formatCurrency(calculatedPayrolls.reduce((sum, p) => sum + p.netPay, 0))}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Employees</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {calculatedPayrolls.length}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <ActionButton text="Back" onClick={handleBack} />
                            <ActionButton
                                text={isSaving ? "Saving..." : "Save & Create Payroll Records"}
                                onClick={showSaveConfirmation}
                                disabled={isSaving || calculatedPayrolls.length === 0}
                                sx={{
                                    width: "auto"
                                }}
                            />
                        </Box>
                    </>
                );

            case 3:
                return (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ mb: 2, color: '#4CAF50', fontWeight: 'bold' }}>
                            ✓ Payroll Processing Complete
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                            All payroll records have been saved successfully.
                        </Typography>
                        <ActionButton text="Process New Payroll" onClick={() => setActiveStep(0)} />
                    </Box>
                );

            default:
                return null;
        }
    };

    const renderModalCards = () => {
        switch (modalType) {
            case "sendToEmails":
                // switch case sa pangkalahatan at isahan na employee
                return selectedEmployee && Array.isArray(selectedEmployee) ? (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                                mb: 2,
                                textAlign: "center"
                            }}
                        >
                            Send payslip emails to {selectedEmployee.length} employee(s)?
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#ccc", textAlign: "center", mb: 2 }}>
                            Emails will be sent to the employees registered email addresses.
                        </Typography>

                        <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                            {selectedEmployee.map((emp, idx) => (
                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Typography sx={{ color: '#fff', fontSize: '14px' }}>{emp.name || emp.employeeName}</Typography>
                                    <Typography sx={{ color: '#ccc', fontSize: '14px' }}>{emp.email || 'No email'}</Typography>
                                </Box>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                display: "flex", justifyContent: "center", gap: 2, mt: 3,
                            }}
                        >
                            <Box
                                onClick={async () => {
                                    if (!selectedEmployee || selectedEmployee.length === 0) {
                                        setSnackbar({ open: true, message: 'No employees selected', severity: 'warning' });
                                        return;
                                    }

                                    try {
                                        const payrollIds = selectedEmployee.map(emp => emp.payrollId).filter(Boolean);
                                        if (payrollIds.length === 0) {
                                            setSnackbar({ open: true, message: 'No valid payroll records selected', severity: 'warning' });
                                            return;
                                        }

                                        const response = await fetch('http://localhost:8080/api/payroll/send-payslip-emails', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ payrollIds })
                                        });

                                        const result = await response.json();
                                        
                                        if (response.ok) {
                                            setSnackbar({ 
                                                open: true, 
                                                message: `Sent ${result.results.sent.length} email(s)${result.results.failed.length > 0 ? `, ${result.results.failed.length} failed` : ''}`, 
                                                severity: result.results.failed.length > 0 ? 'warning' : 'success' 
                                            });
                                        } else {
                                            throw new Error(result.message || result.error || 'Failed to send emails');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        setSnackbar({ open: true, message: err.message || 'Failed to send payslips', severity: 'error' });
                                    }
                                    setOpen(false);
                                }}
                                component="button"
                                sx={{
                                    display: "flex-end",
                                    fontSize: "16px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "auto",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#1f2f31",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Send Emails
                            </Box>
                        </Box>
                    </>
                ) : null;

            case "downloadPayslip":
                return selectedEmployee ? (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                                mb: 2,
                            }}
                        >
                            Payslip for {selectedEmployee.name}
                        </Typography>

                        <PDFViewer 
                            width="100%" 
                            height={650} 
                            showToolbar={false}
                            style={{ border: "none" }}
                        >
                            <PayslipDocument employee={selectedEmployee}/>
                        </PDFViewer>

                        <Box sx={{mt: 2}}>
                            <PayslipActions 
                                employee={selectedEmployee}
                                onDownloadClick={() => {
                                    setPendingDownloadEmployee(selectedEmployee);
                                    setDownloadConfirmModalOpen(true);
                                }}
                            />
                        </Box>
                    </>
                ) : null;

            case "releasePayouts":
                const releaseableCount = selectedEmployees.filter(emp => emp.status === "Processed").length;
                return (
                    <>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: "24px",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: "#fff",
                                mb: 1
                            }}
                        >
                            Release {releaseableCount} payout(s)?
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: "#fff",
                                mb: 2
                            }}
                        >
                            This will mark them as released and ready for disbursement.
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 1 }}>
                            <Box
                                onClick={handleReleasePayouts}
                                component="button"
                                sx={{
                                    fontSize: "16px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "auto",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#1f2f31",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Confirm Release
                            </Box>
                        </Box>
                    </>
                );

            case "processPayslip":
                return selectedEmployee ? (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                                textAlign: "center"
                            }}
                        >
                            Mark payslip as processed for {selectedEmployee.name}?
                        </Typography>
                        <Typography variant="body2" sx={{color: "#ccc", textAlign: "center", mt: 1}}>
                            This confirms the payroll calculation has been reviewed and is ready for release.
                        </Typography>
                        <Box sx={{mt: 2, p: 2, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "8px"}}>
                            <Typography variant="body2" sx={{color: "#ccc"}}>
                                Net Pay: {selectedEmployee.netpayDisplay}
                            </Typography>
                            <Typography variant="body2" sx={{color: "#ccc"}}>
                                Period: {selectedEmployee.period}
                            </Typography>
                        </Box>

                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={() => handleProcessPayslip(selectedEmployee)}
                                component="button"
                                sx={{
                                    fontSize: "16px",
                                    backgroundColor: "#388E3C",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "auto",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#2E7D32",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Mark as Processed
                            </Box>
                        </Box>
                    </>
                ) : null;

            case "rejectPayslip":
                return selectedEmployee ? (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                            }}
                        >
                            Reject payslip for {selectedEmployee.name}?
                        </Typography>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#FFFFFF",
                                    fontSize: "18px",
                                }}
                            >
                                Reason for Rejection
                            </Typography>
                            <TextField
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                multiline
                                rows={3}
                                placeholder="Type reason here..."
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": {border: "none"},
                                    },
                                    "& .MuiInputBase-input": {fontSize: "16px"},
                                }}
                            />
                        </Box>

                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={() => {
                                    if (!rejectionReason || rejectionReason.trim() === "") {
                                        setSnackbar({ open: true, message: "Please enter a reason for rejection.", severity: 'error' });
                                        return;
                                    }
                                    handleRejectPayslip(selectedEmployee, rejectionReason);
                                }}
                                component="button"
                                sx={{
                                    fontSize: "16px",
                                    backgroundColor: "#D32F2F",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "auto",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#B71C1C",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Reject
                            </Box>
                        </Box>
                    </>
                ) : null;

            case "viewRejection":
                return selectedEmployee ? (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                                mb: 2
                            }}
                        >
                            Rejection Reason for {selectedEmployee.name}
                        </Typography>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <TextField
                                value={selectedEmployee.comments || "No reason provided"}
                                InputProps={{readOnly: true}}
                                multiline
                                rows={4}
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": {border: "none"},
                                    },
                                    "& .MuiInputBase-input": {fontSize: "16px"},
                                }}
                            />
                        </Box>
                    </>
                ) : null;

            default:
                return <Typography sx={{color: "#fff"}}>No data available</Typography>;
        }
    };

    return (
        <Box
            sx={{width: "100%", height: "100%", fontFamily: theme.typography.fontFamily}}
        >
            {/* Header with Tabs */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                        mb: 2,
                    }}
                >
                    Payroll Processing
                </Typography>
                
                {/* Tab Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box
                            onClick={() => setCurrentTab(0)}
                            sx={{
                                px: 3,
                                py: 1.5,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                backgroundColor: currentTab === 0 
                                    ? (theme.palette.mode === 'dark' ? 'rgba(31, 40, 41, 0.9)' : 'rgba(23, 34, 36, 0.9)')
                                    : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)'),
                                backdropFilter: "blur(8px)",
                                color: currentTab === 0 ? '#fff' : theme.palette.text.primary,
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                boxShadow: currentTab === 0 ? '0 4px 15px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                                border: `1px solid ${currentTab === 0 ? 'transparent' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                }
                            }}
                        >
                            <RiCalculatorLine size={18} />
                            Calculate New Payroll
                        </Box>
                        <Box
                            onClick={() => setCurrentTab(1)}
                            sx={{
                                px: 3,
                                py: 1.5,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                backgroundColor: currentTab === 1 
                                    ? (theme.palette.mode === 'dark' ? 'rgba(31, 40, 41, 0.9)' : 'rgba(23, 34, 36, 0.9)')
                                    : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)'),
                                backdropFilter: "blur(8px)",
                                color: currentTab === 1 ? '#fff' : theme.palette.text.primary,
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                boxShadow: currentTab === 1 ? '0 4px 15px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                                border: `1px solid ${currentTab === 1 ? 'transparent' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                }
                            }}
                        >
                            <RiEyeFill size={18} />
                            Manage Existing Payroll
                        </Box>
                    </Box>

                    {/* Filters - only show for Manage Existing tab */}
                    {currentTab === 1 && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <SearchBar 
                                placeholder="Search employee..." 
                                width="250px"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <FilterSelect
                                value={urgencyFilter}
                                onChange={(e) => setUrgencyFilter(e.target.value)}
                                options={urgencyFilterOptions}
                                placeholder="Filter by Urgency"
                                width={180}
                            />

                            <FilterSelect
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                options={statusFilterOptions}
                                placeholder="Filter by Status"
                                width={180}
                            />

                            {/* Clear filters button */}
                            {hasActiveFilters && (
                                <Chip
                                    label="Clear Filters"
                                    onDelete={handleClearFilters}
                                    deleteIcon={<RiCloseLine />}
                                    sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        '& .MuiChip-deleteIcon': {
                                            color: theme.palette.primary.contrastText,
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Tab Content */}
            {currentTab === 0 ? (
                /* Calculate New Payroll Tab */
                <Box
                    sx={{
                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgb(209,210,210)",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: "15px",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        p: 6,
                        height: '630px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        }
                    }}
                >
                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label, index) => (
                            <Step key={label}>
                                <StepLabel
                                    sx={{
                                        '& .MuiStepLabel-label': {
                                            color: theme.palette.text.primary,
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        },
                                        '& .MuiStepIcon-root.Mui-active': {
                                            color: '#4CAF50',
                                        },
                                        '& .MuiStepIcon-root.Mui-completed': {
                                            color: '#4CAF50',
                                        },
                                    }}
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Step Content */}
                    {renderStepContent(activeStep)}
                </Box>
            ) : (
                /* Manage Existing Payroll Tab - Period-Based View */
                <>
                    {error && (
                        <Box sx={{ color: 'error.main', p: 2, textAlign: 'center', mb: 2 }}>
                            Error: {error}
                        </Box>
                    )}

                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.primary }}>
                            <CircularProgress size={40} sx={{ mb: 2 }} />
                            <Typography>Loading payroll data...</Typography>
                        </Box>
                    ) : filteredPeriods.length === 0 ? (
                        <Box sx={{ 
                            p: 4, 
                            textAlign: 'center', 
                            color: theme.palette.text.secondary,
                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.7)",
                            borderRadius: "15px",
                            backdropFilter: "blur(12px)",
                            border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                        }}>
                            <Typography>No payroll records found.</Typography>
                        </Box>
                    ) : (
                        /* Period Accordions */
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', pb: 2, scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                            {filteredPeriods.map((period) => {
                                const urgencyStyle = getUrgencyStyle(period.urgency);
                                const progressPercent = period.stats.total > 0 
                                    ? ((period.stats.processed + period.stats.released) / period.stats.total) * 100 
                                    : 0;

                                // Filter payrolls within this period
                                let periodPayrolls = period.payrolls;
                                if (searchTerm) {
                                    periodPayrolls = periodPayrolls.filter(p => 
                                        p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        p.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                }
                                if (filter) {
                                    periodPayrolls = periodPayrolls.filter(p => p.status === filter);
                                }

                                if (periodPayrolls.length === 0 && (searchTerm || filter)) return null;

                                return (
                                    <Accordion
                                        key={period.periodKey}
                                        expanded={expandedPeriod === period.periodKey}
                                        onChange={() => setExpandedPeriod(expandedPeriod === period.periodKey ? null : period.periodKey)}
                                        sx={{
                                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.7)",
                                            borderRadius: "15px !important",
                                            border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
                                            backdropFilter: "blur(12px)",
                                            '&:before': { display: 'none' },
                                            boxShadow: expandedPeriod === period.periodKey 
                                                ? `0 8px 32px ${urgencyStyle.color}25` 
                                                : "0 4px 15px rgba(0,0,0,0.08)",
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: expandedPeriod === period.periodKey ? 'none' : 'translateY(-2px)',
                                                boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                                            }
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<RiArrowDownSLine style={{ fontSize: 24, color: theme.palette.text.primary }} />}
                                            sx={{ 
                                                borderRadius: "15px",
                                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                                                {/* Urgency Indicator */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 1,
                                                    backgroundColor: urgencyStyle.bg,
                                                    color: urgencyStyle.color,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                }}>
                                                    {urgencyStyle.icon}
                                                    {period.daysUntilPayDate <= 0 
                                                        ? 'OVERDUE' 
                                                        : period.daysUntilPayDate === 1 
                                                            ? '1 day left'
                                                            : `${period.daysUntilPayDate} days left`}
                                                </Box>

                                                {/* Period Name */}
                                                <Typography sx={{ 
                                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                                    fontSize: '16px',
                                                    color: theme.palette.text.primary,
                                                    flex: 1,
                                                }}>
                                                    {period.periodName}
                                                </Typography>

                                                {/* Pay Date */}
                                                <Typography sx={{ 
                                                    fontSize: '14px',
                                                    color: theme.palette.text.secondary,
                                                }}>
                                                    Pay Date: {new Date(period.payDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Typography>

                                                {/* Stats */}
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Chip size="small" label={`${period.stats.pending} Pending`} sx={{ backgroundColor: '#FF980020', color: '#FF9800' }} />
                                                    <Chip size="small" label={`${period.stats.processed} Processed`} sx={{ backgroundColor: '#4CAF5020', color: '#4CAF50' }} />
                                                    <Chip size="small" label={`${period.stats.released} Released`} sx={{ backgroundColor: '#2196F320', color: '#2196F3' }} />
                                                    {period.stats.rejected > 0 && (
                                                        <Chip size="small" label={`${period.stats.rejected} Rejected`} sx={{ backgroundColor: '#F4433620', color: '#F44336' }} />
                                                    )}
                                                </Box>

                                                {/* Total Amount */}
                                                <Typography sx={{ 
                                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                                    fontSize: '16px',
                                                    color: '#4CAF50',
                                                }}>
                                                    ₱{period.stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ p: 2 }}>
                                            {/* Progress Bar */}
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                        Processing Progress
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                        {Math.round(progressPercent)}% Complete
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={progressPercent} 
                                                    sx={{ 
                                                        height: 8, 
                                                        borderRadius: 4,
                                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: progressPercent === 100 ? '#4CAF50' : '#2196F3',
                                                            borderRadius: 4,
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {/* Employee Table Header */}
                                            <Box sx={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: '40px 100px 1.5fr 1fr 1fr 1fr 1fr 100px 120px',
                                                gap: 1,
                                                p: 1,
                                                backgroundColor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
                                                borderRadius: '8px',
                                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                                fontSize: '12px',
                                                color: theme.palette.text.secondary,
                                                mb: 1,
                                            }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={periodPayrolls.length > 0 && periodPayrolls.every(emp => selectedEmployees.some(e => e.payrollId === emp.payrollId))}
                                                    indeterminate={periodPayrolls.some(emp => selectedEmployees.some(e => e.payrollId === emp.payrollId)) && !periodPayrolls.every(emp => selectedEmployees.some(e => e.payrollId === emp.payrollId))}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            // Add all period payrolls that aren't already selected
                                                            const newSelections = periodPayrolls
                                                                .filter(emp => !selectedEmployees.some(e => e.payrollId === emp.payrollId))
                                                                .map(emp => ({ ...emp, name: emp.employeeName }));
                                                            setSelectedEmployees(prev => [...prev, ...newSelections]);
                                                        } else {
                                                            // Remove all period payrolls from selection
                                                            const periodPayrollIds = periodPayrolls.map(p => p.payrollId);
                                                            setSelectedEmployees(prev => prev.filter(e => !periodPayrollIds.includes(e.payrollId)));
                                                        }
                                                    }}
                                                    sx={{ p: 0 }}
                                                />
                                                <span>Employee ID</span>
                                                <span>Name</span>
                                                <span>Department</span>
                                                <span style={{ textAlign: 'right' }}>Gross Pay</span>
                                                <span style={{ textAlign: 'right' }}>Deductions</span>
                                                <span style={{ textAlign: 'right' }}>Net Pay</span>
                                                <span style={{ textAlign: 'center' }}>Status</span>
                                                <span style={{ textAlign: 'center' }}>Actions</span>
                                            </Box>

                                            {/* Employee Rows */}
                                            <Box sx={{ maxHeight: '300px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                                                {periodPayrolls.map((emp) => (
                                                    <Box 
                                                        key={emp.payrollId}
                                                        sx={{ 
                                                            display: 'grid', 
                                                            gridTemplateColumns: '40px 100px 1.5fr 1fr 1fr 1fr 1fr 100px 120px',
                                                            gap: 1,
                                                            p: 1.5,
                                                            backgroundColor: '#fff',
                                                            borderRadius: '8px',
                                                            mb: 1,
                                                            alignItems: 'center',
                                                            fontSize: '14px',
                                                            color: '#1b2223',
                                                            transition: 'all 0.2s ease',
                                                            cursor: "pointer",
                                                            '&:hover': {
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                backgroundColor: "#ecebeb"
                                                            }
                                                        }}
                                                    >
                                                        <Checkbox
                                                            size="small"
                                                            checked={selectedEmployees.some(e => e.payrollId === emp.payrollId)}
                                                            onChange={() => {
                                                                setSelectedEmployees(prev =>
                                                                    prev.some(e => e.payrollId === emp.payrollId)
                                                                        ? prev.filter(e => e.payrollId !== emp.payrollId)
                                                                        : [...prev, { ...emp, name: emp.employeeName }]
                                                                );
                                                            }}
                                                            sx={{ p: 0 }}
                                                        />
                                                        <span style={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>{emp.employeeNumber}</span>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>{emp.employeeName}</Typography>
                                                            {emp.waitingDays > 0 && (
                                                                <Typography sx={{ fontSize: '11px', color: '#999' }}>
                                                                    Waiting {emp.waitingDays} day(s)
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <span>{emp.department}</span>
                                                        <span style={{ textAlign: 'right' }}>₱{emp.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                        <span style={{ textAlign: 'right', color: '#d32f2f' }}>-₱{emp.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                        <span style={{ textAlign: 'right', fontWeight: 'bold', color: '#4CAF50' }}>₱{emp.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Chip 
                                                                size="small" 
                                                                label={emp.status}
                                                                sx={{ 
                                                                    backgroundColor: `${getStatusColor(emp.status)}20`,
                                                                    color: getStatusColor(emp.status),
                                                                    fontWeight: 'bold',
                                                                    fontSize: '11px',
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                            {emp.status === "Pending" && (
                                                                <>
                                                                    <Tooltip title="Mark as Processed">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                setSelectedEmployee({ ...emp, name: emp.employeeName, netpayDisplay: `₱${emp.netPay.toLocaleString()}`, period: period.periodName });
                                                                                setModalType("processPayslip");
                                                                                setOpen(true);
                                                                            }}
                                                                            sx={{ backgroundColor: '#E8F5E9', color: '#4CAF50', '&:hover': { backgroundColor: '#4CAF50', color: '#fff' } }}
                                                                        >
                                                                            <RiCheckFill size={16} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Reject">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                setSelectedEmployee({ ...emp, name: emp.employeeName });
                                                                                setRejectionReason("");
                                                                                setModalType("rejectPayslip");
                                                                                setOpen(true);
                                                                            }}
                                                                            sx={{ backgroundColor: '#FFEBEE', color: '#F44336', '&:hover': { backgroundColor: '#F44336', color: '#fff' } }}
                                                                        >
                                                                            <RiCloseFill size={16} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                            {emp.status === "Rejected" && (
                                                                <Tooltip title="View Rejection">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => {
                                                                            setSelectedEmployee({ ...emp, name: emp.employeeName });
                                                                            setModalType("viewRejection");
                                                                            setOpen(true);
                                                                        }}
                                                                        sx={{ backgroundColor: '#FFF3E0', color: '#FF9800' }}
                                                                    >
                                                                        <RiEyeFill size={16} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {(emp.status === "Processed" || emp.status === "Released") && (
                                                                <>
                                                                    <Tooltip title="View Payslip">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                setSelectedEmployee({ ...emp, name: emp.employeeName, netpayDisplay: `₱${emp.netPay.toLocaleString()}`, earningDisplay: `₱${emp.grossPay.toLocaleString()}`, deductionDisplay: `₱${emp.deductions.toLocaleString()}` });
                                                                                setModalType("downloadPayslip");
                                                                                setOpen(true);
                                                                            }}
                                                                            sx={{ backgroundColor: '#E3F2FD', color: '#2196F3', '&:hover': { backgroundColor: '#2196F3', color: '#fff' } }}
                                                                        >
                                                                            <RiDownload2Line size={16} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Send Email">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                setPendingEmailEmployees([{ ...emp, name: emp.employeeName }]);
                                                                                setEmailConfirmModalOpen(true);
                                                                            }}
                                                                            sx={{ backgroundColor: '#F3E5F5', color: '#9C27B0', '&:hover': { backgroundColor: '#9C27B0', color: '#fff' } }}
                                                                        >
                                                                            <RiMailSendLine size={16} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </Box>
                    )}

                    {/* Bulk Action Buttons */}
                    <Box display="flex" justifyContent="flex-end" gap="15px" mt="10px" mb="20px">
                        <ActionButton
                            text={`Mark as Processed (${selectedEmployees.filter(e => e.status === "Pending").length})`}
                            width="220px"
                            onClick={handleBulkProcess}
                            disabled={selectedEmployees.filter(e => e.status === "Pending").length === 0}
                        />
                        <ActionButton
                            text={`Release Payouts (${selectedEmployees.filter(e => e.status === "Processed").length})`}
                            width="200px"
                            onClick={() => {
                                const releaseableCount = selectedEmployees.filter(emp => emp.status === "Processed").length;
                                if (releaseableCount === 0) {
                                    setSnackbar({ open: true, message: 'No processed payslips to release. Mark payslips as processed first.', severity: 'warning' });
                                    return;
                                }
                                setModalType("releasePayouts");
                                setOpen(true);
                            }}
                        />
                        <ActionButton
                            onClick={() => {
                                const emailableEmployees = selectedEmployees.filter(e => e.status === "Processed" || e.status === "Released");
                                if (emailableEmployees.length === 0) {
                                    setSnackbar({ open: true, message: "Select processed or released payslips to send emails.", severity: 'warning' });
                                    return;
                                }
                                setPendingEmailEmployees(emailableEmployees);
                                setEmailConfirmModalOpen(true);
                            }}
                            text={`Send to Emails (${selectedEmployees.filter(e => e.status === "Processed" || e.status === "Released").length})`}
                            width="200px"
                        />
                    </Box>
                </>
            )}

            <BoxModal
                open={open}
                onClose={handleClose}
            >
                {renderModalCards()}
            </BoxModal>

            {/* Save Confirmation Modal */}
            <BoxModal
                open={saveConfirmModalOpen}
                onClose={() => setSaveConfirmModalOpen(false)}
                width={450}
            >
                <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "24px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 1
                        }}
                    >
                        Confirm Save Payroll
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 2
                        }}
                    >
                        Are you sure you want to save {calculatedPayrolls.length} payroll record(s)? This action will create official payroll entries in the system.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                        <Box
                            component="button"
                            onClick={() => setSaveConfirmModalOpen(false)}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#a0a0a0" }
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            component="button"
                            onClick={handleSavePayroll}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#172224",
                                color: "#fff",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#1f2f31" }
                            }}
                        >
                            Confirm
                        </Box>
                    </Box>
                </Box>
            </BoxModal>

            {/* Download Payslip Confirmation Modal */}
            <BoxModal
                open={downloadConfirmModalOpen}
                onClose={() => setDownloadConfirmModalOpen(false)}
                width={400}
            >
                <Box sx={{ textAlign: "center" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "24px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 1
                        }}
                    >
                        Download Payslip
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 2
                        }}
                    >
                        Are you sure you want to download the payslip for {pendingDownloadEmployee?.name}?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                        <Box
                            component="button"
                            onClick={() => setDownloadConfirmModalOpen(false)}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#a0a0a0" }
                            }}
                        >
                            Cancel
                        </Box>
                        {pendingDownloadEmployee && (
                            <Box
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#1f2f31" }
                                }}
                            >
                                <PDFDownloadLink
                                    document={<PayslipDocument employee={pendingDownloadEmployee} />}
                                    fileName={`${pendingDownloadEmployee.name}.pdf`}
                                    style={{
                                        color: "#fff",
                                        textDecoration: "none",
                                    }}
                                    onClick={() => setDownloadConfirmModalOpen(false)}
                                >
                                    {({ loading }) => (loading ? "Generating..." : "Download")}
                                </PDFDownloadLink>
                            </Box>
                        )}
                    </Box>
                </Box>
            </BoxModal>

            {/* Send Email Confirmation Modal */}
            <BoxModal
                open={emailConfirmModalOpen}
                onClose={() => setEmailConfirmModalOpen(false)}
                width={400}
            >
                <Box sx={{ textAlign: "center" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "24px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 1
                        }}
                    >
                        Send to Email
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 2
                        }}
                    >
                        {pendingEmailEmployees?.length === 1 
                            ? `Are you sure you want to send the payslip to ${pendingEmailEmployees[0]?.name}'s email?`
                            : `Are you sure you want to send payslips to ${pendingEmailEmployees?.length} employees' emails?`}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, alignContent:"center"}}>
                        <Box
                            component="button"
                            onClick={() => setEmailConfirmModalOpen(false)}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#a0a0a0" }
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            component="button"
                            onClick={() => {
                                setEmailConfirmModalOpen(false);
                                setSelectedEmployee(pendingEmailEmployees);
                                setModalType("sendToEmails");
                                setOpen(true);
                            }}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#172224",
                                color: "#fff",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#1f2f31" }
                            }}
                        >
                            Send
                        </Box>
                    </Box>
                </Box>
            </BoxModal>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}