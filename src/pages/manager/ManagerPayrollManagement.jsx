import {Box, Typography, IconButton, TextField} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import DashboardCard from "../../components/DashboardCard.jsx";
import "remixicon/fonts/remixicon.css";
import SearchBar from "../../components/SearchBar.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import React, {useState} from "react";
import {RiPencilFill} from "react-icons/ri";

const employeePayrollData = [
    {
        id: 1,
        name: "Jherwin Jimenez",
        gross: "₱45,000",
        deductions: "₱5,000",
        benefits: "₱2,000",
        net: "₱42,000",
    },
    {
        id: 2,
        name: "Symon Banana",
        gross: "₱38,000",
        deductions: "₱4,500",
        benefits: "₱1,500",
        net: "₱35,000",
    },
    {
        id: 3,
        name: "Symon Banana",
        gross: "₱38,000",
        deductions: "₱4,500",
        benefits: "₱1,500",
        net: "₱35,000",
    },
    {
        id: 4,
        name: "Symon Banana",
        gross: "₱38,000",
        deductions: "₱4,500",
        benefits: "₱1,500",
        net: "₱35,000",
    },
    {
        id: 5,
        name: "Symon Banana",
        gross: "₱38,000",
        deductions: "₱4,500",
        benefits: "₱1,500",
        net: "₱35,000",
    },
    {
        id: 6,
        name: "Symon Banana",
        gross: "₱38,000",
        deductions: "₱4,500",
        benefits: "₱1,500",
        net: "₱35,000",
    },
];

const ManagerPayrollSummary = () => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleView = (row) => {
        setSelectedRow(row);
        setOpenModal(true);
    };

    const theme = useTheme();

    return (
        <Box
            sx={{width: "100%", height: "100%", fontFamily: theme.typography.fontFamily}}
        >
            {/* DASHBOARD CARDS */}
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="20px">
                <DashboardCard
                    icon="ri-cash-line"
                    title="Total Payroll Cost"
                    value="₱455,000"
                />
                <DashboardCard
                    icon="ri-file-reduce-line"
                    title="Total Deductions"
                    value="₱56,000"
                />
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="Total Benefits"
                    value="₱237,000"
                />
            </Box>

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
                    Employee Payroll Details
                </Typography>
                <SearchBar
                    placeholder="Enter Employee Name"
                    width="350px"
                />
            </Box>

            {/* TABLE CONTAINER */}
            <Box
                sx={{
                    height: "68.9%",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                        transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* HEADER ROW */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, 1fr)",
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        p: "8px 0",
                        width: "100%",
                        alignItems: "center",
                        textAlign: "center",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <span>Employee Name</span>
                    <span>Gross</span>
                    <span>Deductions</span>
                    <span>Benefits</span>
                    <span>Net</span>
                    <span>Action</span>
                </Box>

                {/* DATA ROWS */}
                <Box
                    sx={{
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {width: 0, height: 0},
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        mt: "8px",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    {employeePayrollData.map((row) => (
                        <Box
                            sx={{
                                marginTop: "10px",
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                alignItems: "center",
                                bgcolor: "#fff",
                                color: "#1b2223",
                                borderRadius: "8px",
                                width: "100%",
                                minHeight: "83px",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-2px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                },
                                textAlign: "center",
                            }}
                        >
                            <span>{row.name}</span>
                            <span>{row.gross}</span>
                            <span>{row.deductions}</span>
                            <span>{row.benefits}</span>
                            <span>{row.net}</span>
                            <Box sx={{display: "flex", justifyContent: "center", gap: "8px"}}>
                                <IconButton
                                    onClick={() => handleView(row)}
                                    sx={{
                                        backgroundColor: "#172224",
                                        color: "#fff",
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            backgroundColor: "#2E3B3D",
                                            color: "#fff",
                                            transform: "translateY(-3px)",
                                        },
                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                    }}
                                >
                                    <RiPencilFill style={{fontSize: 19}}/>
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
            <BoxModal open={openModal} onClose={() => setOpenModal(false)}>
                {selectedRow && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF"
                                }}
                            >
                                Employee Payroll Details
                            </Typography>
                        </Box>

                        {/* Employee Field */}
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                Employee Name
                            </Typography>
                            <TextField
                                value={selectedRow.name}
                                fullWidth
                                variant="outlined"
                                size="small"
                                InputProps={{
                                    readOnly: true,
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "#cacace",
                                        color: "#1F2829",
                                        fontSize: "18px",
                                        "& fieldset": {
                                            border: "none",
                                        },
                                        "&:hover fieldset": {
                                            border: "none",
                                        },
                                        "&.Mui-focused fieldset": {
                                            border: "none",
                                        },
                                    }, "& .MuiInputBase-input": {fontSize: "18px"},
                                }}
                            />
                        </Box>

                        {/* Grid for other fields */}
                        <Box
                            display="grid"
                            gridTemplateColumns={{md: "1fr 1fr"}}
                            gap={1}
                            mt={2}
                        >
                            {/* Gross */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                    Gross
                                </Typography>
                                <TextField
                                    value={selectedRow.gross}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>

                            {/* Deductions */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                    Deductions
                                </Typography>
                                <TextField
                                    value={selectedRow.deductions}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box
                            display="grid"
                            gridTemplateColumns={{md: "1fr 1fr"}}
                            gap={1}
                            mt={2}
                        >
                            {/* Benefits */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                    Benefits
                                </Typography>
                                <TextField
                                    value={selectedRow.benefits}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>

                            {/* Net */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                                    Net
                                </Typography>
                                <TextField
                                    value={selectedRow.net}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "13px",
                                            backgroundColor: "#cacace",
                                            color: "#1F2829",
                                            fontSize: "18px",
                                            "& fieldset": {
                                                border: "none",
                                            },
                                            "&:hover fieldset": {
                                                border: "none",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "none",
                                            },
                                        }, "& .MuiInputBase-input": {fontSize: "18px"},
                                    }}
                                />
                            </Box>

                        </Box>
                    </>
                )}
            </BoxModal>
        </Box>
    );
};

export default ManagerPayrollSummary;