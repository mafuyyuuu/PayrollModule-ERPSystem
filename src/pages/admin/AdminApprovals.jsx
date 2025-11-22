import React, {useState} from "react";
import {
    Box, Button, IconButton, Typography, useTheme, Checkbox, Tooltip, Switch, Select, MenuItem, TextField
} from "@mui/material";
import {styled} from "@mui/material/styles";
import {RiSettings3Fill, RiEyeFill} from "react-icons/ri";
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

    const [workflowData, setWorkflowData] = useState([{
        name: "Payroll Flow",
        type: "Payroll",
        approver: "Manager",
        status: "Active"
    }, {name: "Overtime Flow", type: "Overtime", approver: "Head", status: "Active"}, {
        name: "Leave Flow",
        type: "Leave",
        approver: "Supervisor",
        status: "Inactive"
    },]);

    const [exceptionsData] = useState([
        {
            id: "EX001",
            name: "Jhervin Jimenez",
            type: "Overtime",
            period: "Aug. 1 - Aug. 11, 2025",
            dateFiled: "Aug. 11, 2025",
            status: "Approved"
        },
        {
            id: "EX002",
            name: "Symon Banana",
            type: "Leave",
            period: "Sept. 1 - Sept. 12, 2025",
            dateFiled: "Sept. 12, 2025",
            status: "Pending"
        },
    ]);

    const [checkedWorkflows, setCheckedWorkflows] = useState([]);
    const hasCheckedRules = checkedWorkflows.length > 0;

    const handleDeleteSelectedWorkflows = () => {
        const remaining = workflowData.filter((workflow) => !checkedWorkflows.includes(workflow.name));
        setWorkflowData(remaining);
        setCheckedWorkflows([]);
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
                        gridTemplateColumns: "repeat(6, 1fr)",
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
                    <span style={{textAlign: "center"}}>Date</span>
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
                {data.map((item) => (<Box
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
                            gridTemplateColumns: "repeat(6, 1fr)",
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
                        <Box
                            sx={{
                                display: "flex", gap: "8px", justifyContent: "center",
                            }}
                        >
                            <Box sx={{display: "flex", justifyContent: "center"}}>
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
                                    <RiEyeFill style={{fontSize: 19}}/>
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>)}
                </Box>))}
            </Box>
        </Box>);
    };

    const renderModalContent = () => {
        switch (modalType) {
            case "workflow":
                return (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
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
                                <Tooltip title="Workflow is Active or Inactive">
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
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        color: "#fff",
                                        fontSize: "18px",
                                        "& fieldset": {
                                            borderColor: "rgba(255,255,255,0.4)",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "rgba(255,255,255,0.6)",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "rgba(255,255,255,0.9)",
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
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    borderRadius: "13px",
                                    color: "#fff",
                                    fontSize: "18px",
                                    "& .MuiSelect-select": {padding: "8px 12px"},
                                    "& .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.4)"},
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.9)"},
                                    "&:hover .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.6)"},
                                    "& .MuiSvgIcon-root": {color: "#fff"},
                                }}
                                MenuProps={{
                                    PaperProps: {sx: {backgroundColor: "#ffffff", color: "#1e1e1e"}}
                                }}
                                renderValue={(selected) => {
                                    if (!selected) return <span style={{color: "rgba(255,255,255,0.4)"}}>Select Workflow Type</span>;
                                    return selected;
                                }}
                            >
                                {["Payroll", "Overtime", "Leave"].map((option) => (
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
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    borderRadius: "13px",
                                    color: "#fff",
                                    fontSize: "18px",
                                    "& .MuiSelect-select": {padding: "8px 12px"},
                                    "& .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.4)"},
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.9)"},
                                    "&:hover .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.6)"},
                                    "& .MuiSvgIcon-root": {color: "#fff"},
                                }}
                                MenuProps={{
                                    PaperProps: {sx: {backgroundColor: "#ffffff", color: "#1e1e1e"}}
                                }}
                                renderValue={(selected) => {
                                    if (!selected) return <span
                                        style={{color: "rgba(255,255,255,0.4)"}}>Select Approver</span>;
                                    return selected;
                                }}
                            >
                                {["Manager", "Head", "Supervisor"].map((option) => (
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
                            {isEditing && (<ActionButton
                                text="Remove"
                                width="200px"
                                color="#b22222"
                                onClick={handleCloseModal}
                            />)}
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
                                Save
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
                                placeholder="Employee Name"
                                value={selectedException?.name || ""}
                                fullWidth
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        color: "#fff",
                                        fontSize: "18px",
                                    },
                                    "& .MuiInputBase-input": { fontSize: "18px" },
                                }}
                            />
                        </Box>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Box sx={{display: "flex", gap: 1}}>
                                <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                    <Typography
                                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                        Type
                                    </Typography>
                                    <TextField
                                        placeholder="Type"
                                        value={selectedException?.type || ""}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            width: "150px",
                                            "& .MuiOutlinedInput-root": {
                                                fontSize: "16px",
                                                borderRadius: "13px",
                                                backgroundColor: "rgba(255,255,255,0.2)",
                                            },
                                        }}
                                        disabled
                                    />
                                </Box>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5}}>
                                    <Typography
                                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                        Period
                                    </Typography>
                                    <TextField
                                        placeholder="Period"
                                        value={selectedException?.period || ""}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        disabled
                                        sx={{
                                            width: "228px",
                                            "& .MuiOutlinedInput-root": {
                                                fontSize: "16px",
                                                borderRadius: "13px",
                                                backgroundColor: "rgba(255,255,255,0.2)",
                                                color: "#fff",
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Date Filed
                            </Typography>

                            <TextField
                                placeholder="Date Filed"
                                value={selectedException?.dateFiled || ""}
                                fullWidth
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        color: "#fff",
                                        fontSize: "18px",
                                    },
                                    "& .MuiInputBase-input": { fontSize: "18px" },
                                }}
                            />
                        </Box>

                        <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Status
                            </Typography>

                            <TextField
                                placeholder="Status"
                                value={selectedException?.status || ""}
                                fullWidth
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        color: "#fff",
                                        fontSize: "18px",
                                    },
                                    "& .MuiInputBase-input": { fontSize: "18px" },
                                }}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: "flex", justifyContent: "center", gap: 2, mt: 3,
                            }}
                        >
                            <ActionButton
                                text="Reject"
                                width="200px"
                                color="#b22222"
                                onClick={handleCloseModal}
                            />
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
                                Approve
                            </Box>
                        </Box>
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
                                onClick={handleDeleteSelectedWorkflows}
                            />)}
                        </Box>
                    </Box>
                </Box>

                {renderTable()}

                <BoxModal
                    open={openModal}
                    onClose={handleCloseModal}
                    width={
                        modalType === "workflow" ? 450 :
                            modalType === "viewException" ? 450 :
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
            </Box>
        </Box>
    </Box>);
}