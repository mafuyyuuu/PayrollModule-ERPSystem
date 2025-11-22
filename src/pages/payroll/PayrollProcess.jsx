import React, {useState} from "react";
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

export default function PayoutProcessing() {
    const theme = useTheme();

    const [filter, setFilter] = useState("")
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedPayroll, setSelectedPayroll] = useState("");

    const payrollHistory = [
        {duration: "Oct 1–15, 2025", amount: "₱20,500.00", ref: "REF20251001"},
        {duration: "Sep 16–30, 2025", amount: "₱20,200.00", ref: "REF20250930"},
        {duration: "Sep 1–15, 2025", amount: "₱20,100.00", ref: "REF20250915"},
        {duration: "Aug 16–31, 2025", amount: "₱20,000.00", ref: "REF20250831"},
        {duration: "Aug 1–15, 2025", amount: "₱19,900.00", ref: "REF20250815"},
        {duration: "Jul 16–31, 2025", amount: "₱19,800.00", ref: "REF20250731"},
        {duration: "Jul 1–15, 2025", amount: "₱19,700.00", ref: "REF20250715"},
    ];

    const employeesProcess = [
        {
            id: "0100001",
            name: "Jhervin Jimenez",
            earning: "₱100,000.00",
            deduction: "₱10,000.00",
            netpay: "₱90,000.00",
            status: "Pending"
        },
        {
            id: "0100002",
            name: "Edrianne Lumabas",
            earning: "₱80,000.00",
            deduction: "₱5,000.00",
            netpay: "₱75,000.00",
            status: "Pending"
        },
        {
            id: "0100003",
            name: "Princess Jumiah Zamora",
            earning: "₱70,000.00",
            deduction: "₱8,000.00",
            netpay: "₱92,000.00",
            status: "Pending"
        },
        {
            id: "0100004",
            name: "Jessa Balnig",
            earning: "₱75,000.00",
            deduction: "₱4,000.00",
            netpay: "₱79,000.00",
            status: "Pending"
        },
        {
            id: "0100005",
            name: "Symon Banaag",
            earning: "₱60,000.00",
            deduction: "₱9,000.00",
            netpay: "70,000.00",
            status: "Pending"
        },

    ];

    const handleOpen = (employeeProcess) => {
        setSelectedEmployee(employeeProcess);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

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
                                    border: "none", // remove focus border
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
                    ))}
                </Box>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton text="Generate Payslip" width="200px"/>
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
                        zIndex: 1200, // just below the dialog
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
                                    value={selectedEmployee.period}
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
