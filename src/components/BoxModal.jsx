import React from "react";
import { Box, Modal, useTheme } from "@mui/material";

export default function BoxModal({ open, onClose, children, width = 500 }) {
    const theme = useTheme();

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    p: 4,
                    borderRadius: 10,
                    width: width,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow:
                        theme.palette.mode === "dark"
                            ? "0 8px 32px rgba(0,0,0,0.6)"
                            : "0 8px 32px rgba(0,0,0,0.1)",
                    color: theme.palette.text.primary,
                }}
            >
                {children}
            </Box>
        </Modal>
    );
}
