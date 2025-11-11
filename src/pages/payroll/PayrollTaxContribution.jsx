import { Box, Typography } from "@mui/material";
import {Line, LineChart, ResponsiveContainer} from "recharts";

// Sample chart data (replace later with backend data)
const earningsData = [
    { month: "Jan", earnings: 20000 },
    { month: "Feb", earnings: 23000 },
    { month: "Mar", earnings: 21000 },
    { month: "Apr", earnings: 26000 },
    { month: "May", earnings: 24000 },
];
const deadlines = [
    { contribution: "SSS Remittance", deadline: "Sept. 11, 2025", status: "Completed" },
    { contribution: "Pag-Ibig", deadline: "Sept. 11, 2025", status : "Completed" },
    { contribution: "PhilHealth", deadline: "Sept. 11, 2025", status: "Completed" },
];
export default function PayrollTaxContribution() {
    return (
        <Box
            width="100%"
            height="63.5vh"
        >
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    Tax and Contributions
                </Typography>
            </Box>

            <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
                gap="20px"
                mt="30px"
                alignItems="stretch"
                height="100%"
            >
                <Box
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                    borderRadius="12px"
                    width="100%"
                    p="24px"
                    color="#222"
                    sx={{
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        }
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            mb: 3,
                            fontSize: "20px",
                            fontFamily: "'TTHoves-demiBold', sans-serif",
                            color: "#222",
                        }}
                    >
                        <i
                            className="ri-bar-chart-2-line"
                            style={{ fontSize: 18, color: "#222", marginRight: "10px" }}
                        ></i>
                        Contributions Overview
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            mb: 1,
                            ml: 2,
                            fontSize: "16px",
                            fontFamily: "'TTHoves-medium', sans-serif",
                            color: "#222",
                        }}
                    >
                        Total Contributions Over Time Graph
                    </Typography>
                    <Box
                        backgroundColor="rgba(255, 255, 255, 0.2)"
                        borderRadius="12px"
                        p="24px"
                        lineHeight={4}
                        color="#222"
                        sx={{
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            }
                        }}
                    >
                    <ResponsiveContainer width="100%" height={185}>
                        <LineChart data={earningsData}>
                            <Line
                                type="monotone"
                                dataKey="earnings"
                                stroke="#3A4F50"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 1 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    </Box>

                    <Typography
                        variant="h5"
                        sx={{
                            mt: 2,
                            mb: 1,
                            ml: 2,
                            fontSize: "16px",
                            fontFamily: "'TTHoves-medium', sans-serif",
                            color: "#222",
                        }}
                    >
                        Department Level Breakdown Line Bar
                    </Typography>
                    <Box
                        backgroundColor="rgba(255, 255, 255, 0.2)"
                        borderRadius="12px"
                        p="24px"
                        lineHeight={4}
                        color="#222"
                        sx={{
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            }
                        }}
                    >
                        <ResponsiveContainer width="100%" height={185}>
                            <LineChart data={earningsData}>
                                <Line
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#3A4F50"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 1 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>

                <Box
                    backgroundColor="rgba(255, 255, 255, 0.2)"
                    borderRadius="12px"
                    p="24px"
                    lineHeight={4}
                    color="#222"
                    width="67vh"
                    sx={{
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        }
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            mb: 1.5,
                            fontSize: "20px",
                            fontFamily: "'TTHoves-demiBold', sans-serif",
                            color: "#222",
                        }}
                    >
                        <i
                            className="ri-bar-chart-2-line"
                            style={{ fontSize: 18, color: "#222", marginRight: "10px" }}
                        ></i>
                        Upcoming Deadlines
                    </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 0.8fr",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                border: "none",
                                marginBottom:"-10px",
                                fontWeight: 600,
                            }}
                        >
                            <span style={{ justifySelf: "start", paddingLeft:"8px"}}>Contributions</span>
                            <span style={{ justifySelf: "center", paddingRight:"80px" }}>Deadline</span>
                            <span style={{ justifySelf: "end", paddingRight: "80px"}}>Status</span>
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
                                height: "85%",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                "&::-webkit-scrollbar": {
                                    width: 0,
                                    height: 0,
                                },
                            }}
                        >
                            {deadlines.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "0.9fr 1.1fr 0.9fr",
                                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(12px)",
                                        borderRadius: "10px",
                                        marginTop: "3px",
                                        fontFamily: "'TTHoves-Bold', sans-serif",
                                        transition: "all 0.3s ease",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.4)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                        },
                                    }}
                                >
                                    <span style={{ justifySelf: "start", paddingLeft: "20px", fontWeight: 600}}>{item.contribution}</span>
                                    <span style={{ justifySelf: "center" }}>{item.deadline}</span>
                                    <span style={{ justifySelf: "center", color: "limegreen" }}>{item.status}</span>
                                </Box>
                            ))}
                    </Box>
                </Box>
            </Box>
            <Box textAlign="end" marginTop="30px">
                <button
                    style={{
                        backgroundColor: "#152022",
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 1)",
                        fontFamily: "'TTHoves-bold', sans-serif",
                        fontSize: "14px",
                        padding: "13px 30px",
                        borderRadius: "50px",
                        marginRight: "10px",
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
                    Export PDF
                </button>
                <button
                    style={{
                        backgroundColor: "#152022",
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 1)",
                        fontFamily: "'TTHoves-bold', sans-serif",
                        fontSize: "14px",
                        padding: "13px 30px",
                        borderRadius: "50px",
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
                    Export CSV
                </button>
            </Box>
        </Box>
    );
}