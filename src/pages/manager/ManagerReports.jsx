import React, {useState, useEffect} from "react";
import {Box, Typography, useTheme} from "@mui/material";
import ActionButton from "../../components/ActionButton.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend} from "recharts";

export default function ManagerReports() {
    const theme = useTheme();

    const [filter, setFilter] = useState("all");
    const [deductionData, setDeductionData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [taxData, setTaxData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Export modal states
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportModalType, setExportModalType] = useState(''); // 'deductions-pdf', 'deductions-csv', 'department-pdf', 'full'

    const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];

    // Fetch all report data
    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // Fetch deductions
                const deductionsResponse = await fetch('http://localhost:8080/api/manager/reports/deductions');
                if (deductionsResponse.ok) {
                    const data = await deductionsResponse.json();
                    setDeductionData(data);
                }

                // Fetch department summary
                const deptResponse = await fetch('http://localhost:8080/api/manager/reports/department-summary');
                if (deptResponse.ok) {
                    const data = await deptResponse.json();
                    setDepartmentData(data);
                }

                // Fetch tax summary
                const taxResponse = await fetch('http://localhost:8080/api/manager/reports/tax-summary');
                if (taxResponse.ok) {
                    const data = await taxResponse.json();
                    setTaxData(data);
                }
            } catch (error) {
                console.error('Error fetching report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Filter deduction data
    const filteredDeductionData = filter === 'all' 
        ? deductionData 
        : deductionData.filter(item => {
            if (filter === 'high') return (item.total || 0) > 10000;
            if (filter === 'low') return (item.total || 0) <= 10000;
            return true;
        });

    // Export functions
    const exportToPDF = (title, data) => {
        // Create a simple printable HTML
        const printContent = `
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #4CAF50; color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    .footer { margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <table>
                    <thead>
                        <tr>
                            ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${Object.values(row).map(val => `<td>${typeof val === 'number' ? formatCurrency(val) : val}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="footer">Payroll Management System - Manager Reports</div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    const exportToCSV = (filename, data) => {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const val = row[header];
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleGenerateReport = () => {
        setExportModalType('full');
        setIsExportModalOpen(true);
    };

    const handleOpenExportModal = (type) => {
        setExportModalType(type);
        setIsExportModalOpen(true);
    };

    const handleConfirmExport = () => {
        if (exportModalType === 'deductions-pdf') {
            exportToPDF('Payroll Deductions Report', filteredDeductionData.map(d => ({
                Employee: d.employee_name,
                Tax: formatCurrency(d.tax || 0),
                SSS: formatCurrency(d.sss || 0),
                PhilHealth: formatCurrency(d.philhealth || 0),
                'Pag-IBIG': formatCurrency(d.pagibig || 0),
                Total: formatCurrency(d.total || 0)
            })));
        } else if (exportModalType === 'deductions-csv') {
            const csvData = filteredDeductionData.map(d => ({
                Employee: d.employee_name,
                Tax: d.tax || 0,
                SSS: d.sss || 0,
                PhilHealth: d.philhealth || 0,
                'Pag-IBIG': d.pagibig || 0,
                Total: d.total || 0
            }));
            exportToCSV(csvData, `deductions_report_${new Date().toISOString().split('T')[0]}.csv`);
        } else if (exportModalType === 'department-pdf') {
            exportToPDF('Department Summary Report', departmentData.map(d => ({
                Department: d.name,
                'Total Pay': formatCurrency(d.totalPay),
                Employees: d.employees
            })));
        } else if (exportModalType === 'full') {
            exportToPDF('Complete Payroll Report', [
                { Metric: 'Total Employees', Value: deductionData.length },
                { Metric: 'Total Deductions', Value: formatCurrency(deductionData.reduce((sum, d) => sum + (d.total || 0), 0)) },
                { Metric: 'Departments', Value: departmentData.length },
                { Metric: 'Report Date', Value: new Date().toLocaleDateString() }
            ]);
        }
        setIsExportModalOpen(false);
    };

    // Render export modal content
    const renderExportModalContent = () => {
        const getTitle = () => {
            if (exportModalType === 'deductions-pdf') return 'Export Deductions Report';
            if (exportModalType === 'deductions-csv') return 'Export Deductions to CSV';
            if (exportModalType === 'department-pdf') return 'Export Department Summary';
            if (exportModalType === 'full') return 'Generate Complete Report';
            return 'Export Report';
        };

        const getDescription = () => {
            if (exportModalType === 'deductions-pdf' || exportModalType === 'deductions-csv') 
                return `${filteredDeductionData.length} employee deduction records`;
            if (exportModalType === 'department-pdf') 
                return `${departmentData.length} departments`;
            if (exportModalType === 'full') 
                return 'Complete payroll summary report';
            return '';
        };

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
                    {getTitle()}
                </Typography>
                <Typography sx={{ color: "#ccc", textAlign: "center", mb: 2 }}>
                    {getDescription()}
                </Typography>
                
                {exportModalType === 'full' && (
                    <Box sx={{ 
                        backgroundColor: "rgba(255,255,255,0.1)", 
                        borderRadius: "12px", 
                        p: 2, 
                        mb: 2,
                        textAlign: "center"
                    }}>
                        <Typography sx={{ color: "#fff", fontSize: "14px" }}>
                            Total Employees: {deductionData.length}
                        </Typography>
                        <Typography sx={{ color: "#fff", fontSize: "14px" }}>
                            Departments: {departmentData.length}
                        </Typography>
                        <Typography sx={{ color: "#4CAF50", fontSize: "14px" }}>
                            Total Deductions: {formatCurrency(deductionData.reduce((sum, d) => sum + (d.total || 0), 0))}
                        </Typography>
                    </Box>
                )}
                
                <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                    <Box
                        onClick={handleConfirmExport}
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
                        {exportModalType.includes('csv') ? 'Download CSV' : 'Download PDF'}
                    </Box>
                </Box>
            </>
        );
    };

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

                <Box
                    sx={{
                        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1,
                    }}
                >
                    <ActionButton
                        text="Generate Report"
                        width="180px"
                        onClick={handleGenerateReport}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    height: "90.8%",
                    backgroundColor: theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: 2,
                    transition: "all 0.3s ease",
                    overflowY: "auto",
                    "&:hover": {
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* Payroll Summary Section */}
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
                        Payroll Deductions Summary
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <ActionButton
                            text="Export PDF"
                            width="130px"
                            onClick={() => handleOpenExportModal('deductions-pdf')}
                        />
                        <ActionButton
                            text="Export CSV"
                            width="130px"
                            onClick={() => handleOpenExportModal('deductions-csv')}
                        />
                        <FilterSelect
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            width={150}
                            options={[
                                { value: 'all', label: 'All Employees' },
                                { value: 'high', label: 'High Deductions' },
                                { value: 'low', label: 'Low Deductions' },
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
                    {/* Deductions Bar Chart */}
                    <Box
                        sx={{
                            flex: 1.2,
                            height: 267,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: `1px solid ${theme.palette.divider}`,
                            p: 2,
                        }}
                    >
                        {loading ? (
                            <Typography>Loading chart...</Typography>
                        ) : filteredDeductionData.length === 0 ? (
                            <Typography color="text.secondary">No data available</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filteredDeductionData.slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="employee_name" 
                                        fontSize={11}
                                        tickFormatter={(value) => value.split(' ')[0]}
                                    />
                                    <YAxis 
                                        fontSize={11}
                                        tickFormatter={(value) => `₱${(value/1000).toFixed(0)}k`}
                                    />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Bar dataKey="sss" fill="#4CAF50" name="SSS" />
                                    <Bar dataKey="philhealth" fill="#2196F3" name="PhilHealth" />
                                    <Bar dataKey="pagibig" fill="#FF9800" name="Pag-IBIG" />
                                    <Bar dataKey="tax" fill="#9C27B0" name="Tax" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Box>

                    {/* Deductions Table */}
                    <Box
                        sx={{
                            height: 277,
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
                                <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.text.primary }}>
                                    Loading...
                                </Box>
                            ) : filteredDeductionData.length === 0 ? (
                                <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.text.secondary }}>
                                    No data available
                                </Box>
                            ) : (
                            filteredDeductionData.map((row, i) => (
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
                                    <span>{row.employee_name}</span>
                                    <span>{formatCurrency(row.tax || 0)}</span>
                                    <span>{formatCurrency(row.sss || 0)}</span>
                                    <span>{formatCurrency(row.philhealth || 0)}</span>
                                    <span>{formatCurrency(row.pagibig || 0)}</span>
                                    <span style={{ fontWeight: 700 }}>{formatCurrency(row.total || 0)}</span>
                                </Box>
                            ))
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Bottom Charts */}
                <Box
                    sx={{
                        height: 280,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                        mt: 2,
                    }}
                >
                    {/* Department Summary */}
                    <Box
                        sx={{
                            borderRadius: "12px",
                            p: 2,
                            backgroundColor:
                                theme.palette.mode === "dark"
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
                                Department Summary
                            </Typography>
                            <ActionButton
                                text="Export PDF"
                                width="120px"
                                onClick={() => handleOpenExportModal('department-pdf')}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {loading ? (
                                <Typography>Loading...</Typography>
                            ) : departmentData.length === 0 ? (
                                <Typography color="text.secondary">No department data</Typography>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={departmentData}
                                            dataKey="totalPay"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {departmentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Box>

                    {/* Tax and Compliance */}
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
                        </Box>
                        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {loading ? (
                                <Typography>Loading...</Typography>
                            ) : taxData.length === 0 ? (
                                <Typography color="text.secondary">No tax data</Typography>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={taxData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" fontSize={10} />
                                        <YAxis fontSize={10} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="sss" fill="#4CAF50" name="SSS" />
                                        <Bar dataKey="philhealth" fill="#2196F3" name="PhilHealth" />
                                        <Bar dataKey="pagibig" fill="#FF9800" name="Pag-IBIG" />
                                        <Bar dataKey="tax" fill="#9C27B0" name="Tax" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* EXPORT MODAL */}
            <BoxModal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
                {renderExportModalContent()}
            </BoxModal>
        </Box>
    );
}