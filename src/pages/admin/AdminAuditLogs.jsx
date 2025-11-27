import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchBar from "../../components/SearchBar.jsx";
import axios from "axios";

export default function AdminAuditLogs() {
    const theme = useTheme();
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true); // 💡 ADDED: Loading state
    const [hasError, setHasError] = useState(false); // 💡 ADDED: Error state

    const fetchLogs = async (query = "") => {
        setIsLoading(true);
        setHasError(false);
        try {
            const res = await axios.get("/api/admin/audit-logs", { params: { search: query } });

            // 💡 DEBUG: Log the received data to confirm records exist on the client side
            console.log("✅ Audit Logs API Response Data:", res.data);

            // Ensure logs are an array before setting state
            setLogs(res.data.logs || []);
        } catch (err) {
            console.error("❌ Error fetching audit logs:", err);
            setLogs([]);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Helper function to format the MySQL datetime string ('YYYY-MM-DD HH:i:s')
     * into a readable local time string consistently across browsers.
     */
    const formatLogDate = (dateString) => {
        if (!dateString) return "N/A";

        // 💡 FIX: Replace space with 'T' to create a quasi-ISO string for reliable Date parsing
        const isoString = dateString.replace(' ', 'T');
        const date = new Date(isoString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return dateString; // Return original string if parsing fails
        }

        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        // Use toLocaleString for a single, consistent, and readable output.
        return date.toLocaleString('en-US', options);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <Box width="100%" height="100%" sx={{ fontFamily: theme.typography.fontFamily }}>
            <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%", mb: 3 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                    }}
                >
                    Audit Logs
                </Typography>

                <Box sx={{ display: "flex" }}>
                    <SearchBar
                        placeholder="Enter Username"
                        width="350px"
                        onChange={(e) => {
                            setSearch(e.target.value);
                            // Fetches logs on every key stroke
                            fetchLogs(e.target.value);
                        }}
                        value={search}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    height: "90.9%",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                        transform: "scale(1.005)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* Header Row */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr 1fr 1.8fr",
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
                    <span>Date / Time</span>
                    <span>User</span>
                    <span>Action</span>
                    <span>Description</span>
                </Box>

                {/* Log Entries Container */}
                <Box
                    sx={{
                        maxHeight: "530px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "4px", height: "4px" },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: theme.palette.divider,
                            borderRadius: '2px'
                        },
                        mt: "8px",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    {/* 💡 RENDER LOGIC WITH LOADING AND ERROR STATES */}
                    {isLoading ? (
                        <Typography sx={{ textAlign: 'center', mt: 4, color: theme.palette.text.secondary }}>
                            Loading audit logs...
                        </Typography>
                    ) : hasError ? (
                        <Typography sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>
                            Failed to load audit logs. Check the server connection and API path.
                        </Typography>
                    ) : logs.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', mt: 4, color: theme.palette.text.secondary }}>
                            No audit logs found.
                        </Typography>
                    ) : (
                        logs.map((log, index) => (
                            <Box
                                key={index}
                                sx={{
                                    marginTop: "10px",
                                    display: "grid",
                                    gridTemplateColumns: "1.2fr 1fr 1fr 1.8fr",
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
                                    padding: "8px",
                                    wordBreak: "break-word",
                                }}
                            >
                                <span>{formatLogDate(log.date)}</span>
                                <span>{log.user_name}</span>
                                <span>{log.action}</span>
                                <span style={{ padding: '0 10px' }}>{log.description}</span>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>
        </Box>
    );
}