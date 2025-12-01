import React, { useState, useEffect } from "react";
import {Box, Typography, CircularProgress} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import SearchBar from "../../components/SearchBar.jsx";

export default function AdminAuditLogs() {
    const theme = useTheme();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/audit-logs');
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log =>
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (<Box
        width="100%"
        height="100%"
        sx={{
            fontFamily: theme.typography.fontFamily,
        }}
    >
        <Box
            sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                mb: 3,
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
                Audit Logs
            </Typography>

            <Box sx={{display: "flex"}}>
                <SearchBar 
                    placeholder="Search logs..." 
                    width="350px"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
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
                    "&::-webkit-scrollbar": {width: 0, height: 0},
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    mt: "8px",
                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress />
                    </Box>
                ) : filteredLogs.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Typography sx={{ color: theme.palette.text.secondary }}>No logs found</Typography>
                    </Box>
                ) : (
                    filteredLogs.map((log, index) => (<Box
                        key={log.id || index}
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
                                transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            },
                            textAlign: "center",
                        }}
                    >
                        <span>{formatDate(log.date)}</span>
                        <span>{log.user}</span>
                        <span>{log.action}</span>
                        <span>{log.description}</span>
                    </Box>))
                )}
            </Box>
        </Box>
    </Box>);
}