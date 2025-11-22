import React, { useRef, useState } from "react";
import {
    Modal, Box, IconButton, MenuItem, Select, TextField, Typography, useTheme,
} from "@mui/material";
import {RiPencilFill} from "react-icons/ri";
import SearchBar from "../../components/SearchBar.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

export default function AdminUserManagement() {
    const theme = useTheme();
    const videoRef = useRef();
    const [status, setStatus] = useState("Initializing camera...");
    const [loading, setLoading] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleAddUser = () => {
        setSelectedUser({id: "", name: "", role: "", status: ""});
        setIsEditing(false);
        setUserModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditing(true);
        setUserModalOpen(true);
    };

    const handleCloseModal = () => setUserModalOpen(false);

    const users = [
        {
            id: "010001",
            name: "Jhervin Jimenez",
            role: "Dropbox",
            status: "Pending"
        },
        {
            id: "010002",
            name: "Sarah Cruz",
            role: "Manager",
            status: "Active"
        },
        {
            id: "010003",
            name: "Michael Lee",
            role: "Developer",
            status: "Inactive"
        },
        {
            id: "010004",
            name: "Jhervin Jimenez",
            role: "Dropbox",
            status: "Pending"
        },
        {
            id: "010005",
            name: "Sarah Cruz",
            role: "Manager",
            status: "Active"
        },
        {
            id: "010006",
            name: "Michael Lee",
            role: "Developer",
            status: "Inactive"
        }
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
                    User Management
                </Typography>

                <Box
                    sx={{
                        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
                    }}
                >
                    <ActionButton text="Add User" width="200px" onClick={handleAddUser}/>

                    <SearchBar placeholder="Enter Username" width="350px"/>
                </Box>
            </Box>

            <Box
                sx={{
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
                        transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
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
                    {users.map((user, i) => (<Box
                        key={i}
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
                    </Box>))}
                </Box>
            </Box>
            <BoxModal
                open={userModalOpen}
                onClose={handleCloseModal}
                width="450px"
                height="470"
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: "'TTHoves-Bold', sans-serif", fontSize: "24px", color: "#FFFFFF", mb: 2,
                    }}
                >
                    {isEditing ? "Edit User" : "Add User"}
                </Typography>

                <Box sx={{display: "flex", gap: 1}}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                            User ID
                        </Typography>
                        <TextField
                            placeholder="User ID"
                            value={selectedUser?.id || ""}
                            onChange={(e) =>
                                !isEditing && setSelectedUser(prev => ({...prev, id: e.target.value}))
                            }
                            variant="outlined"
                            size="small"
                            sx={{
                                width: "150px",
                                "& .MuiOutlinedInput-root": {
                                    fontSize: "16px",
                                    borderRadius: "13px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    color: "#fff",
                                    "& fieldset": {borderColor: "rgba(255,255,255,0.4)"},
                                    "&:hover fieldset": {borderColor: "rgba(255,255,255,0.6)"},
                                    "&.Mui-focused fieldset": {borderColor: "rgba(255,255,255,0.9)"},
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                        <Typography
                            sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}>
                            Full Name
                        </Typography>
                        <TextField
                            placeholder="Enter Full Name"
                            value={selectedUser?.name || ""}
                            onChange={(e) => setSelectedUser(prev => ({...prev, name: e.target.value}))} fullWidth
                            variant="outlined"
                            size="small"
                            sx={{
                                width: "228px",
                                "& .MuiOutlinedInput-root": {
                                    fontSize: "16px",
                                    borderRadius: "13px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    color: "#fff",
                                    "& fieldset": {borderColor: "rgba(255,255,255,0.4)"},
                                    "&:hover fieldset": {borderColor: "rgba(255,255,255,0.6)"},
                                    "&.Mui-focused fieldset": {borderColor: "rgba(255,255,255,0.9)"},
                                },
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{display: "flex", flexDirection: "column", gap: 1, mt: 2}}>
                    <Typography
                        sx={{fontFamily: "'TTHoves-DemiBold', sans-serif", color: "#FFFFFF", fontSize: "18px"}}
                    >
                        Role
                    </Typography>

                    <Select
                        value={selectedUser?.role || ""}
                        onChange={(e) => setSelectedUser(prev => ({...prev, role: e.target.value}))}
                        displayEmpty
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: "13px",
                            color: "#fff",
                            fontSize: "18px",
                            "& .MuiSelect-select": {padding: "8px 12px"},
                            "& .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.4)"},
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.9)"},
                            "&:hover .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.6)"},
                            "& .MuiSvgIcon-root": {color: "#fff"},
                        }}
                        MenuProps={{
                            PaperProps: {sx: {backgroundColor: "#ffffff", color: "#1e1e1e"}}
                        }}
                        renderValue={(selected) => {
                            if (!selected) return <span style={{color: "rgba(255,255,255,0.4)"}}>Select Role</span>;
                            return selected;
                        }}
                    >
                        {["Full Time", "Part Time", "Contract"].map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

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
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: "13px",
                            color: "#fff",
                            fontSize: "18px",
                            "& .MuiSelect-select": {padding: "8px 12px"},
                            "& .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.4)"},
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.9)"},
                            "&:hover .MuiOutlinedInput-notchedOutline": {borderColor: "rgba(255,255,255,0.6)"},
                            "& .MuiSvgIcon-root": {color: "#fff"},
                        }}
                        MenuProps={{
                            PaperProps: {sx: {backgroundColor: "#ffffff", color: "#1e1e1e"}}
                        }}
                        renderValue={(selected) => {
                            if (!selected) return <span style={{color: "rgba(255,255,255,0.4)"}}>Select Status</span>;
                            return selected;
                        }}
                    >
                        {["Inactive", "Active"].map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <Box
                    sx={{
                        display: "flex", justifyContent: isEditing ? "center" : "flex-end", gap: 2, mt: 3,
                    }}
                >
                    {isEditing && (
                        <ActionButton
                            text="Remove"
                            width="200px"
                            color="#b22222"
                            onClick={() => {
                                handleCloseModal();
                            }}
                        />
                    )}
                    <Box
                        onClick={() => setConfirmModalOpen(true)}
                        component="button"
                        sx={{
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
