import { Box, Typography, InputBase } from "@mui/material";
import {fontFamily} from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";

export default function PayrollPendingRequest() {
    const employeeRequests = [
        { type: "Overtime", employee: "Jhervin Jimenez", date: "Sept. 15, 2025", amount: "PXX,XXX.XX", status: "Pending" },
        { type: "Overtime", employee: "Edrianne Lumabas", date: "Aug. 30, 2025", amount: "PXX,XXX.XX", status : "Pending" },
        { type: "Overtime", employee: "Jumiah Zamora", date: "Aug. 15, 2025", amount: "PXX,XXX.XX", status: "Pending" },
        { type: "Overtime", employee: "Jessa Balnig", date: "July 30, 2025", amount: "PXX,XXX.XX", status: "Pending" },
        { type: "Overtime", employee: "Symon Banaag", date: "July 15, 2025", amount: "PXX,XXX.XX", status: "Pending" },
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
                    Pending Requests
                </Typography>

                <Box sx={{ position: "relative", mr: -100 }}>
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
                        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        border: "none",
                        padding: "20px",
                        fontWeight: 600,
                    }}
                >
                    <span style={{ justifySelf: "start", paddingLeft:"8px"}}>Request Type</span>
                    <span style={{ justifySelf: "center", paddingRight:"120px" }}>Employee</span>
                    <span style={{ justifySelf: "center" }}>Date</span>
                    <span style={{ justifySelf: "center", paddingLeft:"30px" }}>Amount</span>
                    <span style={{ justifySelf: "center", paddingLeft:"60px" }}>Status</span>
                    <span style={{ justifySelf: "end", paddingRight:"30px" }}>Actions</span>
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
                    {employeeRequests.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "0.88fr 0.9fr 1fr 1fr 1fr 0.68fr",                                backgroundColor: "rgba(255, 255, 255, 0.25)",
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
                            <span style={{ justifySelf: "start", fontWeight: 600}}>{item.type}</span>
                            <span style={{ justifySelf: "start" }}>{item.employee}</span>
                            <span style={{ justifySelf: "center" }}>{item.date}</span>
                            <span style={{ justifySelf: "center"  }}>{item.amount}</span>
                            <span style={{ justifySelf: "center", color: "red" }}>{item.status}</span>

                            <Box sx={{ justifySelf: "end", display: "flex", gap: "8px" }}>
                                <Box
                                    component="button"
                                    sx={{
                                        width: 33,
                                        height: 33,
                                        borderRadius: "50%",
                                        backgroundColor: "black",
                                        color: "limegreen",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.transform = "translateY(-3px)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.transform = "translateY(0)")
                                    }
                                >
                                    <i className="ri-check-line" style={{fontSize: "27px"}}></i>
                                </Box>
                                <Box
                                    component="button"
                                    sx={{
                                        width: 33,
                                        height: 33,
                                        borderRadius: "50%",
                                        backgroundColor: "black",
                                        color: "red",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.transform = "translateY(-3px)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.transform = "translateY(0)")
                                    }
                                >
                                    <i className="ri-close-line" style={{fontSize: "27px"}}></i>
                                </Box>
                            </Box>
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