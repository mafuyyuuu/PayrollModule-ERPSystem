import {
    Box,
    IconButton,
    Typography,
    useTheme,
    InputBase,
} from "@mui/material";
import { useContext } from "react";
import { ColorModeContext } from "../theme.js";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SearchIcon from "@mui/icons-material/Search";

const Topbar = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const isLightMode = theme.palette.mode === "light";

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            height="16vh"
            p="4rem 4rem"
            sx={{
                background: isLightMode
                    ? "#E3E3E3"
                    : "linear-gradient(180deg, rgba(28,35,36,1) 0%, rgba(23,34,36,1) 100%)"
        }}
        >
            {/* Left Section - Greeting */}
            <Box>
                <Typography
                    variant="h2"
                    sx={{
                        fontFamily: "TTHoves-Bold, sans-serif",
                        color: theme.palette.text.primary,
                        lineHeight: 1.2,
                    }}
                >
                    Welcome, Lorem Ipsum.
                </Typography>
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: "TTHoves-Regular, sans-serif",
                        color: theme.palette.text.primary,
                        mt: 0.5,
                    }}
                >
                    Here’s your dashboard overview.
                </Typography>
            </Box>

            {/* Right Section - Search + Toggle */}
            <Box display="flex" alignItems="center" gap="1rem">
                {/* Search Bar */}
                <Box
                    display="flex"
                    alignItems="center"
                    bgcolor={isLightMode ? "#F1F3F4" : theme.palette.secondary.main}
                    borderRadius="9px"
                    px="15px"
                    py="5px"
                    width="450px"
                >
                    <SearchIcon
                        sx={{
                            color: theme.palette.text.primary,
                            fontSize: "1.7rem",
                            mr: 1,
                        }}
                    />
                    <InputBase
                        placeholder="Enter Employee Name"
                        sx={{
                            fontFamily: "TT Hoves Pro, sans-serif",
                            fontWeight: 300,
                            color: theme.palette.text.primary,
                            fontSize: "0.95rem",
                            width: "100%",
                        }}
                    />
                </Box>

                {/* Dark/Light Mode Toggle */}
                <IconButton onClick={colorMode.toggleColorMode}>
                    {isLightMode ? (
                        <DarkModeOutlinedIcon
                            sx={{
                                fontSize: "1.7rem",
                                color: "#1F2829",
                                fill: "#1F2829",
                            }}
                        />
                    ) : (
                        <LightModeOutlinedIcon
                            sx={{
                                fontSize: "1.7rem",
                                color: "#EFEFEF",
                                fill: "#EFEFEF",
                            }}
                        />
                    )}
                </IconButton>
            </Box>
        </Box>
    );
};

export default Topbar;
