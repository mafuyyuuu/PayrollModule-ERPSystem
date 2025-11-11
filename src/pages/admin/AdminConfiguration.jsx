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
    Modal,
} from "@mui/material";
import { RiFilter3Line, RiPencilFill, RiEyeFill } from "react-icons/ri";

export default function AdminConfiguration() {
    const [activeTab, setActiveTab] = useState("payrollRules");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");

    const [selectedRule, setSelectedRule] = useState("");
    const [selectedFreq, setSelectedFreq] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

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
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "60px repeat(5,1fr)",
                                fontWeight: 700,
                                p: "8px",
                                bgcolor: "#e4e4e4",
                                borderRadius: "15px",
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Checkbox />
                            </Box>
                            <span>Rule Type</span>
                            <span>Description</span>
                            <span>Formula / Value</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </Box>

                        {["Benefit", "Deduction", "Bonus", "Allowance"].map((type, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "60px repeat(5,1fr)",
                                    alignItems: "center",
                                    p: "8px",
                                    bgcolor: "#fff",
                                    borderRadius: "8px",
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <Checkbox />
                                </Box>
                                <span>{type}</span>
                                <span>Lorem Ipsum</span>
                                <span>10%</span>
                                <span>
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
                                <Box sx={{ display: "flex", gap: "8px" }}>
                                    <IconButton
                                        onClick={() => openModal("rule")}
                                        sx={{
                                            bgcolor: "#1f2937",
                                            color: "#fff",
                                            width: "30px",
                                            height: "30px",
                                        }}
                                    >
                                        <RiPencilFill />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                );

            case "cutoffDates":
                return (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "60px repeat(5,1fr)",
                                fontWeight: 700,
                                p: "8px",
                                bgcolor: "#e4e4e4",
                                borderRadius: "8px",
                            }}
                        >
                            <span></span>
                            <span>Period</span>
                            <span>Start Date</span>
                            <span>End Date</span>
                            <span>Frequency</span>
                            <span>Actions</span>
                        </Box>

                        {[1, 2, 3].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "60px repeat(5,1fr)",
                                    alignItems: "center",
                                    p: "8px",
                                    bgcolor: "#fff",
                                    borderRadius: "8px",
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <Checkbox />
                                </Box>
                                <span>Sept. 1 - 15</span>
                                <span>Sept. 1, 2025</span>
                                <span>Sept. 15, 2025</span>
                                <span>Bi-weekly</span>
                                <Box sx={{ display: "flex", gap: "8px" }}>
                                    <IconButton
                                        onClick={() => openModal("cutoff")}
                                        sx={{
                                            bgcolor: "#1f2937",
                                            color: "#fff",
                                            width: "30px",
                                            height: "30px",
                                        }}
                                    >
                                        <RiPencilFill />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                );

            case "employeeGroups":
                return (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px",
                                fontWeight: 700,
                                p: "8px",
                            }}
                        >
                            <span>Department</span>
                            <span>Employees</span>
                            <span>Full Time</span>
                            <span>Part Time</span>
                            <span>Contract</span>
                            <span>Actions</span>
                        </Box>

                        {["IT Department", "HR", "Accounting"].map((dept, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px",
                                    alignItems: "center",
                                    p: "8px",
                                    bgcolor: "#fff",
                                    borderRadius: "8px",
                                }}
                            >
                                <span>{dept}</span>
                                <span>53</span>
                                <span>23</span>
                                <span>27</span>
                                <span>3</span>
                                <Box sx={{ display: "flex", gap: "8px" }}>
                                    <IconButton
                                        onClick={() => openModal("employee")}
                                        sx={{
                                            bgcolor: "#1f2937",
                                            color: "#fff",
                                            width: "30px",
                                            height: "30px",
                                        }}
                                    >
                                        <RiEyeFill />
                                    </IconButton>
                                    <IconButton
                                        sx={{
                                            bgcolor: "#1f2937",
                                            color: "#fff",
                                            width: "30px",
                                            height: "30px",
                                        }}
                                    >
                                        <RiPencilFill />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <Typography variant="h6">Config Rule</Typography>

                        <Select
                            value={selectedRule}
                            onChange={(e) => setSelectedRule(e.target.value)}
                            displayEmpty
                            sx={{
                                bgcolor: "#fff",
                                borderRadius: "8px",
                            }}
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

                        <TextField
                            placeholder="Formula or Fixed Amount"
                            fullWidth
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            placeholder="Description"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                            size="small"
                        />

                        <Box sx={{ display: "flex", gap: "16px" }}>
                            <Button
                                onClick={closeModal}
                                variant="contained"
                                color="error"
                                fullWidth
                            >
                                Remove
                            </Button>
                            <Button variant="contained" fullWidth>
                                Save
                            </Button>
                        </Box>
                    </Box>
                );

            case "cutoff":
                return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                            sx={{
                                bgcolor: "#fff",
                                borderRadius: "8px",
                            }}
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
                            sx={{
                                bgcolor: "#fff",
                                borderRadius: "8px",
                            }}
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

                        <FormControlLabel
                            control={<Checkbox />}
                            label="Apply to all employees in selected department"
                        />

                        <Box sx={{ display: "flex", gap: "16px" }}>
                            <Button onClick={closeModal} variant="outlined" fullWidth>
                                Cancel
                            </Button>
                            <Button variant="contained" fullWidth>
                                Save
                            </Button>
                        </Box>
                    </Box>
                );

            case "employee":
                return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6">IT Department</Typography>
                            <TextField placeholder="Enter User Name" size="small" />
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                            <span>Employee</span>
                            <span>Type</span>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                                { name: "Jherwin Jimenez", type: "Full Time" },
                                { name: "Symon Banana", type: "Part Time" },
                                { name: "Russell James Vitale", type: "Contract" },
                            ].map((emp, i) => (
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
            sx={{ fontFamily: "'TTHoves-Regular', sans-serif" }}
        >
            <Typography
                variant="h5"
                sx={{
                    fontSize: "20px",
                    fontFamily: "'TTHoves-Bold', sans-serif",
                    color: "#222",
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
                        mb: "16px",
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
                                bgcolor: activeTab === tab ? "#fff" : "#efeff0", // non-active tab background
                                color: activeTab === tab ? "#172224" : "#3a4f50", // non-active tab text
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
                    backgroundColor="rgba(150, 150, 150, 0.3)"
                    borderRadius="12px"
                    p="24px"
                    color="#222"
                    sx={{
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
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
                        <Box>
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
                                        fontFamily: "'TTHoves-Regular', sans-serif",
                                        cursor: "pointer",
                                        border: "none",
                                        transition: "all 0.3s ease",
                                        width: "200px",
                                        "&:hover": {
                                            backgroundColor: "#1f2f31",
                                        },
                                    }}
                                >
                                    {activeTab === "payrollRules" ? "Add Rule" : "Add Cutoff"}
                                </Box>
                            )}
                        </Box>
                        <Button
                            startIcon={<RiFilter3Line />}
                            sx={{
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                width: 250,
                                padding: "10px 40px 10px 12px",
                                borderRadius: "15px",
                                border: "1px solid rgba(255, 255, 255, 0.4)",
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                backdropFilter: "blur(12px)",
                                color: "#222",
                                fontFamily: "inherit",
                                fontSize: "16px",
                                cursor: "pointer",
                                outline: "none",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                                },
                            }}
                        >
                            Filter
                        </Button>
                    </Box>

                    {renderCards()}

                    <Modal open={showModal} onClose={closeModal}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                bgcolor: "background.paper",
                                p: "32px",
                                borderRadius: "16px",
                                width: "500px",
                                maxHeight: "80vh",
                                overflowY: "auto",
                            }}
                        >
                            {renderModalContent()}
                        </Box>
                    </Modal>
                </Box>
            </Box>
        </Box>
    );
}