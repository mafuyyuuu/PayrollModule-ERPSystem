import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

export const tokens = (mode) => ({
    ...(mode === "light"
        ? {
            white: {
                500: "#FFFFFF",
            },
            gray: {
                500: "#DFE3E3",
                700: "#899596",
            },
            black: {
                500: "#1F2829",
                700: "#131819",
            },
        }
        : {
            bunker: {
                500: "#172224",
            },
            "outer-space": {
                500: "#2E3839",
            },
            gallery: {
                500: "#EFEFEF",
            },
            "white-ice": {
                100: "#FFFFFF",
            },
        }),
});

// MUI theme settings
export const themeSettings = (mode) => {
    const colors = tokens(mode);

    return {
        palette: {
            mode,
            ...(mode === "light"
                ? {
                    primary: { main: colors.white[500] },
                    secondary: { main: colors.gray[500] },
                    background: { default: colors.white[500], paper: "#f8f8f9" },
                    text: {
                        primary: colors.black[500],
                        secondary: colors.gray[700],
                    },
                }
                : {
                    primary: { main: colors.bunker[500] },
                    secondary: { main: colors["outer-space"][500] },
                    background: { default: colors.bunker[500], paper: colors["outer-space"][500] },
                    text: {
                        primary: colors.gallery[500],
                        secondary: colors["white-ice"][100],
                    },
                }),
        },
        typography: {
            fontFamily: "TT Hoves Pro, sans-serif",
            fontWeightLight: 300, // Thin
            fontWeightRegular: 400,
            fontWeightMedium: 500,
            fontWeightBold: 700, // Bold

            h1: { fontSize: 40, fontWeight: 700 },
            h2: { fontSize: 32, fontWeight: 700 },
            h3: { fontSize: 24, fontWeight: 500 },
            h4: { fontSize: 20, fontWeight: 400 },
            h5: { fontSize: 16, fontWeight: 400 },
            h6: { fontSize: 14, fontWeight: 300 },
        },
    };
};

// Context for color mode
export const ColorModeContext = createContext({
    toggleColorMode: () => {},
});

export const useMode = () => {
    const [mode, setMode] = useState("light");

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () =>
                setMode((prev) => (prev === "light" ? "dark" : "light")),
        }),
        []
    );

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    return [theme, colorMode];
};