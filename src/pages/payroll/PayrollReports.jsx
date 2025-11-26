import {Box, Typography, useTheme, Chip} from "@mui/material";
import ActionButton from "../../components/ActionButton.jsx";
import React, {useState, useEffect} from "react";
import FilterSelect from "../../components/FilterSelect.jsx";
import {generateReportPDF} from "../../utils/pdfGenerator.js";
import BoxModal from "../../components/BoxModal.jsx";
import {RiCloseLine} from "react-icons/ri";

export default function PayrollReports() {
    const theme = useTheme();

    const [filter, setFilter] = useState("");
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

    // Check if filter is active
    const hasActiveFilters = filter && filter !== 'all';

    // Clear filters
    const handleClearFilters = () => {
        setFilter("");
    };

    // Fetch payroll reports from database
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/payroll/payroll-reports');

                if (!response.ok) {
                    throw new Error('Failed to fetch reports');
                }

                const data = await response.json();
                console.log('✅ Reports data:', data);

                const transformedData = data.map(report => ({
                    date: new Date(report.pay_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    rawDate: new Date(report.pay_date), // For sorting
                    updatedAt: report.updated_at ? new Date(report.updated_at) : new Date(report.pay_date),
                    period: `${new Date(report.cutoff_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(report.cutoff_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    amount: `₱${parseFloat(report.net_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    status: report.status || "Released",
                    employee: report.employee_name || `Employee ${report.employee_id}`,
                    processedBy: report.prepared_by_name || 'System',
                    processedDate: report.updated_at ? new Date(report.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : 'N/A',
                    reference: report.payslip_reference_number || 'N/A'
                }))
                // Filter out Pending status - only show processed records
                .filter(report => report.status !== 'Pending')
                // Sort by most recent processed time first
                .sort((a, b) => b.updatedAt - a.updatedAt);

                setReports(transformedData);
                setFilteredReports(transformedData);
                setLoading(false);
            } catch (_err) {
                console.error('❌ Error fetching reports:', _err);
                setError(_err.message);
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Filter reports based on search term and filter
    useEffect(() => {
        let filtered = reports;

        // Apply status filter
        if (filter && filter !== 'all') {
            filtered = filtered.filter(report => report.status === filter);
        }

        setFilteredReports(filtered);
    }, [filter, reports]);

    // Get unique statuses for filter options
    const statuses = [...new Set(reports.map(rep => rep.status))];
    const filterOptions = [
        {value: 'all', label: 'All'},
        ...statuses.map(status => ({value: status, label: `Status: ${status}`})),
    ];

    const handleExportPDF = () => {
        if (filteredReports.length === 0) {
            console.warn('No reports to export');
            alert('No reports to export');
            return;
        }
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        generateReportPDF(filteredReports, `Payroll Reports and History - Generated ${currentDate}`);
    };

    const renderModalCards = () => {
        switch (modalType) {
            case "exportReportsPDF":
                return (
                    <>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                fontSize: "24px",
                                color: "#FFFFFF",
                                mb: 2,
                                textAlign: "center"
                            }}
                        >
                            Export Payroll Reports
                        </Typography>
                        <Typography sx={{ color: "#ccc", textAlign: "center", mb: 2 }}>
                            This will export {filteredReports.length} report(s) to PDF
                        </Typography>
                        <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                            <Box
                                onClick={() => {
                                    handleExportPDF();
                                    setIsModalOpen(false);
                                }}
                                component="button"
                                sx={{
                                    fontSize: "16px",
                                    backgroundColor: "#172224",
                                    color: "#fff",
                                    padding: "10px 0",
                                    borderRadius: "15px",
                                    cursor: "pointer",
                                    border: "none",
                                    transition: "all 0.3s ease",
                                    width: "200px",
                                    fontFamily: "'TTHoves-Regular', sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#1f2f31",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                Download PDF
                            </Box>
                        </Box>
                    </>
                );

            default:
                return <Typography sx={{color: "#fff"}}>No data available</Typography>;

        }
    };

    return (
        <Box
            width="100%"
            height="100%"
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
                    Report and History
                </Typography>

                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                    }}
                >
                    <FilterSelect
                        width={180}
                        placeholder="Filter by Status"
                        options={filterOptions}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />

                    {/* Clear filters button */}
                    {hasActiveFilters && (
                        <Chip
                            label="Clear Filters"
                            onDelete={handleClearFilters}
                            deleteIcon={<RiCloseLine />}
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                '& .MuiChip-deleteIcon': {
                                    color: theme.palette.primary.contrastText,
                                }
                            }}
                        />
                    )}
                </Box>
            </Box>

            <Box
                sx={{
                    height: "80%",
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
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1}}>
                    <Typography sx={{color: theme.palette.text.secondary, fontSize: "14px"}}>
                        Showing {filteredReports.length} of {reports.length} reports
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
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
                    <span>Date</span>
                    <span>Employee</span>
                    <span>Payroll Period</span>
                    <span>Total Amount</span>
                    <span>Processed By</span>
                    <span>Processed Date</span>
                    <span>Status</span>
                </Box>

                {error && (
                    <Box sx={{color: 'error.main', p: 2, textAlign: 'center'}}>
                        Error: {error}
                    </Box>
                )}

                {loading ? (
                    <Box sx={{p: 2, textAlign: 'center', color: theme.palette.text.primary}}>
                        Loading reports...
                    </Box>
                ) : (
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
                        {filteredReports.length === 0 ? (
                            <Box sx={{p: 4, textAlign: 'center', color: theme.palette.text.secondary}}>
                                No reports found matching your filters.
                            </Box>
                        ) : (
                            filteredReports.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        marginTop: "10px",
                                        display: "grid",
                                        gridTemplateColumns: "repeat(7, 1fr)",
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
                                        fontSize: "14px",
                                    }}
                                >
                                    <span>{item.date}</span>
                                    <span>{item.employee}</span>
                                    <span>{item.period}</span>
                                    <span>{item.amount}</span>
                                    <span>{item.processedBy}</span>
                                    <span>{item.processedDate}</span>
                                    <span
                                        style={{
                                            fontFamily: "'TTHoves-Bold', sans-serif",
                                            color:
                                                item.status === "Released"
                                                    ? "#2196F3"
                                                    : item.status === "Approved"
                                                        ? "#4CAF50"
                                                        : item.status === "Processed"
                                                            ? "#9C27B0"
                                                            : "#F44336",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {item.status}
                                    </span>
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>

            <Box display="flex" justifyContent="flex-end" gap="15px" mt="20px">
                <ActionButton
                    text="Export Reports PDF"
                    width="200px"
                    onClick={() => {
                        setModalType("exportReportsPDF");
                        setIsModalOpen(true);
                    }}
                />
            </Box>

            <BoxModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                {renderModalCards()}
            </BoxModal>
        </Box>
    );
}