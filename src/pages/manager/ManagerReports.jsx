import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import FilterSelect from "../../components/FilterSelect.jsx";

const deductionData = [
    ["Jhervin Jimenez", "₱1,200", "₱500", "₱400", "₱200", "₱2,300"],
    ["Symon Banana", "₱1,100", "₱480", "₱390", "₱180", "₱2,150"],
    ["Jane Cruz", "₱1,300", "₱520", "₱410", "₱220", "₱2,450"],
    ["Jane Cruz", "₱1,300", "₱520", "₱410", "₱220", "₱2,450"],
];

export default function ManagerReports() {
    const theme = useTheme();

    return (
        <Box mr="20px" ml="20px">
            {/* HEADER */}
            <Box display= "flex" justifyContent="space-between" alignItems="center" mb="20px">
                <Typography
                    Color="#172224"
                    fontSize="20px"
                    sx={{
                        fontFamily: "TTHoves-Bold, sans-serif",}}
                >
                    Report and Analytics
                </Typography>

                <Button
                    variant="contained"
                    sx={{
                        height: "45px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#fff !important",
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgb(23,34,36)",
                        borderRadius: "100px",
                        px: 3,
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "#1E293B",
                            transform: "scale(1.03)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"},
                    }}
                >
                    Generate Report
                </Button>
            </Box>

            {/* MAIN WRAPPER */}
            <Box
                sx={{
                    maxHeight: "auto",
                    fontFamily: "'TTHoves-Regular', sans-serif",
                }}
            >
                {/* === DEPARTMENT PAYROLL SUMMARY REPORT === */}
                <Box
                    borderRadius="12px"
                    p="20px"
                    mb="25px"
                    sx={{
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.2)",
                        color: theme.palette.text.primary,
                        backdropFilter: "blur(6.300000190734863px)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography
                            sx={{
                                color: theme.palette.text.primary,
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontWeight: 600,
                            }}
                        >
                            Department Payroll Summary Report
                        </Typography>

                        <Box display="flex" gap="10px" alignItems="center">
                            <FilterSelect>

                            </FilterSelect>
                            <Button
                                variant="contained"
                                sx={{
                                    height: "43px",
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color: "#fff !important",
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? "rgba(255, 255, 255, 0.05)"
                                            : "rgb(23,34,36)",
                                    borderRadius: "100px",
                                    px: 3,
                                    textTransform: "none",
                                    "&:hover": {
                                        backgroundColor: "#1E293B",
                                        transform: "scale(1.03)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"},
                                }}
                            >
                                Export PDF
                            </Button>
                        </Box>
                    </Box>

                    {/*DEPARTMENT SUMMARY CONTAINER*/}
                    <Box
                        display= "flex"
                        width= "auto"
                        height= "225px"
                        justifyContent= "space-between"
                        align-items= "flex-start"
                        gap= "10px">

                        {/*DEPARTMENT SUMMARY CHART*/}
                        <Box
                            alignItems="center"
                            alignContent="center"
                            justifyContent = "center"
                            width = "750px"
                            height = "220px"
                            textAlign="center" fontStyle="italic">
                                (Chart/Graph Placeholder)
                        </Box>

                        {/* TABLE CONTAINER */}
                        <Box
                            display="flex"
                            flexDirection="column"
                            width="790px"
                            height="218px"
                            p="15px"
                            sx={{
                                borderRadius: "12px",
                                opacity: "0.95",
                                backgroundColor:
                                    theme.palette.mode === "dark"
                                        ? "rgba(255, 255, 255, 0.05)"
                                        : "rgba(255, 255, 255, 0.1)",
                                backdropFilter: "blur(12px)",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                border: `1px solid ${theme.palette.divider}`,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            {/* TABLE HEADER */}
                            <Box
                                display="grid"
                                gridTemplateColumns="repeat(6, 1fr)"
                                alignItems="center"
                                textAlign="center"
                                fontWeight={600}
                                p="8px"
                                borderRadius="8px 8px 0 0"
                                sx={{
                                    fontFamily: "TTHoves-Bold, sans-serif",
                                    color: theme.palette.mode === "dark"
                                        ? "#fff !important"
                                        : "#000000",

                                }}
                            >
                                <Typography fontFamily = "TTHoves-Bold, sans-serif" fontSize="15px"  >Employee</Typography>
                                <Typography fontFamily = "TTHoves-Bold, sans-serif" fontSize="15px" mr="10px" >Tax</Typography>
                                <Typography fontFamily = "TTHoves-Bold, sans-serif" fontSize="15px" mr="15px">SSS</Typography>
                                <Typography fontFamily = "TTHoves-Bold, sans-serif" fontSize="15px" mr="10px">PhilHealth</Typography>
                                <Typography fontFamily = "TTHoves-Bold, sans-serif" fontSize="15px" mr="20px">Pag-IBIG</Typography>
                                <Typography fontFamily = "TTHoves-Bold, sans-serif" fontSize="15px" mr="40px">Total</Typography>
                            </Box>

                            {/* TABLE BODY */}
                            <Box
                                sx={{
                                    overflowY: "auto",
                                    maxHeight: "500px",
                                    pr: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                    mt: "5px",
                                    gap: "5px",
                                    height: "85%",
                                }}>
                                {deductionData.map((row, i) => (
                                    <Box
                                        maxHeight= "500px"
                                        overflowY= "auto"
                                        key={i}
                                        display="grid"
                                        mt = "5px"
                                        borderRadius="9px"
                                        gridTemplateColumns="repeat(6, 1fr)"
                                        alignItems="center"
                                        textAlign="center"
                                        p="10px"
                                        sx={{
                                            backgroundColor: "#fff",
                                            color: "#000000",
                                            "&:hover": {
                                            },
                                        }}
                                    >
                                        {row.map((cell, j) => (
                                            <Typography key={j} fontFamily = "TTHoves-DemiBold, sans-serif" fontSize="13px">
                                                {cell}
                                            </Typography>
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                    </Box>
                </Box>

                {/* === LOWER GRID SECTION === */}
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="20px" >
                    {/* DEPARTMENT SUMMARY */}
                    <Box
                        height= "330px"
                        borderRadius="12px"
                        p="20px"
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            },
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} >
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                }}
                            >
                                Department Summary (Chart/Graph)
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    textTransform: "none",
                                    backgroundColor: "#0E1F1B",
                                    color: "#fff",
                                    borderRadius: "20px",
                                    "&:hover": { backgroundColor: "#1E3932" },
                                }}
                            >
                                Export PDF
                            </Button>
                        </Box>
                        <Box
                            alignItems="center"
                            alignContent="center"
                            justifyContent = "center"
                            height = "150px"
                            textAlign="center" fontStyle="italic">
                            (Chart/Graph Placeholder)
                        </Box>
                    </Box>

                    {/* TAX AND COMPLIANCE */}
                    <Box
                        borderRadius="12px"
                        p="20px"
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(255, 255, 255, 0.1)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                            },
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                }}
                            >
                                Tax and Compliance (Chart/Graph)
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    fontFamily: "'TTHoves-DemiBold', sans-serif",
                                    textTransform: "none",
                                    backgroundColor: "#0E1F1B",
                                    color: "#fff",
                                    borderRadius: "20px",
                                    "&:hover": { backgroundColor: "#1E3932" },
                                }}
                            >
                                Export PDF
                            </Button>
                        </Box>
                        <Box
                            alignItems="center"
                            alignContent="center"
                            justifyContent = "center"
                            height = "150px"
                            textAlign="center" fontStyle="italic">
                            (Chart/Graph Placeholder)
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
