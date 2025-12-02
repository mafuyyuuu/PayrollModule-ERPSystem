import {Box, Typography, IconButton, TextField, Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import "remixicon/fonts/remixicon.css";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import React, {useState, useEffect} from "react";
import {RiCheckFill, RiCloseFill, RiEyeFill} from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

const ManagerPendingRequest = () => {
    const theme = useTheme();

    const [filter, setFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openApproveModal, setOpenApproveModal] = useState(false);

    // Fetch requests from API
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/manager/pending-requests');
            if (!response.ok) throw new Error('Failed to fetch requests');
            const data = await response.json();
            
            // Transform data
            const transformedData = data.map(req => ({
                id: req.request_id,
                requestType: req.request_type,
                employee: req.employee_name,
                employee_id: req.employee_id,
                date: req.date_filed ? new Date(req.date_filed).toISOString().split('T')[0] : '',
                amount: req.request_description || 'N/A',
                status: req.status,
                reason: req.remarks || ''
            }));
            
            setRequests(transformedData);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Filter requests
    const filteredRequests = requests.filter(row => {
        const matchesSearch = !searchTerm || row.employee.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = !filter || filter === 'all' || 
            row.status === filter || 
            row.requestType === filter;
        return matchesSearch && matchesFilter;
    });

    const handleApproveClick = (request) => {
        setSelectedRequest(request);
        setOpenApproveModal(true);
    };

    const handleCloseApproveModal = () => {
        setOpenApproveModal(false);
    };

    const handleConfirmApprove = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/manager/pending-requests/${selectedRequest.id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved_by: 1, remarks: 'Approved' })
            });
            if (!response.ok) throw new Error('Failed to approve request');
            fetchRequests();
            handleCloseApproveModal();
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request');
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/manager/pending-requests/${selectedRequest.id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved_by: 1, remarks: rejectionReason })
            });
            if (!response.ok) throw new Error('Failed to reject request');
            fetchRequests();
            handleCloseModal();
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request');
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setShowReasonInput(false);
        setRejectionReason("");
    };

    const handleRejectClick = (request) => {
        setSelectedRequest(request);
        setOpenModal(true);
        setShowReasonInput(true);
        setRejectionReason("");
    };

    const handleClose = () => setOpen(false);

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setOpen(true);
    };

    // Get unique request types for filter buttons
    const requestTypes = [...new Set(requests.map(req => req.requestType).filter(Boolean))];

    return (
        <Box
            sx={{width: "100%", height: "100%", fontFamily: theme.typography.fontFamily}}
        >
            {/* FILTER BAR */}
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 2,
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
                    <SearchBar
                        placeholder="Enter Employee Name"
                        width="300px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
            </Box>

            {/* Filter Buttons */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Button
                    onClick={() => setFilter("all")}
                    sx={{
                        fontSize: "12px",
                        px: 2,
                        py: 0.5,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "all" || !filter ? "#1b2223" : "#e0e0e0",
                        color: filter === "all" || !filter ? "#fff" : "#333",
                        "&:hover": { backgroundColor: filter === "all" || !filter ? "#2a3435" : "#d0d0d0" },
                    }}
                >
                    All
                </Button>
                {requestTypes.map((type) => (
                    <Button
                        key={type}
                        onClick={() => setFilter(type)}
                        sx={{
                            fontSize: "12px",
                            px: 2,
                            py: 0.5,
                            borderRadius: "8px",
                            textTransform: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            backgroundColor: filter === type ? "#1b2223" : "#e0e0e0",
                            color: filter === type ? "#fff" : "#333",
                            "&:hover": { backgroundColor: filter === type ? "#2a3435" : "#d0d0d0" },
                        }}
                    >
                        {type}
                    </Button>
                ))}
                <Button
                    onClick={() => setFilter("Pending")}
                    sx={{
                        fontSize: "12px",
                        px: 2,
                        py: 0.5,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Pending" ? "#f0ad4e" : "#e0e0e0",
                        color: filter === "Pending" ? "#fff" : "#333",
                        "&:hover": { backgroundColor: filter === "Pending" ? "#ec971f" : "#d0d0d0" },
                    }}
                >
                    Pending
                </Button>
                <Button
                    onClick={() => setFilter("Manager_Approved")}
                    sx={{
                        fontSize: "12px",
                        px: 2,
                        py: 0.5,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Manager_Approved" ? "#17a2b8" : "#e0e0e0",
                        color: filter === "Manager_Approved" ? "#fff" : "#333",
                        "&:hover": { backgroundColor: filter === "Manager_Approved" ? "#138496" : "#d0d0d0" },
                    }}
                >
                    Awaiting Payroll
                </Button>
                <Button
                    onClick={() => setFilter("Rejected")}
                    sx={{
                        fontSize: "12px",
                        px: 2,
                        py: 0.5,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Rejected" ? "#d9534f" : "#e0e0e0",
                        color: filter === "Rejected" ? "#fff" : "#333",
                        "&:hover": { backgroundColor: filter === "Rejected" ? "#c9302c" : "#d0d0d0" },
                    }}
                >
                    Rejected
                </Button>
            </Box>

            {/* TABLE CONTAINER */}
            <Box
                sx={{
                    height: "calc(100% - 100px)",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    display: "flex",
                    flexDirection: "column",
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
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.primary }}>
                            Loading requests...
                        </Box>
                    ) : filteredRequests.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                            No requests found.
                        </Box>
                    ) : (
                    filteredRequests.map((row) => (
                        <Box
                            key={row.id}
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
                                                : row.status === "Manager_Approved"
                                                    ? "#17a2b8"
                                                    : "#FFC107",
                                    fontWeight: 500,
                                }}
                            >
                                {row.status === "Manager_Approved" ? "Awaiting Payroll" : row.status}
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
                    ))
                    )}
                </Box>
            </Box>

            {/* EXPORT BUTTONS */}
            <Box
                sx={{
                    display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap", mt: "20px"
                }}
            >
                <ActionButton 
                    text="Export PDF" 
                    width="150px"
                    onClick={() => {
                        const printContent = `
                            <html>
                            <head>
                                <title>Pending Requests Report</title>
                                <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; }
                                    h1 { color: #333; }
                                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                    th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
                                    th { background-color: #4CAF50; color: white; }
                                    tr:nth-child(even) { background-color: #f2f2f2; }
                                    .approved { color: #4CAF50; }
                                    .rejected { color: #F44336; }
                                    .pending { color: #FF9800; }
                                </style>
                            </head>
                            <body>
                                <h1>Pending Requests Report</h1>
                                <p>Generated: ${new Date().toLocaleString()}</p>
                                <table>
                                    <thead>
                                        <tr><th>Request Type</th><th>Employee</th><th>Date</th><th>Details</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        ${filteredRequests.map(row => `
                                            <tr>
                                                <td>${row.requestType}</td>
                                                <td>${row.employee}</td>
                                                <td>${row.date}</td>
                                                <td>${row.amount}</td>
                                                <td class="${row.status.toLowerCase()}">${row.status}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </body>
                            </html>
                        `;
                        const printWindow = window.open('', '_blank');
                        printWindow.document.write(printContent);
                        printWindow.document.close();
                        printWindow.print();
                    }}
                />
                <ActionButton 
                    text="Export CSV" 
                    width="150px"
                    onClick={() => {
                        const headers = ['Request Type', 'Employee', 'Date', 'Details', 'Status'];
                        const csvData = filteredRequests.map(row => [
                            row.requestType,
                            row.employee,
                            row.date,
                            row.amount,
                            row.status
                        ]);
                        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `requests_${new Date().toISOString().split('T')[0]}.csv`;
                        link.click();
                    }}
                />
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
