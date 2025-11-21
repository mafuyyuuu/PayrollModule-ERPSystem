import React, {useState} from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
    Box, Button, Typography, IconButton, Select, MenuItem, TextField, Checkbox, FormControlLabel, InputBase,
} from "@mui/material";
import {RiPencilFill, RiEyeFill} from "react-icons/ri";
import {useTheme} from "@mui/material/styles";
import BoxModal from "../../components/BoxModal";
import ActionButton from "../../components/ActionButton.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import SearchIcon from "@mui/icons-material/Search";

export default function AdminConfiguration() {
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState("payrollRules");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [showRemove, setShowRemove] = useState(false);
    const [filter, setFilter] = useState("");

    const [selectedRule, setSelectedRule] = useState("");
    const [selectedFreq, setSelectedFreq] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    const [rulesFromDB, setRulesFromDB] = useState([{
        id: 1, type: "Benefit", description: "Additional fixed compensation for specific purposes"
    }, {id: 2, type: "Deduction", description: "Mandatory payroll deductions"}, {
        id: 3, type: "Bonus", description: "Performance-based rewards"
    }, {id: 4, type: "Allowance", description: "Fixed allowances for specific tasks"}, {
        id: 5, type: "Deduction", description: "Mandatory payroll deductions"
    },]);

    const [cutoffsFromDB, setCutoffsFromDB] = useState([{
        id: 1,
        period: "January 2025 - 1st Half",
        startDate: "Jan 1, 2025",
        endDate: "Jan 15, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 2,
        period: "January 2025 - 2nd Half",
        startDate: "Jan 16, 2025",
        endDate: "Jan 31, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 3,
        period: "February 2025 - 1st Half",
        startDate: "Feb 1, 2025",
        endDate: "Feb 15, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 4,
        period: "February 2025 - 2nd Half",
        startDate: "Feb 16, 2025",
        endDate: "Feb 28, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 5,
        period: "March 2025 - 1st Half",
        startDate: "Mar 1, 2025",
        endDate: "Mar 15, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 6,
        period: "March 2025 - 2nd Half",
        startDate: "Mar 16, 2025",
        endDate: "Mar 31, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 7,
        period: "April 2025 - 1st Half",
        startDate: "Apr 1, 2025",
        endDate: "Apr 15, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 8,
        period: "April 2025 - 2nd Half",
        startDate: "Apr 16, 2025",
        endDate: "Apr 30, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 9, period: "May 2025 - 1st Half", startDate: "May 1, 2025", endDate: "May 15, 2025", frequency: "Bi-Monthly"
    }, {
        id: 10,
        period: "May 2025 - 2nd Half",
        startDate: "May 16, 2025",
        endDate: "May 31, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 11,
        period: "June 2025 - 1st Half",
        startDate: "Jun 1, 2025",
        endDate: "Jun 15, 2025",
        frequency: "Bi-Monthly"
    }, {
        id: 12,
        period: "June 2025 - 2nd Half",
        startDate: "Jun 16, 2025",
        endDate: "Jun 30, 2025",
        frequency: "Bi-Monthly"
    },]);

    const employeeGroupsFromDB = [{
        id: 1, department: "Human Resources", totalEmployees: 25, fullTime: 15, partTime: 7, temporary: 3,
    }, {
        id: 2, department: "Finance", totalEmployees: 18, fullTime: 12, partTime: 4, temporary: 2,
    }, {
        id: 3, department: "IT", totalEmployees: 30, fullTime: 25, partTime: 8, temporary: 2,
    },];

    const [checkedRules, setCheckedRules] = useState({});
    const [checkedCutoffs, setCheckedCutoffs] = useState({});
    const allRulesChecked = rulesFromDB.every(rule => checkedRules[rule.id]);
    const allCutoffsChecked = cutoffsFromDB.every(cutoff => checkedCutoffs[cutoff.id]);
    const hasCheckedRules = Object.values(checkedRules).some(Boolean);
    const hasCheckedCutoffs = Object.values(checkedCutoffs).some(Boolean);

    const handleSelectAllRules = (e) => {
        const checked = e.target.checked;
        const newChecked = {};
        rulesFromDB.forEach(rule => newChecked[rule.id] = checked);
        setCheckedRules(newChecked);
    };

    const handleDeleteSelectedRules = () => {
        const remaining = rulesFromDB.filter((rule) => !checkedRules[rule.id]);
        setRulesFromDB(remaining);
        setCheckedRules({});
    };

    const handleSelectAllCutoffs = (e) => {
        const checked = e.target.checked;
        const newChecked = {};
        cutoffsFromDB.forEach(cutoff => newChecked[cutoff.id] = checked);
        setCheckedCutoffs(newChecked);
    };

    const handleDeleteSelectedCutoffs = () => {
        const remaining = cutoffsFromDB.filter((cutoff) => !checkedCutoffs[cutoff.id]);
        setCutoffsFromDB(remaining);
        setCheckedCutoffs({});
    };

    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
        setSelectedRule("");
        setSelectedFreq("");
        setSelectedDept("");
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType("");
    };

    const renderCards = () => {
        switch (activeTab) {
            case "payrollRules":
                return (<Box
                    sx={{
                        paddingLeft: "10px",
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
                        <Checkbox
                            checked={allRulesChecked}
                            onChange={handleSelectAllRules}
                            sx={(theme) => ({
                                p: 0,
                                mr: "10px",
                                color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                borderRadius: "5px",
                                "&.Mui-checked": {
                                    color: theme.palette.mode === "dark" ? "#fff" : "#1F2829",
                                },
                                "& .MuiSvgIcon-root": {fontSize: 25},
                            })}
                        />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                p: "8px 0",
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            <span style={{marginLeft: "7px", textAlign: "left"}}>Rule Type</span>
                            <span style={{textAlign: "left"}}>Description</span>
                            <span style={{textAlign: "center"}}>Formula / Value</span>
                            <span style={{textAlign: "center"}}>Status</span>
                            <span style={{textAlign: "center"}}>Actions</span>
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
                        {rulesFromDB.map((rule) => (<Box
                            key={rule.id}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
                            <Checkbox
                                checked={!!checkedRules[rule.id]}
                                onChange={(e) => setCheckedRules((prev) => ({
                                    ...prev, [rule.id]: e.target.checked,
                                }))}
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
                                <span style={{paddingLeft: "15px", textAlign: "left"}}>
                                    {rule.type}
                                </span>
                                <span style={{textAlign: "left"}}>
                                    {rule.description}
                                </span>
                                <span style={{textAlign: "center"}}>10%</span>
                                <span style={{textAlign: "center"}}>
                                    <Box
                                        component="span"
                                        sx={{
                                            display: "inline-block",
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            bgcolor: "#28a745",
                                            mr: "4px",
                                        }}
                                    />
                                    Active
                                </span>
                                <Box
                                    sx={{
                                        display: "flex", gap: "8px", justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => {
                                            setShowRemove(true);
                                            -openModal("rule");
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

            case "cutoffDates":
                return (<Box
                    sx={{
                        paddingLeft: "10px",
                        display: "flex",
                        flexDirection: "column",
                        fontFamily: "'TTHoves-Regular', sans-serif",
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
                        <Checkbox
                            checked={allCutoffsChecked}
                            onChange={handleSelectAllCutoffs}
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
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            <span style={{marginLeft: "7px", textAlign: "left"}}>Period</span>
                            <span style={{textAlign: "center"}}>Start Date</span>
                            <span style={{textAlign: "center"}}>End Date</span>
                            <span style={{textAlign: "center"}}>Frequency</span>
                            <span style={{textAlign: "center"}}>Actions</span>
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
                        {cutoffsFromDB.map((cutoff) => (<Box
                            key={cutoff.id}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
                            <Checkbox
                                checked={!!checkedCutoffs[cutoff.id]}
                                onChange={(e) => setCheckedCutoffs((prev) => ({
                                    ...prev, [cutoff.id]: e.target.checked,
                                }))}
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
                                <span style={{paddingLeft: "15px", textAlign: "left"}}>{cutoff.period}</span>
                                <span style={{textAlign: "center"}}>{cutoff.startDate}</span>
                                <span style={{textAlign: "center"}}>{cutoff.endDate}</span>
                                <span style={{textAlign: "center"}}>{cutoff.frequency}</span>
                                <Box
                                    sx={{
                                        display: "flex", gap: "8px", justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => {
                                            setShowRemove(true);
                                            openModal("cutoff", cutoff);
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

            case "employeeGroups":
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
                                gridTemplateColumns: "repeat(6, 1fr)",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                p: "8px 0",
                                width: "100%",
                                alignItems: "center",
                                textAlign: "center",
                            }}
                        >
                            <span>Department</span>
                            <span>Total Employees</span>
                            <span>Full-Time</span>
                            <span>Part-Time</span>
                            <span>Temporary</span>
                            <span>Actions</span>
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
                        {employeeGroupsFromDB.map((group) => (<Box
                            key={group.id}
                            sx={{
                                marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", mb: "12px",
                            }}
                        >
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
                                        transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                    textAlign: "center",
                                }}
                            >
                                <span>{group.department}</span>
                                <span>{group.totalEmployees}</span>
                                <span>{group.fullTime}</span>
                                <span>{group.partTime}</span>
                                <span>{group.temporary}</span>
                                <Box
                                    sx={{
                                        display: "flex", gap: "8px", justifyContent: "center",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => openModal("employee", group)}
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
                                        <RiEyeFill/>
                                    </IconButton>
                                    <IconButton
                                        onClick={() => openModal("employee", group)}
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
            case "rule":
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
                        Add Rule
                    </Typography>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                            Rule Type
                        </Typography>

                        <Select
                            value={selectedRule}
                            onChange={(e) => setSelectedRule(e.target.value)}
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
                                    style={{color: "rgba(255,255,255,0.4"}}>Select Rule Type</span>;
                                return selected;
                            }}
                        >
                            {["Overtime", "Deduction", "Bonus", "Allowance"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                            Formula or Fixed Amount
                        </Typography>

                        <TextField
                            placeholder="Enter formula or amount"
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
                            Description
                        </Typography>

                        <TextField
                            placeholder="Enter description"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontSize: "18px",
                                    borderRadius: "13px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    color: "#fff",
                                    "& fieldset": {
                                        borderColor: "rgba(255,255,255,0.4)",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "rgba(255,255,255,0.6)",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "rgba(255,255,255,0.9)",
                                    },
                                },
                            }}
                        />
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
                            onClick={closeModal}
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

            case "cutoff":
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
                        Add Cutoff
                    </Typography>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                            Formula or Fixed Amount
                        </Typography>

                        <Box sx={{display: "flex", gap: 1}}>
                            {[...Array(2)].map((_, i) => (<input
                                key={i}
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
                            />))}
                        </Box>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}
                        >
                            Frequency
                        </Typography>

                        <Select
                            value={selectedFreq}
                            onChange={(e) => setSelectedFreq(e.target.value)}
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
                                    },
                                },
                            }}
                            renderValue={(selected) => {
                                if (!selected) return (<span style={{color: "rgba(255,255,255,0.4)"}}>
                                    Select Frequency
                                </span>);
                                return selected;
                            }}
                        >
                            {["Weekly", "Bi-weekly", "Monthly"].map((option) => (<MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>))}
                        </Select>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}
                        >
                            Department
                        </Typography>

                        <Select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
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
                                    },
                                },
                            }}
                            renderValue={(selected) => {
                                if (!selected) return (<span style={{color: "rgba(255,255,255,0.4)"}}>
                                        Select Department
                                    </span>);
                                return selected;
                            }}
                        >
                            {["IT Department", "HR", "Accounting"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>))}
                        </Select>
                    </Box>

                    <FormControlLabel
                        sx={{
                            color: "#fff"
                        }}
                        control={<Checkbox
                            sx={{
                                color: "rgba(255,255,255,0.2)", "&.Mui-checked": {color: "#fff"}
                            }}
                        />}
                        label="Apply to all employees in selected department"
                    />

                    <Box
                        sx={{
                            display: "flex", justifyContent: showRemove ? "center" : "flex-end", gap: 2, mt: 1,
                        }}
                    >
                        {showRemove && (<ActionButton
                            text="Remove"
                            width="200px"
                            color="#b22222"
                            onClick={closeModal}
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

            case "employee":
                return (<Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            color: (theme) => (theme.palette.mode === "dark" ? "#fff" : "#222"),
                        }}
                    >
                        <Box sx={{
                            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 2
                        }}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "20px"}}
                            >
                                IT Department {/* change 'yung dept. */}
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "9px",
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.01)" : "rgba(255, 255, 255, 0.2)",
                                    backdropFilter: "blur(12px)",
                                    px: "15px",
                                    py: "5px",
                                    width: "350px",

                                }}
                            >
                                <SearchIcon
                                    sx={{
                                        color: theme.palette.text.primary, fontSize: "1.7rem", mr: 1,
                                    }}
                                />
                                <InputBase
                                    placeholder="Enter Username"
                                    sx={{
                                        fontFamily: "'TT Hoves Pro', sans-serif",
                                        fontWeight: 300,
                                        fontSize: "0.95rem",
                                        width: "100%",
                                        color: theme.palette.text.primary,
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 150px",
                                gap: 2,
                                padding: "8px 0",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                color: "#FFFFFF",
                                fontSize: "20px",
                            }}
                        >
                            <span style={{paddingLeft: "15px", textAlign: "left"}}>Employee</span>
                            <span style={{paddingRight: "15px", textAlign: "right"}}>Type</span>
                        </Box>

                        <Box sx={{
                            maxHeight: "300px",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {width: 0, height: 0},
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                        }}>
                            {employeeGroupsFromDB.map((emp, i) => (<Box
                                    key={i}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 150px",
                                        alignItems: "center",
                                        p: "16px 0",
                                        pr: "16px",
                                        width: "100%",
                                        bgcolor: "#f5f5f5",
                                        borderRadius: "8px",
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    }}
                                >
                                    <span style={{paddingLeft: "15px", textAlign: "left"}}>Jhervin Banana</span>
                                    <Select
                                        value={emp.type}
                                        size="small"
                                        sx={{
                                            borderRadius: "10px",
                                            width: "150px",
                                            justifySelf: "end",
                                            backgroundColor: "#DFE3E3",
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                            color: "#172224",
                                        }}
                                    >
                                        <MenuItem value="Full Time">Full Time</MenuItem>
                                        <MenuItem value="Part Time">Part Time</MenuItem>
                                        <MenuItem value="Contract">Contract</MenuItem>
                                    </Select>
                                </Box>))}
                        </Box>

                        <Box
                            sx={{
                                display: "flex", justifyContent: "flex-end", gap: 2, mt: 3,
                            }}
                        >
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
                {["payrollRules", "cutoffDates", "employeeGroups"].map((tab) => (<Button
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
                    {tab === "payrollRules" ? "Payroll Rules" : tab === "cutoffDates" ? "Cutoff Dates" : "Employee Groups"}
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
                            {(activeTab === "payrollRules" || activeTab === "cutoffDates") && (<ActionButton
                                text={activeTab === "payrollRules" ? "Add Rule" : "Add Cutoff"}
                                width="200px"
                                onClick={() => {
                                    setShowRemove(false);   // hide Remove button
                                    openModal(activeTab === "payrollRules" ? "rule" : "cutoff");
                                }}
                            />)}

                            {(activeTab === "payrollRules" && hasCheckedRules) || (activeTab === "cutoffDates" && hasCheckedCutoffs) ? (
                                <ActionButton
                                    text="Delete Selected"
                                    width="200px"
                                    onClick={activeTab === "payrollRules" ? handleDeleteSelectedRules : handleDeleteSelectedCutoffs}
                                />) : null}
                        </Box>
                    </Box>

                    <FilterSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </Box>

                {renderCards()}

                <BoxModal
                    open={showModal}
                    onClose={closeModal}
                    width={modalType === "employee" ? 700 : 500}
                    height={modalType === "cutoff" ? 470 : modalType === "rule" ? 495 : modalType === "employee" ? 465 : 400}
                >
                    {renderModalContent()}
                </BoxModal>
            </Box>
        </Box>
    </Box>);
}