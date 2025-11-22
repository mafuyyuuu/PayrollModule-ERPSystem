import {Box, IconButton, TextField, Typography, useTheme} from "@mui/material";
import React, {useState} from "react";
import SearchBar from "../../components/SearchBar.jsx";
import {RiEyeFill} from "react-icons/ri";
import FilterSelect from "../../components/FilterSelect.jsx";
import BoxModal from "../../components/BoxModal.jsx";

export default function PayrollEmployeeRecords() {
    const theme = useTheme();

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [filter, setFilter] = useState("")

    const handleCloseModal = () => setUserModalOpen(false);

    const employeeRecords = [
        {
            id: "01XXXXX",
            name: "Jhervin Jimenez",
            department: "IT",
            position: "Employee",
            employmentType: "Full Time",
            salaryComponents: {
                basic: 20000,
                allowance: 5000,
                bonus: 2000,
            },
            taxInfo: {
                TIN: "123-456-789",
                bankAccount: "0123456789",
            },
            status: "Active",
        },
        {
            id: "02XXXXX",
            name: "Edrianne Lumabas",
            department: "HR",
            position: "Admin",
            employmentType: "Full Time",
            salaryComponents: {
                basic: 25000,
                allowance: 4000,
                bonus: 1500,
            },
            taxInfo: {
                TIN: "987-654-321",
                bankAccount: "9876543210",
            },
            status: "Active",
        },
        {
            id: "03XXXXX",
            name: "Jumiah Zamora",
            department: "Finance",
            position: "Manager",
            employmentType: "Full Time",
            salaryComponents: {
                basic: 35000,
                allowance: 7000,
                bonus: 5000,
            },
            taxInfo: {
                TIN: "456-123-789",
                bankAccount: "1234567890",
            },
            status: "Active",
        },
        {
            id: "04XXXXX",
            name: "Jessa Balnig",
            department: "Payroll",
            position: "Payroll",
            employmentType: "Contract",
            salaryComponents: {
                basic: 18000,
                allowance: 3000,
                bonus: 0,
            },
            taxInfo: {
                TIN: "321-654-987",
                bankAccount: "9871234560",
            },
            status: "Active",
        },
        {
            id: "05XXXXX",
            name: "Symon Banaag",
            department: "Payroll",
            position: "Payroll",
            employmentType: "Part Time",
            salaryComponents: {
                basic: 10000,
                allowance: 2000,
                bonus: 0,
            },
            taxInfo: {
                TIN: "654-321-987",
                bankAccount: "0129876543",
            },
            status: "Inactive",
        },
    ];

    return (
        <Box
            sx={{width: "100%", height: "100%", fontFamily: theme.typography.fontFamily}}
        >
            <Box
                sx={{
                    alignItems: "center",
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
                        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                    }}
                >
                    <SearchBar
                        placeholder="Enter Employee Name"
                        width="350px"
                    />

                    <FilterSelect
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
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
                        gridTemplateColumns: "repeat(6, 1fr)",
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
                    <span style={{textAlign: "center"}}>Name</span>
                    <span style={{textAlign: "center"}}>Department</span>
                    <span style={{textAlign: "center"}}>Position</span>
                    <span style={{textAlign: "center"}}>Employment Type</span>
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
                            <span>{item.id}</span>
                            <span>{item.name}</span>
                            <span>{item.department}</span>
                            <span>{item.position}</span>
                            <span>{item.employmentType}</span>
                            <Box sx={{display: "flex", justifyContent: "center", gap: "8px"}}>
                                <IconButton
                                    onClick={() => {
                                        setSelectedEmployee(item);
                                        setUserModalOpen(true);
                                    }}
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
                                    <RiEyeFill style={{fontSize: 19}}/>
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            <BoxModal
                open={userModalOpen}
                onClose={handleCloseModal}
                width="500px"
                height="600px"
            >
                <Typography
                    variant="h5"
                    sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2 }}
                >
                    Employee Record
                </Typography>

                {/* Row 1: Employee ID + Name */}
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                            Employee ID
                        </Typography>
                        <TextField
                            InputProps={{ readOnly: true }}
                            value={selectedEmployee?.id || ""}
                            onChange={(e) => setSelectedEmployee(prev => ({ ...prev, id: e.target.value }))}
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "13px",
                                    backgroundColor: "#cacace",
                                    color: "#1F2829",
                                    fontSize: "18px",
                                    "& fieldset": { border: "none" },
                                    "&:hover fieldset": { border: "none" },
                                    "&.Mui-focused fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { fontSize: "18px" },
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                            Name
                        </Typography>
                        <TextField
                            InputProps={{ readOnly: true }}
                            value={selectedEmployee?.name || ""}
                            onChange={(e) => setSelectedEmployee(prev => ({ ...prev, name: e.target.value }))}
                            variant="outlined"
                            size="small"
                            sx={{
                                width: "250px",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "13px",
                                    backgroundColor: "#cacace",
                                    color: "#1F2829",
                                    fontSize: "18px",
                                    "& fieldset": { border: "none" },
                                    "&:hover fieldset": { border: "none" },
                                    "&.Mui-focused fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { fontSize: "18px" },
                            }}
                        />
                    </Box>
                </Box>

                {/* Row 2: Department + Position */}
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                            Department
                        </Typography>
                        <TextField
                            InputProps={{ readOnly: true }}
                            value={selectedEmployee?.department || ""}
                            onChange={(e) => setSelectedEmployee(prev => ({ ...prev, department: e.target.value }))}
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "13px",
                                    backgroundColor: "#cacace",
                                    color: "#1F2829",
                                    fontSize: "18px",
                                    "& fieldset": { border: "none" },
                                    "&:hover fieldset": { border: "none" },
                                    "&.Mui-focused fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { fontSize: "18px" },
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                            Position
                        </Typography>
                        <TextField
                            InputProps={{ readOnly: true }}
                            value={selectedEmployee?.position || ""}
                            onChange={(e) => setSelectedEmployee(prev => ({ ...prev, position: e.target.value }))}
                            variant="outlined"
                            size="small"
                            sx={{
                                width: "250px",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "13px",
                                    backgroundColor: "#cacace",
                                    color: "#1F2829",
                                    fontSize: "18px",
                                    "& fieldset": { border: "none" },
                                    "&:hover fieldset": { border: "none" },
                                    "&.Mui-focused fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { fontSize: "18px" },
                            }}
                        />
                    </Box>
                </Box>

                {/* Row 3: Employment Type + Status */}
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                            Employment Type
                        </Typography>
                        <TextField
                            InputProps={{ readOnly: true }}
                            value={selectedEmployee?.employmentType || ""}
                            onChange={(e) => setSelectedEmployee(prev => ({ ...prev, employmentType: e.target.value }))}
                            variant="outlined"
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "13px",
                                    backgroundColor: "#cacace",
                                    color: "#1F2829",
                                    fontSize: "18px",
                                    "& fieldset": { border: "none" },
                                    "&:hover fieldset": { border: "none" },
                                    "&.Mui-focused fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { fontSize: "18px" },
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                            Status
                        </Typography>
                        <TextField
                            InputProps={{ readOnly: true }}
                            value={selectedEmployee?.status || ""}
                            onChange={(e) => setSelectedEmployee(prev => ({ ...prev, status: e.target.value }))}
                            variant="outlined"
                            size="small"
                            sx={{
                                width: "250px",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "13px",
                                    backgroundColor: "#cacace",
                                    color: "#1F2829",
                                    fontSize: "18px",
                                    "& fieldset": { border: "none" },
                                    "&:hover fieldset": { border: "none" },
                                    "&.Mui-focused fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { fontSize: "18px" },
                            }}
                        />
                    </Box>
                </Box>

                {/* Row 4: Salary Components */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1 }}>
                    <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                        Salary Components
                    </Typography>
                    <TextField
                        InputProps={{ readOnly: true }}
                        value={selectedEmployee?.salaryComponents ? JSON.stringify(selectedEmployee.salaryComponents) : ""}
                        onChange={(e) => setSelectedEmployee(prev => ({ ...prev, salaryComponents: JSON.parse(e.target.value) }))}
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "13px",
                                backgroundColor: "#cacace",
                                color: "#1F2829",
                                fontSize: "18px",
                                "& fieldset": { border: "none" },
                                "&:hover fieldset": { border: "none" },
                                "&.Mui-focused fieldset": { border: "none" },
                            },
                            "& .MuiInputBase-input": { fontSize: "18px" },
                        }}
                    />
                </Box>

                {/* Row 5: Tax / Bank Info */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                        Tax / Bank Info
                    </Typography>
                    <TextField
                        InputProps={{ readOnly: true }}
                        value={selectedEmployee?.taxInfo ? JSON.stringify(selectedEmployee.taxInfo) : ""}
                        onChange={(e) => setSelectedEmployee(prev => ({ ...prev, taxInfo: JSON.parse(e.target.value) }))}
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "13px",
                                backgroundColor: "#cacace",
                                color: "#1F2829",
                                fontSize: "18px",
                                "& fieldset": { border: "none" },
                                "&:hover fieldset": { border: "none" },
                                "&.Mui-focused fieldset": { border: "none" },
                            },
                            "& .MuiInputBase-input": { fontSize: "18px" },
                        }}
                    />
                </Box>
            </BoxModal>
        </Box>
    );
}