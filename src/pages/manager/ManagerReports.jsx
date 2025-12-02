import React, {useState, useEffect} from "react";
import {Box, Typography, useTheme, CircularProgress, Button} from "@mui/material";
import ActionButton from "../../components/ActionButton.jsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts";

export default function ManagerReports() {
    const theme = useTheme();
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [deductionData, setDeductionData] = useState([]);
    const [reportsSummary, setReportsSummary] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [timesheetData, setTimesheetData] = useState([]);

    const COLORS = ['#1b2223', '#3a4f50', '#5a7f80', '#7ab0b0', '#9ad0d0', '#bae0e0'];

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            // Fetch deduction data
            const deductionsResponse = await fetch('http://localhost:8080/api/manager/reports/deductions');
            if (deductionsResponse.ok) {
                const deductions = await deductionsResponse.json();
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
                        name: d.name?.split(' ')[0] || 'Unknown',
                        Tax: d.tax,
                        SSS: d.sss,
                        PhilHealth: d.philhealth,
                        'Pag-IBIG': d.pagibig
                    }));
                setChartData(chartData);
            }

            // Fetch department summary
            const deptResponse = await fetch('http://localhost:8080/api/manager/reports/department-summary');
            if (deptResponse.ok) {
                const data = await deptResponse.json();
                setDepartmentData(data.map(d => ({
                    name: d.name || d.department_name || 'Unknown',
                    value: d.employees || d.employee_count || 0,
                    totalPay: d.totalPay || 0
                })));
            }

            // Fetch timesheet summary for trend
            const timesheetResponse = await fetch('http://localhost:8080/api/manager/timesheets');
            if (timesheetResponse.ok) {
                const data = await timesheetResponse.json();
                // Group by status for pie chart
                const statusCounts = data.reduce((acc, ts) => {
                    const status = ts.status || 'Pending';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});
                setTimesheetData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
            }

            // Fetch reports summary
            const summaryResponse = await fetch('http://localhost:8080/api/admin/reports-summary');
            if (summaryResponse.ok) {
                const summary = await summaryResponse.json();
                setReportsSummary(summary);
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

            if (reportType === 'Employee Deductions') {
                const filteredData = getFilteredData();
                htmlContent += `
                    <h2>Employee Deductions Report</h2>
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
            } else if (reportType === 'Timesheet Summary') {
                htmlContent += `
                    <h2>Timesheet Summary Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${timesheetData.map(row => `
                                <tr>
                                    <td>${row.name}</td>
                                    <td>${row.value}</td>
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
        handleExportPDF('Employee Deductions');
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
                    p: 2,
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
                        Employee Deductions Report
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        {/* Filter Buttons */}
                        <Box sx={{ display: "flex", gap: 0.5, mr: 1 }}>
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
                            onClick={() => handleExportPDF('Employee Deductions')}
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
                            height: 267,
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₱${v/1000}k`} />
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
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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

                    {/* Timesheet Summary - Pie Chart */}
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
                                Timesheet Summary
                            </Typography>
                            <ActionButton
                                text="Export PDF"
                                width="120px"
                                onClick={() => handleExportPDF('Timesheet Summary')}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            {timesheetData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={timesheetData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#1b2223" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <Typography sx={{ color: theme.palette.text.secondary, fontStyle: "italic" }}>
                                        No timesheet data available
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
