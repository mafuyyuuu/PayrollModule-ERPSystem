import { useState } from "react";
import { IconButton, Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const DashboardCard = ({ icon, title, value, showHideButton }) => {
    const [showValue, setShowValue] = useState(false);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const toggleVisibility = () => setShowValue((prev) => !prev);

    const formatValue = (val) => {
        if (typeof val !== "string") val = String(val);

        const dateMatch = val.match(/^(.+?),\s*(\d{4})$/);
        if (dateMatch) {
            return {
                main: dateMatch[1] + ",",
                suffix: dateMatch[2],
                isDate: true,
            };
        }

        const [main, suffix] = val.split(".");
        return {
            main: main || "",
            suffix: suffix ? `.${suffix}` : "",
            isDate: false,
        };
    };

    const { main, suffix, isDate } = formatValue(value);

    return (
        <Box
            backgroundColor={theme.palette.background.paper}
            borderRadius="12px"
            p="24px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            color={theme.palette.text.primary}
            sx={{
                fontFamily: theme.typography.fontFamily,
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow:
                        theme.palette.mode === "light"
                            ? "0 4px 20px rgba(0,0,0,0.15)"
                            : "0 4px 20px rgba(0,0,0,0.3)",
                },
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap="10px">
                    {icon && (
                        <i
                            className={icon}
                            style={{ fontSize: 18, color: theme.palette.text.primary }}
                        ></i>
                    )}
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                            fontSize: "18px",
                            color: theme.palette.text.primary,
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                {showHideButton && (
                    <IconButton
                        onClick={toggleVisibility}
                        size="small"
                        sx={{ color: theme.palette.text.primary }}
                    >
                        <i
                            className={showValue ? "ri-eye-off-line" : "ri-eye-line"}
                            style={{ fontSize: 18 }}
                        ></i>
                    </IconButton>
                )}
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center" mt="10px">
                <Typography
                    variant="h2"
                    sx={{
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        fontSize: "35px",
                        lineHeight: 1.1,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                    }}
                >
                    {showHideButton && !showValue ? (
                        <span
                            style={{
                                color: theme.palette.mode === "dark"
                                    ? colors.gallery[500]
                                    : colors.charcoal[500],
                            }}
                        >
                            ••••••
                        </span>
                    ) : (
                        <>
                            <span
                                style={{
                                    color: theme.palette.mode === "dark"
                                        ? colors.gallery[500]
                                        : colors.charcoal[500],
                                }}
                            >
                                {main}
                            </span>

                            {suffix && (
                                <span
                                    style={{
                                        color: theme.palette.text.secondary,
                                        fontSize: isDate ? "25px" : "25px",
                                        lineHeight: 1,
                                        verticalAlign: "baseline",
                                        marginBottom: "2px",
                                        marginLeft: isDate ? "6px" : 0,
                                    }}
                                >
                                    {suffix}
                                </span>
                            )}
                        </>
                    )}
                </Typography>
            </Box>
        </Box>
    );
};

export default DashboardCard;
