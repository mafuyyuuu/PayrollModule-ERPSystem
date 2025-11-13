import React from "react";
import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";

const SearchBar = ({ placeholder = "Search...", width = "450px", onChange }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: "9px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                backdropFilter: "blur(12px)",
                px: "15px",
                py: "5px",
                width: width,
                transition: "box-shadow 0.3s ease, transform 0.3s ease",
                "&:hover": {
                    boxShadow:
                        theme.palette.mode === "light"
                            ? "0 4px 20px rgba(0,0,0,0.15)"
                            : "0 4px 20px rgba(0,0,0,0.3)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <SearchIcon
                sx={{
                    color: theme.palette.text.primary,
                    fontSize: "1.7rem",
                    mr: 1,
                }}
            />
            <InputBase
                placeholder={placeholder}
                onChange={onChange}
                sx={{
                    fontFamily: "'TT Hoves Pro', sans-serif",
                    fontWeight: 300,
                    fontSize: "0.95rem",
                    width: "100%",
                    color: theme.palette.text.primary,
                }}
            />
        </Box>
    );
};

export default SearchBar;
