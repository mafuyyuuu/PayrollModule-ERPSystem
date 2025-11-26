import React, {useState, useEffect} from "react";
import {
    Box,
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
import {RiCheckFill, RiCloseFill, RiDownload2Line, RiEyeFill} from "react-icons/ri";
import BoxModal from "../../components/BoxModal.jsx";
import {PayslipActions, PayslipDocument} from "../../components/PayslipPDF.jsx";
import {PDFViewer, pdf} from "@react-pdf/renderer";

export default function PayoutProcessing() {
    const theme = useTheme();

    const [filter, setFilter] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedPayroll, setSelectedPayroll] = useState("");
    const [modalType, setModalType] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rowActions, setRowActions] = useState({});
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);

    const [payrollHistory, setPayrollHistory] = useState([]);
    const [employeesProcess, setEmployeesProcess] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch payroll history (cutoff periods)
    useEffect(() => {
        const fetchPayrollHistory = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/cutoffs');

                if (!response.ok) {
                    throw new Error('Failed to fetch payroll history');
                }

                const data = await response.json();
                console.log('✅ Payroll history:', data);

                const transformedData = data.map(cutoff => ({
                    duration: `${new Date(cutoff.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${new Date(cutoff.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    amount: `₱${parseFloat(cutoff.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    ref: `REF${cutoff.cutoff_id}`
                }));

                setPayrollHistory(transformedData);
            } catch (err) {
                console.error('❌ Error fetching payroll history:', err);
                setPayrollHistory([
                    {duration: "Oct 1–15, 2025", amount: "₱20,500.00", ref: "REF20251001"},
                    {duration: "Sep 16–30, 2025", amount: "₱20,200.00", ref: "REF20250930"},
                ]);
            }
        };

        fetchPayrollHistory();
    }, []);

    // Fetch payroll processing data
    useEffect(() => {
        const fetchPayrollProcess = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/payroll');

                if (!response.ok) {
                    throw new Error('Failed to fetch payroll data');
                }

                const data = await response.json();
                console.log('✅ Payroll process data:', data);

                const transformedData = data.map(payroll => ({
                    id: `EMP-${String(payroll.employee_id).padStart(3, '0')}`,
                    name: payroll.employee_name || `Employee ${payroll.employee_id}`,
                    earning: `₱${parseFloat(payroll.basic_pay + payroll.overtime_pay + payroll.bonuses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    deduction: `₱${parseFloat(payroll.deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    netpay: `₱${parseFloat(payroll.net_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    status: payroll.status || "Pending",
                    period: `${new Date(payroll.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${new Date(payroll.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    department: payroll.department || "N/A"
                }));

                setEmployeesProcess(transformedData);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching payroll process:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPayrollProcess();
    }, []);

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
                // for release payouts na button sa baba
                return (
                    <>
                        <Typography
                            variant="h5"
                            sx={{color: "#fff", fontFamily: "'TTHoves-Bold', sans-serif"}}
                        >
                            You are about to release a payout for
                            {/*employee employees department or lahat */}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex", justifyContent: "center", gap: 2, mt: 3,
                            }}
                        >
                            <Box
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
                                Confirm
                            </Box>
                        </Box>
                    </>
                );

            case "acceptPayslip":
                // switch case ito para sa approve payslip na pangkalahatan at isahan na employee
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
                            Are you sure you want to approve the payslip for {selectedEmployee.name}?
                        </Typography>

                        <Box
                            sx={{
                                display: "flex", justifyContent: "center", gap: 2, mt: 3,
                            }}
                        >
                            <Box
                                onClick={() => {
                                    if (selectedEmployee) {
                                        // Mark the employee row as accepted
                                        setRowActions(prev => ({
                                            ...prev,
                                            [selectedEmployee.id]: "accepted"
                                        }));

                                        // Close the modal
                                        setOpen(false);

                                        // Optionally: trigger any API call for approval here
                                        // approvePayslip(selectedEmployee.id);
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
                            Are you sure you want to reject the payslip for {selectedEmployee.name}?
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
                                value={rejectionReason} // <-- bind state here
                                onChange={(e) => setRejectionReason(e.target.value)} // <-- update state on typing
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
                                        alert("Please enter a reason for rejection.");
                                        return;
                                    }

                                    // Store the reason for this employee
                                    setRejectionReasons(prev => ({
                                        ...prev,
                                        [selectedEmployee.id]: rejectionReason
                                    }));

                                    // Mark as rejected in the row actions
                                    setRowActions(prev => ({
                                        ...prev,
                                        [selectedEmployee.id]: "rejected"
                                    }));

                                    // Close the modal
                                    setOpen(false);
                                }}
                                component="button"
                                sx={{
                                    display: "flex-end",
                                    fontSize: "16px",
                                    backgroundColor: "#8b1a1a",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#a32020",
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
                                value={rejectionReasons[selectedEmployee.id] || "No reason provided"}
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
                                <span>{item.earning}</span>
                                <span>{item.deduction}</span>
                                <span>{item.netpay}</span>
                                <span
                                    style={{
                                        fontFamily: "'TTHoves-Bold', sans-serif",
                                        color:
                                            item.status === "Processed"
                                                ? "#4CAF50"
                                                : item.status === "Rejected"
                                                    ? "#F44336"
                                                    : "#FFC107",
                                        fontWeight: 500,
                                    }}
                                >
                                    {item.status}
                                </span>

                                <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                    {!rowActions[item.id] && (
                                        <>
                                            {/* Accept Button */}
                                            <IconButton
                                                disableRipple
                                                onClick={() => {
                                                    setSelectedEmployee(item); // set the clicked employee
                                                    setModalType("acceptPayslip"); // open the acceptPayslip modal
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

                                            {/* Reject Button */}
                                            <IconButton
                                                disableRipple
                                                onClick={() => {
                                                    if (!item) return alert("No employee selected"); // optional safety check

                                                    setSelectedEmployee(item);          // set the employee for the modal
                                                    setRejectionReason("");             // reset any previous reason
                                                    setModalType("rejectPayslip");      // open the rejectPayslip modal
                                                    setOpen(true);                      // show the modal
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

                                    {rowActions[item.id] === "rejected" && (
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

                                    {rowActions[item.id] === "accepted" && (
                                        <>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedEmployee(item); // set the clicked employee
                                                    setModalType("downloadPayslip"); // open the downloadPayslip modal
                                                    setOpen(true); // open the modal
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
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
                )}
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton
                    text="Approve Payslips"
                    width="200px"
                />
                <ActionButton
                    text="Release Payouts"
                    width="200px"
                />
                <ActionButton
                    onClick={() => {
                        if (!selectedRows || selectedRows.length === 0) {
                            alert("No employees selected. Please select at least one employee.");
                            return;
                        }

                        // Set the selected employees in state
                        setSelectedEmployee(selectedRows);
                        setModalType("sendToEmails"); // open the modal
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
        </Box>
    );
}