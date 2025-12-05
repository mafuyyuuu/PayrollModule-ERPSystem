/* eslint-disable no-unused-vars */
import {Box, Typography, IconButton, TextField, MenuItem, Select, FormControl, InputLabel, Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import "remixicon/fonts/remixicon.css";
import SearchBar from "../../components/SearchBar.jsx";
import FilterSelect from "../../components/FilterSelect.jsx";
import BoxModal from "../../components/BoxModal.jsx";
import {RiCheckFill, RiCloseFill, RiPencilFill, RiAddFill, RiSaveFill} from "react-icons/ri";
import React, {useState, useEffect} from "react";
import ActionButton from "../../components/ActionButton.jsx";
import {exportToCSV} from "../../utils/pdfGenerator.js";
import { useUser } from "../../components/UserContext.jsx";

const ManagerTimesheets = () => {
    const theme = useTheme();
    const { user } = useUser();
    
    // Get current user's employee ID for logging processed_by
    const currentUserId = user?.employeeId || user?.employee_id || 1;

    const [filter, setFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [timesheetData, setTimesheetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedRow, setEditedRow] = useState(null);
    
    // Rejection modal state
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [rejectingRow, setRejectingRow] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    
    // Export modal state
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportModalType, setExportModalType] = useState(""); // "pdf" or "csv"
    
    // Add Manual Entry Modal State
    const [openAddModal, setOpenAddModal] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [newEntry, setNewEntry] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        time_in: '08:00',
        time_out: '17:00',
        break_duration: 1,
        overtime_hours: 0,
        remarks: 'Manual Entry'
    });
    
    // Save confirmation modal state
    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [pendingSaveAction, setPendingSaveAction] = useState(null); // 'edit' or 'add'

    // Calculate total hours and overtime automatically
    const calculateHours = (timeIn, timeOut, breakDuration = 1) => {
        if (!timeIn || !timeOut) return { totalHours: 0, overtime: 0 };
        
        const [inHours, inMinutes] = timeIn.split(':').map(Number);
        const [outHours, outMinutes] = timeOut.split(':').map(Number);
        
        const inTotalMinutes = inHours * 60 + inMinutes;
        const outTotalMinutes = outHours * 60 + outMinutes;
        
        let workedMinutes = outTotalMinutes - inTotalMinutes - (breakDuration * 60);
        if (workedMinutes < 0) workedMinutes = 0;
        
        const totalHours = workedMinutes / 60;
        const regularHours = 8;
        const overtime = Math.max(0, totalHours - regularHours);
        
        return { 
            totalHours: totalHours.toFixed(1), 
            overtime: overtime.toFixed(1) 
        };
    };

    // Update new entry calculations when times change
    useEffect(() => {
        const { totalHours, overtime } = calculateHours(newEntry.time_in, newEntry.time_out, newEntry.break_duration);
        setNewEntry(prev => ({
            ...prev,
            overtime_hours: parseFloat(overtime)
        }));
    }, [newEntry.time_in, newEntry.time_out, newEntry.break_duration]);

    // Fetch timesheets from API
    const fetchTimesheets = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/manager/timesheets');
            if (!response.ok) throw new Error('Failed to fetch timesheets');
            const data = await response.json();
            
            // Transform data to match component structure
            const transformedData = data.map(ts => {
                const { totalHours, overtime } = calculateHours(ts.time_in, ts.time_out, ts.break_duration || 1);
                return {
                    id: ts.timesheet_id,
                    employee_id: ts.employee_id,
                    employee: ts.employee_name,
                    date: ts.date ? new Date(ts.date).toISOString().split('T')[0] : '',
                    timeIn: ts.time_in || '',
                    timeOut: ts.time_out || '',
                    totalHours: totalHours,
                    overtime: overtime,
                    status: ts.status || 'Pending',
                    break_duration: ts.break_duration || 1,
                    remarks: ts.remarks || ''
                };
            });
            
            setTimesheetData(transformedData);
        } catch (error) {
            console.error('Error fetching timesheets:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch employees for dropdown
    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/manager/employees');
            if (!response.ok) throw new Error('Failed to fetch employees');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    useEffect(() => {
        fetchTimesheets();
        fetchEmployees();
    }, []);

    // Filter timesheets based on search and filter
    const filteredData = timesheetData.filter(row => {
        const matchesSearch = !searchTerm || row.employee.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = !filter || filter === 'all' || row.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleView = (row) => {
        setSelectedRow(row);
        setEditedRow({...row});
        setIsEditing(false);
        setOpenModal(true);
    };

    const handleApprove = async (row) => {
        try {
            const response = await fetch(`http://localhost:8080/api/manager/timesheets/${row.id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved_by: currentUserId })
            });
            if (!response.ok) throw new Error('Failed to approve timesheet');
            fetchTimesheets();
        } catch (error) {
            console.error('Error approving timesheet:', error);
            alert('Failed to approve timesheet');
        }
    };

    const handleRejectClick = (row) => {
        setRejectingRow(row);
        setRejectionReason("");
        setOpenRejectModal(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please enter a reason for rejection');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8080/api/manager/timesheets/${rejectingRow.id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    approved_by: currentUserId, 
                    reason: rejectionReason,
                    remarks: rejectionReason
                })
            });
            if (!response.ok) throw new Error('Failed to reject timesheet');
            setOpenRejectModal(false);
            setRejectingRow(null);
            setRejectionReason("");
            fetchTimesheets();
        } catch (error) {
            console.error('Error rejecting timesheet:', error);
            alert('Failed to reject timesheet');
        }
    };

    // Show save confirmation modal
    const showSaveConfirmation = (actionType) => {
        setPendingSaveAction(actionType);
        setSaveConfirmModalOpen(true);
    };

    // Confirm save action
    const confirmSave = () => {
        setSaveConfirmModalOpen(false);
        if (pendingSaveAction === 'edit') {
            executeSaveEdit();
        } else if (pendingSaveAction === 'add') {
            executeAddManualEntry();
        }
    };

    const executeSaveEdit = async () => {
        const { totalHours, overtime } = calculateHours(editedRow.timeIn, editedRow.timeOut, editedRow.break_duration);
        
        try {
            const response = await fetch(`http://localhost:8080/api/manager/timesheets/${editedRow.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    time_in: editedRow.timeIn,
                    time_out: editedRow.timeOut,
                    break_duration: editedRow.break_duration,
                    overtime_hours: parseFloat(overtime),
                    total_hours: parseFloat(totalHours),
                    remarks: editedRow.remarks,
                    processed_by: currentUserId
                })
            });
            if (!response.ok) throw new Error('Failed to update timesheet');
            setIsEditing(false);
            setOpenModal(false);
            fetchTimesheets();
        } catch (error) {
            console.error('Error updating timesheet:', error);
            alert('Failed to update timesheet');
        }
    };

    const executeAddManualEntry = async () => {
        if (!newEntry.employee_id || !newEntry.date || !newEntry.time_in || !newEntry.time_out) {
            alert('Please fill in all required fields');
            return;
        }
        
        const { totalHours, overtime } = calculateHours(newEntry.time_in, newEntry.time_out, newEntry.break_duration);
        
        try {
            const response = await fetch('http://localhost:8080/api/manager/timesheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newEntry,
                    total_hours: parseFloat(totalHours),
                    overtime_hours: parseFloat(overtime),
                    processed_by: currentUserId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create timesheet');
            }
            
            setOpenAddModal(false);
            setNewEntry({
                employee_id: '',
                date: new Date().toISOString().split('T')[0],
                time_in: '08:00',
                time_out: '17:00',
                break_duration: 1,
                overtime_hours: 0,
                remarks: 'Manual Entry'
            });
            fetchTimesheets();
        } catch (error) {
            console.error('Error creating timesheet:', error);
            alert(error.message);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    // Export handlers
    const handleExportPDF = () => {
        if (filteredData.length === 0) {
            alert('No data to export');
            return;
        }
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Timesheet Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .report-title { font-size: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #2E7D32; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .approved { color: #4CAF50; font-weight: bold; }
        .rejected { color: #F44336; font-weight: bold; }
        .pending { color: #FF9800; font-weight: bold; }
        .summary { margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">ERP System Payroll</div>
        <div class="report-title">Timesheet Report</div>
    </div>
    
    <div class="summary">
        <strong>Total Records:</strong> ${filteredData.length} | 
        <strong>Approved:</strong> ${filteredData.filter(r => r.status === 'Approved').length} | 
        <strong>Pending:</strong> ${filteredData.filter(r => r.status === 'Pending').length} | 
        <strong>Rejected:</strong> ${filteredData.filter(r => r.status === 'Rejected').length}
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Total Hours</th>
                <th>Overtime</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${filteredData.map(row => `
                <tr>
                    <td>${row.employee}</td>
                    <td>${row.date}</td>
                    <td>${formatTime(row.timeIn)}</td>
                    <td>${formatTime(row.timeOut)}</td>
                    <td>${row.totalHours}h</td>
                    <td>${row.overtime}h</td>
                    <td class="${row.status.toLowerCase()}">${row.status}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p>This is a computer-generated report.</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
    </div>
</body>
</html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Unable to open print window. Please check your popup blocker settings.');
            return;
        }
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = function() {
            printWindow.print();
        };
        setIsExportModalOpen(false);
    };

    const handleExportCSV = () => {
        if (filteredData.length === 0) {
            alert('No data to export');
            return;
        }
        
        const csvData = filteredData.map(row => ({
            Employee: row.employee,
            Date: row.date,
            'Time In': row.timeIn,
            'Time Out': row.timeOut,
            'Total Hours': row.totalHours,
            Overtime: row.overtime,
            Status: row.status
        }));
        
        exportToCSV(csvData, `timesheets_${new Date().toISOString().split('T')[0]}.csv`);
        setIsExportModalOpen(false);
    };

    // Render export modal content
    const renderExportModalContent = () => {
        if (exportModalType === 'pdf') {
            return (
                <>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            fontSize: "24px",
                            color: "#FFFFFF",
                            mb: 1,
                        }}
                    >
                        Export Timesheet Report
                    </Typography>
                    <Typography sx={{ color: "#fff", mb: 2 }}>
                        {filteredData.length} records will be exported
                    </Typography>
                    <Box sx={{
                        backgroundColor: "#cacace",
                        borderRadius: "12px", 
                        p: 2, 
                        mb: 2,
                    }}>
                        <Typography sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#4CAF50", fontSize: "14px" }}>
                            Approved: {filteredData.filter(r => r.status === 'Approved').length}
                        </Typography>
                        <Typography sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#FF9800", fontSize: "14px" }}>
                            Pending: {filteredData.filter(r => r.status === 'Pending').length}
                        </Typography>
                        <Typography sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#F44336", fontSize: "14px" }}>
                            Rejected: {filteredData.filter(r => r.status === 'Rejected').length}
                        </Typography>
                    </Box>
                    <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 3}}>
                        <Box
                            onClick={handleExportPDF}
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
        } else if (exportModalType === 'csv') {
            return (
                <>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            fontSize: "24px",
                            color: "#FFFFFF",
                            textAlign: "center",
                            mb: 1
                        }}
                    >
                        Export Timesheet to CSV
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 2,
                            textAlign: "center"
                        }}
                    >
                        This will export {filteredData.length} timesheet records
                    </Typography>
                    <Box sx={{display: "flex", justifyContent: "center", gap: 2, mt: 1}}>
                        <Box
                            onClick={handleExportCSV}
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
                            Download CSV
                        </Box>
                    </Box>
                </>
            );
        }
        return null;
    };

    return (
        <Box width="100%" height="100%" display="flex" flexDirection="column">
            {/* FILTER BAR */}
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 2,
                }}
            >
                {/* HEADER */}
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: theme.palette.text.primary,
                    }}
                >
                    Timesheet Approval
                </Typography>
            </Box>

            {/* Filter Buttons and Search */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                    onClick={() => setFilter("all")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "all" || !filter ? "#334042" : "#e0e0e0",
                        color: filter === "all" || !filter ? "#fff" : "#333",
                        opacity: filter === "all" || !filter ? 1 : 0.6,
                        "&:hover": { backgroundColor: filter === "all" || !filter ? "#2a3435" : "#d0d0d0" },
                    }}
                >
                    All
                </Button>
                <Button
                    onClick={() => setFilter("Pending")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Pending" ? "#f0ad4e" : "#e0e0e0",
                        color: filter === "Pending" ? "#fff" : "#333",
                        opacity: filter === "Pending" ? 1 : 0.6,
                        "&:hover": { backgroundColor: filter === "Pending" ? "#ec971f" : "#d0d0d0" },
                    }}
                >
                    Pending
                </Button>
                <Button
                    onClick={() => setFilter("Approved")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Approved" ? "#5cb85c" : "#e0e0e0",
                        color: filter === "Approved" ? "#fff" : "#333",
                        opacity: filter === "Approved" ? 1 : 0.6,
                        "&:hover": { backgroundColor: filter === "Approved" ? "#449d44" : "#d0d0d0" },
                    }}
                >
                    Approved
                </Button>
                <Button
                    onClick={() => setFilter("Rejected")}
                    sx={{
                        fontSize: "14px",
                        px: 3,
                        py: 1,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                        backgroundColor: filter === "Rejected" ? "#d9534f" : "#e0e0e0",
                        color: filter === "Rejected" ? "#fff" : "#333",
                        opacity: filter === "Rejected" ? 1 : 0.6,
                        "&:hover": { backgroundColor: filter === "Rejected" ? "#c9302c" : "#d0d0d0" },
                    }}
                >
                    Rejected
                </Button>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    <ActionButton 
                        text="Add Manual Entry" 
                        width="auto" 
                        onClick={() => setOpenAddModal(true)}
                    />

                    <SearchBar
                        placeholder="Enter Employee Name"
                        width="300px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <ActionButton 
                        text="Export PDF" 
                        width="auto" 
                        onClick={() => { setExportModalType('pdf'); setIsExportModalOpen(true); }}
                    />
                    <ActionButton 
                        text="Export CSV" 
                        width="auto" 
                        onClick={() => { setExportModalType('csv'); setIsExportModalOpen(true); }}
                    />
                </Box>
            </Box>

            {/* TABLE CONTAINER */}
            <Box
                sx={{
                    height: "calc(100% - 130px)",
                    flex: 1,
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* HEADER ROW */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(8, 1fr)",
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
                    <span style={{ textAlign: "left", paddingLeft: "12px" }}>Employee Name</span>
                    <span>Date</span>
                    <span>Time In</span>
                    <span>Time Out</span>
                    <span>Total Hours</span>
                    <span>Overtime</span>
                    <span>Status</span>
                    <span>Actions</span>
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
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.primary }}>
                            Loading timesheets...
                        </Box>
                    ) : filteredData.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: theme.palette.text.secondary }}>
                            No timesheets found.
                        </Box>
                    ) : (
                    filteredData.map((row) => (
                        <Box
                            key={row.id}
                            sx={{
                                marginTop: "10px",
                                display: "grid",
                                gridTemplateColumns: "repeat(8, 1fr)",
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
                            <span style={{ textAlign: "left", paddingLeft: "12px", fontWeight: 600 }}>{row.employee}</span>
                            <span>{row.date}</span>
                            <span>{formatTime(row.timeIn)}</span>
                            <span>{formatTime(row.timeOut)}</span>
                            <span>{row.totalHours}</span>
                            <span>{row.overtime}</span>
                            <span
                                style={{
                                    fontFamily: "'TTHoves-Bold', sans-serif",
                                    color:
                                        row.status === "Approved"
                                            ? "#4CAF50"
                                            : row.status === "Rejected"
                                                ? "#F44336"
                                                : "#FFC107",
                                    fontWeight: 500,
                                }}
                            >
                                {row.status}
                            </span>
                            <Box textAlign="center" ml="0px" display="flex" justifyContent="center" gap="8px">
                                {row.status === "Pending" ? (
                                    <>
                                        {/*Accept Button */}
                                        <IconButton
                                            disableRipple
                                            onClick={() => handleApprove(row)}
                                            sx={{
                                                backgroundColor: "#172224",
                                                color: "green",
                                                width: 40,
                                                height: 36,
                                                borderRadius: "50%",
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor: "#388E3C",
                                                    color: "#fff",
                                                    transform: "translateY(-3px)",
                                                },
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                            }}
                                        >
                                            <RiCheckFill style={{fontSize: 20, transform: "scale(1.2)"}}/>
                                        </IconButton>

                                        {/* Reject Button */}
                                        <IconButton
                                            disableRipple
                                            onClick={() => handleRejectClick(row)}
                                            sx={{
                                                backgroundColor: "#172224",
                                                color: "red",
                                                width: 40,
                                                height: 36,
                                                borderRadius: "50%",
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor: "#D32F2F",
                                                    color: "#fff",
                                                    transform: "translateY(-3px)",
                                                },
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                            }}
                                        >
                                            <RiCloseFill style={{fontSize: 20, transform: "scale(1.2)"}}/>
                                        </IconButton>
                                    </>
                                ) : (
                                    <IconButton
                                        onClick={() => handleView(row)} sx={{
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
                                )}
                            </Box>
                        </Box>
                    ))
                    )}
                </Box>
            </Box>

            <BoxModal open={openModal} onClose={() => { setOpenModal(false); setIsEditing(false); }}>
                {selectedRow && (
                    <Box sx={{ display: "flex", flexDirection: "column", color: theme.palette.text.primary }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 2
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#fff"
                                }}
                            >
                                Timesheet Details
                            </Typography>
                            {!isEditing ? (
                                <IconButton
                                    onClick={() => setIsEditing(true)}
                                    sx={{
                                        backgroundColor: "#172224",
                                        color: "#fff",
                                        "&:hover": { backgroundColor: "#2E3B3D" },
                                    }}
                                >
                                    <RiPencilFill />
                                </IconButton>
                            ) : (
                                <IconButton
                                    onClick={() => showSaveConfirmation('edit')}
                                    sx={{
                                        backgroundColor: "#388E3C",
                                        color: "#fff",
                                        "&:hover": { backgroundColor: "#4CAF50" },
                                    }}
                                >
                                    <RiSaveFill />
                                </IconButton>
                            )}
                        </Box>

                        {/* Employee Field */}
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}>
                                Employee
                            </Typography>
                            <TextField
                                value={selectedRow.employee}
                                fullWidth
                                variant="outlined"
                                size="small"
                                InputProps={{
                                    readOnly: true,
                                }}
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

                        {/* Grid for other fields */}
                        <Box
                            display="grid"
                            gridTemplateColumns={{md: "1fr 1fr"}}
                            gap={1}
                            mt={2}
                        >
                            {/* Date */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}>
                                    Date
                                </Typography>
                                <TextField
                                    value={selectedRow.date}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                    }}
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

                            {/* Status */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}>
                                    Status
                                </Typography>
                                <TextField
                                    value={selectedRow.status}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                    }}
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

                        <Box
                            display="grid"
                            gridTemplateColumns={{md: "1fr 1fr"}}
                            gap={1}
                            mt={2}
                        >
                            {/* Time In */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}
                                >
                                    Time In
                                </Typography>
                                <TextField
                                    type={isEditing ? "time" : "text"}
                                    value={isEditing ? editedRow.timeIn : formatTime(selectedRow.timeIn)}
                                    onChange={(e) => setEditedRow({...editedRow, timeIn: e.target.value})}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: !isEditing,
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: isEditing ? "#fff" : "#cacace",
                                            "& fieldset": { border: isEditing ? "2px solid #388E3C" : "none" },
                                        },
                                        "& .MuiInputBase-input": { color: "#1F2829" },
                                    }}
                                />
                            </Box>

                            {/* Time Out */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}
                                >
                                    Time Out
                                </Typography>
                                <TextField
                                    type={isEditing ? "time" : "text"}
                                    value={isEditing ? editedRow.timeOut : formatTime(selectedRow.timeOut)}
                                    onChange={(e) => setEditedRow({...editedRow, timeOut: e.target.value})}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: !isEditing,
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "10px",
                                            backgroundColor: isEditing ? "#fff" : "#cacace",
                                            "& fieldset": { border: isEditing ? "2px solid #388E3C" : "none" },
                                        },
                                        "& .MuiInputBase-input": { color: "#1F2829" },
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
                            {/* Total Hours */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}
                                >
                                    Total Hours
                                </Typography>
                                <TextField
                                    value={isEditing ? calculateHours(editedRow.timeIn, editedRow.timeOut, editedRow.break_duration || 1).totalHours : selectedRow.totalHours}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                    }}
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

                            {/* Overtime */}
                            <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                <Typography
                                    sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}
                                >
                                    Overtime (auto-calculated)
                                </Typography>
                                <TextField
                                    value={isEditing ? calculateHours(editedRow.timeIn, editedRow.timeOut, editedRow.break_duration || 1).overtime : selectedRow.overtime}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                    }}
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

                        {/* Break Duration when editing */}
                        {isEditing && (
                            <Box mt={2}>
                                <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                                    <Typography
                                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}
                                    >
                                        Break (hours)
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={editedRow.break_duration || 1}
                                        onChange={(e) => setEditedRow({...editedRow, break_duration: parseFloat(e.target.value) || 0})}
                                        variant="outlined"
                                        size="small"
                                        inputProps={{ step: 0.5, min: 0, max: 4 }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "10px",
                                                backgroundColor: "#fff",
                                                "& fieldset": { border: "2px solid #388E3C" },
                                            },
                                            "& .MuiInputBase-input": { color: "#1F2829" },
                                        }}
                                    />
                                </Box>
                            </Box>
                        )}

                        {/* Save Button when editing */}
                        {isEditing && (
                            <Box display="flex" justifyContent="center" mt={3}>
                                <Box
                                    component="button"
                                    onClick={() => showSaveConfirmation('edit')}
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
                                    Save Changes
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
            </BoxModal>

            {/* ADD MANUAL ENTRY MODAL */}
            <BoxModal open={openAddModal} onClose={() => setOpenAddModal(false)}>
                <Box sx={{ display: "flex", flexDirection: "column", color: "#fff", }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "24px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 1
                        }}
                    >
                        Add Manual Time Entry
                    </Typography>

                    {/* Employee Select */}
                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mb: 2}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif",                             color: "#fff",
                            fontSize: "16px"}}>
                            Employee *
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={newEntry.employee_id}
                                onChange={(e) => setNewEntry({...newEntry, employee_id: e.target.value})}
                                sx={{
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    "& .MuiSelect-select": { color: "#1F2829" },
                                }}
                            >
                                {employees.map((emp) => (
                                    <MenuItem key={emp.employee_id} value={emp.employee_id}>
                                        {emp.full_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Date */}
                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mb: 2}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif",
                            color: "#fff",
                            fontSize: "16px"}}>
                            Date *
                        </Typography>
                        <TextField
                            type="date"
                            value={newEntry.date}
                            onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                            fullWidth
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                                "& input::-webkit-calendar-picker-indicator": { filter: theme.palette.mode === "dark" ? "invert(1)" : "none" },
                            }}
                        />
                    </Box>

                    {/* Time In / Time Out */}
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif",
                                color: "#fff", fontSize: "16px"}}>
                                Time In *
                            </Typography>
                            <TextField
                                type="time"
                                value={newEntry.time_in}
                                onChange={(e) => setNewEntry({...newEntry, time_in: e.target.value})}
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                    "& input::-webkit-calendar-picker-indicator": { filter: theme.palette.mode === "dark" ? "invert(1)" : "none" },
                                }}
                            />
                        </Box>
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}>
                                Time Out *
                            </Typography>
                            <TextField
                                type="time"
                                value={newEntry.time_out}
                                onChange={(e) => setNewEntry({...newEntry, time_out: e.target.value})}
                                fullWidth
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        backgroundColor: "#cacace",
                                        "& fieldset": { border: "none" },
                                    },
                                    "& .MuiInputBase-input": { color: "#1F2829" },
                                    "& input::-webkit-calendar-picker-indicator": { filter: theme.palette.mode === "dark" ? "invert(1)" : "none" },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Break / Overtime */}
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}>
                                Break (hours)
                            </Typography>
                            <TextField
                                type="number"
                                value={newEntry.break_duration}
                                onChange={(e) => setNewEntry({...newEntry, break_duration: parseFloat(e.target.value) || 0})}
                                fullWidth
                                size="small"
                                inputProps={{ step: 0.5, min: 0 }}
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
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}>
                                Overtime (auto)
                            </Typography>
                            <TextField
                                type="number"
                                value={newEntry.overtime_hours}
                                fullWidth
                                size="small"
                                disabled
                                inputProps={{ step: 0.5, min: 0 }}
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

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}>
                            Calculated Hours:
                        </Typography>
                        <Box sx={{
                            backgroundColor: "#cacace",
                            borderRadius: "12px",
                            p: 1.5,
                            mb: 2,
                            display: "flex",
                            flexDirection: "column",
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                                <Typography sx={{ color: "#388E3C", fontSize: "18px", fontFamily: "'TTHoves-Bold', sans-serif" }}>
                                    Total: {calculateHours(newEntry.time_in, newEntry.time_out, newEntry.break_duration).totalHours}h
                                </Typography>
                                <Typography sx={{ color: "#F57C00", fontSize: "18px", fontFamily: "'TTHoves-Bold', sans-serif" }}>
                                    Overtime: {calculateHours(newEntry.time_in, newEntry.time_out, newEntry.break_duration).overtime}h
                                </Typography>
                        </Box>
                    </Box>

                    {/* Remarks */}
                    <Box sx={{display: "flex", flexDirection: "column", gap: 1, mb: 2}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#fff", fontSize: "16px"}}>
                            Remarks
                        </Typography>
                        <TextField
                            value={newEntry.remarks}
                            onChange={(e) => setNewEntry({...newEntry, remarks: e.target.value})}
                            fullWidth
                            size="small"
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

                <Box display="flex" justifyContent="center" mt={1}>
                    <Box
                        component="button"
                        onClick={() => showSaveConfirmation('add')}
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
                        Add Entry
                    </Box>
                </Box>
                </Box>
            </BoxModal>

            {/* REJECTION MODAL */}
            <BoxModal open={openRejectModal} onClose={() => { setOpenRejectModal(false); setRejectionReason(""); }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "24px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 1
                        }}
                    >
                        Reject Timesheet
                    </Typography>
                    
                    {rejectingRow && (
                        <Typography
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: "#fff",
                                mb: 1
                            }}
                        >
                            Rejecting timesheet for <strong>{rejectingRow.employee}</strong> on {rejectingRow.date}
                        </Typography>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                        <Typography sx={{ fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#a32020", fontSize: "16px" }}>
                            Reason for Rejection *
                        </Typography>
                        <TextField
                            multiline
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
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

                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignContent:"center" }}>
                        <Box
                            component="button"
                            onClick={() => { setOpenRejectModal(false); setRejectionReason(""); }}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#a0a0a0" }
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            component="button"
                            onClick={handleConfirmReject}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#8b1a1a",
                                color: "#fff",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: "#a32020",
                                },
                            }}
                        >
                            Confirm Reject
                        </Box>
                    </Box>
                </Box>
            </BoxModal>

            {/* EXPORT MODAL */}
            <BoxModal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)}>
                {renderExportModalContent()}
            </BoxModal>

            {/* SAVE CONFIRMATION MODAL */}
            <BoxModal open={saveConfirmModalOpen} onClose={() => setSaveConfirmModalOpen(false)} width={400} height={200}>
                <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: "24px",
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: "#fff",
                                mb: 1
                            }}
                        >
                            Confirm Save
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: "'TTHoves-Bold', sans-serif",
                                color: "#fff",
                                mb: 2
                            }}
                        >
                            {pendingSaveAction === 'edit'
                                ? "Are you sure you want to save the changes to this timesheet entry?"
                                : "Are you sure you want to add this new timesheet entry?"}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignContent:"center" }}>
                        <Box
                            component="button"
                            onClick={() => setSaveConfirmModalOpen(false)}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#a0a0a0" }
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            component="button"
                            onClick={confirmSave}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#172224",
                                color: "#fff",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#1f2f31" }
                            }}
                        >
                            Confirm
                        </Box>
                    </Box>
                </Box>
            </BoxModal>
        </Box>
    );
};

export default ManagerTimesheets;
