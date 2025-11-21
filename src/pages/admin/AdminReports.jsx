import React, { useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import ActionButton from "../../components/ActionButton.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";

export default function AdminReports() {
    const theme = useTheme();
    const [filter, setFilter] = useState("");

    const deductionData = [
        ["Jhervin Jimenez", "₱1,200", "₱500", "₱400", "₱200", "₱2,300"],
        ["Symon Banana", "₱1,100", "₱480", "₱390", "₱180", "₱2,150"],
        ["Jane Cruz", "₱1,300", "₱520", "₱410", "₱220", "₱2,450"],
    ];

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
                height: "100%",
                fontFamily: theme.typography.fontFamily,
                overflow: "hidden",
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    fontSize: "20px",
                    fontFamily: "'TTHoves-Bold', sans-serif",
                    color: theme.palette.text.primary,
                }}
            >
                Reports and Analytics
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    gap: 2,
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    p: 2,
                    overflow: "hidden",
                }}
            >
                {/* Top bar */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
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
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <ActionButton text="Export PDF" width="150px" />
                        <FilterSelect
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            options={[]}
                        />
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flex: 1,
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            flex: 1.2,
                            minHeight: 200,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
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
                            overflow: "hidden",
                        }}
                    >
                        {/* Table Header */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                p: 1,
                            }}
                        >
                            {["Employee", "Tax", "SSS", "PhilHealth", "Pag-IBIG", "Total"].map(
                                (header) => (
                                    <span key={header} style={{ textAlign: "center" }}>
                    {header}
                  </span>
                                )
                            )}
                        </Box>

                        <Box
                            sx={{
                                mt: 1,
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                overflowY: "auto",
                                "&::-webkit-scrollbar": { width: 0, height: 0 },
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                            }}
                        >
                            {deductionData.map((row, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(6, 1fr)",
                                        alignItems: "center",
                                        borderRadius: "8px",
                                        minHeight: 45,
                                        p: 1,
                                        textAlign: "center",
                                        color: "#1b2223",
                                        bgcolor: "#fff",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                        },
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
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                        flex: 1,
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "12px",
                            p: 2,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${theme.palette.divider}`,
                            overflow: "hidden",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: "17px",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color: theme.palette.text.primary,
                                }}
                            >
                                Department Summary
                            </Typography>
                            <ActionButton text="Export PDF" width="150px" />
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
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "12px",
                            p: 2,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${theme.palette.divider}`,
                            overflow: "hidden",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: "17px",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color: theme.palette.text.primary,
                                }}
                            >
                                Tax and Compliance
                            </Typography>
                            <ActionButton text="Export PDF" width="150px" />
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

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <ActionButton text="Generate Report" width="180px" />
                </Box>
            </Box>
        </Box>
    );
}
