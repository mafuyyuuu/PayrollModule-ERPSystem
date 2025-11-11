import React from "react";
import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";

const SearchBar = ({ placeholder = "Search...", width = "450px", onChange }) => {
    const theme = useTheme();
    const isLightMode = theme.palette.mode === "light";

    return (
        <Box
            display="flex"
            alignItems="center"
            borderRadius="9px"
            border = "1px solid rgba(255, 255, 255, 0.4)"
            background = "rgba(255, 255, 255, 0.2)"
            backdropFilter = "blur(12px)"
            px="15px"
            py="5px"
            width={width}
            boxShadow={isLightMode ? "0 2px 5px rgba(0,0,0,0.1)" : "0 2px 5px rgba(0,0,0,0.5)"}
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
                    fontFamily: "TT Hoves Pro, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.95rem",
                    width: "100%",
                }}
            />
        </Box>
    );
};

export default SearchBar;
