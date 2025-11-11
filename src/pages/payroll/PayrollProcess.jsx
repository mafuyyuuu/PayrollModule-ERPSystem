import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function PayoutProcessing() {
    const [open, setOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Sample data
    const employeesProcess = [
        { id: "0100001", name: "Jhervin Jimenez", earning: "₱100,000.00", deduction: "₱10,000.00", netpay: "₱90,000.00", status: "Pending" },
        { id: "0100002", name: "Edrianne Lumabas", earning: "₱80,000.00", deduction: "₱5,000.00", netpay: "₱75,000.00", status: "Pending" },
        { id: "0100003", name: "Princess Jumiah Zamora", earning: "₱70,000.00", deduction: "₱8,000.00", netpay: "₱92,000.00", status: "Pending" },
        { id: "0100004", name: "Jessa Balnig", earning: "₱75,000.00", deduction: "₱4,000.00", netpay: "₱79,000.00", status: "Pending" },
        { id: "0100005", name: "Symon Banaag", earning: "₱60,000.00", deduction: "₱9,000.00", netpay: "70,000.00", status: "Pending" },

    ];

    const handleOpen = (employeeProcess) => {
        setSelectedEmployee(employeeProcess);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    return (
        <Box
            width = "100%"
            height = "70vh"
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3.5}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    Payout Processing
                </Typography>

                <Box
                    marginLeft="52vh"
                    display="flex"
                    alignItems="center"
                    bgcolor="#E1E0E0"
                    borderRadius="8px"
                    px="15px"
                    py="5px"
                    boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    border= "1px solid rgba(255, 255, 255, 0.4)"
                    width="450px"
                >
                    <SearchIcon
                        sx={{
                            fontSize: "1.7rem",
                            mr: 1,
                        }}
                    />
                    <InputBase
                        placeholder="Enter Employee Name"
                        sx={{
                            fontFamily: "TT Hoves Pro, sans-serif",
                            fontWeight: 300,
                            fontSize: "0.95rem",
                            width: "100%",
                            backgroundColor: "#E1E0E0",
                        }}
                    />
                </Box>

                <Box sx={{ position: "relative" }}>
                    <select
                        style={{
                            marginRight:"20px",
                            appearance: "none",
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            padding: "10px 4px 10px 15px",
                            borderRadius: "25px",
                            backgroundColor: "#DADBDB",
                            color: "#222",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            fontSize: "15px",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Filter</option>
                        <option>By Category</option>
                        <option>By Date</option>
                        <option>By Name</option>
                    </select>
                    <i
                        className="ri-arrow-down-s-fill"
                        style={{
                            position: "absolute",
                            right: "75%",
                            top: "56%",
                            paddingRight: "10px",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#222",
                            fontSize: "20px",
                        }}
                    ></i>

                    <select
                        style={{
                            marginRight:"11.5vh",
                            appearance: "none",
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            padding: "10px 50px 10px 20px",
                            borderRadius: "25px",
                            backgroundColor: "#DADBDB",
                            color: "#222",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            fontSize: "15px",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Select Period</option>
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                    </select>
                    <i
                        className="ri-arrow-down-s-fill"
                        style={{
                            position: "absolute",
                            right: "120px",
                            top: "56%",
                            paddingRight: "10px",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#222",
                            fontSize: "20px",
                        }}
                    ></i>
                    <Box textAlign="end" marginTop="-39px">
                        <button
                            style={{
                                backgroundColor: "#152022",
                                color: "#fff",
                                border: "1px solid rgba(255, 255, 255, 1)",
                                fontFamily: "'TTHoves-bold', sans-serif",
                                fontSize: "12px",
                                padding: "10px 20px",
                                borderRadius: "50px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.transform = "translateY(-3px)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "translateY(0)")
                            }
                            onClick={() => handleOpen(employeesProcess)}
                        >
                            Generate
                        </button>
                    </Box>
                </Box>
            </Box>

            <Box
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius="12px"
                p="24px"
                color="#222"
                height="87%"
                sx={{
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.7)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                    gap: "10px",
                }}
            >

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr 1fr",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        border: "none",
                        padding: "20px",
                        fontWeight: 600,
                    }}
                >
                    <span style={{ justifySelf: "start", paddingLeft:"8px"}}>Name</span>
                    <span style={{ justifySelf: "center", paddingRight:"120px" }}>Earning</span>
                    <span style={{ justifySelf: "center" }}>Deduction</span>
                    <span style={{ justifySelf: "center", paddingLeft:"30px" }}>Netpay</span>
                    <span style={{ justifySelf: "center", paddingLeft:"60px" }}>Status</span>
                    <span style={{ justifySelf: "end", paddingRight:"30px" }}>Actions</span>
                </Box>

                <Box
                    sx={{
                        maxHeight: "100%",
                        overflowY: "auto",
                        pr: "8px",
                        display: "flex",
                        flexDirection: "column",
                        mt: "5px",
                        gap: "10px",
                        height: "85%",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": {
                            width: 0,
                            height: 0,
                        },
                    }}
                >
                    {employeesProcess.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1.2fr 0.8fr 1fr 1fr 1fr 0.68fr",                                backgroundColor: "rgba(255, 255, 255, 0.25)",
                                backdropFilter: "blur(12px)",
                                borderRadius: "10px",
                                padding: "30px",
                                marginTop: "3px",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                transition: "all 0.3s ease",
                                border: "1px solid rgba(255,255,255,0.3)",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                },
                            }}
                        >
                            <span style={{ justifySelf: "start", fontWeight: 600}}>{item.name}</span>
                            <span style={{ justifySelf: "start" }}>{item.earning}</span>
                            <span style={{ justifySelf: "center" }}>{item.deduction}</span>
                            <span style={{ justifySelf: "center"  }}>{item.netpay}</span>
                            <span style={{ justifySelf: "center", color: "red" }}>{item.status}</span>

                            <Box sx={{ justifySelf: "end", display: "flex", gap: "8px" }}>
                                <Box
                                    component="button"
                                    sx={{
                                        width: 33,
                                        height: 33,
                                        borderRadius: "50%",
                                        backgroundColor: "black",
                                        color: "white",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.transform = "translateY(-3px)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.transform = "translateY(0)")
                                    }
                                >
                                    <i className="ri-eye-fill" style={{fontSize: "20px"}}></i>
                                </Box>
                                <Box
                                    component="button"
                                    sx={{
                                        width: 33,
                                        height: 33,
                                        borderRadius: "50%",
                                        backgroundColor: "black",
                                        color: "white",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.transform = "translateY(-3px)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.transform = "translateY(0)")
                                    }
                                >
                                    <i className="ri-download-2-fill" style={{fontSize: "19px"}}></i>
                                </Box>
                            </Box>

                            <span style={{ justifySelf: "start", color: "#818080", marginTop:"-10px" }}>{item.id}</span>

                        </Box>
                    ))}
                </Box>
            </Box>

            <Box textAlign="end" marginTop="30px">
                <button
                    style={{
                        backgroundColor: "#152022",
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 1)",
                        fontFamily: "'TTHoves-bold', sans-serif",
                        fontSize: "14px",
                        padding: "13px 30px",
                        borderRadius: "50px",
                        marginRight: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-3px)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                    }
                >
                    Bulk Payout
                </button>
                <button
                    style={{
                        backgroundColor: "#152022",
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 1)",
                        fontFamily: "'TTHoves-bold', sans-serif",
                        fontSize: "14px",
                        padding: "13px 30px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-3px)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                    }
                >
                    Approve or Release
                </button>
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
                        sx={{ fontFamily: "'TTHoves-bold', sans-serif",
                            fontWeight:"500", textAlign: "start", color: "white", m:"-15px -25px -5px" }}
                    >
                        Generate Payslip
                    </Typography>
                </DialogTitle>

                <DialogContent
                    sx={{
                        backgroundColor: "transparent",
                        border: "none",
                        width: "100%",
                        gap:3,
                        scrollbarWidth:     "none",
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
