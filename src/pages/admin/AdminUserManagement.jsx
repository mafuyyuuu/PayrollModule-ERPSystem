/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect } from "react";
import {
    Modal, Box, IconButton, MenuItem, Select, TextField, Typography, useTheme, CircularProgress, Button
} from "@mui/material";
import {RiPencilFill, RiUploadCloud2Line, RiCloseLine} from "react-icons/ri";
import SearchBar from "../../components/SearchBar.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

export default function AdminUserManagement() {
    const theme = useTheme();

    const videoRef = useRef();
    const fileInputRef = useRef();
    const [status, setStatus] = useState("Initializing camera...");
    const [loading, setLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState(null);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saveConfirmModalOpen, setSaveConfirmModalOpen] = useState(false);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [availableEmployees, setAvailableEmployees] = useState([]);

    // Role options
    const roleOptions = [
        { id: 1, name: "Admin" },
        { id: 2, name: "Manager" },
        { id: 3, name: "Payroll" },
        { id: 4, name: "Employee" }
    ];

    // Fetch users from database
    useEffect(() => {
        fetchUsers();
        fetchEmployeeTypes();
        fetchDepartments();
        fetchPositions();
        fetchAvailableEmployees();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableEmployees = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/available-employees');
            if (response.ok) {
                const data = await response.json();
                setAvailableEmployees(data);
            }
        } catch (error) {
            console.error('Error fetching available employees:', error);
        }
    };

    const fetchEmployeeTypes = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/employee-types');
            if (response.ok) {
                const data = await response.json();
                setEmployeeTypes(data);
            } else {
                // Try to get from API
                setEmployeeTypes([]);
            }
        } catch (error) {
            console.error('Error fetching employee types:', error);
            // No fallback data
            setEmployeeTypes([]);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/departments');
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/positions');
            if (response.ok) {
                const data = await response.json();
                setPositions(data);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
        }
    };

    const handleAddUser = () => {
        setSelectedUser({
            id: "", 
            employeeId: "",
            firstName: "",
            middleName: "",
            lastName: "",
            username: "", 
            email: "", 
            role: "", 
            roleId: "", 
            status: "Active",
            password: ""
        });
        setUploadedPhotos([]);
        setIsEditing(false);
        fetchAvailableEmployees(); // Refresh list when opening modal
        setUserModalOpen(true);
    };

    const handleEmployeeSelect = (employeeId) => {
        const employee = availableEmployees.find(e => e.employee_id === parseInt(employeeId));
        if (employee) {
            setSelectedUser(prev => ({
                ...prev,
                employeeId: employee.employee_id,
                firstName: employee.first_name,
                middleName: employee.middle_name || "",
                lastName: employee.last_name,
                email: employee.email || "",
                username: employee.email ? employee.email.split('@')[0] : `${employee.first_name.toLowerCase()}.${employee.last_name.toLowerCase()}`
            }));
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser({
            ...user,
            firstName: user.firstName || "",
            middleName: user.middleName || "",
            lastName: user.lastName || "",
            roleId: user.role_id || user.roleId || "",
            employeeId: user.employeeId || user.employee_id || ""
        });
        setUploadedPhotos([]);
        setIsEditing(true);
        setUserModalOpen(true);
    };

    const handleCloseModal = () => {
        setUserModalOpen(false);
        setUploadedPhotos([]);
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));
        setUploadedPhotos(prev => [...prev, ...newPhotos]);
    };

    const removePhoto = (index) => {
        setUploadedPhotos(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const validateAndShowSaveConfirm = () => {
        // Validate required fields
        if (!isEditing && !selectedUser?.employeeId) {
            alert('Please select an employee');
            return;
        }
        if (!selectedUser?.username?.trim()) {
            alert('Username is required');
            return;
        }
        if (!selectedUser?.email?.trim()) {
            alert('Email is required');
            return;
        }
        if (!selectedUser?.roleId) {
            alert('Role is required');
            return;
        }
        if (!isEditing && !selectedUser?.password?.trim()) {
            alert('Password is required for new users');
            return;
        }
        // Show save confirmation modal
        setSaveConfirmModalOpen(true);
    };

    const handleSaveUser = async () => {
        setSaveConfirmModalOpen(false);
        setSaving(true);
        try {
            const url = isEditing 
                ? `http://localhost:8080/api/admin/users/${selectedUser.id}`
                : 'http://localhost:8080/api/admin/users';
            
            const method = isEditing ? 'PUT' : 'POST';
            
            const userData = {
                username: selectedUser.username.trim(),
                email: selectedUser.email.trim(),
                role_id: parseInt(selectedUser.roleId),
                status: selectedUser.status || 'Active',
                password: isEditing ? undefined : selectedUser.password,
                employee_id: selectedUser.employeeId ? parseInt(selectedUser.employeeId) : null
            };

            console.log('Sending user data:', userData);

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                // Upload photos if any (only for Employee role)
                const empId = result.employee_id || selectedUser.employeeId;
                if (uploadedPhotos.length > 0 && empId && selectedUser.roleId === 4) {
                    const formData = new FormData();
                    uploadedPhotos.forEach((photo) => {
                        formData.append('photos', photo.file);
                    });
                    formData.append('employee_id', empId);
                    formData.append('role_id', selectedUser.roleId);

                    const photoResponse = await fetch('http://localhost:8080/api/admin/users/photos', {
                        method: 'POST',
                        body: formData
                    });

                    const photoResult = await photoResponse.json();
                    if (!photoResult.success) {
                        console.error('Photo upload failed:', photoResult.error);
                    }
                }

                fetchUsers();
                handleCloseModal();
            } else {
                alert(result.message || 'Failed to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleShowDeleteConfirm = () => {
        setDeleteConfirmModalOpen(true);
    };

    const handleDeleteUser = async () => {
        setDeleteConfirmModalOpen(false);
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchUsers();
                handleCloseModal();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Filter state for role/status
    const [roleFilter, setRoleFilter] = useState("all");

    // Get unique roles and statuses for filter buttons
    const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))];
    const uniqueStatuses = [...new Set(users.map(u => u.status).filter(Boolean))];

    // Filter users by search term and role/status filter
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || 
            user.role === roleFilter || 
            user.status === roleFilter;
        return matchesSearch && matchesRole;
    });

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
                    mb: 2,
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
                    User Management
                </Typography>
            </Box>

            {/* Filter Buttons */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                        onClick={() => setRoleFilter("all")}
                        sx={{
                            fontSize: "14px",
                            px: 3,
                            py: 1,
                            borderRadius: "10px",
                            textTransform: "none",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            backgroundColor: roleFilter === "all" ? "#334042" : "#e0e0e0",
                            color: roleFilter === "all" ? "#fff" : "#333",
                            opacity: roleFilter === "all" ? 1 : 0.6,
                            "&:hover": { backgroundColor: roleFilter === "all" ? "#2a3435" : "#d0d0d0" },
                        }}
                    >
                        All Users
                    </Button>
                    {uniqueRoles.map((role) => (
                        <Button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            sx={{
                                fontSize: "14px",
                                px: 3,
                                py: 1,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                backgroundColor: roleFilter === role ? "#334042" : "#e0e0e0",
                                color: roleFilter === role ? "#fff" : "#333",
                                opacity: roleFilter === role ? 1 : 0.6,
                                "&:hover": { backgroundColor: roleFilter === role ? "#2a3435" : "#d0d0d0" },
                            }}
                        >
                            {role}
                        </Button>
                    ))}
                    {uniqueStatuses.map((status) => (
                        <Button
                            key={status}
                            onClick={() => setRoleFilter(status)}
                            sx={{
                                fontSize: "14px",
                                px: 3,
                                py: 1,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontFamily: "'TTHoves-DemiBold', sans-serif",
                                backgroundColor: roleFilter === status ? "#334042" : "#e0e0e0",
                                color: roleFilter === status ? "#fff" : "#333",
                                opacity: roleFilter === status ? 1 : 0.6,
                                "&:hover": { backgroundColor: roleFilter === status ? "#2a3435" : "#d0d0d0" },
                            }}
                        >
                            {status}
                        </Button>
                    ))}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <SearchBar 
                        placeholder="Enter Username" 
                        width="300px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ActionButton text="Add User" width="200px" onClick={handleAddUser}/>
                </Box>
            </Box>

            <Box
                sx={{
                    height: "calc(100% - 100px)",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
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
                    <span style={{textAlign: "center"}}>User ID</span>
                    <span style={{textAlign: "center"}}>Name</span>
                    <span style={{textAlign: "center"}}>Role</span>
                    <span style={{textAlign: "center"}}>Status</span>
                    <span style={{textAlign: "center"}}>Actions</span>
                </Box>

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
                        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                            <CircularProgress />
                        </Box>
                    ) : filteredUsers.length === 0 ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                            <Typography sx={{ color: theme.palette.text.secondary }}>No users found</Typography>
                        </Box>
                    ) : (
                        filteredUsers.map((user, i) => (<Box
                            key={user.id || i}
                            sx={{
                                marginTop: "10px",
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
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
                            <span>{user.id}</span>
                            <span>{user.name}</span>
                            <span>{user.role}</span>
                            <span>{user.status}</span>
                            <Box sx={{display: "flex", justifyContent: "center", gap: "8px"}}>
                                <IconButton
                                    onClick={() => handleEditUser(user)}
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
                        </Box>))
                    )}
                </Box>
            </Box>
            <BoxModal
                open={userModalOpen}
                onClose={handleCloseModal}
                width="600px"
                height="auto"
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2,
                    }}
                >
                    {isEditing ? "Edit User" : "Add New User"}
                </Typography>

                {/* Employee Selection (only for new users) */}
                {!isEditing && (
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, mb: 2}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            Select Employee *
                        </Typography>
                        <Select
                            value={selectedUser?.employeeId || ""}
                            onChange={(e) => handleEmployeeSelect(e.target.value)}
                            displayEmpty
                            size="small"
                            sx={{
                                borderRadius: "10px",
                                backgroundColor: "#cacace",
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                "& .MuiSelect-select": { color: "#1F2829" },
                                "& .MuiSelect-icon": { color: "#1F2829" },
                            }}
                            renderValue={(selected) => {
                                if (!selected) return <span style={{color: "#888"}}>Select an employee</span>;
                                const emp = availableEmployees.find(e => e.employee_id === parseInt(selected));
                                return emp ? `${emp.first_name} ${emp.last_name}` : selected;
                            }}
                        >
                            {availableEmployees.length === 0 ? (
                                <MenuItem disabled>No employees without accounts</MenuItem>
                            ) : (
                                availableEmployees.map((emp) => (
                                    <MenuItem key={emp.employee_id} value={emp.employee_id}>
                                        {emp.first_name} {emp.last_name} - {emp.department || 'No Dept'}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </Box>
                )}

                {/* Row 1: Name display (read-only when creating, shows selected employee) */}
                <Box sx={{display: "flex", gap: 1, mb: 2}}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            First Name
                        </Typography>
                        <TextField
                            placeholder="First name"
                            value={selectedUser?.firstName || ""}
                            onChange={(e) => setSelectedUser(prev => ({...prev, firstName: e.target.value}))}
                            variant="outlined"
                            size="small"
                            disabled={!isEditing}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                                "& .MuiInputBase-input.Mui-disabled": { color: "#1F2829", WebkitTextFillColor: "#1F2829" },
                            }}
                        />
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            Middle Name
                        </Typography>
                        <TextField
                            placeholder="Middle name"
                            value={selectedUser?.middleName || ""}
                            onChange={(e) => setSelectedUser(prev => ({...prev, middleName: e.target.value}))}
                            variant="outlined"
                            size="small"
                            disabled={!isEditing}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                                "& .MuiInputBase-input.Mui-disabled": { color: "#1F2829", WebkitTextFillColor: "#1F2829" },
                            }}
                        />
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            Last Name
                        </Typography>
                        <TextField
                            placeholder="Last name"
                            value={selectedUser?.lastName || ""}
                            onChange={(e) => setSelectedUser(prev => ({...prev, lastName: e.target.value}))}
                            variant="outlined"
                            size="small"
                            disabled={!isEditing}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                    backgroundColor: "#cacace",
                                    "& fieldset": { border: "none" },
                                },
                                "& .MuiInputBase-input": { color: "#1F2829" },
                                "& .MuiInputBase-input.Mui-disabled": { color: "#1F2829", WebkitTextFillColor: "#1F2829" },
                            }}
                        />
                    </Box>
                </Box>

                {/* Row 2: Username and Email */}
                <Box sx={{display: "flex", gap: 1, mb: 2}}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            Username *
                        </Typography>
                        <TextField
                            placeholder="Enter username"
                            value={selectedUser?.username || ""}
                            onChange={(e) => setSelectedUser(prev => ({...prev, username: e.target.value}))}
                            variant="outlined"
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
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            Email *
                        </Typography>
                        <TextField
                            placeholder="Enter email"
                            value={selectedUser?.email || ""}
                            onChange={(e) => setSelectedUser(prev => ({...prev, email: e.target.value}))}
                            variant="outlined"
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
                </Box>

                {/* Row 3: Password (only for new users) */}
                {!isEditing && (
                    <Box sx={{display: "flex", gap: 1, mb: 2}}>
                        <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
                            <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                                Password *
                            </Typography>
                            <TextField
                                type="password"
                                placeholder="Enter password"
                                value={selectedUser?.password || ""}
                                onChange={(e) => setSelectedUser(prev => ({...prev, password: e.target.value}))}
                                variant="outlined"
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
                    </Box>
                )}

                {/* Row 4: Role and Status */}
                <Box sx={{display: "flex", gap: 1, mb: 2}}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            Role *
                        </Typography>
                        <Select
                            value={selectedUser?.roleId || ""}
                            onChange={(e) => setSelectedUser(prev => ({
                                ...prev,
                                roleId: e.target.value,
                                role: roleOptions.find(r => r.id === e.target.value)?.name || ""
                            }))}
                            displayEmpty
                            size="small"
                            sx={{
                                backgroundColor: "#cacace",
                                borderRadius: "10px",
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                "& .MuiSelect-select": { color: "#1F2829" },
                                "& .MuiSelect-icon": { color: "#1F2829" },
                            }}
                            renderValue={(selected) => {
                                if (!selected) return <span style={{color: "#828689"}}>Select Role</span>;
                                return roleOptions.find(r => r.id === selected)?.name || selected;
                            }}
                        >
                            {roleOptions.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px"}}>
                            Status
                        </Typography>
                        <Select
                            value={selectedUser?.status || "Active"}
                            onChange={(e) => setSelectedUser(prev => ({...prev, status: e.target.value}))}
                            size="small"
                            sx={{
                                backgroundColor: "#cacace",
                                borderRadius: "10px",
                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                "& .MuiSelect-select": { color: "#1F2829" },
                                "& .MuiSelect-icon": { color: "#1F2829" },
                            }}
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </Box>
                </Box>

                {/* Photo Upload Section - Only shown when role is Employee (roleId === 4) */}
                {selectedUser?.roleId === 4 && (
                    <Box sx={{mb: 2}}>
                        <Typography sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "14px", mb: 1}}>
                            Employee Photos (for Face Recognition)
                        </Typography>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                        />
                                
                        {/* Photo Upload Container with photos inside */}
                        <Box
                            sx={{
                                backgroundColor: "rgba(255,255,255,0.1)",
                                borderRadius: "10px",
                                border: "2px dashed rgba(255,255,255,0.3)",
                                width: "100%",
                                minHeight: "120px",
                                p: 2,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                alignItems: "center",
                                justifyContent: uploadedPhotos.length === 0 ? "center" : "flex-start",
                            }}
                        >
                            {/* Show uploaded photos inside the container */}
                            {uploadedPhotos.map((photo, index) => (
                                <Box key={index} sx={{ position: "relative" }}>
                                    <img
                                        src={photo.preview}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                            objectFit: "cover",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <IconButton
                                        onClick={() => removePhoto(index)}
                                        sx={{
                                            position: "absolute",
                                            top: -8,
                                            right: -8,
                                            backgroundColor: "#f44336",
                                            color: "#fff",
                                            width: 20,
                                            height: 20,
                                            "&:hover": { backgroundColor: "#d32f2f" }
                                        }}
                                    >
                                        <RiCloseLine style={{ fontSize: "14px" }} />
                                    </IconButton>
                                </Box>
                            ))}
                            
                            {/* Add button - shows + when photos exist, or upload prompt when empty */}
                            <Box
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    width: uploadedPhotos.length > 0 ? "80px" : "100%",
                                    height: uploadedPhotos.length > 0 ? "80px" : "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    borderRadius: "8px",
                                    backgroundColor: uploadedPhotos.length > 0 ? "rgba(255,255,255,0.15)" : "transparent",
                                    border: uploadedPhotos.length > 0 ? "2px dashed rgba(255,255,255,0.4)" : "none",
                                    transition: "all 0.2s ease",
                                    py: uploadedPhotos.length > 0 ? 0 : 2,
                                    "&:hover": {
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                    }
                                }}
                            >
                                {uploadedPhotos.length > 0 ? (
                                    <Typography sx={{ fontSize: "32px", color: "#fff", fontWeight: "bold" }}>+</Typography>
                                ) : (
                                    <>
                                        <RiUploadCloud2Line style={{ fontSize: "24px", color: "#fff", marginBottom: "8px" }} />
                                        <Typography sx={{ color: "#fff", fontSize: "14px" }}>
                                            Click to upload photos
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                    {isEditing && (
                        <Box
                            component="button"
                            onClick={handleShowDeleteConfirm}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#8b1a1a",
                                color: "#fff",
                                padding: "10px 30px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: "#a32020",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            Delete
                        </Box>
                    )}
                    <Box
                        onClick={validateAndShowSaveConfirm}
                        component="button"
                        disabled={saving}
                        sx={{
                            fontSize: "16px",
                            backgroundColor: saving ? "#666" : "#172224",
                            color: "#fff",
                            padding: "10px 30px",
                            borderRadius: "15px",
                            cursor: saving ? "not-allowed" : "pointer",
                            border: "none",
                            transition: "all 0.3s ease",
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            "&:hover": {
                                backgroundColor: saving ? "#666" : "#1f2f31",
                                transform: saving ? "none" : "translateY(-2px)",
                            },
                        }}
                    >
                        {saving ? "Saving..." : "Save"}
                    </Box>
                </Box>
            </BoxModal>

            {/* Save Confirmation Modal */}
            <Modal
                open={saveConfirmModalOpen}
                onClose={() => setSaveConfirmModalOpen(false)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        bgcolor: "rgba(23, 34, 36, 0.95)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        borderRadius: 3,
                        p: 4,
                        width: { xs: "90%", sm: "400px" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            fontSize: "22px",
                            color: "#FFFFFF",
                            mb: 2,
                            textAlign: "center",
                        }}
                    >
                        Confirm Save
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            fontSize: "16px",
                            color: "#ccc",
                            mb: 3,
                            textAlign: "center",
                        }}
                    >
                        Are you sure you want to save this user?
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Box
                            component="button"
                            onClick={() => setSaveConfirmModalOpen(false)}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#555",
                                color: "#fff",
                                padding: "10px 30px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: "#666",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            component="button"
                            onClick={handleSaveUser}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#172224",
                                color: "#fff",
                                padding: "10px 30px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: "#1f2f31",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            Confirm
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={deleteConfirmModalOpen}
                onClose={() => setDeleteConfirmModalOpen(false)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        bgcolor: "rgba(23, 34, 36, 0.95)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        borderRadius: 3,
                        p: 4,
                        width: { xs: "90%", sm: "400px" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            fontSize: "22px",
                            color: "#FFFFFF",
                            mb: 2,
                            textAlign: "center",
                        }}
                    >
                        Confirm Delete
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            fontSize: "16px",
                            color: "#ccc",
                            mb: 3,
                            textAlign: "center",
                        }}
                    >
                        Are you sure you want to delete this user? This action cannot be undone.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Box
                            component="button"
                            onClick={() => setDeleteConfirmModalOpen(false)}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#555",
                                color: "#fff",
                                padding: "10px 30px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: "#666",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            component="button"
                            onClick={handleDeleteUser}
                            sx={{
                                fontSize: "16px",
                                backgroundColor: "#8b1a1a",
                                color: "#fff",
                                padding: "10px 30px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: "#a32020",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            Delete
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <Modal
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: (theme) =>
                            theme.palette.mode === "dark"
                                ? "0 8px 32px rgba(0,0,0,0.6)"
                                : "0 8px 32px rgba(0,0,0,0.1)",
                        borderRadius: 3,
                        p: 4,
                        width: { xs: "90%", sm: "600px", md: "800px" },
                        height: { xs: "auto", sm: "70%", md: "600px" },
                        maxHeight: "90vh",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            fontSize: "30px",
                            color: "#FFFFFF",
                            mb: 2,
                            textAlign: "center",
                        }}
                    >
                        Facial Recognition
                    </Typography>

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        width="400"
                        height="300"
                        style={{ borderRadius: "10px", border: "2px solid #ccc" }}
                    />

                    <img
                        id="face-preview"
                        alt="Face preview"
                        style={{ marginTop: "10px", width: "120px", borderRadius: "10px" }}
                    />

                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            fontSize: "18px",
                            color: "#FFFFFF",
                            mb: 2,
                            mt: 2,
                            textAlign: "center",
                        }}
                    >
                        {status}
                    </Typography>

                    <ActionButton
                        text={loading ? "Processing..." : "Recognition..."}
                        width="200px"
                        disabled={loading}
                    />
                </Box>
            </Modal>
        </Box>
    );
}
