import React from "react";
import {Box, Typography, Button, useTheme} from "@mui/material";
import { RiFilter3Line } from "react-icons/ri";
import ActionButton from "../../components/ActionButton.jsx";

const deductionData = [
    ["Jhervin Jimenez", "₱1,200", "₱500", "₱400", "₱200", "₱2,300"],
    ["Symon Banana", "₱1,100", "₱480", "₱390", "₱180", "₱2,150"],
    ["Jane Cruz", "₱1,300", "₱520", "₱410", "₱220", "₱2,450"],
];

export default function AdminReports() {
    const theme = useTheme();

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
                        borderRadius: "12px",
                        p: 2.5,
                        backgroundColor: theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(255, 255, 255, 0.3)",
                        border: `1px solid ${theme.palette.divider}`,
                        mb: 2,
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
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <ActionButton
                                text="Export PDF"
                                width="150px"
                            />
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
                                        border: `1px solid ${theme.palette.divider}`,
                                        backgroundColor:
                                            theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.05)"
                                                : "rgba(255, 255, 255, 0.2)",
                                        backdropFilter: "blur(12px)",
                                        color: theme.palette.text.primary,
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
                                        color: theme.palette.text.primary,
                                        fontSize: "18px",
                                    }}
                                />
                            </Box>
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
                                height: 220,
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: "12px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontStyle: "italic",
                                border: "1px dashed rgba(255,255,255,0.4)",
                            }}
                        >
                            (Chart/Graph Placeholder)
                        </Box>

                        <Box
                            sx={{
                                flex: 1.8,
                                display: "flex",
                                flexDirection: "column",
                                minHeight: "24vh",
                                p: 1,
                                borderRadius: "10px",
                                overflowY: "auto",
                                background: "linear-gradient(to bottom, #d4d3d3, #d7d4d4)",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(6, 1fr)",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    color: "#172224",
                                    p: 1,
                                    borderRadius: "8px 8px 0 0",
                                }}
                            >
                                <span>Employee</span>
                                <span>Tax</span>
                                <span>SSS</span>
                                <span>PhilHealth</span>
                                <span>Pag-IBIG</span>
                                <span>Total</span>
                            </Box>

                            <Box sx={{ mt: -0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                {deductionData.map((row, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(6, 1fr)",
                                            p: 1,
                                            background: "#fff",
                                            borderRadius: "8px",
                                            border: "1px solid rgba(255,255,255,0.2)",
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
                </Box>

                <Box
                    sx={{
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
                            background: "#FFFFFFD9",
                            backdropFilter: "blur(6px)",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(255,255,255,0.27)",
                            minHeight: 150,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="h6">Department Summary</Typography>
                            <Button
                                sx={{
                                    background: "#172224",
                                    color: "#fff",
                                    px: 2,
                                    borderRadius: "20px",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    "&:hover": { background: "#1e3932", transform: "scale(1.03)" },
                                }}
                            >
                                Export PDF
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                borderRadius: "10px",
                                border: "1px dashed rgba(255,255,255,0.4)",
                                background: "rgba(255,255,255,0.2)",
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
                            background: "#FFFFFFD9",
                            backdropFilter: "blur(6px)",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(255,255,255,0.27)",
                            minHeight: 150,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="h6">Tax and Compliance</Typography>
                            <Button
                                sx={{
                                    background: "#172224",
                                    color: "#fff",
                                    px: 2,
                                    borderRadius: "20px",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    "&:hover": { background: "#1e3932", transform: "scale(1.03)" },
                                }}
                            >
                                Export PDF
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                borderRadius: "10px",
                                border: "1px dashed rgba(255,255,255,0.4)",
                                background: "rgba(255,255,255,0.2)",
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
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                        sx={{
                            background: "#172224",
                            color: "#fff",
                            px: 3,
                            py: 1.25,
                            borderRadius: "12px",
                            fontSize: 15,
                            fontWeight: 600,
                            "&:hover": { background: "#1e3932", transform: "scale(1.03)" },
                        }}
                    >
                        Generate Report
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}