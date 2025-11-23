import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function FilterSelect({ value, onChange, options = [], label = "Filter By" }) {
    const theme = useTheme();

    return (
        <FormControl
            sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.8)",
                    height: "40px",
                    fontFamily: theme.typography.fontFamily,
                },
            }}
        >
            <InputLabel>{label}</InputLabel>
            <Select
                value={value || ""}
                onChange={onChange}
                label={label}
            >
                {/* If options is array of objects */}
                {options.length > 0 && typeof options[0] === 'object' ? (
                    options.map((option, index) => (
                        <MenuItem key={index} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))
                ) : (
                    // If options is array of strings
                    <>
                        <MenuItem value="">All</MenuItem>
                        {options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </>
                )}
            </Select>
        </FormControl>
    );
}