import { Box, Typography, useTheme } from "@mui/material";

export default function EmployeePayoutHistory() {
    const theme = useTheme();

    const payrollHistory = [
        { duration: "Oct 1–15, 2025", amount: "₱20,500.00", ref: "REF20251001" },
        { duration: "Sep 16–30, 2025", amount: "₱20,200.00", ref: "REF20250930" },
        { duration: "Sep 1–15, 2025", amount: "₱20,100.00", ref: "REF20250915" },
        { duration: "Aug 16–31, 2025", amount: "₱20,000.00", ref: "REF20250831" },
        { duration: "Aug 1–15, 2025", amount: "₱19,900.00", ref: "REF20250815" },
        { duration: "Jul 16–31, 2025", amount: "₱19,800.00", ref: "REF20250731" },
        { duration: "Jul 1–15, 2025", amount: "₱19,700.00", ref: "REF20250715" },
    ];

    return (
        <Box width="100%" height="100%">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: "bold",
                        color: theme.palette.text.primary,
                    }}
                >
                    Payout History
                </Typography>
                <Box sx={{ position: "relative", width: 250 }}>
                    <select
                        defaultValue=""
                        style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            width: "100%",
                            padding: "10px 40px 10px 12px",
                            borderRadius: "15px",
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.25)",
                            backdropFilter: "blur(12px)",
                            color: theme.palette.text.primary,
                            fontFamily: theme.typography.fontFamily,
                            fontSize: "16px",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Select Payroll Duration</option>
                        {payrollHistory.map((item, idx) => (
                            <option key={idx} value={item.duration}>
                                {item.duration}
                            </option>
                        ))}
                    </select>
                    <i
                        className="ri-arrow-down-s-line"
                        style={{
                            position: "absolute",
                            right: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: theme.palette.text.primary,
                            fontSize: "18px",
                        }}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: "12px",
                    p: "24px",
                    color: theme.palette.text.primary,
                    height: "92%",
                    fontFamily: theme.typography.fontFamily,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        alignItems: "center",
                        justifyItems: "center",
                        fontWeight: 600,
                        padding: "10px 0",
                    }}
                >
                    <span>Payroll Duration</span>
                    <span>Amount</span>
                    <span>Reference Number</span>
                    <span>Action</span>
                </Box>
                <Box
                    sx={{
                        maxHeight: "100%",
                        overflowY: "auto",
                        pr: "8px",
                        display: "flex",
                        flexDirection: "column",
                        mt: "5px",
                        gap: "10px",
                        "&::-webkit-scrollbar": { width: 0, height: 0 },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {payrollHistory.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                                alignItems: "center",
                                justifyItems: "center",
                                backgroundColor: theme.palette.action.hover,
                                borderRadius: "10px",
                                padding: "12px 0",
                                marginTop: "10px",
                                transition: "all 0.3s ease",
                                border: `1px solid ${theme.palette.divider}`,
                                "&:hover": {
                                    backgroundColor: theme.palette.action.selected,
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                },
                            }}
                        >
                            <span>{item.duration}</span>
                            <span>{item.amount}</span>
                            <span>{item.ref}</span>
                            <Box textAlign="center" ml="15px">
                                <button
                                    style={{
                                        backgroundColor:
                                            theme.palette.mode === "light"
                                                ? "#3A4F50"
                                                : "#EFEFEF",
                                        color:
                                            theme.palette.mode === "light"
                                                ? "#fff"
                                                : "#1b2223",
                                        border: "none",
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-3px)";
                                        e.currentTarget.style.backgroundColor =
                                            theme.palette.mode === "light"
                                                ? "#2E3B3D"
                                                : "#bdbdbd";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.backgroundColor =
                                            theme.palette.mode === "light"
                                                ? "#3A4F50"
                                                : "#EFEFEF";
                                    }}
                                >
                                    <i
                                        className="ri-download-2-line"
                                        style={{
                                            color: theme.palette.mode === "light" ? "#fff" : "#1b2223",
                                        }}
                                    ></i>
                                </button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
