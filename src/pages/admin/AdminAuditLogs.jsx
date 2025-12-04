/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {Box, Typography, CircularProgress, Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import SearchBar from "../../components/SearchBar.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

export default function AdminAuditLogs() {
    const theme = useTheme();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState("");

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

    // Get unique actions for filter
    const uniqueActions = [...new Set(logs.map(log => log.action).filter(Boolean))];

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = actionFilter === "all" || log.action === actionFilter;
        return matchesSearch && matchesAction;
    });

    const handleExportPDF = () => {
        const reportDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Audit Logs Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #1b2223; border-bottom: 2px solid #1b2223; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #1b2223; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .date { color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Audit Logs Report</h1>
                    <p class="date">Generated on: ${reportDate}</p>
                    <p>Total Records: ${filteredLogs.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredLogs.map(log => `
                            <tr>
                                <td>${formatDate(log.date)}</td>
                                <td>${log.user || 'N/A'}</td>
                                <td>${log.action || 'N/A'}</td>
                                <td>${log.description || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    };

    const handleExportCSV = () => {
        const headers = ['Date', 'User', 'Action', 'Description'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                formatDate(log.date),
                `"${log.user || 'N/A'}"`,
                `"${log.action || 'N/A'}"`,
                `"${(log.description || 'N/A').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleConfirmExport = () => {
        if (exportType === 'pdf') {
            handleExportPDF();
        } else if (exportType === 'csv') {
            handleExportCSV();
        }
        setIsExportModalOpen(false);
    };

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
                mb: 2,
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
        </Box>

        {/* Filter Buttons */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                    onClick={() => setActionFilter("all")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: actionFilter === "all" ? "#334042" : "#e0e0e0",
                        color: actionFilter === "all" ? "#fff" : "#333",
                        opacity: actionFilter === "all" ? 1 : 0.6,
                        "&:hover": { backgroundColor: actionFilter === "all" ? "#2a3435" : "#d0d0d0" },
                    }}
                >
                    All Actions
                </Button>
                {uniqueActions.slice(0, 6).map((action) => (
                    <Button
                        key={action}
                        onClick={() => setActionFilter(action)}
                        sx={{
                            fontSize: "14px",
                            px: 3,
                            py: 1,
                            borderRadius: "10px",
                            textTransform: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            backgroundColor: actionFilter === action ? "#334042" : "#e0e0e0",
                            color: actionFilter === action ? "#fff" : "#333",
                            opacity: actionFilter === action ? 1 : 0.6,
                            "&:hover": { backgroundColor: actionFilter === action ? "#2a3435" : "#d0d0d0" },
                        }}
                    >
                        {action}
                    </Button>
                ))}
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <SearchBar 
                    placeholder="Search logs..." 
                    width="300px"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ActionButton
                    text="Export PDF"
                    width="120px"
                    onClick={() => { setExportType('pdf'); setIsExportModalOpen(true); }}
                />
                <ActionButton
                    text="Export CSV"
                    width="120px"
                    onClick={() => { setExportType('csv'); setIsExportModalOpen(true); }}
                />
            </Box>
        </Box>

        <Box
            sx={{
                height: "calc(100% - 120px)",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "15px",
                backdropFilter: "blur(12px)",
                p: "12px 24px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ fontSize: "14px", color: theme.palette.text.secondary }}>
                    Showing {filteredLogs.length} of {logs.length} logs
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 2fr",
                    color: theme.palette.text.primary,
                    fontWeight: 700,
                    p: "5px 0",
                    width: "100%",
                    alignItems: "center",
                    justifyItems: "center",
                    position: "sticky",
                    top: 0,
                    zIndex: 10
                }}
            >
                <span>Date</span>
                <span>User</span>
                <span>Action</span>
                <span>Description</span>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 0, height: 0 },
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    mt: "5px",
                    mb: "20px",
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
                            gridTemplateColumns: "1fr 1fr 1fr 2fr",
                            alignItems: "center",
                            bgcolor: "#fff",
                            color: "#1b2223",
                            borderRadius: "8px",
                            width: "100%",
                            minHeight: "60px",
                            textAlign: "center",
                            fontSize: "13px",
                            p: 1,
                            cursor: "pointer",
                        }}
                    >
                        <span>{formatDate(log.date)}</span>
                        <span>{log.user}</span>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px'
                        }}>{log.action}</span>
                        <span style={{ 
                            textAlign: "left", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis", 
                            whiteSpace: "nowrap",
                            paddingLeft: "8px"
                        }} title={log.description}>{log.description}</span>
                    </Box>))
                )}
            </Box>
        </Box>

        {/* Export Confirmation Modal */}
        <BoxModal
            open={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            width="400px"
        >
            <Typography
                variant="h5"
                sx={{
                    fontFamily: "'TTHoves-Bold', sans-serif",
                    fontSize: "24px",
                    color: theme.palette.text.primary,
                    mb: 2,
                    textAlign: "center"
                }}
            >
                Export Audit Logs
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, textAlign: "center", mb: 2 }}>
                Export {filteredLogs.length} log(s) to {exportType.toUpperCase()}?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
                <Box
                    onClick={() => setIsExportModalOpen(false)}
                    component="button"
                    sx={{
                        fontSize: "16px",
                        backgroundColor: "#666",
                        color: "#fff",
                        padding: "10px 30px",
                        borderRadius: "15px",
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        "&:hover": { backgroundColor: "#555" },
                    }}
                >
                    Cancel
                </Box>
                <Box
                    onClick={handleConfirmExport}
                    component="button"
                    sx={{
                        fontSize: "16px",
                        backgroundColor: "#172224",
                        color: "#fff",
                        padding: "10px 30px",
                        borderRadius: "15px",
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        "&:hover": { backgroundColor: "#1f2f31", transform: "translateY(-2px)" },
                    }}
                >
                    Export
                </Box>
            </Box>
        </BoxModal>
    </Box>);
}