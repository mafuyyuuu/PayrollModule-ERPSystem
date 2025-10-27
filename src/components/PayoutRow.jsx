import { Box, Typography } from "@mui/material";

// 🔹 Reusable Row Component
function PayoutRow({ duration, time, amount, refCode }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                alignItems: "center",
                justifyItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(12px)",
                borderRadius: "10px",
                padding: "12px",
                transition: "all 0.3s ease",
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                },
            }}
        >
            {/* Duration + Time */}
            <Box textAlign="center">
                <Typography
                    sx={{
                        fontWeight: 500,
                        fontSize: "14px",
                    }}
                >
                    {duration}
                </Typography>
                <Typography
                    sx={{
                        fontSize: "12px",
                        color: "#555",
                    }}
                >
                    {time}
                </Typography>
            </Box>

            {/* Amount */}
            <Typography>{amount}</Typography>

            {/* Reference */}
            <Typography>{refCode}</Typography>

            {/* Action */}
            <Box>
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
    );
}