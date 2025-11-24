import {Box, Typography, IconButton, TextField} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import "remixicon/fonts/remixicon.css";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import React, {useState} from "react";
import {RiCheckFill, RiCloseFill, RiEyeFill} from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

// Sample data for Manager Timesheet table
const PendingRequest = [
    {
        id: 1,
        requestType: "Overtime",
        employee: "Jherwin Jimenez",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Pending",
    },
    {
        id: 2,
        requestType: "Overtime",
        employee: "Symon Banana",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Rejected",
    },
    {
        id: 3,
        requestType: "Overtime",
        employee: "Michael Cruz",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Approved",
    },
    {
        id: 4,
        requestType: "Overtime",
        employee: "Michael Cruz",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Approved",
    },
    {
        id: 5,
        requestType: "Overtime",
        employee: "Michael Cruz",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Approved",
    },
    {
        id: 6,
        requestType: "Overtime",
        employee: "Michael Cruz",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Approved",
    },
];

const ManagerPendingRequest = () => {
    const theme = useTheme();

    const [filter, setFilter] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [requests, setRequests] = useState(PendingRequest);
    const [openApproveModal, setOpenApproveModal] = useState(false);

    const handleApproveClick = (request) => {
        setSelectedRequest(request);
        setOpenApproveModal(true);
    };

    const handleCloseApproveModal = () => {
        setOpenApproveModal(false);
    };

    const handleConfirmApprove = () => {
        setRequests((prev) =>
            prev.map((req) =>
                req.id === selectedRequest.id
                    ? {...req, status: "Approved"} // no reason needed
                    : req
            )
        );
        handleCloseApproveModal();
    };

    const handleConfirmReject = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }

        // update the selected request in state
        setRequests((prev) =>
            prev.map((req) =>
                req.id === selectedRequest.id
                    ? {...req, status: "Rejected", reason: rejectionReason}
                    : req
            )
        );

        handleCloseModal(); // close the modal
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setShowReasonInput(false);
        setRejectionReason("");
    };

    const handleRejectClick = (request) => {
        setSelectedRequest(request);
        setOpenModal(true);
        setShowReasonInput(true); // directly show reason input when rejecting
        setRejectionReason("");
    };

    const handleClose = () => setOpen(false);

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setOpen(true);
    };

    return (
        <Box
            sx={{width: "100%", height: "80%", fontFamily: theme.typography.fontFamily}}
        >
            {/* FILTER BAR */}
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 3,
                }}
            >
                {/* HEADER */}
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                    }}
                >
                    Pending Request
                </Typography>
                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                    }}
                >
                    <FilterSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />

                    <SearchBar
                        placeholder="Enter Employee Name"
                        width="350px"
                    />
                </Box>
            </Box>

            {/* TABLE CONTAINER */}
            <Box
                sx={{
                    height: "100%",
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
                {/* HEADER ROW */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, 1fr)",
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
                    <span>Request Type</span>
                    <span>Employee Name</span>
                    <span>Date</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Action</span>
                </Box>

                {/* DATA ROWS */}
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
                    {requests.map((row) => (
                        <Box
                            sx={{
                                marginTop: "10px",
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
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
                            <span>{row.requestType}</span>
                            <span>{row.employee}</span>
                            <span>{row.date}</span>
                            <span>{row.amount}</span>
                            <span
                                style={{
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color:
                                        row.status === "Approved"
                                            ? "#4CAF50"
                                            : row.status === "Rejected"
                                                ? "#F44336"
                                                : "#FFC107",
                                    fontWeight: 500,
                                }}
                            >
                                {row.status}
                            </span>
                            <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                {row.status === "Pending" ? (
                                    <>
                                        {/* Accept Button */}
                                        <IconButton
                                            disableRipple
                                            onClick={() => handleApproveClick(row)}
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
                                            onClick={() => handleRejectClick(row)}
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
                                ) : (
                                    // Default "View" Button
                                    <IconButton
                                        onClick={() => handleViewRequest(row)} // open view modal
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
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* EXPORT BUTTONS */}
            <Box
                sx={{
                    display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap", mt: "20px"
                }}
            >
                <ActionButton text="Export Payslip PDF" width="200px"/>
                <ActionButton text="Export CSV" width="200px"/>
            </Box>

            {/* MODAL */}
            <BoxModal open={open} onClose={handleClose}>
                {selectedRequest && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF"
                                }}
                            >
                                Timesheet Approval Details
                            </Typography>
                        </Box>
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Employee Name
                            </Typography>
                            <TextField
                                value={selectedRequest?.employee || ""}
                                fullWidth
                                variant="outlined"
                                size="small"
                                InputProps={{readOnly: true}}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "#cacace",
                                        color: "#1F2829",
                                        fontSize: "18px",
                                        "& fieldset": {
                                            border: "none",
                                        },
                                        "&:hover fieldset": {
                                            border: "none",
                                        },
                                        "&.Mui-focused fieldset": {
                                            border: "none",
                                        },
                                    }, "& .MuiInputBase-input": {fontSize: "18px"},
                                }}
                            />
                        </Box>
                        <Box
                            display="grid"
                            gridTemplateColumns={{md: "1fr 1fr"}}
                            gap={1}
                            mt={2}
                        >
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: "#FFFFFF",
                                        fontSize: "18px"
                                    }}>
                                    Request Type
                                </Typography>
                                <TextField
                                    value={selectedRequest?.requestType || ""}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{readOnly: true}}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: "#FFFFFF",
                                        fontSize: "18px"
                                    }}>
                                    Amount
                                </Typography>
                                <TextField
                                    value={selectedRequest?.amount || ""}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{readOnly: true}}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box
                            display="grid"
                            gridTemplateColumns={{md: "1fr 1fr"}}
                            gap={1}
                            mt={2}
                        >
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: "#FFFFFF",
                                        fontSize: "18px"
                                    }}>
                                    Date Filed
                                </Typography>
                                <TextField
                                    value={selectedRequest?.date || ""}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{readOnly: true}}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: "#FFFFFF",
                                        fontSize: "18px"
                                    }}>
                                    Status
                                </Typography>
                                <TextField
                                    value={selectedRequest?.status || ""}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{readOnly: true}}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>
                        </Box>
                        {/* Rejection Reason */}
                        {selectedRequest.status?.toLowerCase() === "rejected" && (
                            <Box display="flex" flexDirection="column" gap={1} mt={2}>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: "#FFFFFF",
                                    fontSize: "18px"
                                }}>
                                    Reason for Rejection
                                </Typography>
                                <TextField
                                    value={selectedRequest?.reason || ""}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    multiline
                                    rows={4}
                                    maxRows={10}
                                    InputProps={{readOnly: true}}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>
                        )}
                    </>
                )}
            </BoxModal>

            <BoxModal open={openApproveModal} onClose={handleCloseApproveModal}>
                {selectedRequest && (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif", textAlign: "center", fontSize: "24px", color: "#FFFFFF"
                            }}
                        >
                            Are you sure you want to approve request for {selectedRequest.employee}?
                        </Typography>

                        <Box
                            sx={{
                                display: "flex", justifyContent: "center", gap: 2, mt: 3,
                            }}
                        >
                            <Box
                                component="button"
                                onClick={handleConfirmApprove}
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
                )}
            </BoxModal>

            <BoxModal open={openModal} onClose={handleCloseModal}>
                {showReasonInput && (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF"
                            }}
                        >
                            Are you sure you want to reject this request for {selectedRequest?.employee}?
                        </Typography>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Enter Reason for Rejection
                            </Typography>
                            <TextField
                                multiline
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
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
                        <Box
                            sx={{
                                display: "flex", justifyContent: "center", gap: 2, mt: 3,
                            }}
                        >
                            <Box
                                component="button"
                                onClick={handleConfirmReject} // call confirm reject directly
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
                )}
            </BoxModal>
        </Box>
    );
};

export default ManagerPendingRequest;
