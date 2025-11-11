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
                    bgcolor={theme.palette.background.default}
                >
                    <Sidebar />

                    <Box display="flex" flexDirection="column" flex={1} overflow="hidden">

                        <Topbar />

                        <Box
                            flex={1}
                            p="2rem"
                            sx={{
                                backgroundColor: "#D1D2D2",
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