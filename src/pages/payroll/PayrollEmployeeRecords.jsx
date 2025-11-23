import {Box, IconButton, TextField, Typography, useTheme} from "@mui/material";
import React, {useState, useEffect} from "react";
import SearchBar from "../../components/SearchBar.jsx";
import {RiEyeFill} from "react-icons/ri";
import FilterSelect from "../../components/FilterSelect.jsx";
import BoxModal from "../../components/BoxModal.jsx";

export default function PayrollEmployeeRecords() {
    const theme = useTheme();

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("");
    const [employeeRecords, setEmployeeRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleCloseModal = () => setUserModalOpen(false);

    // Fetch employee data
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/employees');

                if (!response.ok) {
                    throw new Error('Failed to fetch employees');
                }

                const data = await response.json();
                console.log('✅ Employees data:', data);

                // Transform data to match component structure
                const transformedData = data.map(emp => ({
                    id: emp.employee_number || emp.employee_id,
                    name: emp.full_name,
                    department: emp.department || 'N/A',
                    position: emp.position || 'N/A',
                    employmentType: emp.employment_type || 'N/A',
                    status: emp.employment_status || 'Active',
                    salaryComponents: {
                        basic: 0, // Will be fetched from salary details
                        allowance: 0,
                        bonus: 0,
                    },
                    taxInfo: {
                        TIN: emp.tin_number || 'N/A',
                        SSS: emp.sss_number || 'N/A',
                        PhilHealth: emp.philhealth_number || 'N/A',
                        PagIBIG: emp.pagibig_number || 'N/A',
                    },
                }));

                setEmployeeRecords(transformedData);
                setFilteredRecords(transformedData);
                setLoading(false);
            } catch (_err) {
                console.error('❌ Error fetching employees:', _err);
                setError(_err.message);
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    // Filter records based on search term and filter
    useEffect(() => {
        let filtered = employeeRecords;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.id.toString().includes(searchTerm)
            );
        }

        // Apply department/position filter
        if (filter && filter !== 'all') {
            filtered = filtered.filter(record =>
                record.department === filter || record.position === filter
            );
        }

        setFilteredRecords(filtered);
    }, [searchTerm, filter, employeeRecords]);

    // Get unique departments and positions for filter options
    const departments = [...new Set(employeeRecords.map(rec => rec.department))];
    const positions = [...new Set(employeeRecords.map(rec => rec.position))];
    const filterOptions = [
        { value: 'all', label: 'All' },
        ...departments.map(dept => ({ value: dept, label: `Dept: ${dept}` })),
        ...positions.map(pos => ({ value: pos, label: `Pos: ${pos}` })),
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <FilterSelect
                        width={200}
                        placeholder="Filter by Dept/Position"
                        options={filterOptions}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    height: "90.3%",
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}>
                        Showing {filteredRecords.length} of {employeeRecords.length} employees
                    </Typography>
                </Box>
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

                {error && (
                    <Box sx={{ color: 'error.main', p: 2, textAlign: 'center' }}>
                        Error: {error}
                    </Box>
                )}

                {loading ? (
                    <Box sx={{ p: 2, textAlign: 'center', color: theme.palette.text.primary }}>
                        Loading employees...
                    </Box>
                ) : (
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
                        {filteredRecords.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                                No employees found matching your filters.
                            </Box>
                        ) : (
                            filteredRecords.map((item, index) => (
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
                        ))
                        )}
                    </Box>
                )}
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

                {/* Row 4: Tax Info */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1 }}>
                    <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px" }}>
                        Tax / Government IDs
                    </Typography>
                    <TextField
                        InputProps={{ readOnly: true }}
                        value={selectedEmployee?.taxInfo ? `TIN: ${selectedEmployee.taxInfo.TIN}, SSS: ${selectedEmployee.taxInfo.SSS}, PhilHealth: ${selectedEmployee.taxInfo.PhilHealth}, Pag-IBIG: ${selectedEmployee.taxInfo.PagIBIG}` : ""}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={3}
                        fullWidth
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "13px",
                                backgroundColor: "#cacace",
                                color: "#1F2829",
                                fontSize: "14px",
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