import React, {useState, useEffect} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Typography,
    useTheme,
    Select,
    MenuItem,
    IconButton,
} from "@mui/material";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import {RiDownload2Line, RiEyeFill} from "react-icons/ri";
import { generatePayslipPDF } from "../../utils/pdfGenerator.js";

export default function PayoutProcessing() {
    const theme = useTheme();

    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedPayroll, setSelectedPayroll] = useState("");
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [employeesProcess, setEmployeesProcess] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
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
            } catch (_err) {
                console.error('❌ Error fetching payroll history:', _err);
                // Set default data if fetch fails
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
                    id: payroll.employee_id,
                    name: payroll.employee_name || `Employee ${payroll.employee_id}`,
                    department: payroll.department || 'N/A',
                    earning: `₱${parseFloat(payroll.gross_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    deduction: `₱${parseFloat(payroll.total_deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    netpay: `₱${parseFloat(payroll.net_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    status: payroll.status || "Pending",
                    period: payroll.pay_period || "N/A"
                }));

                setEmployeesProcess(transformedData);
                setFilteredEmployees(transformedData);
                setLoading(false);
            } catch (_err) {
                console.error('❌ Error fetching payroll process:', _err);
                setError(_err.message);
                setLoading(false);
            }
        };

        fetchPayrollProcess();
    }, []);

    // Filter employees based on search term and filter
    useEffect(() => {
        let filtered = employeesProcess;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.id.toString().includes(searchTerm)
            );
        }

        // Apply department filter
        if (filter && filter !== 'all') {
            filtered = filtered.filter(emp => emp.department === filter);
        }

        setFilteredEmployees(filtered);
    }, [searchTerm, filter, employeesProcess]);

    // Get unique departments for filter options
    const departments = [...new Set(employeesProcess.map(emp => emp.department))];
    const filterOptions = [
        { value: 'all', label: 'All' },
        ...departments.map(dept => ({ value: dept, label: dept })),
    ];

    const handleOpen = (employeeProcess) => {
        setSelectedEmployee(employeeProcess);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleGeneratePayslip = () => {
        if (!selectedEmployee) {
            console.warn('No employee selected for payslip generation');
            // Using alert for user feedback as no notification system exists
            alert('No employee selected');
            return;
        }
        generatePayslipPDF(selectedEmployee);
    };

    const handleDownloadPayslip = (employee) => {
        generatePayslipPDF(employee);
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
                        placeholder="Enter Username" 
                        width="350px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <FilterSelect
                        width={180}
                        placeholder="Filter by Department"
                        options={filterOptions}
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}>
                        Showing {filteredEmployees.length} of {employeesProcess.length} employees
                    </Typography>
                </Box>
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
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <span>Employee ID</span>
                    <span>Employee Name</span>
                    <span>Earning</span>
                    <span>Deduction</span>
                    <span>Netpay</span>
                    <span>Status</span>
                    <span>Actions</span>
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
                                No employees found matching your filters.
                            </Box>
                        ) : (
                            filteredEmployees.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    marginTop: "10px",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    alignItems: "center",
                                    bgcolor: "#fff",
                                    color: "#1b2223",
                                    borderRadius: "8px",
                                    width: "100%",
                                    minHeight: "83px",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                    textAlign: "center",
                                }}
                            >
                                <span>{item.id}</span>
                                <span>{item.name}</span>
                                <span>{item.earning}</span>
                                <span>{item.deduction}</span>
                                <span>{item.netpay}</span>
                                <span>{item.status}</span>

                                <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                    <IconButton
                                        onClick={() => handleOpen(item)}
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
                                        <RiEyeFill style={{ fontSize: 19 }}/>
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDownloadPayslip(item)}
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
                        ))
                        )}
                    </Box>
                )}
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton text="Generate Payslip" width="200px" onClick={handleGeneratePayslip}/>
                <ActionButton text="Bulk Payout" width="200px"/>
                <ActionButton text="Release Payout" width="200px"/>
            </Box>

            {/* Custom Blur Layer */}
            {open && (
                <Box
                    sx={{
                        position: "fixed",
                        top: "160px",
                        left: "250px",
                        right: 0,
                        bottom: 0,
                        backdropFilter: "blur(5px)",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        zIndex: 1200,
                    }}
                />
            )}

            <Dialog
                open={open}
                onClose={handleClose}
                hideBackdrop
                PaperProps={{
                    sx: {
                        top: "55px",
                        left: "5%",
                        borderRadius: "50px",
                        padding: 6,
                        background: "rgba(28,28,28,0.4)",
                        width: "430px",
                        height: "550px",
                    },
                }}
            >
                <DialogTitle>
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: "'TTHoves-bold', sans-serif",
                            fontWeight: "500", textAlign: "start", color: "white", m: "-15px -25px -5px"
                        }}
                    >
                        Generate Payslip
                    </Typography>
                </DialogTitle>

                <DialogContent
                    sx={{
                        backgroundColor: "transparent",
                        border: "none",
                        width: "100%",
                        gap: 3,
                        scrollbarWidth: "none",
                        p: 0,
                    }}
                >
                    {selectedEmployee && (
                        <Box sx={{scrollbarWidth: "none"}}>
                            {/* Name */}
                            <Box>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.9rem",
                                        color: "white",
                                        mt: 1,
                                    }}
                                >
                                    Name
                                </Typography>
                                <TextField
                                    value={selectedEmployee.name}
                                    InputProps={{
                                        readOnly: true,
                                        sx: {
                                            width: "33.5vh",
                                            borderRadius: "10px",
                                            backgroundColor: "#ebebeb",
                                            "& .MuiOutlinedInput-notchedOutline": {border: "none"},
                                        },
                                    }}
                                    size="small"
                                />
                            </Box>

                            {/* Period */}
                            <Box>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.9rem",
                                        color: "white",
                                        mt: 1,
                                    }}
                                >
                                    Period
                                </Typography>
                                <TextField
                                    value={selectedEmployee.period || selectedPayroll || "N/A"}
                                    InputProps={{
                                        readOnly: true,
                                        sx: {
                                            width: "33.5vh",
                                            borderRadius: "10px",
                                            backgroundColor: "#ebebeb",
                                            "& .MuiOutlinedInput-notchedOutline": {border: "none"},
                                        },
                                    }}
                                    size="small"
                                />
                            </Box>

                            {/* Earnings */}
                            <Box>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.9rem",
                                        color: "white",
                                        mt: 1,
                                    }}
                                >
                                    Earnings
                                </Typography>
                                <TextField
                                    value={selectedEmployee.earning}
                                    InputProps={{
                                        readOnly: true,
                                        sx: {
                                            width: "33.5vh",
                                            borderRadius: "10px",
                                            backgroundColor: "#ebebeb",
                                            "& .MuiOutlinedInput-notchedOutline": {border: "none"},
                                        },
                                    }}
                                    size="small"
                                />
                            </Box>

                            {/* Deduction */}
                            <Box>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.9rem",
                                        color: "white",
                                        mt: 1,
                                    }}
                                >
                                    Deduction
                                </Typography>
                                <TextField
                                    value={selectedEmployee.deduction}
                                    InputProps={{
                                        readOnly: true,
                                        sx: {
                                            width: "33.5vh",
                                            borderRadius: "10px",
                                            backgroundColor: "#ebebeb",
                                            "& .MuiOutlinedInput-notchedOutline": {border: "none"},
                                        },
                                    }}
                                    size="small"
                                />
                            </Box>

                            {/* Net Pay */}
                            <Box>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.9rem",
                                        color: "white",
                                        mt: 1,
                                    }}
                                >
                                    Net Pay
                                </Typography>
                                <TextField
                                    value={selectedEmployee.netpay}
                                    InputProps={{
                                        readOnly: true,
                                        sx: {
                                            width: "33.5vh",
                                            borderRadius: "10px",
                                            backgroundColor: "#ebebeb",
                                            "& .MuiOutlinedInput-notchedOutline": {border: "none"},
                                        },
                                    }}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: -1.4,
                    }}
                >
                    <Button
                        sx={{
                            width: "80%",
                            backgroundColor: "#1F2D3D",
                            color: "#fff",
                            borderRadius: "50px",
                            textTransform: "none",
                            fontFamily: "'TTHoves-bold', sans-serif",
                        }}
                    >
                        Send to Email
                    </Button>
                    <Button
                        onClick={handleGeneratePayslip}
                        sx={{
                            width: "80%",
                            padding: "10px",
                            backgroundColor: "#1F2D3D",
                            color: "#fff",
                            borderRadius: "50px",
                            textTransform: "none",
                            fontFamily: "'TTHoves-bold', sans-serif",
                        }}
                    >
                        Download PDF
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
}