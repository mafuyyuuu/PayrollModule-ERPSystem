import React from "react";
import { Box, Modal } from "@mui/material";

export default function BoxModal({ open, onClose, children, width = 500 }) {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "white",
                    p: 4,
                    borderRadius: 3,
                    width: width,
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                {children}
            </Box>
        </Modal>
    );
}