import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { useMode, ColorModeContext } from "../theme.js";

export default function Layout() {
    const [theme, colorMode] = useMode();

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />

                <Box
                    display="flex"
                    width="100vw"
                    height="100vh"
                    overflow="hidden"
                    bgcolor="#C4C3C3"
                    color="#222"
                >
                    <Sidebar />

                    <Box display="flex" flexDirection="column" flex={1} overflow="hidden">
                        <Topbar />

                        <Box
                            flex={1}
                            p="2rem"
                            sx={{
                                background: "radial-gradient(circle 170vh at 50% 20%, #c0c2c2, #F0E8E8)",                                overflowY: "auto",
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