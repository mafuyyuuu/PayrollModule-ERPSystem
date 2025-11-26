import React, {useState, useEffect} from "react";
import {
    Box,
    TextField,
    Typography,
    useTheme,
    Select,
    MenuItem,
    IconButton, Checkbox, Snackbar, Alert, Chip,
} from "@mui/material";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import {RiCheckFill, RiCloseFill, RiCloseLine, RiDownload2Line, RiEyeFill} from "react-icons/ri";
import BoxModal from "../../components/BoxModal.jsx";
import {PayslipActions, PayslipDocument} from "../../components/PayslipPDF.jsx";
import {PDFViewer, pdf} from "@react-pdf/renderer";

export default function PayoutProcessing() {
    const theme = useTheme();

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
    const [error, setError] = useState(null);

    // Filter options for status
    const statusFilterOptions = [
        { value: '', label: 'All Status' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Released', label: 'Released' },
        { value: 'Rejected', label: 'Rejected' },
    ];

    // Check if any filter is active
    const hasActiveFilters = filter || selectedPayroll || searchTerm;

    // Clear all filters
    const handleClearFilters = () => {
        setFilter("");
        setSelectedPayroll("");
        setSearchTerm("");
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
            console.error('❌ Error fetching payroll process:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrollProcess();
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

        if (filter && filter !== 'all') {
            filtered = filtered.filter(emp => emp.status === filter || emp.department === filter);
        }

        if (selectedPayroll) {
            filtered = filtered.filter(emp => emp.period === selectedPayroll);
        }

        setFilteredEmployees(filtered);
    }, [searchTerm, filter, selectedPayroll, employeesProcess]);

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

    // API call to approve payslip
    const handleApprovePayslip = async (employee) => {
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/payroll/${employee.payrollId}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                // Refetch to ensure data consistency
                await fetchPayrollProcess();
                setSnackbar({ open: true, message: `Payslip approved for ${employee.name}`, severity: 'success' });
            } else {
                throw new Error('Failed to approve payslip');
            }
        } catch (err) {
            console.error('Error approving payslip:', err);
            setSnackbar({ open: true, message: `Failed to approve payslip for ${employee.name}`, severity: 'error' });
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

    // Bulk approve selected payslips
    const handleBulkApprove = async () => {
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
                console.error(`Error approving payslip for ${emp.name}:`, err);
            }
        }
        // Refetch to ensure data consistency
        await fetchPayrollProcess();
        setSelectedEmployees([]);
        setSnackbar({ open: true, message: `${successCount} payslips approved`, severity: 'success' });
    };

    // Release approved payouts
    const handleReleasePayouts = async () => {
        const approvedEmployees = selectedEmployees.filter(emp => emp.status === "Approved");
        if (approvedEmployees.length === 0) {
            setSnackbar({ open: true, message: 'No approved payslips to release', severity: 'warning' });
            return;
        }

        try {
            const payrollIds = approvedEmployees.map(emp => emp.payrollId);
            const response = await fetch('http://localhost:8080/api/payroll/payroll-release', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payrollIds })
            });

            if (response.ok) {
                // Refetch to ensure data consistency
                await fetchPayrollProcess();
                setSnackbar({ open: true, message: `${approvedEmployees.length} payouts released`, severity: 'success' });
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
            case "Approved": return "#4CAF50";
            case "Released": return "#2196F3";
            case "Rejected": return "#F44336";
            case "Processing": return "#FF9800";
            default: return "#FFC107"; // Pending
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
                            {selectedEmployee[0].department
                                ? `Are you sure you want to send emails to the employees in the ${selectedEmployee[0].department} department?`
                                : `Are you sure you want to send payslip to selected employees?`}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex", justifyContent: "center", gap: 2, mt: 3,
                            }}
                        >
                            <Box
                                onClick={async () => {
                                    if (!selectedEmployee || selectedEmployee.length === 0) return alert("No employees selected");

                                    try {
                                        for (let emp of selectedEmployee) {
                                            const blob = await pdf(<PayslipDocument employee={emp}/>).toBlob();
                                            const formData = new FormData();
                                            formData.append("file", blob, `${emp.name}.pdf`);
                                            formData.append("email", emp.email || "test@example.com");

                                            await fetch("http://localhost:8080/api/send-payslip", {
                                                method: "POST",
                                                body: formData
                                            });
                                        }

                                        alert(`Payslips sent to ${selectedEmployee.length} employee(s)!`);
                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to send payslips.");
                                    }
                                }}
                                component="button"
                                sx={{
                                    display: "flex-end",
                                    fontSize: "16px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#1f2f31",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Send
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

                        <PDFViewer width="100%" height={600} showToolbar={false}>
                            <PayslipDocument employee={selectedEmployee}/>
                        </PDFViewer>

                        <Box sx={{mt: 2}}>
                            <PayslipActions employee={selectedEmployee}/>
                        </Box>
                    </>
                ) : null;

            case "releasePayouts":
                const approvedCount = selectedEmployees.filter(emp => emp.status === "Approved").length;
                return (
                    <>
                        <Typography
                            variant="h5"
                            sx={{color: "#fff", fontFamily: "'TTHoves-Bold', sans-serif", textAlign: "center"}}
                        >
                            Release {approvedCount} approved payout(s)?
                        </Typography>
                        <Typography variant="body2" sx={{color: "#ccc", textAlign: "center", mt: 1}}>
                            This will mark them as released and ready for disbursement.
                        </Typography>

                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={handleReleasePayouts}
                                component="button"
                                sx={{
                                    fontSize: "16px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
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

            case "acceptPayslip":
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
                            Approve payslip for {selectedEmployee.name}?
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
                                onClick={() => handleApprovePayslip(selectedEmployee)}
                                component="button"
                                sx={{
                                    fontSize: "16px",
                                    backgroundColor: "#388E3C",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#2E7D32",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Approve
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
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
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
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 3,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                    }}
                >
                    Payout Processing
                </Typography>

                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                    }}
                >
                    <SearchBar 
                        placeholder="Search employee..." 
                        width="300px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <FilterSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        options={statusFilterOptions}
                        placeholder="Filter by Status"
                        width={180}
                    />

                    <Box
                        sx={{
                            display: "inline-block",
                            borderRadius: "15px",
                            transition: "box-shadow 0.3s ease, transform 0.3s ease",
                            "&:hover": {
                                boxShadow: "0 3px 10px rgba(0,0,0,0.2)", transform: "translateY(-2px)",
                            },
                        }}
                    >
                        <Select
                            value={selectedPayroll}
                            onChange={(e) => setSelectedPayroll(e.target.value)}
                            displayEmpty
                            sx={{
                                backgroundColor:
                                    theme.palette.mode === "dark"
                                        ? "rgba(255, 255, 255, 0.05)"
                                        : "rgba(255, 255, 255, 0.3)",
                                borderRadius: "15px",
                                width: "220px",
                                fontSize: "16px",
                                color: theme.palette.text.primary,
                                "& .MuiSelect-select": {
                                    padding: "8px 12px",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: theme.palette.divider,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: theme.palette.divider,
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                },
                                "& .MuiSvgIcon-root": {
                                    color: theme.palette.text.primary,
                                },
                            }}
                            renderValue={(selected) => {
                                if (!selected)
                                    return (
                                        <span style={{fontSize: "16px", color: "#bdbdbd"}}>
                                            Select Pay Period
                                        </span>
                                    );
                                return selected;
                            }}
                        >
                            <MenuItem value="">
                                <em>All Periods</em>
                            </MenuItem>
                            {payrollHistory.map((item) => (
                                <MenuItem key={item.ref} value={item.duration}>
                                    {item.duration}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

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
            </Box>

            <Box
                sx={{
                    height: "80%",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                        transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    <Checkbox
                        checked={selectedEmployees.length === employeesProcess.length && employeesProcess.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                            p: 0,
                            mr: "10px",
                            color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                            borderRadius: "5px",
                            "&.Mui-checked": {
                                color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                            },
                            "& .MuiSvgIcon-root": {fontSize: 25},
                        }}
                    />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            color: theme.palette.text.primary,
                            fontWeight: 700,
                            p: "8px 0",
                            width: "100%",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <span style={{paddingLeft: "15px", textAlign: "left"}}>Employee ID</span>
                        <span>Employee Name</span>
                        <span>Department</span>
                        <span>Earning</span>
                        <span>Deduction</span>
                        <span>Netpay</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </Box>
                </Box>

                {error && (
                    <Box sx={{ color: 'error.main', p: 2, textAlign: 'center' }}>
                        Error: {error}
                    </Box>
                )}

                {loading ? (
                    <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.text.primary }}>
                        Loading payroll data...
                    </Box>
                ) : (
                <Box
                    sx={{
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {width: 0, height: 0},
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        mt: "8px",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    {filteredEmployees.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                            No payroll records found.
                        </Box>
                    ) : (
                    filteredEmployees.map((item, index) => (
                        <Box
                            key={item.payrollId || index}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
                            <Checkbox
                                checked={selectedEmployees.some(emp => emp.payrollId === item.payrollId)}
                                onChange={() => {
                                    setSelectedEmployees((prev) =>
                                        prev.some(emp => emp.payrollId === item.payrollId)
                                            ? prev.filter((e) => e.payrollId !== item.payrollId)
                                            : [...prev, item]
                                    );
                                }}
                                sx={{
                                    p: 0,
                                    mr: "10px",
                                    color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                    borderRadius: "5px",
                                    "&.Mui-checked": {
                                        color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                    },
                                    "& .MuiSvgIcon-root": {fontSize: 25},
                                }}
                            />

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(8, 1fr)",
                                    alignItems: "center",
                                    textAlign: "center",
                                    bgcolor: "#fff",
                                    color: "#1b2223",
                                    borderRadius: "8px",
                                    width: "100%",
                                    minHeight: "80px",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                }}
                            >
                                <span style={{paddingLeft: "15px", textAlign: "left"}}>{item.id}</span>
                                <span>{item.name}</span>
                                <span>{item.department}</span>
                                <span>{item.earningDisplay}</span>
                                <span>{item.deductionDisplay}</span>
                                <span>{item.netpayDisplay}</span>
                                <span
                                    style={{
                                        fontFamily: "'TTHoves-Bold', sans-serif",
                                        color: getStatusColor(item.status),
                                        fontWeight: 500,
                                    }}
                                >
                                    {item.status}
                                </span>

                                <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                    {/* Pending status - show approve/reject buttons */}
                                    {(item.status === "Pending" || item.status === "Processing") && (
                                        <>
                                            <IconButton
                                                disableRipple
                                                onClick={() => {
                                                    setSelectedEmployee(item);
                                                    setModalType("acceptPayslip");
                                                    setOpen(true);
                                                }}
                                                sx={{
                                                    backgroundColor: "#172224",
                                                    color: "green",
                                                    width: 40,
                                                    height: 36,
                                                    borderRadius: "50%",
                                                    transition: "all 0.2s ease",
                                                    "&:hover": {
                                                        backgroundColor: "#388E3C",
                                                        color: "#fff",
                                                        transform: "translateY(-3px)",
                                                    },
                                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                                }}
                                            >
                                                <RiCheckFill style={{fontSize: 20, transform: "scale(1.2)"}}/>
                                            </IconButton>

                                            <IconButton
                                                disableRipple
                                                onClick={() => {
                                                    setSelectedEmployee(item);
                                                    setRejectionReason("");
                                                    setModalType("rejectPayslip");
                                                    setOpen(true);
                                                }}
                                                sx={{
                                                    backgroundColor: "#172224",
                                                    color: "red",
                                                    width: 40,
                                                    height: 36,
                                                    borderRadius: "50%",
                                                    transition: "all 0.2s ease",
                                                    "&:hover": {
                                                        backgroundColor: "#D32F2F",
                                                        color: "#fff",
                                                        transform: "translateY(-3px)",
                                                    },
                                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                                }}
                                            >
                                                <RiCloseFill style={{fontSize: 20, transform: "scale(1.2)"}}/>
                                            </IconButton>
                                        </>
                                    )}

                                    {/* Rejected status - show view reason button */}
                                    {item.status === "Rejected" && (
                                        <IconButton
                                            onClick={() => {
                                                setSelectedEmployee(item);
                                                setModalType("viewRejection");
                                                setOpen(true);
                                            }}
                                            sx={{
                                                backgroundColor: "#172224",
                                                color: "#fff",
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor: "#2E3B3D",
                                                    color: "#fff",
                                                    transform: "translateY(-3px)",
                                                },
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                            }}
                                        >
                                            <RiEyeFill style={{fontSize: 19}}/>
                                        </IconButton>
                                    )}

                                    {/* Approved or Released status - show download button */}
                                    {(item.status === "Approved" || item.status === "Released" || item.status === "Processed") && (
                                        <IconButton
                                            onClick={() => {
                                                setSelectedEmployee(item);
                                                setModalType("downloadPayslip");
                                                setOpen(true);
                                            }}
                                            sx={{
                                                backgroundColor: "#172224",
                                                color: "#fff",
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor: "#2E3B3D",
                                                    color: "#fff",
                                                    transform: "translateY(-3px)",
                                                },
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                            }}
                                        >
                                            <RiDownload2Line style={{fontSize: 19}}/>
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    ))
                    )}
                </Box>
                )}
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton
                    text={`Approve Payslips (${selectedEmployees.filter(e => e.status === "Pending").length})`}
                    width="200px"
                    onClick={handleBulkApprove}
                    disabled={selectedEmployees.filter(e => e.status === "Pending").length === 0}
                />
                <ActionButton
                    text={`Release Payouts (${selectedEmployees.filter(e => e.status === "Approved").length})`}
                    width="200px"
                    onClick={() => {
                        const approvedCount = selectedEmployees.filter(emp => emp.status === "Approved").length;
                        if (approvedCount === 0) {
                            setSnackbar({ open: true, message: 'No approved payslips to release', severity: 'warning' });
                            return;
                        }
                        setModalType("releasePayouts");
                        setOpen(true);
                    }}
                />
                <ActionButton
                    onClick={() => {
                        if (selectedEmployees.length === 0) {
                            setSnackbar({ open: true, message: "No employees selected.", severity: 'warning' });
                            return;
                        }
                        setSelectedEmployee(selectedEmployees);
                        setModalType("sendToEmails");
                        setOpen(true);
                    }}
                    text="Send to Emails"
                    width="200px"
                />
            </Box>

            <BoxModal
                open={open}
                onClose={handleClose}
            >
                {renderModalCards()}
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