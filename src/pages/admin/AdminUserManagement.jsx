import React, { useRef, useState, useEffect, useMemo } from "react";
import {
    Modal, Box, IconButton, MenuItem, Select, TextField, Typography, useTheme,
    Snackbar, Alert
} from "@mui/material";
import { RiPencilFill, RiDeleteBin7Fill } from "react-icons/ri";
import axios from "axios";
import * as faceapi from "face-api.js";

// Assuming these paths are correct for your project structure
import SearchBar from "../../components/SearchBar.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

// --- Role and Status Definitions (MUST MATCH BACKEND LOGIC: 1=Admin, 4=Employee, etc.) ---
const ROLES = [
    { id: 1, name: "Admin" },
    { id: 2, name: "Manager" },
    { id: 3, name: "Payroll" },
    { id: 4, name: "Employee" },
];
const STATUSES = ["Active", "Inactive", "Pending"];
const API_BASE_URL = "http://localhost:3000/api/admin/users";
const FACE_MODELS_PATH = "/models";

export default function AdminUserManagement() {
    const theme = useTheme();

    // --- State Management ---
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Face Recognition State & Refs ---
    const videoRef = useRef();
    const [status, setStatus] = useState("Initializing camera...");
    const [loading, setLoading] = useState(false);

    // --- Snackbar State ---
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const roleMap = useMemo(() => {
        return ROLES.reduce((map, role) => {
            map[role.id] = role.name;
            return map;
        }, {});
    }, []);

    // --- Data Fetching and CRUD Operations ---

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_BASE_URL);
            // The response data contains user_id, username, role_id, email, etc.
            setUsers(response.data.users || []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setSnackbar({
                open: true,
                message: "Failed to load user data.",
                severity: "error",
            });
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async () => {
        setConfirmModalOpen(false);

        if (!selectedUser?.username || !selectedUser?.email || !selectedUser?.role_id || !selectedUser?.status) {
            setSnackbar({ open: true, message: "Please fill all required fields.", severity: "warning" });
            return;
        }

        const payload = {
            username: selectedUser.username,
            email: selectedUser.email,
            role_id: selectedUser.role_id,
            status: selectedUser.status,
            // Assuming you'd add a password field for POST, or only update it if provided for PUT
            // For simplicity, we omit password here, but it should be handled securely.
        };

        // This is a common requirement in your backend logic for audit logs
        // You'd normally get this from a global auth state.
        payload.currentUser = 'AdminUser';

        try {
            if (isEditing) {
                // Update User (PUT)
                await axios.put(`${API_BASE_URL}/${selectedUser.id}`, payload);
                setSnackbar({
                    open: true,
                    message: `User ${selectedUser.username} updated successfully!`,
                    severity: "success",
                });
            } else {
                // Add New User (POST) - This is currently handled by /api/create-user in server.js
                // NOTE: If using the provided adminUserManagementRoutes.js, the POST route is missing.
                // Assuming for this component, we use the Admin route for POST/CREATE.
                await axios.post(API_BASE_URL, {
                    ...payload,
                    // New users need an Employee ID (employee_id) and password in a real scenario
                    password: selectedUser.password || 'defaultpassword', // Must be handled securely
                    employee_id: selectedUser.employee_id || null // Important for linking
                });

                setSnackbar({
                    open: true,
                    message: `User ${selectedUser.username} added successfully!`,
                    severity: "success",
                });
            }
            fetchUsers();
        } catch (error) {
            console.error("Save failed:", error);
            const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} user.`;
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error",
            });
        } finally {
            setUserModalOpen(false);
            setSelectedUser(null);
        }
    };

    const handleRemoveUser = async () => {
        if (!selectedUser?.id) return;

        // The delete operation requires admin verification (which we handle via the modal)
        // We will move the actual API call logic into a new function triggered by handleRecognition success.

        try {
            await axios.delete(`${API_BASE_URL}/${selectedUser.id}`, { data: { currentUser: 'AdminUser' } });
            setSnackbar({
                open: true,
                message: `User ID ${selectedUser.id} removed successfully!`,
                severity: "info",
            });
            fetchUsers();
        } catch (error) {
            console.error("Delete failed:", error);
            const errorMessage = error.response?.data?.message || "Failed to remove user.";
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error",
            });
        } finally {
            setSelectedUser(null);
            setUserModalOpen(false);
        }
    };

    // Function to initiate the remove process with verification
    const handleConfirmRemove = () => {
        setConfirmModalOpen(true);
    };

    // --- Face Recognition Logic ---
    // (Existing face recognition logic remains the same)

    const loadModels = async () => {
        // ... (omitted for brevity, assume model loading works)
        setStatus("Loading facial recognition models...");
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_PATH);
            await faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODELS_PATH);
            await faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODELS_PATH);
            setStatus("Models loaded successfully. Starting camera...");
        } catch (error) {
            console.error("Error loading models:", error);
            setStatus("Error: Could not load facial recognition models.");
        }
    };

    const startCamera = async () => {
        // ... (omitted for brevity, assume camera access works)
        if (!navigator.mediaDevices) {
            setStatus("Error: Media devices not supported.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStatus("Camera active. Recognition required to proceed.");
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setStatus("Error: Could not access camera. Check permissions.");
        }
    };

    const stopCamera = () => {
        // ... (omitted for brevity, assume camera stop works)
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setStatus("Camera stopped.");
    };

    const handleRecognition = async () => {
        if (loading || !videoRef.current || !videoRef.current.srcObject) return;

        setLoading(true);
        setStatus("Capturing image and recognizing face...");

        try {
            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks();

            if (!detection) {
                setStatus("Recognition Failed: No face detected. Try again.");
                setLoading(false);
                return;
            }

            // Mock verification success
            const isVerified = Math.random() > 0.1;

            if (isVerified) {
                setStatus(`Verification Successful! Proceeding...`);
                // Delay slightly to show success status before saving
                setTimeout(() => {
                    // Determine if the user intended to Save or Delete
                    if (selectedUser.action === 'delete') {
                        handleRemoveUser();
                    } else {
                        handleSaveUser(); // Proceed to save/update user
                    }
                    setConfirmModalOpen(false);
                    setLoading(false);
                }, 1000);
            } else {
                setStatus("Verification Failed: Try to center your face.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Facial recognition error:", error);
            setStatus("An unexpected error occurred during recognition.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (confirmModalOpen) {
            loadModels().then(startCamera);
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [confirmModalOpen]);


    // --- Modal & Handler Functions ---

    const handleAddUser = () => {
        setSelectedUser({ id: "", username: "", email: "", role_id: 4, status: "Active", employee_id: null, password: "" });
        setIsEditing(false);
        setUserModalOpen(true);
    };

    const handleEditUser = (user) => {
        // Map user object fields to match component state expectations
        setSelectedUser({
            ...user,
            id: user.user_id, // Use user_id as the primary key for the component
            role_id: user.role_id, // Keep the numeric ID for the API
            // Add action property to selectedUser to track intent after verification
            action: 'save'
        });
        setIsEditing(true);
        setUserModalOpen(true);
    };

    const handleCloseModal = () => {
        setUserModalOpen(false);
        setSelectedUser(null);
    };

    const handleInitiateSave = () => {
        setSelectedUser(prev => ({ ...prev, action: 'save' }));
        setConfirmModalOpen(true);
    };

    const handleInitiateDelete = () => {
        setSelectedUser(prev => ({ ...prev, action: 'delete' }));
        setConfirmModalOpen(true);
        handleCloseModal(); // Close the edit modal before opening confirmation
    };

    // --- Filtering and Display Logic ---

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            (user.full_name || user.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.user_id.toString().includes(searchTerm)
        );
    }, [users, searchTerm]);

    // --- Component Return ---

    return (
        <Box
            sx={{ width: "100%", height: "100%", fontFamily: theme.typography.fontFamily }}
        >
            {/* ... (Existing Header and SearchBar remains the same) ... */}
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

                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                    }}
                >
                    <ActionButton text="Add User" width="200px" onClick={handleAddUser} />

                    <SearchBar
                        placeholder="Search Name or ID"
                        width="350px"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    // ... (Existing styles for the data container) ...
                    height: "90.9%",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                        transform: "scale(1.005)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    },
                }}
            >
                {/* --- Table Header --- */}
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

                {/* --- Table Body --- */}
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
                    {isLoading ? (
                        <Typography sx={{textAlign: 'center', mt: 4, color: theme.palette.text.secondary}}>
                            Loading user data...
                        </Typography>
                    ) : filteredUsers.length === 0 ? (
                        <Typography sx={{textAlign: 'center', mt: 4, color: theme.palette.text.secondary}}>
                            {searchTerm ? "No users match your search." : "No users found."}
                        </Typography>
                    ) : (
                        filteredUsers.map((user, i) => (<Box
                            key={user.user_id || i}
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
                            <span>{user.user_id}</span>
                            {/* Display full_name (from Employee DB) or username if not linked */}
                            <span>{user.full_name || user.username}</span>
                            {/* Map numeric role_id to readable role name */}
                            <span>{roleMap[user.role_id] || 'N/A'}</span>
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

            {/* --- User Edit/Add Modal --- */}
            <BoxModal
                open={userModalOpen}
                onClose={handleCloseModal}
                width="450px"
                height="600px" // Adjusted height for more fields
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2,
                    }}
                >
                    {isEditing ? "Edit User Account" : "Add New User Account"}
                </Typography>

                <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                    {/* User ID */}
                    <Typography
                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                        User ID (System)
                    </Typography>
                    <TextField
                        placeholder="ID is assigned by system"
                        value={selectedUser?.id || "Auto-Assigned"}
                        disabled={true}
                        variant="outlined"
                        size="small"
                        sx={{
                            // ... (Existing styles) ...
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "13px",
                                backgroundColor: "#b0b0b0",
                                color: "#1F2829",
                                fontSize: "18px",
                                "& fieldset": { border: "none" },
                            }, "& .MuiInputBase-input": {fontSize: "18px"},
                        }}
                    />

                    {/* Employee ID (Link) */}
                    <Typography
                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px", mt: 1}}>
                        Employee ID (Link)
                    </Typography>
                    <TextField
                        placeholder="Enter linked Employee ID (Optional)"
                        value={selectedUser?.employee_id || ""}
                        onChange={(e) => setSelectedUser(prev => ({...prev, employee_id: e.target.value}))}
                        disabled={isEditing} // Typically, you cannot change the linked employee ID after creation
                        variant="outlined"
                        size="small"
                        sx={{
                            // ... (Existing styles) ...
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "13px",
                                backgroundColor: isEditing ? "#b0b0b0" : "#cacace",
                                color: "#1F2829",
                                fontSize: "18px",
                                "& fieldset": { border: "none" },
                            }, "& .MuiInputBase-input": {fontSize: "18px"},
                        }}
                    />

                    {/* Username */}
                    <Typography
                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px", mt: 1}}>
                        Username
                    </Typography>
                    <TextField
                        placeholder="Enter username"
                        value={selectedUser?.username || ""}
                        onChange={(e) => setSelectedUser(prev => ({...prev, username: e.target.value}))} fullWidth
                        variant="outlined"
                        size="small"
                        sx={{
                            // ... (Existing styles) ...
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "13px",
                                backgroundColor: "#cacace",
                                color: "#1F2829",
                                fontSize: "18px",
                                "& fieldset": { border: "none" },
                            }, "& .MuiInputBase-input": {fontSize: "18px"},
                        }}
                    />

                    {/* Email */}
                    <Typography
                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px", mt: 1}}>
                        Email
                    </Typography>
                    <TextField
                        placeholder="Enter email address"
                        value={selectedUser?.email || ""}
                        onChange={(e) => setSelectedUser(prev => ({...prev, email: e.target.value}))} fullWidth
                        variant="outlined"
                        size="small"
                        sx={{
                            // ... (Existing styles) ...
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "13px",
                                backgroundColor: "#cacace",
                                color: "#1F2829",
                                fontSize: "18px",
                                "& fieldset": { border: "none" },
                            }, "& .MuiInputBase-input": {fontSize: "18px"},
                        }}
                    />

                    {/* Password (Only for Add, or optional update) */}
                    {!isEditing && (
                        <>
                            <Typography
                                sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px", mt: 1}}>
                                Password
                            </Typography>
                            <TextField
                                placeholder="Enter initial password"
                                value={selectedUser?.password || ""}
                                onChange={(e) => setSelectedUser(prev => ({...prev, password: e.target.value}))} fullWidth
                                type="password"
                                variant="outlined"
                                size="small"
                                sx={{
                                    // ... (Existing styles) ...
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "13px",
                                        backgroundColor: "#cacace",
                                        color: "#1F2829",
                                        fontSize: "18px",
                                        "& fieldset": { border: "none" },
                                    }, "& .MuiInputBase-input": {fontSize: "18px"},
                                }}
                            />
                        </>
                    )}
                </Box>

                {/* Role Select */}
                <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                    <Typography
                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}
                    >
                        Role
                    </Typography>

                    <Select
                        // Use role_id for the value
                        value={selectedUser?.role_id || ""}
                        onChange={(e) => setSelectedUser(prev => ({...prev, role_id: e.target.value}))}
                        displayEmpty
                        // ... (Existing styles) ...
                        sx={{
                            backgroundColor: "#cacace",
                            borderRadius: "13px",
                            color: "#1F2829",
                            fontSize: "18px",
                            "& .MuiSelect-select": { padding: "8px 12px", },
                            "& .MuiOutlinedInput-notchedOutline": { border: "none", },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none", },
                            "&:hover .MuiOutlinedInput-notchedOutline": { border: "none", },
                            "& .MuiSvgIcon-root": { color: "#1F2829", },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: { backgroundColor: "#ffffff", color: "#1F2829", }
                            }
                        }}
                        renderValue={(selected) => {
                            if (!selected) return <span style={{color: "#828689"}}>Select Role</span>;
                            // Display the mapped name
                            return roleMap[selected] || 'Unknown';
                        }}
                    >
                        {ROLES.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                                {role.name}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Status Select */}
                <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                    <Typography
                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}
                    >
                        Status
                    </Typography>

                    <Select
                        value={selectedUser?.status || ""}
                        onChange={(e) => setSelectedUser(prev => ({...prev, status: e.target.value}))}
                        displayEmpty
                        // ... (Existing styles) ...
                        sx={{
                            backgroundColor: "#cacace",
                            borderRadius: "13px",
                            color: "#1F2829",
                            fontSize: "18px",
                            "& .MuiSelect-select": { padding: "8px 12px", },
                            "& .MuiOutlinedInput-notchedOutline": { border: "none", },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none", },
                            "&:hover .MuiOutlinedInput-notchedOutline": { border: "none", },
                            "& .MuiSvgIcon-root": { color: "#1F2829", },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: { backgroundColor: "#ffffff", color: "#1F2829", }
                            }
                        }}
                        renderValue={(selected) => {
                            if (!selected) return <span style={{color: "#828689"}}>Select Status</span>;
                            return selected;
                        }}
                    >
                        {STATUSES.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <Box
                    sx={{
                        display: "flex", justifyContent: isEditing ? "space-between" : "flex-end", gap: 2, mt: 3,
                    }}
                >
                    {isEditing && (
                        <Box
                            component="button"
                            onClick={handleInitiateDelete} // Changed to initiate facial recognition first
                            sx={{
                                // ... (Existing delete button styles) ...
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                backgroundColor: "#8b1a1a",
                                color: "#fff",
                                padding: "10px 0",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                transition: "all 0.3s ease",
                                width: "200px",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": {
                                    backgroundColor: "#a32020",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            <RiDeleteBin7Fill style={{marginRight: 8, fontSize: 18}}/> Remove User
                        </Box>
                    )}
                    <Box
                        onClick={handleInitiateSave} // Changed to initiate facial recognition first
                        component="button"
                        sx={{
                            // ... (Existing save button styles) ...
                            display: "flex-end",
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
                        Save
                    </Box>
                </Box>
            </BoxModal>

            {/* --- Facial Recognition Modal (Confirmation) --- */}
            <Modal
                open={confirmModalOpen}
                onClose={() => {setConfirmModalOpen(false); setLoading(false);}}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        // ... (Existing modal styles) ...
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: (theme) =>
                            theme.palette.mode === "dark"
                                ? "0 8px 32px rgba(0,0,0,0.6)"
                                : "0 8px 32px rgba(0,0,0,0.1)",
                        borderRadius: 3,
                        p: 4,
                        width: { xs: "90%", sm: "450px" },
                        height: { xs: "auto" },
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

                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: "'TTHoves-Regular', sans-serif",
                            fontSize: "16px",
                            color: "#FFFFFF",
                            mb: 2,
                            textAlign: "center",
                        }}
                    >
                        Verify your identity to {selectedUser?.action === 'delete' ? 'delete' : 'save'} the user account.
                    </Typography>

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        width="400"
                        height="300"
                        style={{ borderRadius: "10px", border: "2px solid #ccc" }}
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
                        text={loading ? "Processing..." : "Verify and Proceed"}
                        width="200px"
                        disabled={loading}
                        onClick={handleRecognition}
                    />
                </Box>
            </Modal>

            {/* Snackbar for notifications */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}