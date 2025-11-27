import { Box, MenuItem, Select, Typography, useTheme, CircularProgress } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import React, { useState, useEffect } from "react";
import { useUser } from "../../components/UserContext.jsx";

export default function EmployeeTax() {
    const theme = useTheme();
    const { user } = useUser();

    const [selectedPayroll, setSelectedPayroll] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for tax data
    const [totals, setTotals] = useState({
        sss: 0,
        philhealth: 0,
        pagibig: 0,
        wtax: 0,
        total: 0
    });
    const [contributions, setContributions] = useState([]);
    const [payrollPeriods, setPayrollPeriods] = useState([]);

    // Fetch tax contributions on component mount
    useEffect(() => {
        fetchTaxContributions();
    }, [user?. employeeId]);

    const fetchTaxContributions = async () => {
        if (!user?.employeeId) {
            setLoading(false);
            return;
        }

        try {
            // ✅ Fixed URL to match employeeRoutes.js
            const response = await fetch(
                `http://localhost:8080/api/employee/tax-contributions/${user.employeeId}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch tax contributions');
            }

            const data = await response.json();
            console.log('✅ Tax contributions:', data);

            setTotals(data.totals || { sss: 0, philhealth: 0, pagibig: 0, wtax: 0, total: 0 });
            setContributions(data.contributions || []);
            setPayrollPeriods(data. payrollPeriods || []);
        } catch (err) {
            console.error('❌ Error fetching tax contributions:', err);
            setError(err. message);
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "₱0.00";
        return `₱${Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Filter contributions based on selected payroll period
    const filteredContributions = selectedPayroll
        ? contributions.filter(item => item.duration === selectedPayroll)
        : contributions;

    // Calculate filtered totals (when a specific period is selected)
    const displayTotals = selectedPayroll
        ? filteredContributions. reduce((acc, curr) => {
            acc.sss += curr.sss;
            acc.philhealth += curr.philhealth;
            acc.pagibig += curr. pagibig;
            acc. wtax += curr.wtax;
            return acc;
        }, { sss: 0, philhealth: 0, pagibig: 0, wtax: 0 })
        : totals;

    return (
        <Box width="100%" height="100%">
            {/* Summary Cards - Connected to Database */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="20px"
            >
                {loading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <Box key={i} display="flex" justifyContent="center" alignItems="center" height="120px">
                                <CircularProgress size={24} />
                            </Box>
                        ))}
                    </>
                ) : (
                    <>
                        <DashboardCard
                            icon="ri-hand-coin-line"
                            title="SSS"
                            value={formatCurrency(displayTotals.sss)}
                            showHideButton={true}
                        />
                        <DashboardCard
                            icon="ri-hand-coin-line"
                            title="Pag-IBIG"
                            value={formatCurrency(displayTotals.pagibig)}
                            showHideButton={true}
                        />
                        <DashboardCard
                            icon="ri-timer-line"
                            title="PhilHealth"
                            value={formatCurrency(displayTotals.philhealth)}
                            showHideButton={true}
                        />
                        <DashboardCard
                            icon="ri-timer-line"
                            title="Withholding Tax"
                            value={formatCurrency(displayTotals.wtax)}
                            showHideButton={true}
                        />
                    </>
                )}
            </Box>

            {/* Contribution History Section */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={4}
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
                    Contribution History
                </Typography>
                <Box
                    sx={{
                        display: "inline-block",
                        borderRadius: "15px",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow:
                                theme.palette.mode === "light"
                                    ? "0 4px 20px rgba(0,0,0,0. 15)"
                                    : "0 4px 20px rgba(0,0,0,0. 3)",
                        },
                    }}
                >
                    <Select
                        value={selectedPayroll}
                        onChange={(e) => setSelectedPayroll(e.target.value)}
                        displayEmpty
                        sx={{
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.3)",
                            borderRadius: "15px",
                            width: "250px",
                            fontSize: "16px",
                            color: theme.palette.text.primary,
                            "& .MuiSelect-select": {
                                padding: "8px 12px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.divider,
                            },
                            "&:hover . MuiOutlinedInput-notchedOutline": {
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
                            if (! selected)
                                return (
                                    <span style={{ fontSize: "16px", color: "#bdbdbd" }}>
                                        Select Payroll Duration
                                    </span>
                                );
                            return selected;
                        }}
                    >
                        <MenuItem value="">
                            <em>All Periods (YTD)</em>
                        </MenuItem>
                        {payrollPeriods.map((item, index) => (
                            <MenuItem key={index} value={item.duration}>
                                {item.duration}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* Contribution Table */}
            <Box
                sx={{
                    height: "68. 7%",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme. palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* Table Header */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        p: "8px 0",
                        width: "100%",
                        alignItems: "center",
                        textAlign: "center",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    <span>SSS</span>
                    <span>PhilHealth</span>
                    <span>Pag-IBIG</span>
                    <span>WTAX</span>
                    <span>Total</span>
                </Box>

                {/* Table Body */}
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Typography color="error">Error: {error}</Typography>
                    </Box>
                ) : filteredContributions.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Typography sx={{ color: theme.palette.text.secondary }}>
                            No contribution records found
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            overflowY: "auto",
                            "&::-webkit-scrollbar": { width: 0, height: 0 },
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            mt: "8px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {filteredContributions.map((item, index) => (
                            <Box
                                key={item.id || index}
                                sx={{
                                    marginTop: "10px",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 1fr)",
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
                                }}
                            >
                                <span>{formatCurrency(item.sss)}</span>
                                <span>{formatCurrency(item.philhealth)}</span>
                                <span>{formatCurrency(item. pagibig)}</span>
                                <span>{formatCurrency(item.wtax)}</span>
                                <span style={{ fontWeight: 'bold' }}>{formatCurrency(item.total)}</span>
                            </Box>
                        ))}

                        {/* Total Row */}
                        {filteredContributions.length > 1 && (
                            <Box
                                sx={{
                                    marginTop: "15px",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(5, 1fr)",
                                    alignItems: "center",
                                    bgcolor: theme.palette.mode === "dark" ? "#2E3B3D" : "#172224",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    width: "100%",
                                    minHeight: "83px",
                                    textAlign: "center",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                }}
                            >
                                <span>{formatCurrency(displayTotals.sss)}</span>
                                <span>{formatCurrency(displayTotals.philhealth)}</span>
                                <span>{formatCurrency(displayTotals.pagibig)}</span>
                                <span>{formatCurrency(displayTotals.wtax)}</span>
                                <span>
                                    {formatCurrency(
                                        displayTotals. sss +
                                        displayTotals.philhealth +
                                        displayTotals.pagibig +
                                        displayTotals.wtax
                                    )}
                                </span>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}