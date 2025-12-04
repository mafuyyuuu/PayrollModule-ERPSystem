import React, {useState, useEffect} from "react";
import {Box, Typography, useTheme, CircularProgress, Button} from "@mui/material";
import ActionButton from "../../components/ActionButton.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts";

export default function AdminReports() {
    const theme = useTheme();
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [deductionData, setDeductionData] = useState([]);
    const [reportsSummary, setReportsSummary] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [complianceData, setComplianceData] = useState([]);

    const COLORS = ['#1b2223', '#3a4f50', '#5a7f80', '#7ab0b0', '#9ad0d0', '#bae0e0'];

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
                const tableData = deductions.map(d => ({
                    name: d.employee_name,
                    tax: d.tax || 0,
                    sss: d.sss || 0,
                    philhealth: d.philhealth || 0,
                    pagibig: d.pagibig || 0,
                    total: d.total || 0
                }));
                setDeductionData(tableData);
                
                // Prepare chart data (top 10 by total deductions)
                const chartData = tableData
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 10)
                    .map(d => ({
                        name: d.name?.split(' ')[0] || 'Unknown', // First name only for chart
                        Tax: d.tax,
                        SSS: d.sss,
                        PhilHealth: d.philhealth,
                        'Pag-IBIG': d.pagibig
                    }));
                setChartData(chartData);
            }

            // Fetch reports summary
            const summaryResponse = await fetch('http://localhost:8080/api/admin/reports-summary');
            if (summaryResponse.ok) {
                const summary = await summaryResponse.json();
                setReportsSummary(summary);
                
                // Prepare department data for pie chart
                if (summary.departments) {
                    setDepartmentData(summary.departments.map(d => ({
                        name: d.department_name || 'Unknown',
                        value: d.employee_count || 0
                    })));
                }
                
                // Prepare compliance data for line chart
                if (summary.requests) {
                    setComplianceData(summary.requests.map(r => ({
                        name: r.status,
                        count: r.count || 0
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching reports data:', error);
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

    // Filter data based on selection
    const getFilteredData = () => {
        if (filter === "all" || !filter) return deductionData;
        
        return deductionData.filter(d => {
            const total = d.total;
            switch(filter) {
                case "high": return total >= 5000;
                case "medium": return total >= 2000 && total < 5000;
                case "low": return total < 2000;
                default: return true;
            }
        });
    };

    // Generate and export PDF report
    const handleExportPDF = async (reportType) => {
        setGenerating(true);
        try {
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
                const filteredData = getFilteredData();
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
                            ${filteredData.map(row => `
                                <tr>
                                    <td>${row.name}</td>
                                    <td>${formatCurrency(row.tax)}</td>
                                    <td>${formatCurrency(row.sss)}</td>
                                    <td>${formatCurrency(row.philhealth)}</td>
                                    <td>${formatCurrency(row.pagibig)}</td>
                                    <td>${formatCurrency(row.total)}</td>
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
                            ${departmentData.map(dept => `
                                <tr>
                                    <td>${dept.name}</td>
                                    <td>${dept.value}</td>
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
                            ${complianceData.map(req => `
                                <tr>
                                    <td>${req.name}</td>
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

    const handleGenerateReport = () => {
        handleExportPDF('Payroll Summary');
    };

    const filteredData = getFilteredData();

    return (
        <Box width="100%" height="100%" sx={{ fontFamily: theme.typography.fontFamily }}>
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
                    Reports and Analytics
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                    p: 2.5,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: 3 },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2
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
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        {/* Filter Buttons */}
                        <Box sx={{ display: "flex", gap: 1, mr: 1 }}>
                            {[
                                { value: "all", label: "All" },
                                { value: "high", label: "High (≥₱5k)" },
                                { value: "medium", label: "Medium" },
                                { value: "low", label: "Low (<₱2k)" }
                            ].map((btn) => (
                                <Button
                                    key={btn.value}
                                    onClick={() => setFilter(btn.value)}
                                    sx={{
                                        fontSize: "12px",
                                        px: 1.5,
                                        py: 0.5,
                                        minWidth: "auto",
                                        borderRadius: "8px",
                                        textTransform: "none",
                                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                                        backgroundColor: filter === btn.value ? "#1b2223" : "#e0e0e0",
                                        color: filter === btn.value ? "#fff" : "#333",
                                        "&:hover": {
                                            backgroundColor: filter === btn.value ? "#2a3435" : "#d0d0d0",
                                        },
                                    }}
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </Box>
                        <ActionButton
                            text="Export PDF"
                            width="120px"
                            onClick={() => handleExportPDF('Payroll Summary')}
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
                    {/* Deductions Bar Chart */}
                    <Box
                        sx={{
                            flex: 1.2,
                            height: 277,
                            backgroundColor: theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "#fff",
                            borderRadius: "12px",
                            p: 2,
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Typography sx={{ fontSize: "14px", fontFamily: "'TTHoves-DemiBold', sans-serif", mb: 1, color: theme.palette.text.primary }}>
                            Top 10 Employee Deductions
                        </Typography>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === "dark" ? "#555" : "#e0e0e0"} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.palette.text.primary }} />
                                    <YAxis tick={{ fontSize: 10, fill: theme.palette.text.primary }} tickFormatter={(v) => `₱${v/1000}k`} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    <Bar dataKey="Tax" fill="#1b2223" stackId="a" />
                                    <Bar dataKey="SSS" fill="#3a4f50" stackId="a" />
                                    <Bar dataKey="PhilHealth" fill="#5a7f80" stackId="a" />
                                    <Bar dataKey="Pag-IBIG" fill="#7ab0b0" stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height="90%">
                                <Typography sx={{ color: theme.palette.text.secondary, fontStyle: "italic" }}>
                                    No chart data available
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Deductions Table */}
                    <Box
                        sx={{
                            height: 278,
                            flex: 1.8,
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: "15px",
                            p: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                p: 1,
                                fontSize: "13px",
                            }}
                        >
                            <span style={{ textAlign: "left", paddingLeft: "8px" }}>Employee</span>
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
                            flex: 1,
                            "&::-webkit-scrollbar": { width: 4 },
                            "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: 2 },
                        }}>
                            {loading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="150px">
                                    <CircularProgress size={24} />
                                </Box>
                            ) : filteredData.length === 0 ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="150px">
                                    <Typography sx={{ color: theme.palette.text.secondary }}>No data available</Typography>
                                </Box>
                            ) : (
                                filteredData.map((row, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                                            display: "grid",
                                            gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
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
                                            fontSize: "12px",
                                        }}
                                    >
                                        <span style={{
                                            textAlign: "left",
                                            paddingLeft: "8px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            maxWidth: "100%"
                                        }} title={row.name}>
                                            {row.name}
                                        </span>
                                        <span style={{ textAlign: "center" }}>{formatCurrency(row.tax)}</span>
                                        <span style={{ textAlign: "center" }}>{formatCurrency(row.sss)}</span>
                                        <span style={{ textAlign: "center" }}>{formatCurrency(row.philhealth)}</span>
                                        <span style={{ textAlign: "center" }}>{formatCurrency(row.pagibig)}</span>
                                        <span style={{ textAlign: "center", fontWeight: 700 }}>{formatCurrency(row.total)}</span>
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
                    {/* Department Summary - Pie Chart */}
                    <Box
                        sx={{
                            borderRadius: "12px",
                            p: 2,
                            backgroundColor: theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "#fff",
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
                                Department Summary
                            </Typography>
                            <ActionButton
                                text="Export PDF"
                                width="120px"
                                onClick={() => handleExportPDF('Department Summary')}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {departmentData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={departmentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = outerRadius + 25;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        textAnchor={x > cx ? 'start' : 'end'}
                                                        dominantBaseline="central"
                                                        style={{
                                                            fontSize: 11,
                                                            fill: theme.palette.text.primary,
                                                            backgroundColor: theme.palette.background.paper,
                                                        }}
                                                    >
                                                        <tspan
                                                            style={{
                                                                filter: `drop-shadow(0 0 3px ${theme.palette.background.default}) drop-shadow(0 0 3px ${theme.palette.background.default})`,
                                                            }}
                                                        >
                                                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                                                        </tspan>
                                                    </text>
                                                );
                                            }}
                                            labelLine={false}
                                        >
                                            {departmentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value} employees`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography sx={{ color: theme.palette.text.secondary, fontStyle: "italic" }}>
                                    No department data available
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Tax and Compliance - Bar Chart */}
                    <Box
                        sx={{
                            borderRadius: "12px",
                            p: 2,
                            backgroundColor: theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "#fff",
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
                                width="120px"
                                onClick={() => handleExportPDF('Tax and Compliance')}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            {complianceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={complianceData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === "dark" ? "#fff" : "#7e7d7d"} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.palette.text.primary }} />
                                        <YAxis tick={{ fontSize: 11, fill: theme.palette.text.primary }} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#1b2223" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <Typography sx={{ color: theme.palette.text.secondary, fontStyle: "italic" }}>
                                        No compliance data available
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}