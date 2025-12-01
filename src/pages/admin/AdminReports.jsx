import React, {useState, useEffect} from "react";
import {Box, Typography, useTheme, CircularProgress} from "@mui/material";
import ActionButton from "../../components/ActionButton.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";

export default function AdminReports() {
    const theme = useTheme();
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [deductionData, setDeductionData] = useState([]);
    const [reportsSummary, setReportsSummary] = useState(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            // Fetch deduction data from manager/payroll reports
            const deductionsResponse = await fetch('http://localhost:8080/api/manager/reports/deductions');
            if (deductionsResponse.ok) {
                const deductions = await deductionsResponse.json();
                // Transform to table format
                const tableData = deductions.map(d => [
                    d.employee_name,
                    formatCurrency(d.tax),
                    formatCurrency(d.sss),
                    formatCurrency(d.philhealth),
                    formatCurrency(d.pagibig),
                    formatCurrency(d.total)
                ]);
                setDeductionData(tableData);
            }

            // Fetch reports summary
            const summaryResponse = await fetch('http://localhost:8080/api/admin/reports-summary');
            if (summaryResponse.ok) {
                const summary = await summaryResponse.json();
                setReportsSummary(summary);
            }
        } catch (error) {
            console.error('Error fetching reports data:', error);
            // No fallback - show empty state
            setDeductionData([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return "₱0.00";
        return `₱${Number(value).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Generate and export PDF report
    const handleExportPDF = async (reportType) => {
        setGenerating(true);
        try {
            // Create a simple printable HTML report
            const reportDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            
            let htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${reportType} Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #1b2223; border-bottom: 2px solid #1b2223; padding-bottom: 10px; }
                        h2 { color: #3a4f50; margin-top: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #1b2223; color: white; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .date { color: #666; font-size: 14px; }
                        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                        .summary-item { display: inline-block; margin-right: 40px; }
                        .summary-value { font-size: 24px; font-weight: bold; color: #1b2223; }
                        .summary-label { color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Payroll Management System</h1>
                        <p class="date">Generated on: ${reportDate}</p>
                    </div>
            `;

            if (reportType === 'Payroll Summary') {
                htmlContent += `
                    <h2>Payroll Summary Report</h2>
                    ${reportsSummary ? `
                        <div class="summary">
                            <div class="summary-item">
                                <div class="summary-value">${reportsSummary.payroll?.total_payrolls || 0}</div>
                                <div class="summary-label">Total Payrolls</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${formatCurrency(reportsSummary.payroll?.total_disbursed || 0)}</div>
                                <div class="summary-label">Total Disbursed</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${formatCurrency(reportsSummary.payroll?.total_deductions || 0)}</div>
                                <div class="summary-label">Total Deductions</div>
                            </div>
                        </div>
                    ` : ''}
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Tax</th>
                                <th>SSS</th>
                                <th>PhilHealth</th>
                                <th>Pag-IBIG</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deductionData.map(row => `
                                <tr>
                                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else if (reportType === 'Department Summary') {
                htmlContent += `
                    <h2>Department Summary Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Employee Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(reportsSummary?.departments || []).map(dept => `
                                <tr>
                                    <td>${dept.department_name || 'Unknown'}</td>
                                    <td>${dept.employee_count || 0}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else if (reportType === 'Tax and Compliance') {
                htmlContent += `
                    <h2>Tax and Compliance Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(reportsSummary?.requests || []).map(req => `
                                <tr>
                                    <td>${req.status}</td>
                                    <td>${req.count}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }

            htmlContent += `
                </body>
                </html>
            `;

            // Open in new window for printing/saving as PDF
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating report');
        } finally {
            setGenerating(false);
        }
    };

    // Generate full report
    const handleGenerateReport = () => {
        handleExportPDF('Payroll Summary');
    };

    return (
        <Box width="100%" height="100%" sx={{ fontFamily: theme.typography.fontFamily }}>
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
                    Reports and Analytics
                </Typography>

                <Box
                    sx={{
                        display: "flex", alignItems: "center", flexWrap: "wrap",
                    }}
                >
                    <ActionButton
                        text={generating ? "Generating..." : "Generate Report"}
                        width="180px"
                        onClick={handleGenerateReport}
                        disabled={generating}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    height: "90.9%",
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
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <ActionButton
                            text="Export PDF"
                            width="150px"
                            onClick={() => handleExportPDF('Payroll Summary')}
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
                            height: 267,
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
                            height: 278,
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
                            {loading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="150px">
                                    <CircularProgress size={24} />
                                </Box>
                            ) : deductionData.length === 0 ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="150px">
                                    <Typography sx={{ color: theme.palette.text.secondary }}>No data available</Typography>
                                </Box>
                            ) : (
                                deductionData.map((row, i) => (
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
                                ))
                            )}
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
                                onClick={() => handleExportPDF('Department Summary')}
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
                                onClick={() => handleExportPDF('Tax and Compliance')}
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
            </Box>
        </Box>
    );
}