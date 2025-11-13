import React from "react";
import { Box, Button, IconButton, TextField, Typography, Paper, Stack, useTheme } from "@mui/material";
import { RiPencilFill, RiSearchLine } from "react-icons/ri";
import SearchBar from "../../components/SearchBar.jsx";
import ActionButton from "../../components/ActionButton.jsx";

export default function AdminUserManagement() {
    const theme = useTheme();

    const users = [
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
        { id: "0100XXX", name: "Jhervin Jimenez", role: "Dropbox", access: "Dropbox", status: "Pending" },
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
                        sx={{
                            color: theme.palette.text.primary,
                            "&:hover": {
                                backgroundColor:
                                    theme.palette.mode === "dark"
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(255, 255, 255, 0.2)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                            },
                        }}
                    />

                    <ActionButton
                        text="Remove"
                        width="200px"
                        sx={{
                            color: theme.palette.text.primary,
                            "&:hover": {
                                backgroundColor:
                                    theme.palette.mode === "dark"
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "rgba(255, 255, 255, 0.2)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                            },
                        }}
                    />
                </Box>

                <SearchBar
                    placeholder="Enter Username"
                    width="350px"
                />
            </Box>

            <Paper
                sx={{
                    p: 2,
                    borderRadius: "16px",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                    boxShadow: theme.shadows[4],
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, 1fr)",
                        fontWeight: 700,
                        fontSize: 14,
                        mb: 1,
                        color: theme.palette.text.primary,
                    }}
                >
                    {["User ID", "Name", "Role", "Access Level", "Status", "Actions"].map((header) => (
                        <Box key={header} sx={{ textAlign: "center" }}>
                            {header}
                        </Box>
                    ))}
                </Box>

                <Stack spacing={1.5}>
                    {users.map((user, i) => (
                        <Box
                            key={i}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                alignItems: "center",
                                p: 1.5,
                                borderRadius: "12px",
                                boxShadow: theme.shadows[1],
                                border: `1px solid ${theme.palette.divider}`,
                                transition: "transform 0.2s, box-shadow 0.2s",
                                backgroundColor: theme.palette.background.paper,
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: theme.shadows[4],
                                },
                                fontSize: 14,
                                color: theme.palette.text.primary,
                            }}
                        >
                            <Box sx={{ textAlign: "center" }}>{user.id}</Box>
                            <Box sx={{ textAlign: "center" }}>{user.name}</Box>
                            <Box sx={{ textAlign: "center" }}>{user.role}</Box>
                            <Box sx={{ textAlign: "center" }}>{user.access}</Box>
                            <Box sx={{ textAlign: "center" }}>{user.status}</Box>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <IconButton
                                    sx={{
                                        bgcolor:
                                            theme.palette.mode === "dark"
                                                ? "#1b2223"
                                                : theme.palette.primary.main,
                                        color: theme.palette.getContrastText(
                                            theme.palette.mode === "dark"
                                                ? "#1b2223"
                                                : theme.palette.primary.main
                                        ),
                                        "&:hover": {
                                            bgcolor:
                                                theme.palette.mode === "dark"
                                                    ? "#333"
                                                    : theme.palette.primary.dark,
                                            transform: "scale(1.05)",
                                        },
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    <RiPencilFill />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
}
