import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchBar from "../../components/SearchBar.jsx";

export default function AdminAuditLogs() {
    const theme = useTheme();

    const logs = [
        { date: "2025XXXX", user: "Jhervin Jimenez", action: "Dropbox", description: "Pending" },
        { date: "2025XXXX", user: "Symon Banaag", action: "Dropbox", description: "Pending" },
        { date: "2025XXXX", user: "Jumiah Zamora", action: "Dropbox", description: "Pending" },
    ];

    return (
        <Box
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
                Audit Logs
            </Typography>

            <Box sx={{ display: "flex", mb: 2 }}>
                <SearchBar placeholder="Enter Username" width="350px" />
            </Box>

            <Box
                sx={{
                    height: "85%",
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
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
                        justifyItems: "center",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <span>Date</span>
                    <span>User</span>
                    <span>Action</span>
                    <span>Description</span>
                </Box>

                <Box
                    sx={{
                        maxHeight: "530px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: 0, height: 0 },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        mt: "8px",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    {logs.map((log, index) => (
                        <Box
                            key={index}
                            sx={{
                                marginTop: "10px",
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                alignItems: "center",
                                bgcolor: "#fff",
                                color: "#1b2223",
                                borderRadius: "8px",
                                width: "100%",
                                minHeight: "83px",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                },
                                textAlign: "center",
                            }}
                        >
                            <span>{log.date}</span>
                            <span>{log.user}</span>
                            <span>{log.action}</span>
                            <span>{log.description}</span>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}