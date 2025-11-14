import React, { useState } from "react";
import {Box, Button, IconButton, Typography} from "@mui/material"; // Added Box import
import "../styles/AdminPayrollSetup.css";
import { RiPencilFill } from "react-icons/ri";
import {useTheme} from "@mui/material/styles";
import ActionButton from "../../components/ActionButton.jsx";

export default function AdminPayrollSetup() {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState("integration");
    const [openModal, setOpenModal] = useState(false);
    const [newComponent, setNewComponent] = useState({
        name: "",
        type: "Fixed",
        status: "Active",
    });

    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    const taxSettings = [
        { type: "SSS", rate: "3.0%", date: "Aug. 11, 2025" },
        { type: "Philhealth", rate: "3.5%", date: "Aug. 11, 2025" },
        { type: "Pag-IBIG", rate: "2.0%", date: "Aug. 11, 2025" },
        { type: "Withholding Tax", rate: "Variable", date: "Aug. 11, 2025" },
    ];

    const payComponents = [
        { component: "Basic Salary", type: "Fixed", status: "Active" },
        { component: "Allowance", type: "Variable", status: "Active" },
        { component: "Bonus", type: "Manual Entry", status: "Inactive" },
        { component: "Overtime Pay", type: "Computed", status: "Active" },
    ];

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const handleSaveComponent = () => {
        console.log("Saving component:", newComponent);
        setOpenModal(false);
    };

    const renderCards = () => {
        switch (activeTab) {
            case "integration":
                return (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                        }}
                    >
                    </Box>
                );
            case "taxSettings":
                return (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            fontFamily: theme.typography.fontFamily,
                        }}
                    >
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
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    color: theme.palette.text.primary,
                                    fontWeight: 700,
                                    p: "8px 0",
                                    width: "100%",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                <span>Type</span>
                                <span>Rate</span>
                                <span>Date</span>
                                <span>Action</span>
                            </Box>
                        </Box>

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
                            {taxSettings.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        marginTop: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        mb: "12px",
                                    }}
                                >
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(4, 1fr)",
                                            alignItems: "center",
                                            bgcolor: "#fff",
                                            color: "#1b2223",
                                            borderRadius: "8px",
                                            width: "100%",
                                            minHeight: "80px",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                            },
                                            textAlign: "center",
                                        }}
                                    >
                                        <span>{item.type}</span>
                                        <span>{item.rate}</span>
                                        <span>{item.date}</span>
                                        <IconButton
                                            onClick={() => openModal("tax", item)}
                                            sx={{
                                                bgcolor: "#3A4F50",
                                                color: "#fff",
                                                width: "30px",
                                                height: "30px",
                                                margin: "auto",
                                                "&:hover": { bgcolor: "#2E3B3D", transform: "translateY(-3px)" },
                                            }}
                                        >
                                            <RiPencilFill />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                );
            case "payComponents":
                return (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            fontFamily: theme.typography.fontFamily,
                        }}
                    >
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
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    color: theme.palette.text.primary,
                                    fontWeight: 700,
                                    p: "8px 0",
                                    width: "100%",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                <span>Component</span>
                                <span>Type</span>
                                <span>Status</span>
                                <span>Action</span>
                            </Box>
                        </Box>

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
                            {payComponents.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        marginTop: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        mb: "12px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(4, 1fr)",
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
                                            textAlign: "center",
                                        }}
                                    >
                                        <span>{item.component}</span>
                                        <span>{item.type}</span>
                                        <span>{item.status}</span>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: "8px",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <IconButton
                                                onClick={() => openModal("payComponent", item)}
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
                                                <RiPencilFill />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box
            width="100%"
            height="100%"
            sx={{
                fontFamily: theme.typography.fontFamily,
            }}
        >
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
                Payment System Setup
            </Typography>

            <Box
                sx={{
                    height:"93%",
                    backgroundColor: theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
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
                    {["integration", "taxSettings", "payComponents"].map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                bgcolor: activeTab === tab ? "#fff" : "#bdbdbd",
                                color: activeTab === tab ? "#172224" : "#3a4f50",
                                fontWeight: 700,
                                textTransform: "none",
                                borderRadius: "15px",
                                fontSize: "18px",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                minWidth: "200px",
                                minHeight: "50px",
                            }}
                        >
                            {tab === "integration"
                                ? "Integration"
                                : tab === "taxSettings"
                                    ? "Tax Settings"
                                    : tab === "payComponents"
                                        ? "Pay Components"
                                        : tab}
                        </Button>
                    ))}
                </Box>

                <Box
                    sx={(theme) => ({
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.1)",
                        height: "85%",
                        borderRadius: "12px",
                        p: "24px",
                        color: "#222",
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        border: `1px solid ${theme.palette.divider}`,
                    })}
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
                                {activeTab === "taxSettings" && (
                                    <ActionButton
                                        text="Add Pay Component"
                                        width="200px"
                                        onClick={() => openModal("payComponent")}
                                    />
                                )}

                                {activeTab === "payComponents" && (
                                    <ActionButton
                                        text="Add Pay Component"
                                        width="200px"
                                        onClick={() => openModal("payComponent")}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {renderCards()}
                </Box>
            </Box>
        </Box>
    );
}