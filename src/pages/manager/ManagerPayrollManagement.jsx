import {Box, Typography, Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import DashboardCard from "../../components/DashboardCard.jsx";
import "remixicon/fonts/remixicon.css";
import SearchBar from "../../components/SearchBar.jsx";
import React, {useState, useEffect} from "react";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

const ManagerPayrollSummary = () => {
    const [employeePayrollData, setEmployeePayrollData] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [stats, setStats] = useState({
        totalPayrollCost: 0,
        totalDeductions: 0,
        totalBenefits: 0
    });

    const theme = useTheme();

    // Fetch payroll data
    useEffect(() => {
        const fetchPayrollData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/manager/payroll');
                if (!response.ok) throw new Error('Failed to fetch payroll data');
                const data = await response.json();

                // Transform and aggregate by employee
                const employeeMap = {};
                data.forEach(p => {
                    const key = p.employee_id;
                    if (!employeeMap[key]) {
                        employeeMap[key] = {
                            id: p.employee_id,
                            name: p.employee_name,
                            gross: 0,
                            deductions: 0,
                            benefits: 0,
                            net: 0
                        };
                    }
                    employeeMap[key].gross += parseFloat(p.gross) || 0;
                    employeeMap[key].deductions += parseFloat(p.deductions) || 0;
                    employeeMap[key].benefits += parseFloat(p.benefits) || 0;
                    employeeMap[key].net += parseFloat(p.net_pay) || 0;
                });

                const aggregatedData = Object.values(employeeMap);
                setEmployeePayrollData(aggregatedData);

                // Calculate totals
                const totals = aggregatedData.reduce((acc, emp) => ({
                    totalPayrollCost: acc.totalPayrollCost + emp.gross,
                    totalDeductions: acc.totalDeductions + emp.deductions,
                    totalBenefits: acc.totalBenefits + emp.benefits
                }), { totalPayrollCost: 0, totalDeductions: 0, totalBenefits: 0 });

                setStats(totals);
            } catch (error) {
                console.error('Error fetching payroll data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchActivityLogs = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/manager/activity-logs');
                if (!response.ok) throw new Error('Failed to fetch activity logs');
                const data = await response.json();
                setActivityLogs(data);
            } catch (error) {
                console.error('Error fetching activity logs:', error);
            } finally {
                setLogsLoading(false);
            }
        };

        fetchPayrollData();
        fetchActivityLogs();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        const date = new Date(dateTime);
        return date.toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredData = employeePayrollData.filter(row =>
        !searchTerm || row.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Employee Name', 'Gross', 'Deductions', 'Benefits', 'Net'];
        const csvData = filteredData.map(row => [
            row.name,
            row.gross,
            row.deductions,
            row.benefits,
            row.net
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `payroll_summary_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <Box
            sx={{width: "100%", height: "100%", fontFamily: theme.typography.fontFamily, display: "flex", flexDirection: "column"}}
        >
            {/* DASHBOARD CARDS */}
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="20px" mb={2}>
                <DashboardCard
                    icon="ri-cash-line"
                    title="Total Payroll Cost"
                    value={loading ? "..." : formatCurrency(stats.totalPayrollCost)}
                />
                <DashboardCard
                    icon="ri-file-reduce-line"
                    title="Total Deductions"
                    value={loading ? "..." : formatCurrency(stats.totalDeductions)}
                />
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="Total Benefits"
                    value={loading ? "..." : formatCurrency(stats.totalBenefits)}
                />
            </Box>

            {/* MAIN CONTENT - Two columns */}
            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "1.5fr 1fr" }}
                gap="20px"
                mt={2}
                sx={{ flex: 1, minHeight: 0 }}
            >
                {/* LEFT COLUMN - Payroll Summary Table */}
                <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
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
                            Employee Payroll Summary
                        </Typography>
                        <Box display="flex" gap={1}>
                            <ActionButton
                                text="Export CSV"
                                width="auto"
                                onClick={() => setExportModalOpen(true)}
                            />
                            <SearchBar
                                placeholder="Search Employee"
                                width="250px"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Box>
                    </Box>

                    {/* TABLE CONTAINER */}
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: "15px",
                            backdropFilter: "blur(12px)",
                            p: "12px 24px",
                            transition: "all 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            "&:hover": {
                                transform: "scale(1.01)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            },
                        }}
                    >
                        {/* HEADER ROW */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
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
                            <span style={{textAlign: "left"}}>Employee Name</span>
                            <span>Gross</span>
                            <span>Deductions</span>
                            <span>Benefits</span>
                            <span>Net</span>
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
                            {loading ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.primary }}>
                                    Loading payroll data...
                                </Box>
                            ) : filteredData.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                                    No payroll data found.
                                </Box>
                            ) : (
                            filteredData.map((row) => (
                                <Box
                                    key={row.id}
                                    sx={{
                                        marginTop: "8px",
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                                        alignItems: "center",
                                        bgcolor: "#fff",
                                        color: "#1b2223",
                                        borderRadius: "8px",
                                        width: "100%",
                                        minHeight: "55px",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                        },
                                        textAlign: "center",
                                        px: 2,
                                    }}
                                >
                                    <span style={{textAlign: "left"}}>{row.name}</span>
                                    <span>{formatCurrency(row.gross)}</span>
                                    <span>{formatCurrency(row.deductions)}</span>
                                    <span>{formatCurrency(row.benefits)}</span>
                                    <span style={{fontWeight: 700, color: "#2E7D32"}}>{formatCurrency(row.net)}</span>
                                </Box>
                            ))
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* RIGHT COLUMN - Activity Logs */}
                <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>

                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: "15px",
                            backdropFilter: "blur(12px)",
                            p: "16px",
                            transition: "all 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            "&:hover": {
                                transform: "scale(1.01)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            },
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontSize: "20px",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: theme.palette.text.primary,
                                mb: 2,
                            }}
                        >
                            <i className="ri-history-line" style={{ marginRight: "8px" }}></i>
                            Recent Activity
                        </Typography>
                        <Box
                            sx={{
                                overflowY: "auto",
                                "&::-webkit-scrollbar": {width: 0, height: 0},
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                flex: 1,
                            }}
                        >
                            {logsLoading ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.primary }}>
                                    Loading activity logs...
                                </Box>
                            ) : activityLogs.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                                    No recent activity.
                                </Box>
                            ) : (
                                activityLogs.map((log, index) => (
                                    <Box
                                        key={`${log.type}-${log.id}-${index}`}
                                        sx={{
                                            p: "12px",
                                            mb: 1,
                                            bgcolor: "#fff",
                                            borderRadius: "10px",
                                            borderLeft: `4px solid ${
                                                log.status === 'Approved' ? '#4CAF50' : 
                                                log.status === 'Rejected' ? '#F44336' : 
                                                log.status === 'Released' ? '#2196F3' : '#FF9800'
                                            }`,
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                transform: "translateX(4px)",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                            },
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "14px",
                                                fontWeight: 600,
                                                color: "#1b2223",
                                                mb: 0.5,
                                            }}
                                        >
                                            {log.action}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "13px",
                                                color: "#666",
                                            }}
                                        >
                                            {log.employee}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mt: 1,
                                                fontSize: "12px",
                                                color: "#888",
                                            }}
                                        >
                                            <span>By: {log.processedBy}</span>
                                            <span>{formatDateTime(log.dateTime)}</span>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Export CSV Confirmation Modal */}
            <BoxModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} width={400}>
                <Box sx={{ textAlign: "center" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "24px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 1
                        }}
                    >
                        Export CSV
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 2
                        }}
                    >
                        Are you sure you want to download the payroll summary as CSV?
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignContent:"center" }}>
                        <Box
                            variant="outlined"
                            onClick={() => setExportModalOpen(false)}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#a0a0a0" }
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            variant="contained"
                            onClick={() => {
                                exportToCSV();
                                setExportModalOpen(false);
                            }}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#172224",
                                color: "#fff",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#1f2f31" }
                            }}
                        >
                            Download
                        </Box>
                    </Box>
                </Box>
            </BoxModal>
        </Box>
    );
};

export default ManagerPayrollSummary;