/* eslint-disable no-unused-vars */
import {
    Box,
    Typography,
    useTheme,
    IconButton,
    TextField,
    Chip,
    Button
} from "@mui/material";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import React, {useState, useEffect} from "react";
import {RiCheckFill, RiCloseFill, RiCloseLine, RiDownload2Line, RiEyeFill} from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";
import {exportToCSV} from "../../utils/pdfGenerator.js";
import BoxModal from "../../components/BoxModal.jsx";

export default function PayrollPendingRequest() {
    const theme = useTheme();

    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [rejectType, setRejectType] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState(null); // "approve" or "reject"
    const [modalType, setModalType] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("");
    const [employeeRequests, setEmployeeRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({open: false, action: null, requestId: null});

    // Check if any filter is active
    const hasActiveFilters = filter || searchTerm;

    // Clear all filters
    const handleClearFilters = () => {
        setFilter("");
        setSearchTerm("");
    };

    // Fetch pending requests function
    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            // Fetch ALL requests, not just pending - let frontend filter
            const response = await fetch('http://localhost:8080/api/payroll/pending-requests?showAll=true');

            if (!response.ok) {
                throw new Error('Failed to fetch pending requests');
            }

            const data = await response.json();
            console.log('✅ All requests:', data);

            const transformedData = data.map(request => ({
                type: request.request_type || "Overtime",
                employee: request.employee_name || `Employee ${request.employee_id}`,
                date: new Date(request.date_filed).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                rawDate: new Date(request.date_filed), // For sorting
                updatedAt: request.updated_at ? new Date(request.updated_at) : new Date(request.date_filed),
                amount: request.request_description || "N/A",
                status: request.status || "Pending",
                requestId: request.request_id,
                rejectReason: request.remarks || ""
            }))
            // Sort by most recent updated_at first (when processed), fallback to date_filed
            .sort((a, b) => b.updatedAt - a.updatedAt);

            setEmployeeRequests(transformedData);
            setFilteredRequests(transformedData);
            setLoading(false);
        } catch (_err) {
            console.error('❌ Error fetching pending requests:', _err);
            setError(_err.message);
            setLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchPendingRequests();
    }, []);

    // Filter requests based on search term and filter
    useEffect(() => {
        let filtered = employeeRequests;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(request =>
                request.employee.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply type/status filter
        if (filter) {
            if (filter === 'all') {
                // Show all
            } else if (['Manager_Approved', 'Approved', 'Rejected'].includes(filter)) {
                // Filter by status
                filtered = filtered.filter(request => request.status === filter);
            } else {
                // Filter by type
                filtered = filtered.filter(request => request.type === filter);
            }
        }

        setFilteredRequests(filtered);
    }, [searchTerm, filter, employeeRequests]);

    // Get unique request types for filter options
    const requestTypes = [...new Set(employeeRequests.map(req => req.type))];
    const filterOptions = [
        {value: 'all', label: 'All'},
        ...requestTypes.map(type => ({value: type, label: type})),
        {value: 'Manager_Approved', label: 'Ready for Processing'},
        {value: 'Approved', label: 'Processed'},
        {value: 'Rejected', label: 'Rejected'},
    ];

    const closeConfirmDialog = () => {
        setConfirmDialog({open: false, action: null, requestId: null});
    };

    const handleConfirmAction = async () => {
        const {action, requestId} = confirmDialog;
        try {
            const endpoint = action === 'approve' ? 'approve' : 'reject';
            console.log(`📝 ${action}ing request ${requestId}...`);
            
            const response = await fetch(`http://localhost:8080/api/payroll/pending-requests/${requestId}/${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    approved_by: 1, 
                    remarks: action === 'approve' ? 'Approved' : (rejectType || 'Rejected')
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ Request ${requestId} ${action}d successfully:`, data);
                // Refetch to ensure data consistency from database
                await fetchPendingRequests();
                closeConfirmDialog();
                setRejectType(""); // Clear reject reason
            } else {
                console.error(`❌ Failed to ${action} request:`, data);
                alert(`Failed to ${action} request: ${data.error || 'Unknown error'}`);
            }
        } catch (_err) {
            console.error(`❌ Error ${action}ing request:`, _err);
            alert(`Error ${action}ing request. Please check if the server is running.`);
        }
    };

    const handleExportCSV = () => {
        if (filteredRequests.length === 0) {
            console.warn('No requests to export');
            // Using alert for user feedback as no notification system exists
            alert('No requests to export');
            return;
        }
        exportToCSV(filteredRequests, 'pending_requests.csv');
    };

    const renderModalCards = () => {
        const currentEmployee = employeeRequests.find(req => req.requestId === currentRequestId)?.employee || "this employee";
        
        switch (modalType) {
            case "processRequest":
                return (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                                mb: 2,
                                textAlign: currentAction === "reject" ? "left" : "center"
                            }}
                        >
                            {currentAction === "approve" 
                                ? `Process and approve request for ${currentEmployee}?`
                                : `Reject request for ${currentEmployee}?`
                            }
                        </Typography>

                        {/* Reject reason input only for reject */}
                        {currentAction === "reject" && (
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                                <Typography
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        color: "#FFFFFF",
                                        fontSize: "18px",
                                    }}
                                >
                                    Enter Reason for Rejection
                                </Typography>
                                <TextField
                                    value={rejectType}
                                    onChange={(e) => setRejectType(e.target.value)}
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
                        )}

                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={async () => {
                                    if (currentAction === "approve") {
                                        // Call API to approve
                                        try {
                                            const response = await fetch(`http://localhost:8080/api/payroll/pending-requests/${currentRequestId}/approve`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ approved_by: 1, remarks: 'Approved' })
                                            });
                                            
                                            if (response.ok) {
                                                console.log('✅ Request approved successfully');
                                                await fetchPendingRequests(); // Refresh data from DB
                                            } else {
                                                console.error('❌ Failed to approve request');
                                                alert('Failed to approve request');
                                            }
                                        } catch (err) {
                                            console.error('❌ Error approving request:', err);
                                            alert('Error approving request');
                                        }
                                        setIsModalOpen(false);
                                    } else if (currentAction === "reject") {
                                        // Reject logic - only if reason entered
                                        if (!rejectType.trim()) {
                                            alert("Please enter a reason.");
                                            return;
                                        }

                                        // Call API to reject
                                        try {
                                            const response = await fetch(`http://localhost:8080/api/payroll/pending-requests/${currentRequestId}/reject`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ approved_by: 1, remarks: rejectType })
                                            });
                                            
                                            if (response.ok) {
                                                console.log('✅ Request rejected successfully');
                                                await fetchPendingRequests(); // Refresh data from DB
                                            } else {
                                                console.error('❌ Failed to reject request');
                                                alert('Failed to reject request');
                                            }
                                        } catch (err) {
                                            console.error('❌ Error rejecting request:', err);
                                            alert('Error rejecting request');
                                        }

                                        setRejectType(""); // clear input
                                        setIsModalOpen(false);
                                    }
                                }}
                                component="button"
                                sx={{
                                    display: "flex-end",
                                    fontSize: "16px",
                                    backgroundColor: currentAction === "approve" ? "#172224" : "#8b1a1a",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: currentAction === "approve" ? "#1f2f31" : "#a32020",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)"
                                    }
                                }}
                            >
                                {currentAction === "approve" ? "Process & Approve" : "Reject"}
                            </Box>
                        </Box>
                    </>
                );

            case "viewReject":
                // View rejection reason
                return (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            color: theme.palette.text.primary,
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: theme.palette.text.primary,
                                mb: 2
                            }}
                        >
                            Reason for Rejection
                        </Typography>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: theme.palette.text.primary,
                                    fontSize: "16px",
                                }}
                            >
                                Employee Name
                            </Typography>
                            <TextField
                                value={employeeRequests.find(req => req.requestId === currentRequestId)?.employee || "N/A"}
                                InputProps={{readOnly: true}}
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                }}
                            />
                        </Box>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    color: theme.palette.text.primary,
                                    fontSize: "16px",
                                }}
                            >
                                Rejection Reason
                            </Typography>
                            <TextField
                                value={
                                    employeeRequests.find(req => req.requestId === currentRequestId)?.rejectReason || "No reason provided"
                                }
                                multiline
                                rows={3}
                                InputProps={{readOnly: true}}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                }}
                            />
                        </Box>
                    </Box>
                );

            case "exportCSV":
                return (
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
                            Are you sure you want to download CSV?
                            {/*kung for two or more employees or maramihan or per dept.*/}
                        </Typography>
                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={() => {
                                    handleExportCSV();
                                    setIsModalOpen(false);
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
                                Download CSV
                            </Box>
                        </Box>
                    </>
                );
            default:
                return <Typography sx={{color: "#fff"}}>No data available</Typography>;
        }
    };

    return (
        <Box
            width="100%"
            height="100%"
        >
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 2,
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
                    Employee Requests
                </Typography>
            </Box>

            {/* Filter Buttons and Search */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                    onClick={() => setFilter("all")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "all" || !filter ? "#334042" : "#e0e0e0",
                        color: filter === "all" || !filter ? "#fff" : "#333",
                        opacity: filter === "all" || !filter ? 1 : 0.6,
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
                            fontSize: "14px",
                            px: 3,
                            py: 1,
                            borderRadius: "10px",
                            textTransform: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            backgroundColor: filter === type ? "#334042" : "#e0e0e0",
                            color: filter === type ? "#fff" : "#333",
                            opacity: filter === type ? 1 : 0.6,
                            "&:hover": { backgroundColor: filter === type ? "#2a3435" : "#d0d0d0" },
                        }}
                    >
                        {type}
                    </Button>
                ))}
                <Button
                    onClick={() => setFilter("Manager_Approved")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Manager_Approved" ? "#17a2b8" : "#e0e0e0",
                        color: filter === "Manager_Approved" ? "#fff" : "#333",
                        opacity: filter === "Manager_Approved" ? 1 : 0.6,
                        "&:hover": { backgroundColor: filter === "Manager_Approved" ? "#138496" : "#d0d0d0" },
                    }}
                >
                    Ready for Processing
                </Button>
                <Button
                    onClick={() => setFilter("Approved")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Approved" ? "#5cb85c" : "#e0e0e0",
                        color: filter === "Approved" ? "#fff" : "#333",
                        opacity: filter === "Approved" ? 1 : 0.6,
                        "&:hover": { backgroundColor: filter === "Approved" ? "#449d44" : "#d0d0d0" },
                    }}
                >
                    Processed
                </Button>
                <Button
                    onClick={() => setFilter("Rejected")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Rejected" ? "#d9534f" : "#e0e0e0",
                        color: filter === "Rejected" ? "#fff" : "#333",
                        opacity: filter === "Rejected" ? 1 : 0.6,
                        "&:hover": { backgroundColor: filter === "Rejected" ? "#c9302c" : "#d0d0d0" },
                    }}
                >
                    Rejected
                </Button>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    <SearchBar
                        placeholder="Search employee..."
                        width="300px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    height: "calc(100% - 150px)",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1}}>
                    <Typography sx={{color: theme.palette.text.secondary, fontSize: "14px"}}>
                        Showing {filteredRequests.length} of {employeeRequests.length} requests
                    </Typography>
                </Box>
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
                    <span>Employee</span>
                    <span>Date</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Actions</span>
                </Box>

                {error && (
                    <Box sx={{color: 'error.main', p: 2, textAlign: 'center'}}>
                        Error: {error}
                    </Box>
                )}

                {loading ? (
                    <Box sx={{p: 2, textAlign: 'center', color: theme.palette.text.primary}}>
                        Loading pending requests...
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
                        {filteredRequests.length === 0 ? (
                            <Box sx={{p: 4, textAlign: 'center', color: theme.palette.text.secondary}}>
                                No requests found matching your filters.
                            </Box>
                        ) : (
                            filteredRequests.map((item, index) => (
                                <Box
                                    key={index}
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
                                    <span>{item.type}</span>
                                    <span>{item.employee}</span>
                                    <span>{item.date}</span>
                                    <span>{item.amount}</span>
                                    <span
                                        style={{
                                            fontFamily: "'TTHoves-Bold', sans-serif",
                                            color:
                                                item.status === "Approved"
                                                    ? "#4CAF50"
                                                    : item.status === "Rejected"
                                                        ? "#F44336"
                                                        : item.status === "Manager_Approved"
                                                            ? "#17a2b8"
                                                            : "#FFC107",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {item.status === "Manager_Approved" ? "Ready for Processing" : item.status}
                                    </span>
                                    <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                        {item.status === "Manager_Approved" ? (
                                            <>
                                                {/*Accept Button - Process into payroll */}
                                                <IconButton
                                                    disableRipple
                                                    onClick={() => {
                                                        setModalType("processRequest");
                                                        setCurrentAction("approve");
                                                        setCurrentRequestId(item.requestId);
                                                        setIsModalOpen(true);
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
                                                        setModalType("processRequest");
                                                        setCurrentAction("reject");
                                                        setCurrentRequestId(item.requestId);
                                                        setIsModalOpen(true);
                                                    }} sx={{
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
                                        ) : item.status === "Rejected" ? (
                                            <>
                                                {/* View Button for rejected */}
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
                                                    onClick={() => {
                                                        setModalType("viewReject");
                                                        setCurrentRequestId(item.requestId);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <RiEyeFill style={{fontSize: 19}}/>
                                                </IconButton>
                                            </>
                                        ) : (
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
                                                onClick={() => {
                                                    setModalType("exportCSV");
                                                    setIsModalOpen(true);
                                                }}>
                                                <RiDownload2Line style={{fontSize: 19}}/>
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>

            <BoxModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                {renderModalCards()}
            </BoxModal>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton
                    text="Export CSV"
                    width="200px"
                    onClick={() => {
                        setModalType("exportCSV");
                        setIsModalOpen(true);
                    }}
                />
            </Box>
        </Box>
    );
}