import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "../../components/DashboardCard.jsx";
import "remixicon/fonts/remixicon.css";
import ManagerDashboard from "./ManagerDashboard.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import ViewTextField from "../../components/ViewTextField.jsx";
import { useState } from "react";


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
        <Box mr="20px" ml="20px" overflowY="none"
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
                marginTop="25px"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                gap="10px">

                <Typography
                    Color="#172224"
                    fontSize="20px"
                    sx={{
                        fontFamily: "TTHoves-Bold, sans-serif",}}>
                    Employee Payroll Details
                </Typography>

                <SearchBar
                    placeholder="Enter Employee Name"
                    width="450px"

                />
            </Box>

            {/* TABLE CONTAINER */}
            <Box
                borderRadius="12px"
                p="20px"
                paddingBottom="20px"
                sx={{
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                    maxHeight: "500px",
                    backdropFilter: "blur(12px)",
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.01)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* HEADER ROW */}
                <Box
                    justifyItems="space-between"
                    display="grid"
                    gridTemplateColumns="1.5fr 1fr 1fr 1fr 1fr 0.9fr"
                    fontWeight= "600px"
                    p="12px 16px"
                    sx={{
                        color: theme.palette.text.primary,
                        fontFamily: "TTHoves-Bold, sans-serif",
                    }}
                >
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif", }}>
                        Employee
                    </Typography>
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Gross
                    </Typography>
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Deductions
                    </Typography>
                    <Typography Color="#172224" fontWeight={600} sx={{ fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Benefits
                    </Typography>
                    <Typography Color="#172224" fontWeight={600} sx={{ ml: "10px", fontFamily: "'TTHoves-Bold', sans-serif" }}>
                        Net
                    </Typography>
                    <Typography
                        Color="#172224"
                        fontWeight={600}
                        textAlign="center"
                        sx={{ ml:"13px",  fontFamily: "'TTHoves-Bold', sans-serif" }}
                    >
                        Action
                    </Typography>
                </Box>

                {/* DATA ROWS */}
                <Box
                    sx={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: 0, height: 0 },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        pr: "8px",
                        display: "flex",
                        flexDirection: "column",
                        mt: "5px",
                        gap: "10px",
                        height: "85%",
                    }}>
                    {employeePayrollData.map((row) => (
                        <Box
                            display="grid"
                            gridTemplateColumns="1.5fr 1fr 1fr 1fr 1fr 0.9fr"
                            alignItems="center"
                            p="16px"
                            mt="10px"
                            justifyContent = "space-between"
                            borderRadius="10px"
                            backgroundColor = "rgba(255, 255, 255, 0.25)"
                            boxShadow="0 1px 4px rgba(0,0,0,0.06)"
                            sx={{
                                color: "#1b2223",
                                backgroundColor: "#fff",
                                borderBottom: "1px solid #eee",
                                fontFamily: "'TT-Hoves Bold', sans-serif",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                },
                            }}
                        >
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                                {row.name}
                            </Typography>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                                {row.gross}
                            </Typography>
                            <Typography ml="20px" sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                                {row.deductions}
                            </Typography>
                            <Typography ml="10px" sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif" }}>
                                {row.benefits}
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    fontWeight: 500,
                                }}
                            >
                                {row.net}
                            </Typography>
                            <Button
                                onClick={() => handleView(row)}
                                disableRipple
                                sx={{
                                    ml: "100px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    width: "40px",
                                    height: "36px",
                                    minWidth: "36px",
                                    padding: 0,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "#1e2d2f",
                                        transform: "translateY(-3px)",
                                    },
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                <i className="ri-eye-fill" style={{ fontSize: "18px" }}></i>
                            </Button>

                        </Box>
                    ))}

                </Box>
            </Box>
            <BoxModal open={openModal} onClose={() => setOpenModal(false)}>
                {selectedRow && (
                    <>
                        <Typography variant="h3" mb={3} sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                        }}>
                            Employee Payroll Details
                        </Typography>

                        {/* Employee Field */}
                        <Box mb="10px">
                            <Typography sx={{
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                mb: "5px"
                            }}>
                                Employee
                            </Typography>
                            <ViewTextField value={selectedRow.name} />
                        </Box>

                        {/* Grid for other fields */}
                        <Box
                            display="grid"
                            gridTemplateColumns={{ md: "1fr 1fr" }}
                            gap="20px"
                            mb="18px"
                        >
                            {/* Gross */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Gross
                                </Typography>
                                <ViewTextField value={selectedRow.gross} label="Gross" />
                            </Box>

                            {/* Deductions */}
                            <Box>
                                <Typography sx={{
                                    color: "#fff",
                                    fontWeight: 500,
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Deductions
                                </Typography>
                                <ViewTextField value={selectedRow.deductions} label="Deductions" />
                            </Box>

                            {/* Benefits */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Benefits
                                </Typography>
                                <ViewTextField value={selectedRow.benefits} label="Benefits" />
                            </Box>

                            {/* Net */}
                            <Box>
                                <Typography sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    mb: "5px"
                                }}>
                                    Net
                                </Typography>
                                <ViewTextField value={selectedRow.net} label="Net" />
                            </Box>

                        </Box>
                    </>
                )}
            </BoxModal>
        </Box>


    );
};

export default ManagerPayrollSummary;