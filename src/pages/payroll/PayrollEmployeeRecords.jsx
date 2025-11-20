import {Box, IconButton, MenuItem, Select, Typography, useTheme} from "@mui/material";
import React, {useState} from "react";
import SearchBar from "../../components/SearchBar.jsx";
import {RiPencilFill} from "react-icons/ri";
import FilterSelect from "../../components/FilterSelect.jsx";

export default function PayrollEmployeeRecords() {
    const theme = useTheme();

    const [filter, setFilter] = useState("")

    const employeeRecords = [
        { ID: "01XXXXX", Name: "Jhervin Jimenez", Position: "Employee" },
        { ID: "01XXXXX", Name: "Edrianne Lumabas", Position: "Admin" },
        { ID: "01XXXXX", Name: "Jumiah Zamora", Position: "Manager" },
        { ID: "01XXXXX", Name: "Jessa Balnig", Position: "Payroll" },
        { ID: "01XXXXX", Name: "Symon Banaag", Position: "Payroll" },
    ];
    return (
        <Box
            sx={{width: "100%", height: "100%", fontFamily: theme.typography.fontFamily}}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 3,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                    }}
                >
                    Employee Records
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <SearchBar placeholder="Enter Employee Name" width="350px" />

                    <FilterSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        options={[]}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    height: "91%",
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

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        p: "8px 0",
                        width: "100%",
                        alignItems: "center",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <span style={{textAlign: "center"}}>Employee ID</span>
                    <span style={{textAlign: "center"}}>Employee Name</span>
                    <span style={{textAlign: "center"}}>Position</span>
                    <span style={{textAlign: "center"}}>Actions</span>
                </Box>

                <Box
                    sx={{
                        maxHeight: "530px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {width: 0, height: 0},
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        mt: "8px",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    {employeeRecords.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            marginTop: "10px",
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
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
                        <span>{item.ID}</span>
                        <span>{item.Name}</span>
                        <span>{item.Position}</span>
                        <Box sx={{display: "flex", justifyContent: "center", gap: "8px"}}>
                            <IconButton
                                sx={{
                                    bgcolor: "#3A4F50",
                                    color: "#fff",
                                    width: "32px",
                                    height: "32px",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-3px)", bgcolor: "#2E3B3D",
                                    },
                                }}
                            >
                                <RiPencilFill/>
                            </IconButton>
                        </Box>
                    </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}