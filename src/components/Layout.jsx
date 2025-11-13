import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { ThemeProvider, useTheme, Box } from "@mui/material";
import { ColorModeContext } from "../theme.js";
import {useContext} from "react";


export default function Layout() {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <Box
                    display="flex"
                    width="100vw"
                    height="100vh"
                    overflow="hidden"
                >
                    <Sidebar />
                    <Box display="flex" flexDirection="column" flex={1} overflow="hidden">
                        <Topbar />
                        <Box
                            flex={1}
                            p="2rem"
                            sx={{
                                color: theme.palette.text.primary,
                                overflowY: "auto",
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            <Outlet />
                        </Box>
                    </Box>
                </Box>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}