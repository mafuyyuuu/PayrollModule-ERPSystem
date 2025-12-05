import { Box, Typography, useTheme, Select, MenuItem, IconButton, CircularProgress, Modal, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState, useEffect } from "react";
import { RiDownload2Line } from "react-icons/ri";
import { useUser } from "../../components/UserContext.jsx";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PayslipDocument } from "../../components/PayslipPDF.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import { PDFViewer } from "@react-pdf/renderer";
import ActionButton from "../../components/ActionButton.jsx";

export default function EmployeePayoutHistory() {
    const theme = useTheme();
    const { user } = useUser();

    // Get employee ID from either property name (supports both login methods)
    const employeeId = user?.employee_id || user?.employeeId;

    const [selectedPayroll, setSelectedPayroll] = useState("");
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state for viewing payslip
    const [openModal, setOpenModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    
    // Download confirmation modal state
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [pendingDownloadPayslip, setPendingDownloadPayslip] = useState(null);

    // Modal style for MUI Modal
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: theme.palette.mode === 'dark' ? '#1b2223' : '#fff',
        borderRadius: '15px',
        boxShadow: 24,
        p: 3,
    };

    // Fetch payout history on component mount
    useEffect(() => {
        fetchPayoutHistory();
    }, [employeeId]);

    const fetchPayoutHistory = async () => {
        if (!employeeId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/employee/payroll-history/${employeeId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch payout history');
            }

            const data = await response.json();
            console.log('✅ Payout history:', data);
            setPayoutHistory(data);
        } catch (err) {
            console.error('❌ Error fetching payout history:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "₱0.00";
        return `₱${Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // ✅ Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // ✅ Get payroll duration string from cutoff dates
    const getPayrollDuration = (item) => {
        if (!item.cutoff_start_date || !item.cutoff_end_date) return "N/A";
        return `${formatDate(item.cutoff_start_date)} - ${formatDate(item.cutoff_end_date)}`;
    };

    // ✅ Get unique payroll durations for dropdown
    const getUniqueDurations = () => {
        const durations = payoutHistory.map(item => getPayrollDuration(item));
        return [...new Set(durations)];
    };

    // ✅ Filter payouts based on selected duration
    const filteredPayouts = selectedPayroll
        ? payoutHistory.filter(item => getPayrollDuration(item) === selectedPayroll)
        : payoutHistory;

    // ✅ Handle view/download payslip - use correct field names including tax contributions
    const handleViewPayslip = (payout) => {
        setSelectedPayslip({
            id: payout.payroll_id,
            name: user?.name || 'Employee',
            employeeId: employeeId,
            department: user?.department || 'N/A',
            position: user?.position || 'N/A',
            period: getPayrollDuration(payout),
            basicPay: payout.basic_pay,
            basicSalary: payout.basic_pay,
            overtimePay: payout.overtime_pay,
            bonuses: payout.bonuses,
            grossPay: (Number(payout.basic_pay) || 0) + (Number(payout.overtime_pay) || 0) + (Number(payout.bonuses) || 0),
            earning: (Number(payout.basic_pay) || 0) + (Number(payout.overtime_pay) || 0) + (Number(payout.bonuses) || 0),
            deduction: payout.deductions,
            deductions: payout.deductions,
            netpay: payout.net_pay,
            netPay: payout.net_pay,
            // Tax contributions breakdown
            sss: payout.sss_contribution || 0,
            philhealth: payout.philhealth_contribution || 0,
            pagibig: payout.pagibig_contribution || 0,
            tax: payout.withholding_tax || 0,
            reference: payout.payslip_reference_number,
            payDate: payout.pay_date,
            status: payout.status
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedPayslip(null);
    };

    return (
        <Box width="100%" height="100%">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        fontWeight: "bold",
                        color: theme.palette.text.primary,
                    }}
                >
                    Payout History
                </Typography>

                <Box
                    sx={{
                        display: "inline-block",
                        borderRadius: "15px",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow:
                                theme.palette.mode === "light"
                                    ? "0 4px 20px rgba(0,0,0,0.15)"
                                    : "0 4px 20px rgba(0,0,0,0.3)",
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
                            width: "250px",
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
                                    <span style={{ fontSize: "16px", color: "#bdbdbd" }}>
                                        Select Payroll Duration
                                    </span>
                                );
                            return selected;
                        }}
                    >
                        <MenuItem value="">
                            <em>All Payroll Periods</em>
                        </MenuItem>
                        {/* ✅ Use unique durations */}
                        {getUniqueDurations().map((duration, index) => (
                            <MenuItem key={index} value={duration}>
                                {duration}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            <Box
                sx={{
                    height: "90.9%",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* Table Header */}
                <Box
                    sx={{
                        textAlign: "center",
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        p: "8px 0",
                        width: "100%",
                        alignItems: "center",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    <span>Payroll Duration</span>
                    <span>Amount</span>
                    <span>Reference Number</span>
                    <span>Action</span>
                </Box>

                {/* Loading State */}
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Typography color="error">Error: {error}</Typography>
                    </Box>
                ) : filteredPayouts.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Typography sx={{ color: theme.palette.text.secondary }}>
                            No payout history found
                        </Typography>
                    </Box>
                ) : (
                    /* Table Body */
                    <Box
                        sx={{
                            overflowY: "auto",
                            "&::-webkit-scrollbar": { width: 0, height: 0 },
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            mt: "8px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {filteredPayouts.map((item, index) => (
                            <Box
                                key={item.payroll_id || index}
                                sx={{
                                    marginTop: "10px",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    alignItems: "center",
                                    bgcolor: "#fff",
                                    color: "#1b2223",
                                    borderRadius: "8px",
                                    width: "100%",
                                    minHeight: "83px",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                    textAlign: "center",
                                }}
                            >
                                {/* ✅ Use correct database field names */}
                                <span>{getPayrollDuration(item)}</span>
                                <span>{formatCurrency(item.net_pay)}</span>
                                <span>{item.payslip_reference_number || 'N/A'}</span>
                                <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                    <IconButton
                                        onClick={() => handleViewPayslip(item)}
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
                                        <RiDownload2Line style={{ fontSize: 19 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Payslip Modal */}
            <BoxModal
                open={openModal}
                onClose={handleCloseModal}
                width="800px"
                height="700px"
            >
                {selectedPayslip && (
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
                            Payslip - {selectedPayslip.period}
                        </Typography>

                        <PDFViewer width="100%" height={500} showToolbar={false}>
                            <PayslipDocument employee={selectedPayslip} />
                        </PDFViewer>

                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                            <ActionButton
                                text="Download Payslip"
                                width="200px"
                                onClick={() => {
                                    setPendingDownloadPayslip(selectedPayslip);
                                    setDownloadModalOpen(true);
                                }}
                            />
                        </Box>
                    </>
                )}
            </BoxModal>

            {/* Download Confirmation Modal */}
            <Modal
                open={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                aria-labelledby="download-payslip-modal"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: theme.palette.text.primary,
                            }}
                        >
                            Download Payslip
                        </Typography>
                        <IconButton onClick={() => setDownloadModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <Typography sx={{ mb: 2, color: theme.palette.text.secondary }}>
                        You are about to download the payslip for <strong>{pendingDownloadPayslip?.period}</strong>.
                    </Typography>
                    
                    <Box sx={{ 
                        p: 2, 
                        borderRadius: '10px', 
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                        mb: 3
                    }}>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Period: {pendingDownloadPayslip?.period}
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Net Pay: {formatCurrency(pendingDownloadPayslip?.netpay)}
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Reference: {pendingDownloadPayslip?.reference || 'N/A'}
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Format: PDF Document
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            onClick={() => setDownloadModalOpen(false)}
                            sx={{
                                textTransform: 'none',
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                color: theme.palette.text.secondary,
                            }}
                        >
                            Cancel
                        </Button>
                        {pendingDownloadPayslip && (
                            <Box
                                onClick={() => {
                                    setTimeout(() => setDownloadModalOpen(false), 500);
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
                                    display: "flex",
                                    alignItems: "center",
                                    "&:hover": { backgroundColor: "#1f2f31" }
                                }}
                            >
                                <PDFDownloadLink
                                    document={<PayslipDocument employee={pendingDownloadPayslip} />}
                                    fileName={`Payslip_${pendingDownloadPayslip.reference || 'payslip'}.pdf`}
                                    style={{
                                        color: "#fff",
                                        textDecoration: "none",
                                    }}
                                >
                                    {({ loading: pdfLoading }) => (pdfLoading ? "Generating..." : "Download")}
                                </PDFDownloadLink>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}