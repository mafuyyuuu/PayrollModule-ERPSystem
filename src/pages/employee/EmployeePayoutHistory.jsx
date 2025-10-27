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
            height="69vh"
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3.5}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "18px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <i
                        className="ri-money-dollar-circle-line"
                        style={{ fontSize: 20, color: "#222" }}
                    ></i>
                    Payout History
                </Typography>

                {/* Dropdown for payroll filter */}
                <Box sx={{ position: "relative" }}>
                    <select
                        style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            padding: "8px 36px 8px 12px",
                            borderRadius: "12px",
                            border: "none",
                            backgroundColor: "#bdbdbd",
                            color: "#222",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            fontSize: "14px",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Select Payroll Duration</option>
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
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
                height="100%"
                sx={{
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
                        gap: "10px", // creates the spacing between “rows”
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
                                marginTop: "3px",
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
                            <Box textAlign="center">
                                <button
                                    style={{
                                        backgroundColor: "#3A4F50",
                                        color: "#fff",
                                        border: "none",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.transform = "translateY(-3px)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.transform = "translateY(0)")
                                    }
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