import {Box, Typography, Button, IconButton} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import "remixicon/fonts/remixicon.css";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import ViewTextField from "../../components/ViewTextField.jsx";
import {RiCheckFill, RiCloseFill, RiPencilFill} from "react-icons/ri";
import React, {useState} from "react";
import ActionButton from "../../components/ActionButton.jsx";

const timesheetData = [
    {
        id: 1,
        employee: "Jherwin Jimenez",
        date: "2025-10-25",
        timeIn: "08:00 AM",
        timeOut: "05:00 PM",
        totalHours: "9",
        overtime: "1",
        status: "Approved",
    },
    {
        id: 2,
        employee: "Symon Banana",
        date: "2025-10-25",
        timeIn: "09:00 AM",
        timeOut: "06:00 PM",
        totalHours: "9",
        overtime: "0",
        status: "Pending",
    },
    {
        id: 3,
        employee: "Michael Cruz",
        date: "2025-10-25",
        timeIn: "07:30 AM",
        timeOut: "04:00 PM",
        totalHours: "8.5",
        overtime: "0.5",
        status: "Rejected",
    },
    {
        id: 4,
        employee: "Michael Cruz",
        date: "2025-10-25",
        timeIn: "07:30 AM",
        timeOut: "04:00 PM",
        totalHours: "8.5",
        overtime: "0.5",
        status: "Rejected",
    },
    {
        id: 5,
        employee: "Michael Cruz",
        date: "2025-10-25",
        timeIn: "07:30 AM",
        timeOut: "04:00 PM",
        totalHours: "8.5",
        overtime: "0.5",
        status: "Rejected",
    },
    {
        id: 6,
        employee: "Michael Cruz",
        date: "2025-10-25",
        timeIn: "07:30 AM",
        timeOut: "04:00 PM",
        totalHours: "8.5",
        overtime: "0.5",
        status: "Rejected",
    },
    {
        id: 7,
        employee: "Michael Cruz",
        date: "2025-10-25",
        timeIn: "07:30 AM",
        timeOut: "04:00 PM",
        totalHours: "8.5",
        overtime: "0.5",
        status: "Rejected",
    },
];

const ManagerTimesheets = () => {
    const theme = useTheme();

    const [filter, setFilter] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleView = (row) => {
        setSelectedRow(row);
        setOpenModal(true);
    };

    return (
        <Box width="100%" height="80%">
            {/* FILTER BAR */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 3,
                }}
            >
                {/* HEADER */}
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                    }}
                >
                    Timesheet Approval
                </Typography>
                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                    }}
                >
                    <FilterSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />

                    <SearchBar
                        placeholder="Enter Employee Name"
                        width="350px"
                    />
                </Box>

            </Box>

            {/* TABLE CONTAINER */}
            <Box
                sx={{
                    height: "100%",
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
                {/* HEADER ROW */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(8, 1fr)",
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
                    <span>Employee Name</span>
                    <span>Date</span>
                    <span>Time In</span>
                    <span>Time Out</span>
                    <span>Total Hours</span>
                    <span>Overtime</span>
                    <span>Status</span>
                    <span>Actions</span>
                </Box>

                {/* DATA ROWS */}
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
                    {timesheetData.map((row) => (
                        <Box
                            sx={{
                                marginTop: "10px",
                                display: "grid",
                                gridTemplateColumns: "repeat(8, 1fr)",
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
                            <span>{row.employee}</span>
                            <span>{row.date}</span>
                            <span>{row.timeIn}</span>
                            <span>{row.timeOut}</span>
                            <span>{row.totalHours}</span>
                            <span>{row.overtime}</span>
                            <span
                                style={{
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color:
                                        row.status === "Approved"
                                            ? "#4CAF50"
                                            : row.status === "Rejected"
                                                ? "#F44336"
                                                : "#FFC107",
                                    fontWeight: 500,
                                }}
                            >
                                {row.status}
                            </span>
                            <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                {row.status === "Pending" ? (
                                    <>
                                        {/*Accept Button */}
                                        <IconButton
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
                                    <IconButton
                                        onClick={() => handleView(row)} sx={{
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
                    ))}
                </Box>
            </Box>

            <BoxModal open={openModal} onClose={() => setOpenModal(false)}>
                {selectedRow && (
                    <>
                        <Typography variant="h3" mb={3} sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                        }}>
                            Timesheet Approval Details
                        </Typography>

                        {/* Employee Field */}
                        <Box mb="10px">
                            <Typography sx={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                mb: "5px"
                            }}>
                                Employee
                            </Typography>
                            <ViewTextField value={selectedRow.employee}/>
                        </Box>

                        {/* Grid for other fields */}
                        <Box
                            display="grid"
                            gridTemplateColumns={{md: "1fr 1fr"}}
                            gap="20px"
                            mb="18px"
                        >
                            {/* Date */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Date
                                </Typography>
                                <ViewTextField value={selectedRow.date} label="Date"/>
                            </Box>

                            {/* Status */}
                            <Box>
                                <Typography sx={{
                                    color: "#fff",
                                    fontWeight: 500,
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Status
                                </Typography>
                                <ViewTextField value={selectedRow.status} label="Status"/>
                            </Box>

                            {/* Time In */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Time In
                                </Typography>
                                <ViewTextField value={selectedRow.timeIn} label="Time In"/>
                            </Box>

                            {/* Time Out */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Time Out
                                </Typography>
                                <ViewTextField value={selectedRow.timeOut} label="Time Out"/>
                            </Box>

                            {/* Total Hours */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Total Hours
                                </Typography>
                                <ViewTextField value={selectedRow.totalHours} label="Total Hours"/>
                            </Box>

                            {/* Overtime */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Overtime
                                </Typography>
                                <ViewTextField value={selectedRow.overtime} label="Overtime"/>
                            </Box>
                        </Box>
                    </>
                )}
            </BoxModal>

            {/* EXPORT BUTTONS */}
            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton text="Export Payslip PDF" width="200px"/>
                <ActionButton text="Export CSV" width="200px"/>
            </Box>
        </Box>
    );
};

export default ManagerTimesheets;
