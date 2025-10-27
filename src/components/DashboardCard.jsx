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
        const [main, decimal] = val.split(".");
        return { main: main || "", decimal: decimal ? `.${decimal}` : "" };
    };

    const { main, decimal } = formatValue(value);

    return (
        <Box
            backgroundColor="rgba(255, 255, 255, 0.2)"
            borderRadius="12px"
            p="24px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            color="#222"
            sx={{
                fontFamily: "'TTHoves-Regular', sans-serif",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
            }}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Box
                    display="flex"
                    alignItems="center"
                    gap="10px"
                >
                    {icon && <i className={icon} style={{ fontSize: 18, color: "#222" }}></i>}
                    <Typography
                        variant="h5"
                        sx={{
                            fontSize: "18px",
                            fontFamily: "'TTHoves-DemiBold', sans-serif",
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                {showHideButton && (
                    <IconButton onClick={toggleVisibility} size="small" sx={{ color: "#222" }}>
                        <i
                            className={showValue ? "ri-eye-off-line" : "ri-eye-line"}
                            style={{ fontSize: 18 }}
                        ></i>
                    </IconButton>
                )}
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                mt="10px"
            >
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
                        <span style={{ color: "#3A4F50" }}>••••••</span>
                    ) : (
                        <>
                            <span style={{ color: "#3A4F50" }}>{main}</span>
                            {decimal && (
                                <span
                                    style={{
                                        color: "#444050",
                                        fontSize: "25px",
                                        lineHeight: 1,
                                        verticalAlign: "baseline",
                                        marginBottom: "2px",
                                    }}
                                >
                  {decimal}
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