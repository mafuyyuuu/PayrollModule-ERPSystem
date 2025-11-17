import React, { useState } from "react";
import {
    Box,
    IconButton,
    Typography,
    useTheme,
} from "@mui/material";
import { RiPencilFill } from "react-icons/ri";
import SearchBar from "../../components/SearchBar.jsx";
import ActionButton from "../../components/ActionButton.jsx";
import BoxModal from "../../components/BoxModal.jsx";

export default function AdminUserManagement() {
    const theme = useTheme();

    const users = [
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Sarah Cruz", role: "Manager", access: "Admin", status: "Active" },
        { id: "0100XXX", name: "Michael Lee", role: "Developer", access: "Limited", status: "Inactive" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Sarah Cruz", role: "Manager", access: "Admin", status: "Active" },
        { id: "0100XXX", name: "Michael Lee", role: "Developer", access: "Limited", status: "Inactive" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
    ];

    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const openModal = (type, data) => {
        if (type === "userDetails") {
            setSelectedUser(data);
            setShowUserDetailsModal(true);
        }
    };

    return (
        <Box sx={{ width: "100%", height: "100%", fontFamily: theme.typography.fontFamily }}>
            <Typography
                variant="h5"
                sx={{
                    fontSize: "20px",
                    fontFamily: "'TTHoves-Bold', sans-serif",
                    color: theme.palette.text.primary,
                    mb: 3,
                }}
            >
                User Management
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb:2,
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", gap: 2 }}>
                    <ActionButton
                        text="Add User"
                        width="200px"
                    />

                    <ActionButton
                        text="Remove"
                        width="200px"
                    />
                </Box>

                <SearchBar placeholder="Enter Username" width="350px" />
            </Box>

            <Box
                sx={{
                    height: "85%",
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
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
                    <span style={{ textAlign: "center" }}>User ID</span>
                    <span style={{ textAlign: "center" }}>Name</span>
                    <span style={{ textAlign: "center" }}>Role</span>
                    <span style={{ textAlign: "center" }}>Access</span>
                    <span style={{ textAlign: "center" }}>Status</span>
                    <span style={{ textAlign: "center" }}>Actions</span>
                </Box>

                <Box
                    sx={{
                        maxHeight: "530px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: 0, height: 0 },
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        mt: "8px",
                        fontFamily: "'TTHoves-DemiBold', sans-serif",
                    }}
                >
                    {users.map((user, i) => (
                        <Box
                            key={i}
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
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                },
                                textAlign: "center",
                            }}
                        >
                            <span>{user.id}</span>
                            <span>{user.name}</span>
                            <span>{user.role}</span>
                            <span>{user.access}</span>
                            <span>{user.status}</span>
                            <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                <IconButton
                                    onClick={() => openModal("userDetails", user)}
                                    sx={{
                                        bgcolor: "#3A4F50",
                                        color: "#fff",
                                        width: "32px",
                                        height: "32px",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-3px)",
                                            bgcolor: "#2E3B3D",
                                        },
                                    }}
                                >
                                    <RiPencilFill />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            <BoxModal
                open={showUserDetailsModal}
                onClose={() => setShowUserDetailsModal(false)}
                width="500px"
            >
                <Typography sx={{ fontSize: "20px", fontWeight: 600, mb: 2 }}>
                    User Details
                </Typography>

                {selectedUser && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Typography><strong>ID:</strong> {selectedUser.id}</Typography>
                        <Typography><strong>Name:</strong> {selectedUser.name}</Typography>
                        <Typography><strong>Role:</strong> {selectedUser.role}</Typography>
                        <Typography><strong>Access:</strong> {selectedUser.access}</Typography>
                        <Typography><strong>Status:</strong> {selectedUser.status}</Typography>
                    </Box>
                )}
            </BoxModal>
        </Box>
    );
}
