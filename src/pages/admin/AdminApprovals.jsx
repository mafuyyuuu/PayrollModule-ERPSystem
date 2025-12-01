import React, {useState, useEffect} from "react";
import {
    Box, Button, IconButton, Typography, useTheme, Checkbox, Tooltip, Switch, Select, MenuItem, TextField, CircularProgress
} from "@mui/material";
import {styled} from "@mui/material/styles";
import {RiSettings3Fill, RiEyeFill, RiCheckFill, RiCloseFill} from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

export default function AdminApproval() {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState("workflow");
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [selectedException, setSelectedException] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Confirmation modals
    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const handleOpenModal = (workflow = null) => {
        if (workflow) {
            setSelectedWorkflow(workflow);
            setIsEditing(true);
        } else {
            setSelectedWorkflow({name: "", department: "", description: ""});
            setIsEditing(false);
        }

        setModalType("workflow");
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedItem(null);
    };

    const [workflowData, setWorkflowData] = useState([]);
    const [exceptionsData, setExceptionsData] = useState([]);

    // Fetch data from database
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch workflows
            const workflowResponse = await fetch('http://localhost:8080/api/admin/workflows');
            if (workflowResponse.ok) {
                const workflows = await workflowResponse.json();
                setWorkflowData(workflows);
            }

            // Fetch exceptions/requests
            const exceptionsResponse = await fetch('http://localhost:8080/api/admin/exceptions');
            if (exceptionsResponse.ok) {
                const exceptions = await exceptionsResponse.json();
                setExceptionsData(exceptions);
            }
        } catch (error) {
            console.error('Error fetching approval data:', error);
            // No fallback data - show empty state instead
            setWorkflowData([]);
            setExceptionsData([]);
        } finally {
            setLoading(false);
        }
    };

    // Approve exception request
    const handleApproveException = async (requestId) => {
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/pending-requests/${requestId}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved_by: null, remarks: 'Approved by admin' })
            });
            if (response.ok) {
                // Refresh data
                fetchData();
            } else {
                alert('Failed to approve request');
            }
        } catch (error) {
            console.error('Error approving exception:', error);
            alert('Error approving request');
        } finally {
            setSaving(false);
        }
    };

    // Reject exception request
    const handleRejectException = async (requestId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/pending-requests/${requestId}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved_by: null, remarks: reason })
            });
            if (response.ok) {
                // Refresh data
                fetchData();
            } else {
                alert('Failed to reject request');
            }
        } catch (error) {
            console.error('Error rejecting exception:', error);
            alert('Error rejecting request');
        } finally {
            setSaving(false);
        }
    };

    const [checkedWorkflows, setCheckedWorkflows] = useState([]);
    const hasCheckedRules = checkedWorkflows.length > 0;

    // Show delete confirmation modal
    const showDeleteConfirmation = () => {
        setPendingAction('delete');
        setDeleteConfirmModalOpen(true);
    };

    // Confirm and execute delete
    const confirmDeleteWorkflows = async () => {
        setDeleteConfirmModalOpen(false);
        setSaving(true);
        
        try {
            // Get the IDs of workflows to delete
            const workflowsToDelete = workflowData.filter(w => checkedWorkflows.includes(w.name));
            const idsToDelete = workflowsToDelete.map(w => w.id).filter(id => id);
            
            if (idsToDelete.length > 0) {
                const response = await fetch('http://localhost:8080/api/admin/workflows/delete-batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: idsToDelete })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete workflows');
                }
            }
            
            // Refresh data from server
            await fetchData();
            setCheckedWorkflows([]);
        } catch (error) {
            console.error('Error deleting workflows:', error);
            alert('Error deleting workflows');
        } finally {
            setSaving(false);
        }
    };

    // Show save confirmation modal
    const showSaveConfirmation = () => {
        if (!selectedWorkflow?.name || !selectedWorkflow?.type || !selectedWorkflow?.approver) {
            alert('Please fill in all required fields');
            return;
        }
        setPendingAction('save');
        setSaveConfirmModalOpen(true);
    };

    // Confirm and execute save
    const confirmSaveWorkflow = async () => {
        setSaveConfirmModalOpen(false);
        setSaving(true);
        try {
            const url = isEditing 
                ? `http://localhost:8080/api/admin/workflows/${selectedWorkflow.id}`
                : 'http://localhost:8080/api/admin/workflows';
            
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: selectedWorkflow.name,
                    type: selectedWorkflow.type,
                    approver: selectedWorkflow.approver,
                    status: selectedWorkflow.status || 'Active'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save workflow');
            }
            
            // Refresh data from server
            await fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving workflow:', error);
            alert('Error saving workflow');
        } finally {
            setSaving(false);
        }
    };

    const ModernSwitch = styled(Switch)({
        width: 50,
        height: 28,
        padding: 0,
        borderRadius: 14,

        "& .MuiSwitch-switchBase": {
            padding: 2,
            "&.Mui-checked": {
                transform: "translateX(22px)",
                color: "#fff",
                "& + .MuiSwitch-track": {
                    backgroundColor: "#3A4F50",
                    opacity: 1,
                },
            },
        },

        "& .MuiSwitch-thumb": {
            width: 24,
            height: 24,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            borderRadius: 12,
        },

        "& .MuiSwitch-track": {
            borderRadius: 14,
            backgroundColor: "#bdbdbd",
            opacity: 1,
        },
    });

    const renderTable = () => {
        const isWorkflow = activeTab === "workflow";
        const data = isWorkflow ? workflowData : exceptionsData;

        return (<Box
            sx={{
                paddingLeft: "10px",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'TTHoves-Regular', sans-serif",
            }}
        >
            {isWorkflow ? (<Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                }}
            >
                <Checkbox
                    checked={checkedWorkflows.length === workflowData.length}
                    indeterminate={checkedWorkflows.length > 0 && checkedWorkflows.length < workflowData.length}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setCheckedWorkflows(workflowData.map((w) => w.name));
                        } else {
                            setCheckedWorkflows([]);
                        }
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
                        gridTemplateColumns: "repeat(5, 1fr)",
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        p: "8px 0",
                        borderRadius: "15px",
                        width: "100%",
                        alignItems: "center",
                    }}
                >
                    <span style={{marginLeft: "7px", textAlign: "left"}}>Workflow Name</span>
                    <span style={{textAlign: "center"}}>Type</span>
                    <span style={{textAlign: "center"}}>Approval Role</span>
                    <span style={{textAlign: "center"}}>Status</span>
                    <span style={{textAlign: "center"}}>Actions</span>
                </Box>
            </Box>) : (<Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        p: "8px 0",
                        borderRadius: "15px",
                        width: "100%",
                        alignItems: "center",
                    }}
                >
                    <span style={{textAlign: "center"}}>ID</span>
                    <span style={{textAlign: "center"}}>Employee Name</span>
                    <span style={{textAlign: "center"}}>Type</span>
                    <span style={{textAlign: "center"}}>Period</span>
                    <span style={{textAlign: "center"}}>Date Filed</span>
                    <span style={{textAlign: "center"}}>Status</span>
                    <span style={{textAlign: "center"}}>Actions</span>
                </Box>
            </Box>)}
            <Box
                sx={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {width: 0, height: 0},
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                }}
            >
                {data.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                        {isWorkflow ? 'No workflows configured. Click "New Workflow" to create one.' : 'No exception requests found.'}
                    </Box>
                ) : (
                data.map((item) => (<Box
                    key={isWorkflow ? item.name : item.id}
                    sx={{
                        marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                    }}
                >
                    {isWorkflow ? (<>
                        <Checkbox
                            checked={checkedWorkflows.includes(item.name)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setCheckedWorkflows([...checkedWorkflows, item.name]);
                                } else {
                                    setCheckedWorkflows(checkedWorkflows.filter((w) => w !== item.name));
                                }
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
                                gridTemplateColumns: "repeat(5, 1fr)",
                                alignItems: "center",
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
                            <span style={{paddingLeft: "15px", textAlign: "left"}}>{item.name}</span>
                            <span style={{textAlign: "center"}}>{item.type}</span>
                            <span style={{textAlign: "center"}}>{item.approver}</span>
                            <span style={{textAlign: "center"}}>
                                    <Box
                                        component="span"
                                        sx={{
                                            display: "inline-block",
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            bgcolor: item.status === "Active" ? "#28a745" : "#dc3545",
                                            mr: "4px",
                                        }}
                                    />
                                {item.status}
                                </span>
                            <Box sx={{display: "flex", justifyContent: "center"}}>
                                <IconButton
                                    onClick={() => handleOpenModal(item)}
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
                                    <RiSettings3Fill style={{fontSize: 19}}/>
                                </IconButton>
                            </Box>
                        </Box>
                    </>) : (<Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            alignItems: "center",
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
                        <span style={{textAlign: "center"}}>{item.id}</span>
                        <span style={{textAlign: "center"}}>{item.name}</span>
                        <span style={{textAlign: "center"}}>{item.type}</span>
                        <span style={{textAlign: "center"}}>{item.period}</span>
                        <span style={{textAlign: "center"}}>{item.dateFiled}</span>
                        <span style={{textAlign: "center"}}>
                            <Box
                                component="span"
                                sx={{
                                    display: "inline-block",
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    bgcolor: item.status === "Active" ? "#28a745" : "#dc3545",
                                    mr: "4px",
                                }}
                            />
                            {item.status}
                        </span>
                        <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                            {item.status === "Pending" ? (
                                <>
                                    {/* Accept Button */}
                                    <IconButton
                                        onClick={() => handleApproveException(item.requestId)}
                                        disabled={saving}
                                        disableRipple
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
                                        onClick={() => handleRejectException(item.requestId)}
                                        disabled={saving}
                                        disableRipple
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
                                    onClick={() => {
                                        setSelectedException(item);
                                        setModalType("viewException");
                                        setOpenModal(true);
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
                                    <RiEyeFill style={{ fontSize: 19 }}/>
                                </IconButton>
                            )}
                        </Box>
                    </Box>)}
                </Box>))
                )}
            </Box>
        </Box>);
    };

    const renderModalContent = () => {
        switch (modalType) {
            case "workflow":
                return (
                    <Box
                        sx={{
                            color: (theme) => (theme.palette.mode === "dark" ? "#fff" : "#222"),
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 2
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF"
                                }}
                            >
                                {isEditing ? "Configure Workflow" : "Add New Workflow"}
                            </Typography>

                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                <Tooltip title="Active or Inactive?">
                                    <ModernSwitch/>
                                </Tooltip>
                            </Box>
                        </Box>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Workflow Name
                            </Typography>

                            <TextField
                                placeholder="Enter workflow name"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={selectedWorkflow?.name || ""}
                                onChange={(e) =>
                                    setSelectedWorkflow(prev => ({ ...prev, name: e.target.value }))
                                }
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

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Type
                            </Typography>

                            <Select
                                value={selectedWorkflow?.type || ""}
                                onChange={(e) =>
                                    setSelectedWorkflow(prev => ({...prev, type: e.target.value}))
                                }
                                displayEmpty
                                sx={{
                                    backgroundColor: "#cacace",
                                    borderRadius: "13px",
                                    color: "#1F2829",
                                    fontSize: "18px",
                                    "& .MuiSelect-select": {
                                        padding: "8px 12px",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        color: "#1F2829",
                                    },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            backgroundColor: "#ffffff", color: "#1F2829",
                                        }
                                    }
                                }}
                                renderValue={(selected) => {
                                    if (!selected) return <span style={{color: "#828689"}}>Select Workflow Type</span>;
                                    return selected;
                                }}
                            >
                                {["Payroll", "Overtime", "Leave", "Salary Adjustment", "Bonus", "Deduction"].map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Approval Role
                            </Typography>

                            <Select
                                value={selectedWorkflow?.approver || ""}
                                onChange={(e) =>
                                    setSelectedWorkflow(prev => ({...prev, approver: e.target.value}))
                                }
                                displayEmpty
                                sx={{
                                    backgroundColor: "#cacace",
                                    borderRadius: "13px",
                                    color: "#1F2829",
                                    fontSize: "18px",
                                    "& .MuiSelect-select": {
                                        padding: "8px 12px",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        color: "#1F2829",
                                    },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            backgroundColor: "#ffffff", color: "#1F2829",
                                        }
                                    }
                                }}
                                renderValue={(selected) => {
                                    if (!selected) return <span
                                        style={{color: "#828689"}}>Select Approval Role</span>;
                                    return selected;
                                }}
                            >
                                {["Admin", "Manager", "Payroll", "Department Head", "Supervisor", "HR"].map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>

                        <Box
                            sx={{
                                display: "flex", justifyContent: isEditing ? "center" : "flex-end", gap: 2, mt: 3,
                            }}
                        >
                            {isEditing && (
                                <Box
                                    component="button"
                                    onClick={handleCloseModal}
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
                                    Remove
                                </Box>
                            )}
                            <Box
                                component="button"
                                onClick={showSaveConfirmation}
                                disabled={saving}
                                sx={{
                                    display: "flex-end",
                                    fontSize: "16px",
                                    backgroundColor: saving ? "#666" : "#172224",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: saving ? "#666" : "#1f2f31",
                                        transform: saving ? "none" : "translateY(-2px)",
                                        boxShadow: saving ? "none" : "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                {saving ? "Saving..." : "Save"}
                            </Box>
                        </Box>
                    </Box>
                );

            case "viewException":
                return (<Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            color: (theme) => (theme.palette.mode === "dark" ? "#fff" : "#222"),
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2,
                            }}
                        >
                            Exception Details
                        </Typography>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Employee Name
                            </Typography>

                            <TextField
                                value={selectedException?.name || ""}
                                fullWidth
                                variant="outlined"
                                size="small"
                                InputProps={{ readOnly: true }}
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

                        <Box sx={{display: "flex", gap: 1, mt: 2}}>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                    Type
                                </Typography>
                                <TextField
                                    value={selectedException?.type || ""}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
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

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                    Period
                                </Typography>
                                <TextField
                                    value={selectedException?.period || ""}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                    sx={{
                                        width: "308px",
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

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Date Filed
                            </Typography>

                            <TextField
                                value={selectedException?.dateFiled || ""}
                                fullWidth
                                variant="outlined"
                                size="small"
                                InputProps={{ readOnly: true }}
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

                        <Box sx={{display: "flex", gap: 1, mt: 2}}>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                    Status
                                </Typography>

                                <TextField
                                    value={selectedException?.status || ""}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
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
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                    {selectedException?.status
                                        ? selectedException.status.toLowerCase() === "approved"
                                            ? "Date Approved"
                                            : selectedException.status.toLowerCase() === "rejected"
                                                ? "Date Rejected"
                                                : "Pending"
                                        : "Pending"}
                                </Typography>
                                <TextField
                                    value={selectedException?.dateApproved || ""}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                    sx={{
                                        width: "300px",
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
                        {selectedException?.status?.toLowerCase() === "rejected" && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                                <Typography
                                    sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}
                                >
                                    Reason for Rejection
                                </Typography>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                    multiline
                                    rows={4}
                                    maxRows={10}
                                    value={selectedException.reason || ""}
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
                                        },
                                        "& .MuiInputBase-input": {
                                            fontSize: "18px",
                                            boxSizing: "border-box",
                                            overflowY: "auto",
                                            scrollbarWidth: "none",
                                            msOverflowStyle: "none",
                                            "&::-webkit-scrollbar": { display: "none" },
                                        },
                                    }}

                                />
                            </Box>
                        )}
                    </Box>
                );

            default:
                return null;
        }
    };

    return (<Box width="100%" height="100%" sx={{fontFamily: theme.typography.fontFamily}}>
        <Typography
            variant="h5"
            sx={{
                fontSize: "20px",
                fontFamily: "'TTHoves-Bold', sans-serif",
                color: theme.palette.text.primary,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "25px",
            }}
        >
            Approval Management
        </Typography>

        <Box
            sx={{
                height: "93%",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "15px",
                backdropFilter: "blur(12px)",
                pt: "12px",
                pb: "12px",
                pl: "24px",
                pr: "24px",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    gap: "12px",
                    mb: "13px",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.3)",
                    border: `1px solid ${theme.palette.divider}`,
                    p: "12px",
                    borderRadius: "25px",
                }}
            >
                <Button
                    onClick={() => setActiveTab("workflow")}
                    sx={{
                        bgcolor: activeTab === "workflow" ? "#fff" : "#bdbdbd",
                        color: activeTab === "workflow" ? "#172224" : "#3a4f50",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "15px",
                        fontSize: "18px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        minWidth: "200px",
                        minHeight: "50px",
                    }}
                >
                    Approval Workflow
                </Button>
                <Button
                    onClick={() => setActiveTab("exceptions")}
                    sx={{
                        bgcolor: activeTab === "exceptions" ? "#fff" : "#bdbdbd",
                        color: activeTab === "exceptions" ? "#172224" : "#3a4f50",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "15px",
                        fontSize: "18px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        minWidth: "200px",
                        minHeight: "50px",
                    }}
                >
                    Manage Exceptions
                </Button>
            </Box>

            <Box
                sx={{
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.3)",
                    height: "85%",
                    borderRadius: "12px",
                    p: "24px",
                    color: "#222",
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Box
                    sx={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px",
                    }}
                >
                    <Box sx={{display: "flex", alignItems: "center", gap: "12px"}}>
                        <Box sx={{display: "flex", gap: 2}}>
                            {activeTab === "workflow" && (<ActionButton
                                text="New Workflow"
                                width="200px"
                                onClick={() => handleOpenModal()}
                            />)}

                            {activeTab === "workflow" && hasCheckedRules && (<ActionButton
                                text="Delete Selected"
                                width="200px"
                                onClick={showDeleteConfirmation}
                            />)}
                        </Box>
                    </Box>
                </Box>

                {renderTable()}

                <BoxModal
                    open={openModal}
                    onClose={handleCloseModal}
                    width={
                        modalType === "workflow" ? 490 :
                            modalType === "viewException" ? 550 :
                                500
                    }
                    height={
                        modalType === "workflow" ? 445 :
                            modalType === "viewException" ? 535 :
                                500
                    }
                >
                    {renderModalContent()}
                </BoxModal>

                {/* Save Confirmation Modal */}
                <BoxModal
                    open={saveConfirmModalOpen}
                    onClose={() => setSaveConfirmModalOpen(false)}
                    width={400}
                    height={200}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontFamily: "'TTHoves-Bold', sans-serif", color: theme.palette.text.primary, mb: 2 }}>
                                Confirm Save
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-Regular', sans-serif", color: theme.palette.text.secondary }}>
                                Are you sure you want to save this workflow?
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Box
                                component="button"
                                onClick={() => setSaveConfirmModalOpen(false)}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#bdbdbd",
                                    color: "#333",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#a0a0a0" }
                                }}
                            >
                                Cancel
                            </Box>
                            <Box
                                component="button"
                                onClick={confirmSaveWorkflow}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#1f2f31" }
                                }}
                            >
                                Confirm
                            </Box>
                        </Box>
                    </Box>
                </BoxModal>

                {/* Delete Confirmation Modal */}
                <BoxModal
                    open={deleteConfirmModalOpen}
                    onClose={() => setDeleteConfirmModalOpen(false)}
                    width={400}
                    height={200}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontFamily: "'TTHoves-Bold', sans-serif", color: theme.palette.text.primary, mb: 2 }}>
                                Confirm Delete
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-Regular', sans-serif", color: theme.palette.text.secondary }}>
                                Are you sure you want to delete {checkedWorkflows.length} selected workflow(s)? This action cannot be undone.
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Box
                                component="button"
                                onClick={() => setDeleteConfirmModalOpen(false)}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#bdbdbd",
                                    color: "#333",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#a0a0a0" }
                                }}
                            >
                                Cancel
                            </Box>
                            <Box
                                component="button"
                                onClick={confirmDeleteWorkflows}
                                sx={{
                                    fontSize: "14px",
                                    backgroundColor: "#c42b2b",
                                    color: "#fff",
                                    padding: "10px 24px",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": { backgroundColor: "#a32020" }
                                }}
                            >
                                Delete
                            </Box>
                        </Box>
                    </Box>
                </BoxModal>
            </Box>
        </Box>
    </Box>);
}