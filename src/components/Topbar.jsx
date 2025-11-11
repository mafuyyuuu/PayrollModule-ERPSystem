import {
    Box,
    IconButton,
    Typography,
    useTheme,
} from "@mui/material";
import { useContext } from "react";
import { ColorModeContext } from "../theme.js";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

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
                    : "linear-gradient(180deg, rgba(28,35,36,1) 0%, rgba(23,34,36,1) 100%)",
            }}
        >
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

            <Box display="flex" alignItems="center" gap="1rem">
                <IconButton>
                    <NotificationsNoneOutlinedIcon
                        sx={{
                            fontSize: "1.7rem",
                            color: isLightMode ? "#1F2829" : "#EFEFEF",
                        }}
                    />
                </IconButton>

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