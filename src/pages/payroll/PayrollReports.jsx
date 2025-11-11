import { Box, Typography, InputBase } from "@mui/material";
import {fontFamily} from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";

export default function PayrollPendingRequest() {
    const reports = [
        { date: "Sept. 15, 2025",period: "October Payroll",  amount: "PXX,XXX.XX", status: "Released" },
        { date: "Aug. 30, 2025", period: "October Payroll", amount: "PXX,XXX.XX", status : "Released" },
        { date: "Aug. 15, 2025", period: "October Payroll", amount: "PXX,XXX.XX", status: "Released" },
        { date: "July 30, 2025", period: "October Payroll", amount: "PXX,XXX.XX", status: "Released" },
        { date: "July 15, 2025", period: "October Payroll", amount: "PXX,XXX.XX", status: "Released" },
    ];
    return (
        <Box
            width = "100%"
            height = "70vh"
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
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    Report and History
                </Typography>

                <Box sx={{ position: "relative", mr: -99 }}>
                    <select
                        style={{
                            appearance: "none",
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            padding: "10px 45px 10px 25px",
                            borderRadius: "25px",
                            backgroundColor: "#DADBDB",
                            color: "#222",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            fontSize: "15px",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        <option value="">Filter</option>
                        <option>By Category</option>
                        <option>By Date</option>
                        <option>By Name</option>
                    </select>
                    <i
                        className="ri-arrow-down-s-fill"
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            paddingRight: "10px",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: "#222",
                            fontSize: "20px",
                        }}
                    ></i>
                </Box>

                <Box
                    display="flex"
                    alignItems="center"
                    bgcolor="#E1E0E0"
                    borderRadius="8px"
                    px="15px"
                    py="5px"
                    boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    border= "1px solid rgba(255, 255, 255, 0.4)"
                    width="450px"
                >
                    <SearchIcon
                        sx={{
                            fontSize: "1.7rem",
                            mr: 1,
                        }}
                    />
                    <InputBase
                        placeholder="Enter Employee Name"
                        sx={{
                            fontFamily: "TT Hoves Pro, sans-serif",
                            fontWeight: 300,
                            fontSize: "0.95rem",
                            width: "100%",
                            backgroundColor: "#E1E0E0",
                        }}
                    />
                </Box>
            </Box>

            <Box
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius="12px"
                p="24px"
                color="#222"
                height="87%"
                sx={{
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.7)",
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
                        gridTemplateColumns: "0.3fr 1fr 0.86fr 0.63fr",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        border: "none",
                        padding: "20px",
                        fontWeight: 600,
                    }}
                >
                    <span style={{ justifySelf: "start"}}>Date</span>
                    <span style={{ justifySelf: "center"}}>Payroll Period</span>
                    <span style={{ justifySelf: "center"}}>Total Amount</span>
                    <span style={{ justifySelf: "end", paddingRight: "18vh"}}>Status</span>
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
                    {reports.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "0.3fr 1fr 0.86fr 0.63fr",
                                backgroundColor: "rgba(255, 255, 255, 0.3)",
                                backdropFilter: "blur(12px)",
                                borderRadius: "10px",
                                padding: "30px",
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
                            <span style={{ justifySelf: "start", fontWeight: 600}}>{item.date}</span>
                            <span style={{ justifySelf: "center" }}>{item.period}</span>
                            <span style={{ justifySelf: "center"  }}>{item.amount}</span>
                            <span style={{ justifySelf: "end", color: "green", paddingRight: "15vh" }}>{item.status}</span>
                        </Box>
                    ))}
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
                    Export Payslip PDF
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