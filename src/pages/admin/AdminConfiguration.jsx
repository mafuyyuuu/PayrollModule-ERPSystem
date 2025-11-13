import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    Box,
    Button,
    Typography,
    IconButton,
    Select,
    MenuItem,
    TextField,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import {  RiPencilFill, RiEyeFill } from "react-icons/ri";
import { useTheme } from "@mui/material/styles";
import BoxModal from "../../components/BoxModal";
import { tokens } from "../../theme.js";

export default function AdminConfiguration() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [activeTab, setActiveTab] = useState("payrollRules");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");

    const [selectedRule, setSelectedRule] = useState("");
    const [selectedFreq, setSelectedFreq] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [rulesFromDB, setRulesFromDB] = useState([
        { id: 1, type: "Benefit", description: "Additional fixed compensation for specific purposes" },
        { id: 2, type: "Deduction", description: "Mandatory payroll deductions" },
        { id: 3, type: "Bonus", description: "Performance-based rewards" },
        { id: 4, type: "Allowance", description: "Fixed allowances for specific tasks" },
        { id: 5, type: "Deduction", description: "Mandatory payroll deductions" },
    ]);

    const [cutoffsFromDB, setCutoffsFromDB] = useState([
        { id: 1, period: "January 2025 - 1st Half", startDate: "Jan 1, 2025", endDate: "Jan 15, 2025", frequency: "Bi-Monthly" },
        { id: 2, period: "January 2025 - 2nd Half", startDate: "Jan 16, 2025", endDate: "Jan 31, 2025", frequency: "Bi-Monthly" },
        { id: 3, period: "February 2025 - 1st Half", startDate: "Feb 1, 2025", endDate: "Feb 15, 2025", frequency: "Bi-Monthly" },
        { id: 4, period: "February 2025 - 2nd Half", startDate: "Feb 16, 2025", endDate: "Feb 28, 2025", frequency: "Bi-Monthly" },
        { id: 5, period: "March 2025 - 1st Half", startDate: "Mar 1, 2025", endDate: "Mar 15, 2025", frequency: "Bi-Monthly" },
        { id: 6, period: "March 2025 - 2nd Half", startDate: "Mar 16, 2025", endDate: "Mar 31, 2025", frequency: "Bi-Monthly" },
        { id: 7, period: "April 2025 - 1st Half", startDate: "Apr 1, 2025", endDate: "Apr 15, 2025", frequency: "Bi-Monthly" },
        { id: 8, period: "April 2025 - 2nd Half", startDate: "Apr 16, 2025", endDate: "Apr 30, 2025", frequency: "Bi-Monthly" },
        { id: 9, period: "May 2025 - 1st Half", startDate: "May 1, 2025", endDate: "May 15, 2025", frequency: "Bi-Monthly" },
        { id: 10, period: "May 2025 - 2nd Half", startDate: "May 16, 2025", endDate: "May 31, 2025", frequency: "Bi-Monthly" },
        { id: 11, period: "June 2025 - 1st Half", startDate: "Jun 1, 2025", endDate: "Jun 15, 2025", frequency: "Bi-Monthly" },
        { id: 12, period: "June 2025 - 2nd Half", startDate: "Jun 16, 2025", endDate: "Jun 30, 2025", frequency: "Bi-Monthly" },
    ]);

    const employeeGroupsFromDB = [
        {
            id: 1,
            department: "Human Resources",
            totalEmployees: 25,
            fullTime: 15,
            partTime: 7,
            temporary: 3,
        },
        {
            id: 2,
            department: "Finance",
            totalEmployees: 18,
            fullTime: 12,
            partTime: 4,
            temporary: 2,
        },
        {
            id: 3,
            department: "IT",
            totalEmployees: 30,
            fullTime: 25,
            partTime: 3,
            temporary: 2,
        },
    ];

    const [checkedRules, setCheckedRules] = useState({});
    const [checkedCutoffs, setCheckedCutoffs] = useState({});

    const allRulesChecked = rulesFromDB.every(rule => checkedRules[rule.id]);
    const allCutoffsChecked = cutoffsFromDB.every(cutoff => checkedCutoffs[cutoff.id]);

    const handleSelectAllRules = (e) => {
        const checked = e.target.checked;
        const newChecked = {};
        rulesFromDB.forEach(rule => newChecked[rule.id] = checked);
        setCheckedRules(newChecked);
    };

    const handleSelectAllCutoffs = (e) => {
        const checked = e.target.checked;
        const newChecked = {};
        cutoffsFromDB.forEach(cutoff => newChecked[cutoff.id] = checked);
        setCheckedCutoffs(newChecked);
    };

    const handleDeleteSelectedRules = () => {
        const remaining = rulesFromDB.filter((rule) => !checkedRules[rule.id]);
        setRulesFromDB(remaining);
        setCheckedRules({});
    };

    const handleDeleteSelectedCutoffs = () => {
        const remaining = cutoffsFromDB.filter((cutoff) => !checkedCutoffs[cutoff.id]);
        setCutoffsFromDB(remaining);
        setCheckedCutoffs({});
    };

    const hasCheckedRules = Object.values(checkedRules).some(Boolean);
    const hasCheckedCutoffs = Object.values(checkedCutoffs).some(Boolean);

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
                return (
                    <Box
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
                                    "& .MuiSvgIcon-root": { fontSize: 25 },
                                })}
                            />
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 1fr)",
                                    fontWeight: 700,
                                    p: "8px",
                                    borderRadius: "15px",
                                    width: "100%",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ textAlign: "left" }}>Rule Type</span>
                                <span style={{ textAlign: "left" }}>Description</span>
                                <span style={{ textAlign: "center" }}>Formula / Value</span>
                                <span style={{ textAlign: "center" }}>Status</span>
                                <span style={{ textAlign: "center" }}>Actions</span>
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
                            {rulesFromDB.map((rule) => (
                                <Box
                                    key={rule.id}
                                    sx={{
                                        marginTop: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        mb: "12px",
                                    }}
                                >
                                    <Checkbox
                                        checked={!!checkedRules[rule.id]}
                                        onChange={(e) =>
                                            setCheckedRules((prev) => ({
                                                ...prev,
                                                [rule.id]: e.target.checked,
                                            }))
                                        }
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
                                            bgcolor: "#f0f0f0",
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
                                        <span style={{ paddingLeft: "15px", textAlign: "left" }}>
                                            {rule.type}
                                        </span>
                                        <span style={{ textAlign: "left" }}>
                                            {rule.description}
                                        </span>
                                        <span style={{ textAlign: "center" }}>10%</span>
                                        <span style={{ textAlign: "center" }}>
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
                                                display: "flex",
                                                gap: "8px",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <IconButton
                                                onClick={() => openModal("rule")}
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

            case "cutoffDates":
                return (
                    <Box
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
                                    color: "#1F2829",
                                    borderRadius: "5px",
                                    "&.Mui-checked": { color: "#1F2829" },
                                    "& .MuiSvgIcon-root": { fontSize: 25 },
                                }}
                            />
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 1fr)",
                                    fontWeight: 700,
                                    p: "8px",
                                    borderRadius: "15px",
                                    width: "100%",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ textAlign: "left" }}>Period</span>
                                <span style={{ textAlign: "center" }}>Start Date</span>
                                <span style={{ textAlign: "center" }}>End Date</span>
                                <span style={{ textAlign: "center" }}>Frequency</span>
                                <span style={{ textAlign: "center" }}>Actions</span>
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
                            {cutoffsFromDB.map((cutoff) => (
                                <Box
                                    key={cutoff.id}
                                    sx={{
                                        marginTop: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        mb: "12px",
                                    }}
                                >
                                    <Checkbox
                                        checked={!!checkedCutoffs[cutoff.id]}
                                        onChange={(e) =>
                                            setCheckedCutoffs((prev) => ({
                                                ...prev,
                                                [cutoff.id]: e.target.checked,
                                            }))
                                        }
                                        sx={{
                                            p: 0,
                                            mr: "10px",
                                            color: "#1F2829",
                                            borderRadius: "5px",
                                            "&.Mui-checked": { color: "#1F2829" },
                                            "& .MuiSvgIcon-root": { fontSize: 25 },
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(5, 1fr)",
                                            alignItems: "center",
                                            bgcolor: "#f0f0f0",
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
                                        <span style={{ paddingLeft: "15px", textAlign: "left" }}>
                                            {cutoff.period}
                                        </span>
                                                    <span style={{ textAlign: "center" }}>
                                            {cutoff.startDate}
                                        </span>
                                                    <span style={{ textAlign: "center" }}>
                                            {cutoff.endDate}
                                        </span>
                                                    <span style={{ textAlign: "center" }}>
                                            {cutoff.frequency}
                                        </span>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: "8px",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <IconButton
                                                onClick={() => openModal("cutoff", cutoff)}
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

            case "employeeGroups":
                return (
                    <Box
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
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(6, 1fr)",
                                    fontWeight: 700,
                                    p: "8px",
                                    borderRadius: "15px",
                                    width: "100%",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                <span style={{ marginLeft: "7px", textAlign: "left" }}>Department</span>
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
                                "&::-webkit-scrollbar": { width: 0, height: 0 },
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                            }}
                        >
                            {employeeGroupsFromDB.map((group) => (
                                <Box
                                    key={group.id}
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
                                            gridTemplateColumns: "repeat(6, 1fr)",
                                            alignItems: "center",
                                            bgcolor: "#f0f0f0",
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
                                        <span style={{ paddingLeft: "15px", textAlign: "left" }}>{group.department}</span>
                                        <span>{group.totalEmployees}</span>
                                        <span>{group.fullTime}</span>
                                        <span>{group.partTime}</span>
                                        <span>{group.temporary}</span>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: "8px",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <IconButton
                                                onClick={() => openModal("employeeGroup", group)}
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
                                            <IconButton
                                                onClick={() => openModal("employeeGroup", group)}
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

    const renderModalContent = () => {
        switch (modalType) {
            case "rule":
                return (
                    <>
                        <Typography variant="h6">Config Rule</Typography>

                        <Select
                            value={selectedRule}
                            onChange={(e) => setSelectedRule(e.target.value)}
                            displayEmpty
                            sx={{ bgcolor: "#fff", borderRadius: "8px" }}
                        >
                            <MenuItem value="" disabled>
                                Select Rule Type
                            </MenuItem>
                            {["Overtime", "Deduction", "Bonus", "Allowance"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>

                        <TextField placeholder="Formula or Fixed Amount" fullWidth variant="outlined" size="small" />
                        <TextField placeholder="Description" fullWidth variant="outlined" multiline rows={3} size="small" />

                        <Box sx={{ display: "flex", gap: "16px" }}>
                            <Button onClick={closeModal} variant="contained" color="error" fullWidth>
                                Remove
                            </Button>
                            <Button variant="contained" fullWidth>
                                Save
                            </Button>
                        </Box>
                    </>
                );

            case "cutoff":
                return (
                    <>
                        <Typography variant="h6">Add Cutoff</Typography>

                        <Box sx={{ display: "flex", gap: "16px" }}>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                dateFormat="MMMM d, yyyy"
                                customInput={<TextField label="Start Date" fullWidth size="small" />}
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                dateFormat="MMMM d, yyyy"
                                customInput={<TextField label="End Date" fullWidth size="small" />}
                            />
                        </Box>

                        <Select
                            value={selectedFreq}
                            onChange={(e) => setSelectedFreq(e.target.value)}
                            displayEmpty
                            sx={{ bgcolor: "#fff", borderRadius: "8px" }}
                        >
                            <MenuItem value="" disabled>
                                Select Frequency
                            </MenuItem>
                            {["Weekly", "Bi-weekly", "Monthly"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>

                        <Select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            displayEmpty
                            sx={{ bgcolor: "#fff", borderRadius: "8px" }}
                        >
                            <MenuItem value="" disabled>
                                Select Department
                            </MenuItem>
                            {["IT Department", "HR", "Accounting"].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>

                        <FormControlLabel control={<Checkbox />} label="Apply to all employees in selected department" />

                        <Box sx={{ display: "flex", gap: "16px" }}>
                            <Button onClick={closeModal} variant="outlined" fullWidth>
                                Cancel
                            </Button>
                            <Button variant="contained" fullWidth>
                                Save
                            </Button>
                        </Box>
                    </>
                );

            case "employee":
                return (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6">IT Department</Typography>
                            <TextField placeholder="Enter User Name" size="small" />
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                            <span>Employee</span>
                            <span>Type</span>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {employeeGroupsFromDB.map((emp, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: "8px",
                                        bgcolor: "#f5f5f5",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <span>{emp.name}</span>
                                    <Select value={emp.type} size="small" sx={{ minWidth: "120px" }}>
                                        <MenuItem>Full Time</MenuItem>
                                        <MenuItem>Part Time</MenuItem>
                                        <MenuItem>Contract</MenuItem>
                                    </Select>
                                </Box>
                            ))}
                        </Box>

                        <Button onClick={closeModal} variant="contained" sx={{ mt: "8px" }}>
                            Save
                        </Button>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Box
            width="100%"
            height="100%"
            sx={{ fontFamily: "'TTHoves-Regular', sans-serif" }}
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
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "15px",
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
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        p: "12px",
                        borderRadius: "25px",
                    }}
                >
                    {["payrollRules", "cutoffDates", "employeeGroups"].map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            sx={{
                                bgcolor: activeTab === tab ? "#fff" : "#efeff0",
                                color: activeTab === tab ? "#172224" : "#3a4f50",
                                fontWeight: 700,
                                textTransform: "none",
                                borderRadius: "15px",
                                fontSize: "18px",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                minWidth: "180px",
                                minHeight: "50px",
                            }}
                        >
                            {tab === "payrollRules"
                                ? "Payroll Rules"
                                : tab === "cutoffDates"
                                    ? "Cutoff Dates"
                                    : "Employee Groups"}
                        </Button>
                    ))}
                </Box>

                <Box
                    backgroundColor="rgba(200, 200, 200, 0.6)"
                    height={"85%"}
                    borderRadius="12px"
                    p="24px"
                    color="#222"
                    sx={{
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
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
                            {(activeTab === "payrollRules" || activeTab === "cutoffDates") && (
                                <Box
                                    component="button"
                                    onClick={() =>
                                        openModal(activeTab === "payrollRules" ? "rule" : "cutoff")
                                    }
                                    sx={{
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
                                    {activeTab === "payrollRules" ? "Add Rule" : "Add Cutoff"}
                                </Box>
                            )}

                            {(activeTab === "payrollRules" && hasCheckedRules) ||
                            (activeTab === "cutoffDates" && hasCheckedCutoffs) ? (
                                <Box
                                    component="button"
                                    onClick={
                                        activeTab === "payrollRules"
                                            ? handleDeleteSelectedRules
                                            : handleDeleteSelectedCutoffs
                                    }
                                    sx={{
                                        fontSize: "16px",
                                        backgroundColor: "#b22222",
                                        color: "#fff",
                                        padding: "10px 0",
                                        borderRadius: "15px",
                                        cursor: "pointer",
                                        border: "none",
                                        transition: "all 0.3s ease",
                                        width: "200px",
                                        fontFamily: "'TTHoves-Regular', sans-serif",
                                        "&:hover": {
                                            backgroundColor: "#8b1a1a",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                        },
                                    }}
                                >
                                    Delete Selected
                                </Box>
                            ) : null}
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
                                    border: "1px solid rgba(255, 255, 255, 0.4)",
                                    background: "rgba(255, 255, 255, 0.3)",
                                    backdropFilter: "blur(12px)",
                                    color: "#222",
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
                                    color: "#222",
                                    fontSize: "18px",
                                }}
                            ></i>
                        </Box>
                    </Box>

                    {renderCards()}

                    <BoxModal open={showModal} onClose={closeModal}>
                        {renderModalContent()}
                    </BoxModal>
                </Box>
            </Box>
        </Box>
    );
}