import { useContext } from "react";
import {
    Box,
    IconButton,
    Typography,
    useTheme,
} from "@mui/material";
import { ColorModeContext, tokens } from "../theme.js";
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
            p="4rem"
            sx={{
                background: isLightMode
                    ? tokens("light").gray[500]
                    : `linear-gradient(to right, ${tokens("dark").bunker[500]} 50%, ${tokens("dark")["outer-space"][500]} 85%, ${tokens("dark")["outer-space"][500]} 100%)`, // subtle gradient on right end
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
                            color: isLightMode
                                ? tokens("light").black[500]
                                : tokens("dark").gallery[500],
                        }}
                    />
                </IconButton>

                <IconButton onClick={colorMode.toggleColorMode}>
                    {isLightMode ? (
                        <DarkModeOutlinedIcon
                            sx={{
                                fontSize: "1.7rem",
                                color: tokens("light").black[500],
                                fill: tokens("light").black[500],
                            }}
                        />
                    ) : (
                        <LightModeOutlinedIcon
                            sx={{
                                fontSize: "1.7rem",
                                color: tokens("dark")["white-ice"][100],
                                fill: tokens("dark")["white-ice"][100],
                            }}
                        />
                    )}
                </IconButton>
            </Box>
        </Box>
    );
};

export default Topbar;