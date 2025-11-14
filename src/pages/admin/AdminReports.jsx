import React, {useState} from "react";
import {Box, Typography, Button, useTheme} from "@mui/material";
import { RiFilter3Line } from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";

const deductionData = [
    ["Jhervin Jimenez", "₱1,200", "₱500", "₱400", "₱200", "₱2,300"],
    ["Symon Banana", "₱1,100", "₱480", "₱390", "₱180", "₱2,150"],
    ["Jane Cruz", "₱1,300", "₱520", "₱410", "₱220", "₱2,450"],
];

export default function AdminReports() {
    const theme = useTheme();

    const [filter, setFilter] = useState("")

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
                Reports and Analytics
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
                    p: 2,
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
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "17px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: theme.palette.text.primary,
                        }}
                    >
                        Payroll Summary Report
                    </Typography>
                    <Box sx={{ display: "flex" }}>
                        <ActionButton
                            text="Export PDF"
                            width="150px"
                            mr={1}
                        />
                        <FilterSelect
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            options={[
                            ]}
                        />
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                        mt: 1,
                        flexDirection: { xs: "column", md: "row" },
                    }}
                >
                    <Box
                        sx={{
                            flex: 1.2,
                            height: 240,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",                            borderRadius: "12px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontStyle: "italic",
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        (Chart/Graph Placeholder)
                    </Box>

                    <Box
                        sx={{
                            height: 240,
                            flex: 1.8,
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: "15px",
                            p: 2,
                            position: "sticky",
                            mb: "0",
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                p: 1,
                            }}
                        >
                            <span style={{ textAlign: "center" }}>Employee</span>
                            <span style={{ textAlign: "center" }}>Tax</span>
                            <span style={{ textAlign: "center" }}>SSS</span>
                            <span style={{ textAlign: "center" }}>PhilHealth</span>
                            <span style={{ textAlign: "center" }}>Pag-IBIG</span>
                            <span style={{ textAlign: "center" }}>Total</span>
                        </Box>

                        <Box sx={{
                            mt: "10px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            overflowY: "auto",
                            "&::-webkit-scrollbar": { width: 0, height: 0 },
                            scrollbarWidth: "none",
                            msOverflowStyle: "none", }}
                        >
                            {deductionData.map((row, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        display: "grid",
                                        gridTemplateColumns: "repeat(6, 1fr)",
                                        borderRadius: "8px",
                                        alignItems: "center",
                                        minHeight: "45px",
                                        width: "100%",
                                        color: "#1b2223",
                                        bgcolor: "#fff",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                        },
                                        p: 1,
                                        textAlign: "center",
                                    }}
                                >
                                    {row.map((cell, j) => (
                                        <span key={j}>{cell}</span>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        height: 280,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                        mt: 2,
                    }}
                >
                    <Box
                        sx={{
                            borderRadius: "12px",
                            p: 2,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${theme.palette.divider}`,                          minHeight: 150,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: "17px",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color: theme.palette.text.primary,
                                }}
                            >
                            Department Summary
                            </Typography>
                            <ActionButton
                                text="Export PDF"
                                width="150px"
                            />
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                borderRadius: "10px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontStyle: "italic",
                                color: "#555",
                            }}
                        >
                            (Chart/Graph Placeholder)
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            borderRadius: "12px",
                            p: 2,
                            backgroundColor: theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${theme.palette.divider}`,
                            minHeight: 150,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: "17px",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color: theme.palette.text.primary,
                                }}
                            >
                                Tax and Compliance
                            </Typography>
                            <ActionButton
                                text="Export PDF"
                                width="150px"
                            />
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontStyle: "italic",
                                color: theme.palette.text.primary,
                            }}
                        >
                            (Chart/Graph Placeholder)
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <ActionButton
                        text="Generate Report"
                        width="180px"
                    />
                </Box>
            </Box>
        </Box>
    );
}