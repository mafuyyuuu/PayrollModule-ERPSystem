import {Box, MenuItem, Select, Typography, useTheme} from "@mui/material";
import {Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart, Legend} from "recharts";
import React, {useState, useEffect} from "react";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import {exportToCSV, generateReportPDF} from "../../utils/pdfGenerator.js";

export default function PayrollTaxContribution() {
    const theme = useTheme();

    const [modalType, setModalType] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [earningsData, setEarningsData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState({});
    const [departments, setDepartments] = useState([]);
    const [periodHistory, setPeriodHistory] = useState([]);

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

    // Fetch departments from API
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/departments');
                if (response.ok) {
                    const data = await response.json();
                    setDepartments(data.map(d => ({ id: d.department_id, name: d.department_name })));
                }
            } catch (err) {
                console.log('Using default departments');
                setDepartments([
                    {id: "dept001", name: "Human Resources"},
                    {id: "dept002", name: "Finance"},
                    {id: "dept003", name: "IT Department"},
                ]);
            }
        };
        fetchDepartments();
    }, []);

    // Fetch cutoff periods from API
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/cutoffs');
                if (response.ok) {
                    const data = await response.json();
                    setPeriodHistory(data.map(c => ({
                        ref: c.cutoff_id,
                        period: `${new Date(c.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(c.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    })));
                }
            } catch (err) {
                console.log('Using default periods');
                setPeriodHistory([
                    {ref: "001", period: "Nov 1 - Nov 15, 2025"},
                    {ref: "002", period: "Nov 16 - Nov 30, 2025"},
                ]);
            }
        };
        fetchPeriods();
    }, []);

    // Fetch tax and contribution data
    useEffect(() => {
        const fetchTaxData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/tax-contributions');

                if (!response.ok) {
                    throw new Error('Failed to fetch tax data');
                }

                const data = await response.json();
                console.log('✅ Tax data:', data);

                // Transform chart data for line chart
                const chartData = data.monthlyData?.map(item => ({
                    month: item.month,
                    total: parseFloat(item.total_contributions) || 0,
                    sss: parseFloat(item.sss) || 0,
                    philhealth: parseFloat(item.philhealth) || 0,
                    pagibig: parseFloat(item.pagibig) || 0,
                    tax: parseFloat(item.tax) || 0
                })) || [
                    {month: "Sep", total: 8500, sss: 3200, philhealth: 1800, pagibig: 800, tax: 2700},
                    {month: "Oct", total: 9200, sss: 3400, philhealth: 1900, pagibig: 850, tax: 3050},
                    {month: "Nov", total: 10350, sss: 3900, philhealth: 2100, pagibig: 950, tax: 3400},
                ];

                setEarningsData(chartData);

                // Department breakdown data for bar chart
                setDepartmentData([
                    {name: "Finance", sss: 1600, philhealth: 850, pagibig: 400, tax: 1500},
                    {name: "HR", sss: 1500, philhealth: 850, pagibig: 350, tax: 1050},
                    {name: "IT", sss: 800, philhealth: 400, pagibig: 200, tax: 750},
                ]);

                // Set summary data
                setSummaryData(data.summaryData || {});

                // Transform deadlines
                const deadlinesData = data.upcomingDeadlines?.map(item => ({
                    contribution: item.contribution_type,
                    deadline: new Date(item.deadline_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    status: item.status,
                    amount: item.amount ? `₱${parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null
                })) || [
                    {contribution: "SSS Remittance", deadline: "Dec. 10, 2025", status: "Pending"},
                    {contribution: "PhilHealth", deadline: "Dec. 10, 2025", status: "Pending"},
                    {contribution: "Pag-IBIG", deadline: "Dec. 10, 2025", status: "Pending"},
                ];

                setDeadlines(deadlinesData);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching tax data:', err);
                // Set default data
                setEarningsData([
                    {month: "Sep", total: 8500, sss: 3200, philhealth: 1800, pagibig: 800, tax: 2700},
                    {month: "Oct", total: 9200, sss: 3400, philhealth: 1900, pagibig: 850, tax: 3050},
                    {month: "Nov", total: 10350, sss: 3900, philhealth: 2100, pagibig: 950, tax: 3400},
                ]);
                setDepartmentData([
                    {name: "Finance", sss: 1600, philhealth: 850, pagibig: 400, tax: 1500},
                    {name: "HR", sss: 1500, philhealth: 850, pagibig: 350, tax: 1050},
                    {name: "IT", sss: 800, philhealth: 400, pagibig: 200, tax: 750},
                ]);
                setDeadlines([
                    {contribution: "SSS Remittance", deadline: "Dec. 10, 2025", status: "Pending"},
                    {contribution: "PhilHealth", deadline: "Dec. 10, 2025", status: "Pending"},
                    {contribution: "Pag-IBIG", deadline: "Dec. 10, 2025", status: "Pending"},
                ]);
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
                            {selectedPeriod ? `Period: ${selectedPeriod}` : 'All periods'}
                            {selectedDept ? ` | Department: ${selectedDept}` : ''}
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
                                className="ri-bar-chart-2-line"
                                style={{fontSize: 18, marginRight: "10px"}}
                            ></i>
                            Contributions Overview
                        </Typography>

                        <Box
                            sx={{
                                display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "inline-block",
                                    borderRadius: "15px",
                                    transition: "box-shadow 0.3s ease, transform 0.3s ease",
                                    "&:hover": {
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)", transform: "translateY(-2px)",
                                    },
                                }}
                            >
                                <Select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    displayEmpty
                                    sx={{
                                        backgroundColor:
                                            theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.05)"
                                                : "rgba(255, 255, 255, 0.3)",
                                        borderRadius: "15px",
                                        width: "200px",
                                        fontSize: "16px",
                                        color: theme.palette.text.primary,
                                        "& .MuiSelect-select": {
                                            padding: "8px 12px",
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: theme.palette.divider,
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: theme.palette.divider,
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            border: "none",
                                        },
                                        "& .MuiSvgIcon-root": {
                                            color: theme.palette.text.primary,
                                        },
                                    }}
                                    renderValue={(selected) => {
                                        if (!selected)
                                            return (
                                                <span style={{fontSize: "16px", color: "#bdbdbd"}}>
                                                    Select Period
                                                </span>
                                            );
                                        return selected;
                                    }}
                                >
                                    {periodHistory.map((item) => (
                                        <MenuItem key={item.ref} value={item.period}>
                                            {item.period}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                            <Box
                                sx={{
                                    display: "inline-block",
                                    borderRadius: "15px",
                                    transition: "box-shadow 0.3s ease, transform 0.3s ease",
                                    "&:hover": {
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)", transform: "translateY(-2px)",
                                    },
                                }}
                            >
                                <Select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    displayEmpty
                                    sx={{
                                        backgroundColor:
                                            theme.palette.mode === "dark"
                                                ? "rgba(255, 255, 255, 0.05)"
                                                : "rgba(255, 255, 255, 0.3)",
                                        borderRadius: "15px",
                                        width: "200px",
                                        fontSize: "16px",
                                        color: theme.palette.text.primary,
                                        "& .MuiSelect-select": {
                                            padding: "8px 12px",
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: theme.palette.divider,
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: theme.palette.divider,
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            border: "none",
                                        },
                                        "& .MuiSvgIcon-root": {
                                            color: theme.palette.text.primary,
                                        },
                                    }}
                                    renderValue={(selected) => {
                                        if (!selected)
                                            return (
                                                <span style={{fontSize: "16px", color: "#bdbdbd"}}>
                                                    Select Department
                                                </span>
                                            );
                                        return selected;
                                    }}
                                >
                                    {departments.map((dept) => (
                                        <MenuItem key={dept.id} value={dept.name}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{display: "flex", gap: 2, flexWrap: "wrap"}}>
                        {/* Total Contributions Over Time Graph */}
                        <Box sx={{flex: 1, minWidth: 300}}>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 1,
                                    mt: 2,
                                    fontSize: "16px",
                                    fontFamily: "'TTHoves-medium', sans-serif",
                                }}
                            >
                                Total Contributions Over Time Graph
                            </Typography>
                            <Box
                                borderRadius="12px"
                                p="24px"
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
                                    height: "250px",
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={earningsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis dataKey="month" stroke={theme.palette.text.primary} fontSize={12} />
                                        <YAxis stroke={theme.palette.text.primary} fontSize={12} tickFormatter={(value) => `₱${(value/1000).toFixed(0)}k`} />
                                        <Tooltip 
                                            formatter={(value) => [`₱${parseFloat(value).toLocaleString()}`, '']}
                                            contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="total" name="Total" stroke="#3A4F50" strokeWidth={3} dot={{r: 4}} />
                                        <Line type="monotone" dataKey="sss" name="SSS" stroke="#4CAF50" strokeWidth={2} dot={{r: 3}} />
                                        <Line type="monotone" dataKey="philhealth" name="PhilHealth" stroke="#2196F3" strokeWidth={2} dot={{r: 3}} />
                                        <Line type="monotone" dataKey="pagibig" name="Pag-IBIG" stroke="#FF9800" strokeWidth={2} dot={{r: 3}} />
                                    </LineChart>
                                </ResponsiveContainer>
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
                                    height: "250px",
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departmentData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis dataKey="name" stroke={theme.palette.text.primary} fontSize={12} />
                                        <YAxis stroke={theme.palette.text.primary} fontSize={12} tickFormatter={(value) => `₱${(value/1000).toFixed(0)}k`} />
                                        <Tooltip 
                                            formatter={(value) => [`₱${parseFloat(value).toLocaleString()}`, '']}
                                            contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}
                                        />
                                        <Legend />
                                        <Bar dataKey="sss" name="SSS" fill="#4CAF50" />
                                        <Bar dataKey="philhealth" name="PhilHealth" fill="#2196F3" />
                                        <Bar dataKey="pagibig" name="Pag-IBIG" fill="#FF9800" />
                                        <Bar dataKey="tax" name="Tax" fill="#F44336" />
                                    </BarChart>
                                </ResponsiveContainer>
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
                            className="ri-bar-chart-2-line"
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
                            gridTemplateColumns: "repeat(3, 1fr)",
                            color: theme.palette.text.primary,
                            border: "none",
                            marginBottom: "-10px",
                            fontWeight: 600,
                            textAlign: "center",
                        }}>
                            <span>Contributions</span>
                            <span>Deadline</span>
                            <span>Status</span>
                        </Box>

                        {/* Content */}
                        {loading ? (
                            <Box sx={{p: 2, textAlign: "center", flex: 1}}>
                                Loading deadlines...
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    flex: 1,
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    overflowY: "auto",
                                    gap: "4px",
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                    "&::-webkit-scrollbar": {width: 0, height: 0},
                                }}
                            >
                                {deadlines.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            marginTop: "10px",
                                            display: "grid",
                                            gridTemplateColumns: {xs: "1fr", sm: "repeat(3, 1fr)"},
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
                                            p: {xs: 1, sm: 0}, // padding for mobile
                                            gap: {xs: 1, sm: 0}, // small gap on mobile
                                        }}
                                    >
                                        <span>{item.contribution}</span>
                                        <span>{item.deadline}</span>
                                        <span
                                            style={{
                                                color:
                                                    item.status === "Completed"
                                                        ? "limegreen"
                                                        : "#FFC107",
                                            }}
                                        >
                                            {item.status}
                                        </span>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px">
                <ActionButton
                    text="Export PDF"
                    width="200px"
                    onClick={() => {
                        setModalType("exportPDF");
                        setIsModalOpen(true);
                    }}
                />

                <ActionButton
                    text="Export CSV"
                    width="200px"
                    onClick={() => {
                        setModalType("exportCSV");
                        setIsModalOpen(true);
                    }}
                />
            </Box>

            <BoxModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                {renderModalCards()}
            </BoxModal>
        </Box>
    );
}