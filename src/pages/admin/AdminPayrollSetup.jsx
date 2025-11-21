import React, {useState} from "react";
import {Box, Button, IconButton, MenuItem, Select, TextField, Typography} from "@mui/material";
import {RiPencilFill} from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal";
import { useTheme } from '@mui/material/styles';

export default function AdminPayrollSetup() {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState("integration");
    const [modalType, setModalType] = useState("");
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openModalState, setOpenModalState] = useState(false);
    const [showRemove, setShowRemove] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const openModal = (type, item = null) => {
        setModalType(type);
        setSelectedItem(item);
        setOpenModalState(true);
    };

    const handleCloseModal = () => {
        setOpenModalState(false);
        setSelectedComponent(null);
        setIsEditing(false);
    };

    const taxSettings = [{type: "SSS", rate: "3.0%", date: "Aug. 11, 2025"}, {
        type: "Philhealth", rate: "3.5%", date: "Aug. 11, 2025"
    }, {type: "Pag-IBIG", rate: "2.0%", date: "Aug. 11, 2025"}, {
        type: "Withholding Tax", rate: "Variable", date: "Aug. 11, 2025"
    },];

    const payComponents = [{component: "Basic Salary", type: "Fixed", status: "Active"}, {
        component: "Allowance", type: "Variable", status: "Active"
    }, {component: "Bonus", type: "Manual Entry", status: "Inactive"}, {
        component: "Overtime Pay", type: "Computed", status: "Active"
    },];

    const renderCards = () => {
        switch (activeTab) {
            case "integration":
                return (<Box
                    sx={{
                        display: "flex", flexDirection: "column", fontFamily: "'TTHoves-Regular', sans-serif",
                    }}
                >
                </Box>);
            case "taxSettings":
                return (<Box
                    sx={{
                        display: "flex", flexDirection: "column", fontFamily: theme.typography.fontFamily,
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
                            "&::-webkit-scrollbar": {width: 0, height: 0},
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {taxSettings.map((item, index) => (<Box
                            key={index}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
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
                                        transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                    textAlign: "center",
                                }}
                            >
                                <span>{item.type}</span>
                                <span>{item.rate}</span>
                                <span>{item.date}</span>
                                <IconButton
                                    onClick={() => openModal("taxSettings", item)}
                                    sx={{
                                        bgcolor: "#3A4F50",
                                        color: "#fff",
                                        width: "30px",
                                        height: "30px",
                                        margin: "auto",
                                        "&:hover": {bgcolor: "#2E3B3D", transform: "translateY(-3px)"},
                                    }}
                                >
                                    <RiPencilFill/>
                                </IconButton>
                            </Box>
                        </Box>))}
                    </Box>
                </Box>);
            case "payComponents":
                return (<Box
                    sx={{
                        display: "flex", flexDirection: "column", fontFamily: theme.typography.fontFamily,
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
                            "&::-webkit-scrollbar": {width: 0, height: 0},
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {payComponents.map((item, index) => (<Box
                            key={index}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
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
                                        transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                    textAlign: "center",
                                }}
                            >
                                <span>{item.component}</span>
                                <span>{item.type}</span>
                                <span>{item.status}</span>
                                <Box
                                    sx={{
                                        display: "flex", gap: "8px", justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => {
                                            setSelectedComponent(item);
                                            setIsEditing(true);
                                            setModalType("payComponents");
                                            setShowRemove(true);
                                            setOpenModalState(true);
                                        }}

                                        sx={{
                                            bgcolor: "#3A4F50",
                                            color: "#fff",
                                            width: "30px",
                                            height: "30px",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                transform: "translateY(-3px)", bgcolor: "#2E3B3D",
                                            },
                                        }}
                                    >
                                        <RiPencilFill/>
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>))}
                    </Box>
                </Box>);
            default:
                return null;
        }
    };

    const renderModalContent = () => {
        switch (modalType) {
            case "integration":
                return (<Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2,
                        }}
                    >
                        Integration Settings
                    </Typography>
                </Box>);

            case "taxSettings":
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
                        Edit Tax Setting
                    </Typography>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                            Tax Type
                        </Typography>

                        <Select
                            displayEmpty
                            sx={{
                                backgroundColor: "rgba(255,255,255,0.2)",
                                borderRadius: "13px",
                                color: "#fff",
                                fontSize: "18px",
                                "& .MuiSelect-select": {
                                    padding: "8px 12px",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "rgba(255,255,255,0.4)",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "rgba(255,255,255,0.9)",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "rgba(255,255,255,0.6)",
                                },
                                "& .MuiSvgIcon-root": {
                                    color: "#fff",
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: "#ffffff", color: "#1e1e1e",
                                    }
                                }
                            }}
                            renderValue={(selected) => {
                                if (!selected) return <span
                                    style={{color: "rgba(255,255,255,0.4"}}>Select Tax Type</span>;
                                return selected;
                            }}
                        >
                            {["SSS", "PhilHealth", "Pag-IBIG", "Withholding Tax"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                            Rate
                        </Typography>

                        <TextField
                            placeholder="Enter percentage"
                            fullWidth
                            variant="outlined"
                            size="small"
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
                            Date
                        </Typography>

                        <input
                            type="date"
                            style={{
                                flex: 1,
                                padding: "10px",
                                height: "45px",
                                borderRadius: "13px",
                                fontSize: "18px",
                                backgroundColor: "rgba(255,255,255,0.2)",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.4)",
                                outline: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                boxSizing: "border-box",
                                transition: "border-color 0.25s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = "rgba(255,255,255,0.6)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = "rgba(255,255,255,0.4)";
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = "rgba(255,255,255,0.9)";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = "rgba(255,255,255,0.4)";
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: "flex", justifyContent: "flex-end", gap: 2, mt: 3,
                        }}
                    >
                        <ActionButton
                            text="Remove"
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
                            Save
                        </Box>
                    </Box>
                </Box>);

            case "payComponents":
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
                        {isEditing ? "Edit Pay Component" : "Add Pay Component"}
                    </Typography>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                            Formula or Fixed Amount
                        </Typography>

                        <TextField
                            placeholder="Component Name"
                            fullWidth
                            value={selectedComponent?.name || ""}
                            onChange={(e) => !isEditing && setSelectedComponent(prev => ({
                                ...prev, name: e.target.value
                            }))}
                            disabled={isEditing}
                            variant="outlined"
                            size="small"
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
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}
                        >
                            Type
                        </Typography>

                        <Select
                            value={selectedComponent?.type || ""}
                            onChange={(e) => setSelectedComponent(prev => ({...prev, type: e.target.value}))}
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
                                    style={{color: "rgba(255,255,255,0.4)"}}>Select Role</span>;
                                return selected;
                            }}
                        >
                            {["Fixed", "Variable", "Manual Entry", "Computed"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}
                        >
                            Status
                        </Typography>

                        <Select
                            value={selectedComponent?.status || ""}
                            onChange={(e) => setSelectedComponent(prev => ({...prev, status: e.target.value}))}
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
                                    style={{color: "rgba(255,255,255,0.4)"}}>Select Role</span>;
                                return selected;
                            }}
                        >
                            {["Fixed", "Variable", "Manual Entry", "Computed"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    <Box
                        sx={{
                            display: "flex", justifyContent: showRemove ? "center" : "flex-end", gap: 2, mt: 3,
                        }}
                    >
                        {showRemove && (<ActionButton
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
                </Box>);

            default:
                return null;
        }
    };

    return (<Box
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
                height: "93%",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "15px",
                backdropFilter: "blur(12px)",
                p: "12px 24px",
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
                {["integration", "taxSettings", "payComponents"].map((tab) => (<Button
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
                    {tab === "integration" ? "Integration" : tab === "taxSettings" ? "Tax Settings" : tab === "payComponents" ? "Pay Components" : tab}
                </Button>))}
            </Box>

            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)",
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
                        display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px",
                    }}
                >
                    <Box sx={{display: "flex", alignItems: "center", gap: "12px"}}>
                        <Box sx={{display: "flex", gap: 2}}>
                            {activeTab === "payComponents" && (<ActionButton
                                text="Add Pay Component"
                                width="200px"
                                onClick={() => {
                                    setSelectedComponent({name: "", type: "", status: ""});
                                    setIsEditing(false);
                                    setModalType("payComponents");
                                    setOpenModalState(true);
                                }}
                            />)}
                        </Box>
                    </Box>
                </Box>

                {renderCards()}

                <BoxModal
                    open={openModalState}
                    onClose={handleCloseModal}
                    width={modalType === "integration" ? 450 : modalType === "taxSettings" ? 450 : 480}
                    height={modalType === "integration" ? 450 : modalType === "taxSettings" ? 450 : 460}
                >
                    {renderModalContent()}
                </BoxModal>
            </Box>
        </Box>
    </Box>);
}
