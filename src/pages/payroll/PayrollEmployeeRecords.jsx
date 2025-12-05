import {Box, IconButton, TextField, Typography, useTheme} from "@mui/material";
import React, {useState, useEffect} from "react";
import SearchBar from "../../components/SearchBar.jsx";
import {RiEyeFill} from "react-icons/ri";
import FilterSelect from "../../components/FilterSelect.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import ActionButton from "../../components/ActionButton.jsx";

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
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState("");

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

    const handleExportPDF = () => {
        const reportDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Records Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #1b2223; border-bottom: 2px solid #1b2223; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #1b2223; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .header { text-align: center; margin-bottom: 30px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Employee Records</h1>
                    <p>Generated on: ${reportDate}</p>
                    <p>Total Records: ${filteredRecords.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Position</th>
                            <th>Employment Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredRecords.map(emp => `
                            <tr>
                                <td>${emp.id}</td>
                                <td>${emp.name}</td>
                                <td>${emp.department}</td>
                                <td>${emp.position}</td>
                                <td>${emp.employmentType}</td>
                                <td>${emp.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Name', 'Department', 'Position', 'Employment Type', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredRecords.map(emp => [
                emp.id,
                `"${emp.name}"`,
                `"${emp.department}"`,
                `"${emp.position}"`,
                `"${emp.employmentType}"`,
                emp.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `employee_records_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleConfirmExport = () => {
        if (exportType === 'pdf') handleExportPDF();
        else if (exportType === 'csv') handleExportCSV();
        setIsExportModalOpen(false);
    };

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
                        width="250px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <FilterSelect
                        width={180}
                        placeholder="Filter by Dept/Position"
                        options={filterOptions}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    
                    <ActionButton
                        text="Export PDF"
                        width="120px"
                        onClick={() => { setExportType('pdf'); setIsExportModalOpen(true); }}
                    />
                    <ActionButton
                        text="Export CSV"
                        width="120px"
                        onClick={() => { setExportType('csv'); setIsExportModalOpen(true); }}
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
            >
                <Box sx={{ display: "flex", flexDirection: "column", color: theme.palette.text.primary }}>
                    <Typography
                        variant="h5"
                        sx={{ fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#fff", mb: 2 }}
                    >
                        Employee Record
                    </Typography>

                    {/* Row 1: Employee ID + Name */}
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px" }}>
                                Employee ID
                            </Typography>
                            <TextField
                                InputProps={{ readOnly: true }}
                                value={selectedEmployee?.id || ""}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                }}
                            />
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px" }}>
                                Name
                            </Typography>
                            <TextField
                                InputProps={{ readOnly: true }}
                                value={selectedEmployee?.name || ""}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Row 2: Department + Position */}
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px" }}>
                                Department
                            </Typography>
                            <TextField
                                InputProps={{ readOnly: true }}
                                value={selectedEmployee?.department || ""}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                }}
                            />
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px" }}>
                                Position
                            </Typography>
                            <TextField
                                InputProps={{ readOnly: true }}
                                value={selectedEmployee?.position || ""}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Row 3: Employment Type + Status */}
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px" }}>
                                Employment Type
                            </Typography>
                            <TextField
                                InputProps={{ readOnly: true }}
                                value={selectedEmployee?.employmentType || ""}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                }}
                            />
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px" }}>
                                Status
                            </Typography>
                            <TextField
                                InputProps={{ readOnly: true }}
                                value={selectedEmployee?.status || ""}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Row 4: Tax Info */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px" }}>
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
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                            }}
                        />
                    </Box>
                </Box>
            </BoxModal>

            {/* Export Confirmation Modal */}
            <BoxModal
                open={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                width="400px"
            >
                <Box sx={{ display: "flex", flexDirection: "column", color: "#fff", }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            fontSize: "20px",
                            color: "#fff",
                            mb: 2,
                            textAlign: "center"
                        }}
                    >
                        Export Employee Records
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            textAlign: "center",
                            mb: 2
                        }}
                    >
                        Export {filteredRecords.length} record(s) to {exportType.toUpperCase()}?
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignContent:"center" }}>
                        <Box
                            onClick={() => setIsExportModalOpen(false)}
                            component="button"
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 0",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                width: "120px",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                transition: "all 0.3s ease",
                                "&:hover": { 
                                    backgroundColor: "#a0a0a0",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            onClick={handleConfirmExport}
                            component="button"
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#172224",
                                color: "#fff",
                                padding: "10px 0",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                width: "120px",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                transition: "all 0.3s ease",
                                "&:hover": { 
                                    backgroundColor: "#1f2f31", 
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            Export
                        </Box>
                    </Box>
                </Box>
            </BoxModal>
        </Box>
    );
}