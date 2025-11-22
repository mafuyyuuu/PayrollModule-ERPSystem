import {Box, MenuItem, Select, Typography, useTheme} from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import React, {useState} from "react";

export default function EmployeeTax() {
    const theme = useTheme();

    const [selectedPayroll, setSelectedPayroll] = useState("");

    const employeeContribution = [
        {
            employee: "John Doe",
            SSS: 20500,
            PhilHealth: 19500,
            PagIBIG: 15000,
            WTAX: 5000,
        },
        {
            employee: "Jane Smith",
            SSS: 18200,
            PhilHealth: 17300,
            PagIBIG: 14000,
            WTAX: 4200,
        },
        {
            employee: "Michael Tan",
            SSS: 22000,
            PhilHealth: 20500,
            PagIBIG: 16500,
            WTAX: 5500,
        },
    ];

    const payrollHistory = [
        {duration: "Oct 1–15, 2025", amount: "₱20,500.00", ref: "REF20251001"},
        {duration: "Sep 16–30, 2025", amount: "₱20,200.00", ref: "REF20250930"},
        {duration: "Sep 1–15, 2025", amount: "₱20,100.00", ref: "REF20250915"},
        {duration: "Aug 16–31, 2025", amount: "₱20,000.00", ref: "REF20250831"},
        {duration: "Aug 1–15, 2025", amount: "₱19,900.00", ref: "REF20250815"},
        {duration: "Jul 16–31, 2025", amount: "₱19,800.00", ref: "REF20250731"},
        {duration: "Jul 1–15, 2025", amount: "₱19,700.00", ref: "REF20250715"},
    ];

    return (
        <Box
            width="100%"
            height="100%"
        >
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="20px"
            >
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="SSS"
                    value="₱20,500.00"
                    showHideButton={true}
                />
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="Pag-IBIG"
                    value="₱20,500.00"
                    showHideButton={true}
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="PhilHealth"
                    value="₱19,500.00"
                    showHideButton={true}
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Withholding Tax"
                    value="₱19,500.00"
                    showHideButton={true}
                />
            </Box>

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={4}
                mb={2}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                    }}
                >
                    Contribution
                </Typography>
                <Box
                    sx={{
                        display: "inline-block",
                        borderRadius: "15px",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow:
                                theme.palette.mode === "light"
                                    ? "0 4px 20px rgba(0,0,0,0.15)"
                                    : "0 4px 20px rgba(0,0,0,0.3)",
                        },
                    }}
                >
                    <Select
                        value={selectedPayroll}
                        onChange={(e) => setSelectedPayroll(e.target.value)}
                        displayEmpty
                        sx={{
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.3)",
                            borderRadius: "15px",
                            width: "250px",
                            fontSize: "16px",
                            color: theme.palette.text.primary,
                            "& .MuiSelect-select": {
                                padding: "8px 12px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.divider,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.divider,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                border: "none", // remove focus border
                            },
                            "& .MuiSvgIcon-root": {
                                color: theme.palette.text.primary,
                            },
                        }}
                        renderValue={(selected) => {
                            if (!selected)
                                return (
                                    <span style={{fontSize: "16px", color: "#bdbdbd"}}>
                                        Select Payroll Duration
                                    </span>
                                );
                            return selected;
                        }}
                    >
                        {payrollHistory.map((item) => (
                            <MenuItem key={item.ref} value={item.duration}>
                                {item.duration}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            <Box
                sx={{
                    height: "68.7%",
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
                    <span>Employee</span>
                    <span>SSS</span>
                    <span>PhilHealth</span>
                    <span>Pag-IBIG</span>
                    <span>WTAX</span>
                    <span>Total</span>
                </Box>

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
                    {employeeContribution.map((item, index) => {
                        const total = item.SSS + item.PhilHealth + item.PagIBIG + item.WTAX;

                        return (
                            <Box
                                key={index}
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
                                <span>{item.employee}</span>
                                <span>₱{item.SSS.toLocaleString()}</span>
                                <span>₱{item.PhilHealth.toLocaleString()}</span>
                                <span>₱{item.PagIBIG.toLocaleString()}</span>
                                <span>₱{item.WTAX.toLocaleString()}</span>
                                <span>₱{total.toLocaleString()}</span>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}