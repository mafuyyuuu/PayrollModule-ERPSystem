import {Box, MenuItem, Select, Typography, useTheme} from "@mui/material";
import {Line, LineChart, ResponsiveContainer} from "recharts";
import React, {useState, useEffect} from "react";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import {exportToCSV} from "../../utils/pdfGenerator.js";

export default function PayrollTaxContribution() {
    const theme = useTheme();

    const [modalType, setModalType] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [earningsData, setEarningsData] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredReports, setFilteredReports] = useState([]);

    const handleExportCSV = () => {
        if (filteredReports.length === 0) {
            console.warn('No reports to export');
            // Using alert for user feedback as no notification system exists
            alert('No reports to export');
            return;
        }
        exportToCSV(filteredReports, 'payroll_reports.csv');
    };

    const periodHistory = [
        {ref: "001", period: "Jan 1 - Jan 15, 2025"},
        {ref: "002", period: "Jan 16 - Jan 31, 2025"},
        {ref: "003", period: "Feb 1 - Feb 15, 2025"},
        {ref: "004", period: "Feb 16 - Feb 28, 2025"},
        {ref: "005", period: "Mar 1 - Mar 15, 2025"},
        {ref: "006", period: "Mar 16 - Mar 31, 2025"},
        {ref: "007", period: "Apr 1 - Apr 15, 2025"},
        {ref: "008", period: "Apr 16 - Apr 30, 2025"},
    ];

    const departments = [
        {id: "dept001", name: "Human Resources"},
        {id: "dept002", name: "Finance"},
        {id: "dept003", name: "Payroll"},
        {id: "dept004", name: "IT Department"},
        {id: "dept005", name: "Operations"},
        {id: "dept006", name: "Marketing"},
        {id: "dept007", name: "Sales"},
        {id: "dept008", name: "Customer Support"},
    ];

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

                // Transform chart data
                const chartData = data.monthlyData?.map(item => ({
                    month: item.month,
                    earnings: item.total_contributions
                })) || [
                    {month: "Jan", earnings: 20000},
                    {month: "Feb", earnings: 23000},
                    {month: "Mar", earnings: 21000},
                    {month: "Apr", earnings: 26000},
                    {month: "May", earnings: 24000},
                ];

                setEarningsData(chartData);

                // Transform deadlines
                const deadlinesData = data.upcomingDeadlines?.map(item => ({
                    contribution: item.contribution_type,
                    deadline: new Date(item.deadline_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    status: item.status
                })) || [
                    {contribution: "SSS Remittance", deadline: "Sept. 11, 2025", status: "Completed"},
                    {contribution: "Pag-Ibig", deadline: "Sept. 11, 2025", status: "Completed"},
                    {contribution: "PhilHealth", deadline: "Sept. 11, 2025", status: "Completed"},
                ];

                setDeadlines(deadlinesData);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching tax data:', err);
                // Set default data
                setEarningsData([
                    {month: "Jan", earnings: 20000},
                    {month: "Feb", earnings: 23000},
                    {month: "Mar", earnings: 21000},
                    {month: "Apr", earnings: 26000},
                    {month: "May", earnings: 24000},
                ]);
                setDeadlines([
                    {contribution: "SSS Remittance", deadline: "Sept. 11, 2025", status: "Completed"},
                    {contribution: "Pag-Ibig", deadline: "Sept. 11, 2025", status: "Completed"},
                    {contribution: "PhilHealth", deadline: "Sept. 11, 2025", status: "Completed"},
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
                            }}
                        >
                            Tax Contribution for this period
                        </Typography>
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
                            Are you sure you want to download CSV?
                            {/*kung for two or more employees or maramihan or per dept.*/}
                        </Typography>
                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={() => {
                                    handleExportCSV();
                                    setIsModalOpen(false);
                                }}
                                component="button"
                                sx={{
                                    display: "flex-end",
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
                                    height: "100%",
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={earningsData}>
                                        <Line
                                            type="monotone"
                                            dataKey="earnings"
                                            stroke="#3A4F50"
                                            strokeWidth={3}
                                            dot={{r: 4, strokeWidth: 1}}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>

                        {/* Department Level Breakdown Line Bar */}
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
                                Department Level Breakdown Line Bar
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
                                    color: theme.palette.mode === "dark"
                                        ? "rgba(255, 255, 255, 0.05)"
                                        : "rgba(255, 255, 255, 0.2)",
                                    border: `1px solid ${theme.palette.divider}`,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.02)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                    },
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={earningsData}>
                                        <Line
                                            type="monotone"
                                            dataKey="earnings"
                                            stroke="#3A4F50"
                                            strokeWidth={3}
                                            dot={{r: 4, strokeWidth: 1}}
                                        />
                                    </LineChart>
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