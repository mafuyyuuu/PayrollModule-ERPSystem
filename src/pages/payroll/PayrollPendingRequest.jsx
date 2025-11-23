import {Box, Typography, useTheme, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button} from "@mui/material";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import React, {useState, useEffect} from "react";
import {RiCheckFill, RiCloseFill, RiPencilFill} from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";
import { exportToCSV } from "../../utils/pdfGenerator.js";

export default function PayrollPendingRequest() {
    const theme = useTheme();

    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("");
    const [employeeRequests, setEmployeeRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, requestId: null });

    // Fetch pending requests
    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                // You'll need to create this endpoint in your backend
                const response = await fetch('http://localhost:8080/api/pending-requests');

                if (!response.ok) {
                    throw new Error('Failed to fetch pending requests');
                }

                const data = await response.json();
                console.log('✅ Pending requests:', data);

                const transformedData = data.map(request => ({
                    type: request.request_type || "Overtime",
                    employee: request.employee_name || `Employee ${request.employee_id}`,
                    date: new Date(request.request_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    amount: `₱${parseFloat(request.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    status: request.status || "Pending",
                    requestId: request.request_id
                }));

                setEmployeeRequests(transformedData);
                setFilteredRequests(transformedData);
                setLoading(false);
            } catch (_err) {
                console.error('❌ Error fetching pending requests:', _err);
                setError(_err.message);
                setLoading(false);
            }
        };

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
            } else if (['Pending', 'Approved', 'Rejected'].includes(filter)) {
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
        { value: 'all', label: 'All' },
        ...requestTypes.map(type => ({ value: type, label: type })),
        { value: 'Pending', label: 'Status: Pending' },
        { value: 'Approved', label: 'Status: Approved' },
        { value: 'Rejected', label: 'Status: Rejected' },
    ];

    const openConfirmDialog = (action, requestId) => {
        setConfirmDialog({ open: true, action, requestId });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({ open: false, action: null, requestId: null });
    };

    const handleConfirmAction = async () => {
        const { action, requestId } = confirmDialog;
        try {
            const endpoint = action === 'approve' ? 'approve' : 'reject';
            const response = await fetch(`http://localhost:8080/api/pending-requests/${requestId}/${endpoint}`, {
                method: 'PUT',
            });

            if (response.ok) {
                // Update the local state instead of reloading
                setEmployeeRequests(prev => 
                    prev.map(req => 
                        req.requestId === requestId 
                            ? { ...req, status: action === 'approve' ? 'Approved' : 'Rejected' }
                            : req
                    )
                );
                closeConfirmDialog();
            }
        } catch (_err) {
            console.error(`Error ${action}ing request:`, _err);
        }
    };

    const handleExportCSV = () => {
        if (filteredRequests.length === 0) {
            alert('No requests to export');
            return;
        }
        exportToCSV(filteredRequests, 'pending_requests.csv');
    };

    return (
        <Box
            width = "100%"
            height = "100%"
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
                    Pending Requests
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
                        width={200}
                        placeholder="Filter by Type/Status"
                        options={filterOptions}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
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
                    <Box sx={{ color: 'error.main', p: 2, textAlign: 'center' }}>
                        Error: {error}
                    </Box>
                )}

                {loading ? (
                    <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.text.primary }}>
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
                            <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
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
                                                    : "#FFC107",
                                        fontWeight: 500,
                                    }}
                                >
                                    {item.status}
                                </span>
                                <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                    {item.status === "Pending" ? (
                                        <>
                                            {/*Accept Button */}
                                            <IconButton
                                                disableRipple
                                                onClick={() => openConfirmDialog('approve', item.requestId)}
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
                                                onClick={() => openConfirmDialog('reject', item.requestId)}
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
                                            <RiPencilFill style={{fontSize: 19}}/>
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        ))
                        )}
                    </Box>
                )}
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
                <DialogTitle>
                    Confirm {confirmDialog.action === 'approve' ? 'Approval' : 'Rejection'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {confirmDialog.action === 'approve' ? 'approve' : 'reject'} this request?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmAction} 
                        color={confirmDialog.action === 'approve' ? 'success' : 'error'}
                        variant="contained"
                    >
                        {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton text="Export CSV" width="200px" onClick={handleExportCSV}/>
            </Box>
        </Box>
    );
}