import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

export const tokens = (mode) => ({
    ...(mode === "light"
        ? {
            white: { 500: "#D1D2D2" },
            gray: { 400: "#bdbdbd", 500: "#DFE3E3", 700: "#899596" },
            black: { 500: "#1F2829", 700: "#131819" },
            charcoal: { 500: "#1b2223" },
            green: { 500: "#3A4F50", 700: "#27cf40" },
            red: { 500: "#a61f24" },
            yellow: { 500: "#e9e574" },
            blue: { 500: "#7d9de2" },
        }
        : {
            bunker: { 500: "#172224" },
            "outer-space": { 500: "#2E3839" },
            gallery: { 500: "#EFEFEF" },
            "white-ice": { 100: "#FFFFFF" },
            gray: { 400: "#bdbdbd", 500: "#2E3839", 700: "#899596" },
            green: { 500: "#3A4F50", 700: "#27cf40" },
            red: { 500: "#a61f24" },
            yellow: { 500: "#e9e574" },
            blue: { 500: "#7d9de2" },
        }),
});

export const themeSettings = (mode) => {
    const colors = tokens(mode);

    return {
        palette: {
            mode,
            ...(mode === "light"
                ? {
                    primary: { main: colors.white[500] },
                    secondary: { main: colors.gray[400] },
                    background: { default: colors.white[500], paper: colors.gray[500] },
                    text: { primary: colors.black[500], secondary: colors.gray[700] },
                    success: { main: colors.green[500] },
                    error: { main: colors.red[500] },
                    warning: { main: colors.yellow[500] },
                    info: { main: colors.blue[500] },
                }
                : {
                    primary: { main: colors.bunker[500] },
                    secondary: { main: colors["outer-space"][500] },
                    background: { default: colors.bunker[500], paper: colors["outer-space"][500] },
                    text: { primary: colors.gallery[500], secondary: colors.gray[400] },
                    success: { main: colors.green[500] },
                    error: { main: colors.red[500] },
                    warning: { main: colors.yellow[500] },
                    info: { main: colors.blue[500] },
                }),
        },
        typography: {
            fontFamily: "'TTHoves-Regular', 'sans-serif'",
            fontWeightLight: 300,
            fontWeightRegular: 400,
            fontWeightMedium: 500,
            fontWeightBold: 700,

            h1: { fontFamily: "'TTHoves-Bold', 'sans-serif'", fontSize: 40, fontWeight: 700 },
            h2: { fontFamily: "'TTHoves-DemiBold', 'sans-serif'", fontSize: 32, fontWeight: 700 },
            h3: { fontFamily: "'TTHoves-Medium', 'sans-serif'", fontSize: 24, fontWeight: 500 },
            h4: { fontFamily: "'TTHoves-Regular', 'sans-serif'", fontSize: 20, fontWeight: 400 },
            h5: { fontFamily: "'TTHoves-Regular', 'sans-serif'", fontSize: 16, fontWeight: 400 },
            h6: { fontFamily: "'TTHoves-DemiBold', 'sans-serif'", fontSize: 14, fontWeight: 300 },

            body1: { fontFamily: "'TTHoves-Regular', 'sans-serif'", fontWeight: 400 },
            body2: { fontFamily: "'TTHoves-Regular', 'sans-serif'", fontWeight: 400 },

            button: { fontFamily: "'TTHoves-Medium', 'sans-serif'", textTransform: "none", fontWeight: 500 },
        },
    };
};

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