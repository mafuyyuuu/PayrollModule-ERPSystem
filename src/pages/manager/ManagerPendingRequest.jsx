import { Box, Typography, Button, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import "remixicon/fonts/remixicon.css";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import React, {useState} from "react";
import {RiCheckFill, RiCloseFill, RiEyeFill} from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";

// Sample data for Manager Timesheet table
const PendingRequest = [
    {
        id: 1,
        requestType: "Overtime",
        employee: "Jherwin Jimenez",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Pending",
    },
    {
        id: 2,
        requestType: "Overtime",
        employee: "Symon Banana",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Rejected",
    },
    {
        id: 3,
        requestType: "Overtime",
        employee: "Michael Cruz",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Approved",
    },
    {
        id: 4,
        requestType: "Overtime",
        employee: "Michael Cruz",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Approved",
    },
    {
        id: 5,
        requestType: "Overtime",
        employee: "Michael Cruz",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Approved",
    },
    {
        id: 6,
        requestType: "Overtime",
        employee: "Michael Cruz",
        date: "2025-10-25",
        amount: "P1,200.00",
        status: "Approved",
    },
];

const ManagerPendingRequest = () => {
    const theme = useTheme();

    const [filter, setFilter] = useState("");

    return (
        <Box
            sx={{width: "100%", height: "80%", fontFamily: theme.typography.fontFamily}}
        >
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
                    Pending Request
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
                    <span>Employee Name</span>
                    <span>Date</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Action</span>
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
                    {PendingRequest.map((row) => (
                        <Box
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
                            <span>{row.requestType}</span>
                            <span>{row.employee}</span>
                            <span>{row.date}</span>
                            <span>{row.amount}</span>
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
                                        {/* Accept Button */}
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
                                    // Default "View" Button
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
                                        <RiEyeFill style={{ fontSize: 19 }} />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* EXPORT BUTTONS */}
            <Box
                sx={{
                    display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap", mt: "20px"
                }}
            >
                <ActionButton text="Export Payslip PDF" width="200px"/>
                <ActionButton text="Export CSV" width="200px"/>
            </Box>
        </Box>
    );
};

export default ManagerPendingRequest;
