import React from "react";
import { Box, useTheme } from "@mui/material";

const FilterSelect = ({
                          width = 100,
                          placeholder = "Filter",
                          options = [],
                          value = "",
                          onChange = () => {},
                      }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: "relative",
                width: width,
                borderRadius: "20px",
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor:
                    theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(12px)",
                overflow: "hidden",
                transition: "box-shadow 0.3s ease, transform 0.3s ease",
                "&:hover": {
                    boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <select
                value={value}
                onChange={onChange}
                style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: theme.palette.text.primary,
                    fontFamily: "inherit",
                    fontSize: "16px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                }}
            >
                <option value="" disabled hidden style={{
                    backgroundColor: theme.palette.mode === "dark" ? "#172224" : "#fff",
                    color: theme.palette.text.primary,
                    padding: "10px",
                }}>
                    {placeholder}
                </option>

                {/* Handle options as array of objects or strings */}
                {options.length > 0 && typeof options[0] === "object" ? (
                    options.map((option, index) => (
                        <option key={index} value={option.value} style={{
                            width: "3rem",
                            backgroundColor: theme.palette.mode === "dark" ? "#172224" : "#fff",
                            color: theme.palette.text.primary,
                            textTransform: "capitalize",
                        }}>
                            {option.label}
                        </option>
                    ))
                ) : (
                    <>
                        <option value="" style={{
                            backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                            color: theme.palette.text.primary,
                        }}>All</option>
                        {options.map((option, index) => (
                            <option key={index} value={option} style={{
                                backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                                color: theme.palette.text.primary,
                                textTransform: "capitalize",
                            }}>
                                {option}
                            </option>
                        ))}
                    </>
                )}
            </select>

            <i
                className="ri-filter-3-line"
                style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    fontSize: 18,
                    color: theme.palette.text.primary,
                }}
            />
        </Box>
    );
};

export default FilterSelect;
