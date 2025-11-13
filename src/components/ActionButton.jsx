import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ActionButton = ({ text = "Button", width = "200px", onClick, sx = {} }) => {
    const theme = useTheme();

    return (
        <Box
            component="button"
            onClick={onClick}
            sx={{
                fontSize: "16px",
                padding: "10px 0",
                borderRadius: "15px",
                cursor: "pointer",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(12px)",
                width: width,
                color: theme.palette.text.primary,
                fontFamily: "'TTHoves-Regular', sans-serif",
                transition: "box-shadow 0.3s ease, transform 0.3s ease",
                "&:hover": {
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.2)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                },
                ...sx,
            }}
        >
            {text}
        </Box>
    );
};

export default ActionButton;
