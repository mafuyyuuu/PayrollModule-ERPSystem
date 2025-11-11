import { Box, Typography } from "@mui/material";

export default function EmployeePayoutHistory() {
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
        <Box
            width="100%"
            height="100%"
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    Payout History
                </Typography>

                <Box sx={{ position: "relative" }}>
                    <select
                        defaultValue=""
                        style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            width: 250,
                            padding: "10px 40px 10px 12px",
                            borderRadius: "15px",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(12px)",
                            color: "#222",
                            fontFamily: "inherit",
                            fontSize: "16px",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Select Payroll Duration</option>
                    </select>
                    <i
                        className="ri-arrow-down-s-line"
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#222",
                            fontSize: "18px",
                        }}
                    ></i>
                </Box>
            </Box>

            <Box
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius="12px"
                p="24px"
                color="#222"
                height="92%"
                sx={{
                    backdropFilter: "blur(12px)",
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                    gap: "10px",
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        alignItems: "center",
                        justifyItems: "center",
                        border: "none",
                        padding: "12px",
                        fontWeight: 600,
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
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": {
                            width: 0,
                            height: 0,
                        },
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
                                backgroundColor: "rgba(255, 255, 255, 0.25)",
                                backdropFilter: "blur(12px)",
                                borderRadius: "10px",
                                padding: "12px",
                                marginTop: "10px",
                                transition: "all 0.3s ease",
                                border: "1px solid rgba(255,255,255,0.3)",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.4)",
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
                                        backgroundColor: "#3A4F50",
                                        color: "#fff",
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
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                                >
                                    <i className="ri-download-2-line"></i>
                                </button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>

    );
}