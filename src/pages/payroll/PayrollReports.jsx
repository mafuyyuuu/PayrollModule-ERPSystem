import {Box, Typography, useTheme} from "@mui/material";
import ActionButton from "../../components/ActionButton.jsx";
import React, {useState, useEffect} from "react";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import { generateReportPDF, exportToCSV } from "../../utils/pdfGenerator.js";

export default function PayrollReports() {
    const theme = useTheme();

    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("");
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch payroll reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/payroll-reports');

                if (!response.ok) {
                    throw new Error('Failed to fetch reports');
                }

                const data = await response.json();
                console.log('✅ Reports data:', data);

                const transformedData = data.map(report => ({
                    date: new Date(report.report_date || report.pay_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    period: report.pay_period || "N/A",
                    amount: `₱${parseFloat(report.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    status: report.status || "Released"
                }));

                setReports(transformedData);
                setFilteredReports(transformedData);
                setLoading(false);
            } catch (_err) {
                console.error('❌ Error fetching reports:', _err);
                setError(_err.message);
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Filter reports based on search term and filter
    useEffect(() => {
        let filtered = reports;

        // Apply search filter (by period)
        if (searchTerm) {
            filtered = filtered.filter(report =>
                report.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.date.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (filter && filter !== 'all') {
            filtered = filtered.filter(report => report.status === filter);
        }

        setFilteredReports(filtered);
    }, [searchTerm, filter, reports]);

    // Get unique statuses for filter options
    const statuses = [...new Set(reports.map(rep => rep.status))];
    const filterOptions = [
        { value: 'all', label: 'All' },
        ...statuses.map(status => ({ value: status, label: `Status: ${status}` })),
    ];

    const handleExportPDF = () => {
        if (filteredReports.length === 0) {
            console.warn('No reports to export');
            // Using alert for user feedback as no notification system exists
            // eslint-disable-next-line no-alert
            alert('No reports to export');
            return;
        }
        generateReportPDF(filteredReports, 'Payroll Reports and History');
    };

    const handleExportCSV = () => {
        if (filteredReports.length === 0) {
            console.warn('No reports to export');
            // Using alert for user feedback as no notification system exists
            // eslint-disable-next-line no-alert
            alert('No reports to export');
            return;
        }
        exportToCSV(filteredReports, 'payroll_reports.csv');
    };

    return (
        <Box
            width = "100%"
            height = "100%"
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
                    Report and History
                </Typography>

                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                    }}
                >
                    <SearchBar 
                        placeholder="Search by period or date" 
                        width="350px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <FilterSelect
                        width={180}
                        placeholder="Filter by Status"
                        options={filterOptions}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    height: "80%",
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}>
                        Showing {filteredReports.length} of {reports.length} reports
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
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
                    <span>Date</span>
                    <span>Payroll Period</span>
                    <span>Total Amount</span>
                    <span>Status</span>
                </Box>

                {error && (
                    <Box sx={{ color: 'error.main', p: 2, textAlign: 'center' }}>
                        Error: {error}
                    </Box>
                )}

                {loading ? (
                    <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.text.primary }}>
                        Loading reports...
                    </Box>
                ) : (
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
                        {filteredReports.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                                No reports found matching your filters.
                            </Box>
                        ) : (
                            filteredReports.map((item, index) => (
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
                                        transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                    textAlign: "center",
                                }}
                            >
                                <span>{item.date}</span>
                                <span>{item.period}</span>
                                <span>{item.amount}</span>
                                <span>{item.status}</span>
                            </Box>
                        ))
                        )}
                    </Box>
                )}
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton text="Export Payslip PDF" width="200px" onClick={handleExportPDF}/>
                <ActionButton text="Export CSV" width="200px" onClick={handleExportCSV}/>
            </Box>
        </Box>
    );
}