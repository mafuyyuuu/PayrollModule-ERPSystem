import React from "react";
import { TextField } from "@mui/material";
export default function ViewTextField({ value, placeholder }) {
    return (
        <TextField// Optional: Adds a label above the field
            placeholder={placeholder}  // Optional: Shows if value is empty
            value={value || ""}  // Ensures a string value; defaults to empty string to avoid React warnings
            fullWidth
            InputProps={{
                readOnly: true,
                style: {
                    height: "45px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    color: "#000000",
                    pointerEvents: "none",
                    fontFamily: "TTHoves-Regular, sans-serif",
                    fontSize: "16px",

                },
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    cursor: "default",
                    "& fieldset": {
                        borderRadius: "12px",
                    },
                }
            }}
        />
    );
}