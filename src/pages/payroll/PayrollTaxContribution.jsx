/* eslint-disable no-unused-vars */
import {Box, Typography, useTheme, Chip, Modal, TextField, IconButton, Button, CircularProgress} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart, Legend, Cell} from "recharts";
import React, {useState, useEffect} from "react";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import {exportToCSV, generateReportPDF} from "../../utils/pdfGenerator.js";

export default function PayrollTaxContribution() {
    const theme = useTheme();

    const [modalType, setModalType] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [earningsData, setEarningsData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState({});
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportCSVModalOpen, setExportCSVModalOpen] = useState(false);
    const [exportReportType, setExportReportType] = useState('');
    const [reportTitle, setReportTitle] = useState('Tax Contributions Report');
    const [reportDescription, setReportDescription] = useState('');
    const [generating, setGenerating] = useState(false);

    // Color schemes matching AdminReports
    const darkColors = ["#6cb4ee", "#66cc99", "#ff9966", "#ff6666"];
    const lightColors = ["#1b2223", "#3a4f50", "#5a7f80", "#7ab0b0"];

    // Modal style
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: theme.palette.mode === 'dark' ? '#1b2223' : '#fff',
        borderRadius: '15px',
        boxShadow: 24,
        p: 3,
    };

    // Modal handlers
    const openExportModal = (reportType) => {
        setExportReportType(reportType);
        setExportModalOpen(true);
    };

    const handleConfirmGenerate = () => {
        setGenerating(true);
        setGenerateModalOpen(false);
        handleExportPDF();
        setTimeout(() => setGenerating(false), 1000);
    };

    const handleConfirmExport = () => {
        setGenerating(true);
        setExportModalOpen(false);
        handleExportPDF();
        setTimeout(() => setGenerating(false), 1000);
    };

    const handleConfirmCSVExport = () => {
        setGenerating(true);
        setExportCSVModalOpen(false);
        handleExportCSV();
        setTimeout(() => setGenerating(false), 1000);
    };

    // Get deadline status based on current date
    const getDeadlineStatus = (deadlineDate, currentStatus) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(deadlineDate);
        deadline.setHours(0, 0, 0, 0);
        
        if (currentStatus === 'Completed' || currentStatus === 'Paid') {
            return 'Completed';
        }
        
        if (deadline < today) {
            return 'Overdue';
        }
        
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7) {
            return 'Due Soon';
        }
        
        return 'Upcoming';
    };

    // Get status color using theme
    const getStatusColor = (status) => {
        switch(status) {
            case 'Completed':
            case 'Paid':
                return theme.palette.success.main;
            case 'Overdue':
                return theme.palette.error.main;
            case 'Due Soon':
                return '#E67E22';
            default:
                return theme.palette.primary.main;
        }
    };

    const handleExportCSV = () => {
        const exportData = deadlines.map(d => ({
            Contribution: d.contribution,
            Deadline: d.deadline,
            Status: d.status,
            Amount: d.amount || 'N/A'
        }));
        if (exportData.length === 0) {
            alert('No data to export');
            return;
        }
        exportToCSV(exportData, 'tax_contributions.csv');
    };

    const handleExportPDF = () => {
        const exportData = deadlines.map(d => ({
            contribution: d.contribution,
            deadline: d.deadline,
            status: d.status
        }));
        if (exportData.length === 0) {
            alert('No data to export');
            return;
        }
        generateReportPDF(exportData, 'Tax and Contributions Report');
    };

    // Fetch tax and contribution data
    useEffect(() => {
        const fetchTaxData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/payroll/tax-contributions');

                if (!response.ok) {
                    throw new Error('Failed to fetch tax data');
                }

                const data = await response.json();
                console.log('✅ Tax data:', data);

                // Transform chart data for line chart - use empty array if no data
                const chartData = data.monthlyData?.length > 0 
                    ? data.monthlyData.map(item => ({
                        month: item.month,
                        total: parseFloat(item.total_contributions) || 0,
                        sss: parseFloat(item.sss) || 0,
                        philhealth: parseFloat(item.philhealth) || 0,
                        pagibig: parseFloat(item.pagibig) || 0,
                        tax: parseFloat(item.tax) || 0
                    }))
                    : [];

                setEarningsData(chartData);

                // Department breakdown data from API - use empty array if no data
                const deptData = data.departmentData?.length > 0
                    ? data.departmentData.map(d => ({
                        name: d.name,
                        sss: parseFloat(d.sss) || 0,
                        philhealth: parseFloat(d.philhealth) || 0,
                        pagibig: parseFloat(d.pagibig) || 0,
                        tax: parseFloat(d.tax) || 0
                    }))
                    : [];
                setDepartmentData(deptData);

                // Set summary data
                setSummaryData(data.summaryData || {});

                // Transform deadlines with proper status logic - use empty array if no data
                const deadlinesData = data.upcomingDeadlines?.length > 0
                    ? data.upcomingDeadlines.map(item => {
                        const status = getDeadlineStatus(item.deadline_date, item.status);
                        return {
                            contribution: item.contribution_type,
                            deadline: new Date(item.deadline_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }),
                            deadlineDate: item.deadline_date,
                            status: status,
                            amount: item.amount ? `₱${parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null
                        };
                    })
                    : [];

                // Sort by deadline date (closest first)
                deadlinesData.sort((a, b) => new Date(a.deadlineDate || a.deadline) - new Date(b.deadlineDate || b.deadline));

                setDeadlines(deadlinesData);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching tax data:', err);
                // Set empty arrays on error - no hardcoded fallback data
                setEarningsData([]);
                setDepartmentData([]);
                setDeadlines([]);
                setLoading(false);
            }
        };

        fetchTaxData();
    }, []);

    const renderModalCards = () => {
        switch (modalType) {
            case "exportPDF":
                return (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                                mb: 2,
                                textAlign: "center"
                            }}
                        >
                            Export Tax Contributions Report
                        </Typography>
                        <Typography sx={{ color: "#ccc", textAlign: "center", mb: 2 }}>
                            All periods and departments
                        </Typography>
                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={() => {
                                    handleExportPDF();
                                    setIsModalOpen(false);
                                }}
                                component="button"
                                sx={{
                                    fontSize: "16px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#1f2f31",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Download PDF
                            </Box>
                        </Box>
                    </>
                );

            case "exportCSV":
                return (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                                textAlign: "center"
                            }}
                        >
                            Export Tax Contributions to CSV
                        </Typography>
                        <Typography sx={{ color: "#ccc", textAlign: "center", mb: 2 }}>
                            This will export {deadlines.length} contribution records
                        </Typography>
                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={() => {
                                    handleExportCSV();
                                    setIsModalOpen(false);
                                }}
                                component="button"
                                sx={{
                                    fontSize: "16px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#1f2f31",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Download CSV
                            </Box>
                        </Box>
                    </>
                );

            default:
                return <Typography sx={{color: "#fff"}}>No data available</Typography>;

        }
    };

    return (
        <Box width="100%" height="100%" display="flex" flexDirection="column">
            <Box sx={{alignItems: "center", display: "flex", mb: 2, flexShrink: 0}}>
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                    }}
                >
                    Tax and Contributions
                </Typography>
            </Box>

            <Box
                display="grid"
                gridTemplateColumns={{xs: "1fr", md: "2fr 1fr"}}
                gap="20px"
                flex="1 1 auto"   // allow it to shrink
            >
                <Box
                    borderRadius="12px"
                    p="24px"
                    sx={{
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.2)",
                        fontFamily: theme.typography.fontFamily,
                        color: theme.palette.text.primary,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                        height: "96%",
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
                                fontSize: "18px",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                            }}
                        >
                            <i
                                className="ri-bar-chart-2-line"
                                style={{fontSize: 18, marginRight: "10px"}}
                            ></i>
                            Contributions Overview
                        </Typography>
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, flexWrap: "wrap"}}>
                        {/* Total Contributions Over Time Graph */}
                        <Box sx={{flex: 1, minWidth: 300}}>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 1,
                                    mt: 1,
                                    fontSize: "16px",
                                    fontFamily: "'TTHoves-medium', sans-serif",
                                }}
                            >
                                Total Contributions Over Time Graph
                            </Typography>
                            <Box
                                borderRadius="12px"
                                p="15px"
                                sx={{
                                    color: theme.palette.text.primary,
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.05)"
                                            : "rgba(255, 255, 255, 0.2)",
                                    fontFamily: theme.typography.fontFamily,
                                    border: `1px solid ${theme.palette.divider}`,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.02)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                    },
                                    height: "230px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {earningsData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={earningsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === "dark" ? "#555" : "#e0e0e0"} />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: theme.palette.text.primary }} />
                                            <YAxis tick={{ fontSize: 10, fill: theme.palette.text.primary }} tickFormatter={(value) => `₱${(value/1000).toFixed(0)}k`} />
                                            <Tooltip 
                                                formatter={(value) => [`₱${parseFloat(value).toLocaleString()}`, '']}
                                                contentStyle={{ backgroundColor: "#fff", color: "#000000" }}
                                                labelStyle={{ color: "#000000", fontWeight: "bold" }}
                                            />
                                            <Legend 
                                                wrapperStyle={{
                                                    fontFamily: "TTHoves-Demibold",
                                                    fontSize: "10px",
                                                    color: theme.palette.text.primary
                                                }}
                                            />
                                            <Line type="monotone" dataKey="total" name="Total" stroke={theme.palette.mode === "dark" ? "#6cb4ee" : "#1b2223"} strokeWidth={3} dot={{r: 4}} />
                                            <Line type="monotone" dataKey="sss" name="SSS" stroke={theme.palette.mode === "dark" ? "#66cc99" : "#3a4f50"} strokeWidth={2} dot={{r: 3}} />
                                            <Line type="monotone" dataKey="philhealth" name="PhilHealth" stroke={theme.palette.mode === "dark" ? "#ff9966" : "#5a7f80"} strokeWidth={2} dot={{r: 3}} />
                                            <Line type="monotone" dataKey="pagibig" name="Pag-IBIG" stroke={theme.palette.mode === "dark" ? "#ff6666" : "#7ab0b0"} strokeWidth={2} dot={{r: 3}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Typography sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
                                        No contribution data available
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Department Level Breakdown Bar Chart */}
                        <Box sx={{flex: 1, minWidth: 300}}>
                            <Typography
                                variant="h5"
                                sx={{
                                    mt: 2,
                                    mb: 1,
                                    fontSize: "16px",
                                    fontFamily: "'TTHoves-medium', sans-serif",
                                }}
                            >
                                Department Level Breakdown
                            </Typography>
                            <Box
                                borderRadius="12px"
                                p="24px"
                                sx={{
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.05)"
                                            : "rgba(255, 255, 255, 0.2)",
                                    fontFamily: theme.typography.fontFamily,
                                    color: theme.palette.text.primary,
                                    border: `1px solid ${theme.palette.divider}`,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.02)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                    },
                                    height: "230px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {departmentData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={departmentData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === "dark" ? "#555" : "#7e7d7d"} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.palette.text.primary }} />
                                            <YAxis tick={{ fontSize: 10, fill: theme.palette.text.primary }} tickFormatter={(value) => `₱${(value/1000).toFixed(0)}k`} />
                                            <Tooltip 
                                                formatter={(value) => [`₱${parseFloat(value).toLocaleString()}`, '']}
                                                contentStyle={{ backgroundColor: "#fff", color: "#000000" }}
                                                labelStyle={{ color: "#000000", fontWeight: "bold" }}
                                            />
                                            <Legend 
                                                wrapperStyle={{
                                                    fontFamily: "TTHoves-Demibold",
                                                    fontSize: "10px",
                                                    color: theme.palette.text.primary
                                                }}
                                            />
                                            <Bar dataKey="sss" name="SSS" fill={theme.palette.mode === "dark" ? "#66cc99" : "#1b2223"} radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="philhealth" name="PhilHealth" fill={theme.palette.mode === "dark" ? "#6cb4ee" : "#3a4f50"} radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="pagibig" name="Pag-IBIG" fill={theme.palette.mode === "dark" ? "#ff9966" : "#5a7f80"} radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="tax" name="Tax" fill={theme.palette.mode === "dark" ? "#ff6666" : "#7ab0b0"} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Typography sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
                                        No department data available
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box
                    borderRadius="12px"
                    lineHeight={4}
                    p="24px"
                    sx={{
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.2)",
                        fontFamily: theme.typography.fontFamily,
                        color: theme.palette.text.primary,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                        height: "96%",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 2,
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        <i
                            className="ri-calendar-check-line"
                            style={{fontSize: 18, marginRight: "10px"}}
                        ></i>
                        Upcoming Deadlines
                    </Typography>

                    <Box
                        sx={{
                            height: "497px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Header */}
                        <Box sx={{
                            display: "grid",
                            gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr",
                            color: theme.palette.text.primary,
                            border: "none",
                            marginBottom: "10px",
                            fontWeight: 600,
                            textAlign: "center",
                            fontSize: "13px",
                        }}>
                            <span>Contribution</span>
                            <span>Deadline</span>
                            <span>Amount</span>
                            <span>Status</span>
                        </Box>

                        {/* Content */}
                        {loading ? (
                            <Box sx={{p: 2, textAlign: "center", flex: 1}}>
                                Loading deadlines...
                            </Box>
                        ) : deadlines.length === 0 ? (
                            <Box sx={{p: 2, textAlign: "center", flex: 1, color: theme.palette.text.secondary}}>
                                No upcoming deadlines
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    flex: 1,
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    overflowY: "auto",
                                    gap: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                    "&::-webkit-scrollbar": {width: 0, height: 0},
                                }}
                            >
                                {deadlines.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {xs: "1fr", sm: "1.2fr 1fr 1fr 0.8fr"},
                                            alignItems: "center",
                                            bgcolor: theme.palette.mode === "dark" 
                                                ? "rgba(255, 255, 255, 0.08)" 
                                                : "#fff",
                                            color: theme.palette.text.primary,
                                            borderRadius: "8px",
                                            width: "100%",
                                            minHeight: "60px",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                            },
                                            textAlign: "center",
                                            p: 2,
                                            gap: {xs: 1, sm: 0},
                                            fontSize: "13px",
                                        }}
                                    >
                                        <span style={{ fontWeight: 600, textAlign: "left" }}>{item.contribution}</span>
                                        <span>{item.deadline}</span>
                                        <span style={{ fontWeight: 500 }}>{item.amount || '-'}</span>
                                        <Chip
                                            label={item.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: getStatusColor(item.status),
                                                color: '#fff',
                                                fontWeight: 600,
                                                fontSize: '11px',
                                                minWidth: '80px',
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt={2}>
                <ActionButton
                    text={generating ? "Generating..." : "Generate Report"}
                    width="180px"
                    onClick={() => setGenerateModalOpen(true)}
                    disabled={generating}
                />
                <ActionButton
                    text="Export PDF"
                    width="150px"
                    onClick={() => openExportModal('Tax Contributions')}
                />
                <ActionButton
                    text="Export CSV"
                    width="150px"
                    onClick={() => setExportCSVModalOpen(true)}
                />
            </Box>

            <BoxModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                {renderModalCards()}
            </BoxModal>

            {/* Generate Report Modal */}
            <Modal
                open={generateModalOpen}
                onClose={() => setGenerateModalOpen(false)}
                aria-labelledby="generate-report-modal"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: theme.palette.text.primary,
                            }}
                        >
                            Generate Report
                        </Typography>
                        <IconButton onClick={() => setGenerateModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <TextField
                        fullWidth
                        label="Report Title"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            sx: { borderRadius: '10px' }
                        }}
                    />
                    
                    <TextField
                        fullWidth
                        label="Description (Optional)"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        multiline
                        rows={3}
                        sx={{ mb: 3 }}
                        InputProps={{
                            sx: { borderRadius: '10px' }
                        }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            onClick={() => setGenerateModalOpen(false)}
                            sx={{
                                textTransform: 'none',
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                color: theme.palette.text.secondary,
                            }}
                        >
                            Cancel
                        </Button>
                        <ActionButton
                            text={generating ? "Generating..." : "Generate"}
                            width="120px"
                            onClick={handleConfirmGenerate}
                            disabled={generating}
                        />
                    </Box>
                </Box>
            </Modal>

            {/* Export PDF Modal */}
            <Modal
                open={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
                aria-labelledby="export-pdf-modal"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: theme.palette.text.primary,
                            }}
                        >
                            Export PDF
                        </Typography>
                        <IconButton onClick={() => setExportModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <Typography sx={{ mb: 2, color: theme.palette.text.secondary }}>
                        You are about to export the <strong>{exportReportType}</strong> report as a PDF file.
                    </Typography>
                    
                    <Box sx={{ 
                        p: 2, 
                        borderRadius: '10px', 
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                        mb: 3
                    }}>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Report Type: {exportReportType}
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Format: PDF Document
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            onClick={() => setExportModalOpen(false)}
                            sx={{
                                textTransform: 'none',
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                color: theme.palette.text.secondary,
                            }}
                        >
                            Cancel
                        </Button>
                        <ActionButton
                            text={generating ? "Exporting..." : "Export PDF"}
                            width="120px"
                            onClick={handleConfirmExport}
                            disabled={generating}
                        />
                    </Box>
                </Box>
            </Modal>

            {/* Export CSV Modal */}
            <Modal
                open={exportCSVModalOpen}
                onClose={() => setExportCSVModalOpen(false)}
                aria-labelledby="export-csv-modal"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: theme.palette.text.primary,
                            }}
                        >
                            Export CSV
                        </Typography>
                        <IconButton onClick={() => setExportCSVModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <Typography sx={{ mb: 2, color: theme.palette.text.secondary }}>
                        You are about to export the <strong>Tax Contributions</strong> data as a CSV file.
                    </Typography>
                    
                    <Box sx={{ 
                        p: 2, 
                        borderRadius: '10px', 
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                        mb: 3
                    }}>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Records: {deadlines.length} contribution entries
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Format: CSV (Comma Separated Values)
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
                            • Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            onClick={() => setExportCSVModalOpen(false)}
                            sx={{
                                textTransform: 'none',
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                color: theme.palette.text.secondary,
                            }}
                        >
                            Cancel
                        </Button>
                        <ActionButton
                            text={generating ? "Exporting..." : "Export CSV"}
                            width="120px"
                            onClick={handleConfirmCSVExport}
                            disabled={generating}
                        />
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}