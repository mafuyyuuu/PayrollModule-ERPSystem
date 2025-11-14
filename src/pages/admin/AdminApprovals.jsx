import React, { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Typography,
    useTheme,
    Checkbox,
} from "@mui/material";
import { RiSettings3Fill, RiEyeFill } from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";

export default function AdminApproval() {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState("workflow");
    const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
    const [showConfigureModal, setShowConfigureModal] = useState(false);
    const [showExceptionModal, setShowExceptionModal] = useState(false);

    const [workflowData, setWorkflowData] = useState([
        { name: "Payroll Flow", type: "Payroll", approver: "Manager", status: "Active" },
        { name: "Overtime Flow", type: "Overtime", approver: "Head", status: "Active" },
        { name: "Leave Flow", type: "Leave", approver: "Supervisor", status: "Inactive" },
    ]);

    const [exceptionsData] = useState([
        { id: "EX001", employee: "Jhervin Jimenez", type: "Overtime", date: "Aug. 11, 2025", status: "Approved" },
        { id: "EX002", employee: "Symon Banana", type: "Leave", date: "Sept. 12, 2025", status: "Pending" },
    ]);

    const [checkedWorkflows, setCheckedWorkflows] = useState([]);
    const hasCheckedRules = checkedWorkflows.length > 0;

    const handleDeleteSelectedWorkflows = () => {
        const remaining = workflowData.filter(
            (workflow) => !checkedWorkflows.includes(workflow.name)
        );
        setWorkflowData(remaining);
        setCheckedWorkflows([]);
    };

    const [checkedExceptions, setCheckedExceptions] = useState([]);

    const renderTable = () => {
        const isWorkflow = activeTab === "workflow";
        const data = isWorkflow ? workflowData : exceptionsData;

        return (
            <Box
                sx={{
                    paddingLeft: "10px",
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "'TTHoves-Regular', sans-serif",
                }}
            >
                {isWorkflow ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        <Checkbox
                            checked={checkedWorkflows.length === workflowData.length}
                            indeterminate={
                                checkedWorkflows.length > 0 &&
                                checkedWorkflows.length < workflowData.length
                            }
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
                                "& .MuiSvgIcon-root": { fontSize: 25 },
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
                            <span style={{ marginLeft: "7px", textAlign: "left" }}>Workflow Name</span>
                            <span style={{ textAlign: "center" }}>Type</span>
                            <span style={{ textAlign: "center" }}>Approval Role</span>
                            <span style={{ textAlign: "center" }}>Status</span>
                            <span style={{ textAlign: "center" }}>Actions</span>
                        </Box>
                    </Box>
                ) : (
                    <Box
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
                            <span style={{ textAlign: "center" }}>ID</span>
                            <span style={{ textAlign: "center" }}>Employee Name</span>
                            <span style={{ textAlign: "center" }}>Type</span>
                            <span style={{ textAlign: "center" }}>Date</span>
                            <span style={{ textAlign: "center" }}>Status</span>
                            <span style={{ textAlign: "center" }}>Actions</span>
                        </Box>
                    </Box>
                )}

                <Box
                    sx={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: 0, height: 0 },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    {data.map((item) => (
                        <Box
                            key={isWorkflow ? item.name : item.id}
                            sx={{
                                marginTop: "10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                mb: "12px",
                            }}
                        >
                            {isWorkflow ? (
                                <>
                                    <Checkbox
                                        checked={checkedWorkflows.includes(item.name)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setCheckedWorkflows([...checkedWorkflows, item.name]);
                                            } else {
                                                setCheckedWorkflows(
                                                    checkedWorkflows.filter((w) => w !== item.name)
                                                );
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
                                            "& .MuiSvgIcon-root": { fontSize: 25 },
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
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                            },
                                        }}
                                    >
                                        <span style={{ paddingLeft: "15px", textAlign: "left" }}>{item.name}</span>
                                        <span style={{ textAlign: "center" }}>{item.type}</span>
                                        <span style={{ textAlign: "center" }}>{item.approver}</span>
                                        <span style={{ textAlign: "center" }}>
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
                                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                                            <IconButton
                                                onClick={() => setShowConfigureModal(true)}
                                                sx={{
                                                    bgcolor: "#3A4F50",
                                                    color: "#fff",
                                                    width: "30px",
                                                    height: "30px",
                                                    transition: "all 0.3s ease",
                                                    "&:hover": {
                                                        transform: "translateY(-3px)",
                                                        bgcolor: "#2E3B3D",
                                                    },
                                                }}
                                            >
                                                <RiSettings3Fill />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </>
                            ) : (
                                <Box
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
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                        },
                                    }}
                                >
                                    <span style={{ textAlign: "center" }}>{item.id}</span>
                                    <span style={{ textAlign: "center" }}>{item.employee}</span>
                                    <span style={{ textAlign: "center" }}>{item.type}</span>
                                    <span style={{ textAlign: "center" }}>{item.date}</span>
                                    <span style={{ textAlign: "center" }}>
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
                                            display: "flex",
                                            gap: "8px",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <IconButton
                                            onClick={() => setShowExceptionModal(true)}
                                            sx={{
                                                bgcolor: "#3A4F50",
                                                color: "#fff",
                                                width: "30px",
                                                height: "30px",
                                                transition: "all 0.3s ease",
                                                "&:hover": {
                                                    transform: "translateY(-3px)",
                                                    bgcolor: "#2E3B3D",
                                                },
                                            }}
                                        >
                                            <RiEyeFill />
                                        </IconButton>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    };

    return (
        <Box width="100%" height="100%" sx={{ fontFamily: theme.typography.fontFamily }}>
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
                    backgroundColor: theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    pt: "12px",
                    pb: "12px",
                    pl: "24px",
                    pr: "24px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: "12px",
                        mb: "13px",
                        backgroundColor: theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(255, 255, 255, 0.3)",
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
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.3)",
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
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: "16px",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                {activeTab === "workflow" && (
                                    <ActionButton
                                        text="New Workflow"
                                        width="200px"
                                        onClick={() => setShowNewWorkflowModal(true)}
                                    />
                                )}

                                {activeTab === "workflow" && hasCheckedRules && (
                                    <ActionButton
                                        text="Delete Selected"
                                        width="200px"
                                        onClick={handleDeleteSelectedWorkflows}
                                    />
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ position: "relative" }}>
                            <select
                                defaultValue=""
                                style={{
                                    appearance: "none",
                                    WebkitAppearance: "none",
                                    MozAppearance: "none",
                                    width: 100,
                                    padding: "10px 40px 10px 12px",
                                    borderRadius: "20px",
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.05)"
                                            : "rgba(255, 255, 255, 0.2)",
                                    backdropFilter: "blur(12px)",
                                    color: theme.palette.text.primary,
                                    fontFamily: "inherit",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    outline: "none",
                                }}
                            >
                                <option value="">Filter</option>
                            </select>
                            <i
                                className="ri-arrow-down-s-line"
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                    color: theme.palette.text.primary,
                                    fontSize: "18px",
                                }}
                            />
                        </Box>
                    </Box>

                    {renderTable()}
                </Box>
            </Box>
        </Box>
    );
}
