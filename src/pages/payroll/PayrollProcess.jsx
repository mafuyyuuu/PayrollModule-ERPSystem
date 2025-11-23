import React, {useState, useEffect} from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    useTheme,
    Select,
    MenuItem,
    IconButton, Checkbox,
} from "@mui/material";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import {RiDownload2Line, RiEyeFill} from "react-icons/ri";
import BoxModal from "../../components/BoxModal.jsx";
import {PayslipActions, PayslipDocument} from "../../components/PayslipPDF.jsx";
import {PDFViewer} from "@react-pdf/renderer";

export default function PayoutProcessing() {
    const theme = useTheme();

    const [filter, setFilter] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedPayroll, setSelectedPayroll] = useState("");
    const [modalType, setModalType] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    // const [payrollHistory, setPayrollHistory] = useState([]);
    // const [employeesProcess, setEmployeesProcess] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);

    const [payrollHistory, setPayrollHistory] = useState([
        {
            duration: "Oct 1–15, 2025",
            amount: "₱20,500.00",
            ref: "REF20251001",
        },
        {
            duration: "Sep 16–30, 2025",
            amount: "₱20,200.00",
            ref: "REF20250930",
        },
        {
            duration: "Sep 1–15, 2025",
            amount: "₱19,850.00",
            ref: "REF20250915",
        },
        {
            duration: "Aug 16–31, 2025",
            amount: "₱20,100.00",
            ref: "REF20250831",
        },
    ]);

    const [employeesProcess, setEmployeesProcess] = useState([
        {
            id: "EMP-001",
            name: "John Dela Cruz",
            earning: "₱25,000.00",
            deduction: "₱3,500.00",
            netpay: "₱21,500.00",
            status: "Processed",
            period: "Oct 1–15, 2025",
        },
        {
            id: "EMP-002",
            name: "Maria Santos",
            earning: "₱22,000.00",
            deduction: "₱2,800.00",
            netpay: "₱19,200.00",
            status: "Processed",
            period: "Oct 1–15, 2025",
        },
        {
            id: "EMP-003",
            name: "Carlos Ramirez",
            earning: "₱30,000.00",
            deduction: "₱4,200.00",
            netpay: "₱25,800.00",
            status: "Pending",
            period: "Oct 1–15, 2025",
        },
        {
            id: "EMP-004",
            name: "Ana Villanueva",
            earning: "₱18,500.00",
            deduction: "₱1,900.00",
            netpay: "₱16,600.00",
            status: "Processed",
            period: "Oct 1–15, 2025",
        },
        {
            id: "EMP-005",
            name: "Samuel Reyes",
            earning: "₱27,500.00",
            deduction: "₱3,200.00",
            netpay: "₱24,300.00",
            status: "Processing",
            period: "Oct 1–15, 2025",
        },
    ]);

    // Fetch payroll history (cutoff periods)
    // useEffect(() => {
    //     const fetchPayrollHistory = async () => {
    //         try {
    //             const response = await fetch('http://localhost:8080/api/cutoffs');
    //
    //             if (!response.ok) {
    //                 throw new Error('Failed to fetch payroll history');
    //             }
    //
    //             const data = await response.json();
    //             console.log('✅ Payroll history:', data);
    //
    //             const transformedData = data.map(cutoff => ({
    //                 duration: `${new Date(cutoff.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${new Date(cutoff.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    //                 amount: `₱${parseFloat(cutoff.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    //                 ref: `REF${cutoff.cutoff_id}`
    //             }));
    //
    //             setPayrollHistory(transformedData);
    //         } catch (err) {
    //             console.error('❌ Error fetching payroll history:', err);
    //             // Set default data if fetch fails
    //             setPayrollHistory([
    //                 {duration: "Oct 1–15, 2025", amount: "₱20,500.00", ref: "REF20251001"},
    //                 {duration: "Sep 16–30, 2025", amount: "₱20,200.00", ref: "REF20250930"},
    //             ]);
    //         }
    //     };
    //
    //     fetchPayrollHistory();
    // }, []);

    // Fetch payroll processing data
    // useEffect(() => {
    //     const fetchPayrollProcess = async () => {
    //         try {
    //             const response = await fetch('http://localhost:8080/api/payroll');
    //
    //             if (!response.ok) {
    //                 throw new Error('Failed to fetch payroll data');
    //             }
    //
    //             const data = await response.json();
    //             console.log('✅ Payroll process data:', data);
    //
    //             const transformedData = data.map(payroll => ({
    //                 id: payroll.employee_id,
    //                 name: payroll.employee_name || `Employee ${payroll.employee_id}`,
    //                 earning: `₱${parseFloat(payroll.gross_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    //                 deduction: `₱${parseFloat(payroll.total_deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    //                 netpay: `₱${parseFloat(payroll.net_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    //                 status: payroll.status || "Pending",
    //                 period: payroll.pay_period || "N/A"
    //             }));
    //
    //             setEmployeesProcess(transformedData);
    //             setLoading(false);
    //         } catch (err) {
    //             console.error('❌ Error fetching payroll process:', err);
    //             setError(err.message);
    //             setLoading(false);
    //         }
    //     };
    //
    //     fetchPayrollProcess();
    // }, []);

    const handleClose = () => setOpen(false);

    const handleSelectAll = (checked) => {
        if (checked) {
            // Select all employees
            setSelectedEmployees([...employeesProcess]);
        } else {
            // Deselect all
            setSelectedEmployees([]);
        }
    };

    const payslip = (employee) => {
        setSelectedEmployee(employee);
        setModalType("payslip");
        setOpen(true);
    };

    const downloadPayslip = (employee) => {
        setSelectedEmployee(employee);
        setModalType("downloadPayslip");
        setOpen(true);
    };

    const generatePayslip = (employee) => {
        setSelectedEmployee(employee);
        setModalType("generatePayslip");
        setOpen(true);
    };

    const bulkPayout = (employee) => {
        setSelectedEmployee(employee);
        setModalType("leave");
        setOpen(true);
    };

    const releasePayout = (employee) => {
        setSelectedEmployee(employee);
        setModalType("releasePayout");
        setOpen(true);
    };

    const renderModalCards = () => {
        switch (modalType) {
            case "payslip":
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
                            Employee Payslip Details
                        </Typography>

                        {/* Name */}
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#FFFFFF",
                                    fontSize: "18px"
                                }}
                            >
                                Name
                            </Typography>
                            <TextField
                                value={selectedEmployee.name}
                                InputProps={{readOnly: true}}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "#cacace",
                                        color: "#1F2829",
                                        fontSize: "18px",
                                        "& fieldset": {border: "none"},
                                        "&:hover fieldset": {border: "none"},
                                        "&.Mui-focused fieldset": {border: "none"},
                                    },
                                    "& .MuiInputBase-input": {fontSize: "18px"},
                                }}
                                size="small"
                            />
                        </Box>

                        {/* Period */}
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#FFFFFF",
                                    fontSize: "18px"
                                }}
                            >
                                Period
                            </Typography>
                            <TextField
                                value={selectedEmployee.period || selectedPayroll || "N/A"}
                                InputProps={{readOnly: true}}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "#cacace",
                                        color: "#1F2829",
                                        fontSize: "18px",
                                        "& fieldset": {border: "none"},
                                        "&:hover fieldset": {border: "none"},
                                        "&.Mui-focused fieldset": {border: "none"},
                                    },
                                    "& .MuiInputBase-input": {fontSize: "18px"},
                                }}
                                size="small"
                            />
                        </Box>

                        {/* Earnings */}
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#FFFFFF",
                                    fontSize: "18px"
                                }}
                            >
                                Earnings
                            </Typography>
                            <TextField
                                value={selectedEmployee.earning}
                                InputProps={{readOnly: true}}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "#cacace",
                                        color: "#1F2829",
                                        fontSize: "18px",
                                        "& fieldset": {border: "none"},
                                        "&:hover fieldset": {border: "none"},
                                        "&.Mui-focused fieldset": {border: "none"},
                                    },
                                    "& .MuiInputBase-input": {fontSize: "18px"},
                                }}
                                size="small"
                            />
                        </Box>

                        {/* Deduction */}
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#FFFFFF",
                                    fontSize: "18px"
                                }}
                            >
                                Deduction
                            </Typography>
                            <TextField
                                value={selectedEmployee.deduction}
                                InputProps={{readOnly: true}}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "#cacace",
                                        color: "#1F2829",
                                        fontSize: "18px",
                                        "& fieldset": {border: "none"},
                                        "&:hover fieldset": {border: "none"},
                                        "&.Mui-focused fieldset": {border: "none"},
                                    },
                                    "& .MuiInputBase-input": {fontSize: "18px"},
                                }}
                                size="small"
                            />
                        </Box>

                        {/* Net Pay */}
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#FFFFFF",
                                    fontSize: "18px"
                                }}
                            >
                                Net Pay
                            </Typography>
                            <TextField
                                value={selectedEmployee.netpay}
                                InputProps={{readOnly: true}}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "#cacace",
                                        color: "#1F2829",
                                        fontSize: "18px",
                                        "& fieldset": {border: "none"},
                                        "&:hover fieldset": {border: "none"},
                                        "&.Mui-focused fieldset": {border: "none"},
                                    },
                                    "& .MuiInputBase-input": {fontSize: "18px"},
                                }}
                                size="small"
                            />
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
                            <PayslipDocument employee={selectedEmployee} />
                        </PDFViewer>

                        <Box sx={{ mt: 2 }}>
                            <PayslipActions employee={selectedEmployee} />
                        </Box>
                    </>
                ) : null;

            case "generatePayslip":
                return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Typography
                            variant="h5"
                            sx={{ color: "#fff", fontFamily: "'TTHoves-Bold', sans-serif" }}
                        >
                            Generate Payslip
                        </Typography>

                        <Typography sx={{ color: "#ddd", lineHeight: 1.6 }}>
                            You're about to generate a payslip for:
                            <br />
                            <strong>{selectedEmployee?.name}</strong>
                        </Typography>

                        <Box sx={{ ml: 1, mt: 1, color: "#ccc", lineHeight: 1.6 }}>
                            <div>• Earnings: {selectedEmployee?.earning}</div>
                            <div>• Deductions: {selectedEmployee?.deduction}</div>
                            <div>• Net Pay: {selectedEmployee?.netpay}</div>
                            <div>• Period: {selectedEmployee?.period}</div>
                        </Box>

                        <Typography sx={{ color: "#ffaa00", mt: 1 }}>
                            Note: This will generate a preview inside the modal.
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                            <Button
                                sx={{
                                    backgroundColor: "#2e2e2e",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    padding: "8px 20px",
                                    "&:hover": { backgroundColor: "#444" },
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={() => setModalType("modalPayslip")}
                                sx={{
                                    backgroundColor: "#0066cc",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    padding: "8px 20px",
                                    "&:hover": { backgroundColor: "#1576e0" },
                                }}
                            >
                                Generate
                            </Button>
                        </Box>
                    </Box>
                );

            case "bulkPayout":
                return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Typography
                            variant="h5"
                            sx={{ color: "#fff", fontFamily: "'TTHoves-Bold', sans-serif" }}
                        >
                            Confirm Bulk Payout
                        </Typography>

                        <Typography sx={{ color: "#ddd", lineHeight: 1.6 }}>
                            You are about to release **bulk payouts** for the selected employees.
                            <br />
                            This action cannot be undone.
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                            <Button
                                sx={{
                                    backgroundColor: "#2e2e2e",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    padding: "8px 20px",
                                    "&:hover": { backgroundColor: "#444" },
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                sx={{
                                    backgroundColor: "#00a86b",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    padding: "8px 20px",
                                    "&:hover": { backgroundColor: "#0cc982" },
                                }}
                            >
                                Confirm
                            </Button>
                        </Box>
                    </Box>
                );

            case "releasePayout":
                return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Typography
                            variant="h5"
                            sx={{ color: "#fff", fontFamily: "'TTHoves-Bold', sans-serif" }}
                        >
                            Confirm Release
                        </Typography>

                        <Typography sx={{ color: "#ddd", lineHeight: 1.6 }}>
                            You are about to release a payout for:
                            <br />
                            <strong>{selectedEmployee?.name}</strong>
                        </Typography>

                        <Box sx={{ ml: 1, mt: 1, color: "#ccc", lineHeight: 1.6 }}>
                            <div>• Type: {selectedEmployee?.leaveType}</div>
                            <div>• Dates: {selectedEmployee?.startDate} to {selectedEmployee?.endDate}</div>
                            <div>• Status: {selectedEmployee?.status}</div>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                            <Button
                                sx={{
                                    backgroundColor: "#00a86b",
                                    color: "#fff",
                                    borderRadius: "12px",
                                    padding: "8px 20px",
                                    "&:hover": { backgroundColor: "#0cc982" },
                                }}
                            >
                                Confirm
                            </Button>
                        </Box>
                    </Box>
                );


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
                    <SearchBar placeholder="Enter Username" width="350px"/>

                    <FilterSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
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
                                        <span style={{fontSize: "16px", color: "#bdbdbd"}}>
                                            Select Payroll Duration
                                        </span>
                                    );
                                return selected;
                            }}
                        >
                            {payrollHistory.map((item) => (
                                <MenuItem key={item.ref} value={item.duration}>
                                    {item.duration}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
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
                            "& .MuiSvgIcon-root": { fontSize: 25 },
                        }}
                    />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
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
                        <span>Earning</span>
                        <span>Deduction</span>
                        <span>Netpay</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </Box>
                </Box>

                {/*{error && (*/}
                {/*    <Box sx={{ color: 'error.main', p: 2, textAlign: 'center' }}>*/}
                {/*        Error: {error}*/}
                {/*    </Box>*/}
                {/*)}*/}

                {/*{loading ? (*/}
                {/*    <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.text.primary }}>*/}
                {/*        Loading payroll data...*/}
                {/*    </Box>*/}
                {/*) : (*/}
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
                    {employeesProcess.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
                            <Checkbox
                                checked={selectedEmployees.includes(item)}
                                onChange={() => {
                                    setSelectedEmployees((prev) =>
                                        prev.includes(item)
                                            ? prev.filter((e) => e.id !== item.id)
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
                                    "& .MuiSvgIcon-root": { fontSize: 25 },
                                }}
                            />

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    alignItems: "center",
                                    textAlign: "center",
                                    bgcolor: "#fff",
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
                                <span>{item.earning}</span>
                                <span>{item.deduction}</span>
                                <span>{item.netpay}</span>
                                <span>{item.status}</span>

                                <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                    <IconButton
                                        onClick={() => payslip(item)}
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
                                    <IconButton
                                        onClick={() => downloadPayslip(item)} // updated function name
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
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
                {/*)}*/}
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton
                    onClick={() => selectedEmployee && generatePayslip(selectedEmployee)}
                    text="Generate Payslip"
                    width="200px"
                />
                <ActionButton
                    onClick={() => selectedEmployee && bulkPayout(selectedEmployee)}
                    text="Bulk Payout"
                    width="200px"
                />
                <ActionButton
                    onClick={() => selectedEmployee && releasePayout(selectedEmployee)}
                    text="Release Payout"
                    width="200px"
                />
            </Box>

            <BoxModal
                open={open}
                onClose={handleClose}
            >
                {renderModalCards()}
            </BoxModal>
        </Box>
    );
}