import React from "react";
import {
    Box,
    IconButton,
    Typography,
    useTheme,
} from "@mui/material";
import { RiPencilFill } from "react-icons/ri";
import SearchBar from "../../components/SearchBar.jsx";
import ActionButton from "../../components/ActionButton.jsx";

export default function AdminUserManagement() {
    const theme = useTheme();

    const users = [
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Sarah Cruz", role: "Manager", access: "Admin", status: "Active" },
        { id: "0100XXX", name: "Michael Lee", role: "Developer", access: "Limited", status: "Inactive" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
    ];

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
                    mb: 3,
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

            {/* Table Container */}
            <Box
                sx={{
                    height: "83.5%",
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.2)",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "15px",
                    backdropFilter: "blur(12px)",
                    p: "12px 24px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                }}
            >
                {/* Table Header */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, 1fr)",
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        p: "8px",
                        borderRadius: "15px",
                        width: "100%",
                        alignItems: "center",
                    }}
                >
                    <span style={{ textAlign: "center" }}>User ID</span>
                    <span style={{ textAlign: "center" }}>Name</span>
                    <span style={{ textAlign: "center" }}>Role</span>
                    <span style={{ textAlign: "center" }}>Access</span>
                    <span style={{ textAlign: "center" }}>Status</span>
                    <span style={{ textAlign: "center" }}>Actions</span>
                </Box>

                {/* User Rows */}
                {users.map((user, i) => (
                    <Box
                        key={i}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(6, 1fr)",
                            alignItems: "center",
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "#fff",
                            borderRadius: "8px",
                            width: "100%",
                            minHeight: "70px",
                            mt: 1.5,
                            transition: "all 0.3s ease",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            },
                            color: theme.palette.text.primary,
                        }}
                    >
                        <Box sx={{ textAlign: "center" }}>{user.id}</Box>
                        <Box sx={{ textAlign: "center" }}>{user.name}</Box>
                        <Box sx={{ textAlign: "center" }}>{user.role}</Box>
                        <Box sx={{ textAlign: "center" }}>{user.access}</Box>
                        <Box sx={{ textAlign: "center" }}>{user.status}</Box>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                            <IconButton
                                sx={{
                                    bgcolor:
                                        theme.palette.mode === "dark"
                                            ? "#2E3839"
                                            : "#3A4F50",
                                    color: "#fff",
                                    width: "32px",
                                    height: "32px",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-3px)",
                                        bgcolor:
                                            theme.palette.mode === "dark"
                                                ? "#1f2f31"
                                                : "#2E3B3D",
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
    );
}
