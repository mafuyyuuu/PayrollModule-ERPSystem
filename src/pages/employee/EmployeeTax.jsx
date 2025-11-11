import { Box, Typography } from "@mui/material";
import DashboardCard from "../../components/DashboardCard.jsx";
import SearchBar from "../../components/SearchBar.jsx";

export default function EmployeeTax() {
    const employeeContribution = [
        {
            employee: "John Doe",
            SSS: 20500,
            PhilHealth: 19500,
            PagIBIG: 15000,
            WTAX: 5000,
        },
        {
            employee: "Jane Smith",
            SSS: 18200,
            PhilHealth: 17300,
            PagIBIG: 14000,
            WTAX: 4200,
        },
        {
            employee: "Michael Tan",
            SSS: 22000,
            PhilHealth: 20500,
            PagIBIG: 16500,
            WTAX: 5500,
        },
    ];


    return (
        <Box
            width="100%"
            height="100%"
        >
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="20px"
            >
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="SSS"
                    value="₱20,500.00"
                    showHideButton={true}
                />
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="Pag-IBIG"
                    value="₱20,500.00"
                    showHideButton={true}
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="PhilHealth"
                    value="₱19,500.00"
                    showHideButton={true}
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Withholding Tax"
                    value="₱19,500.00"
                    showHideButton={true}
                />
            </Box>

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={4}
                mb={2}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: "20px",
                        fontFamily: "'TTHoves-Bold', sans-serif",
                        color: "#222",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    Contribution
                </Typography>

                <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ position: "relative" }}>
                        <select
                            defaultValue=""
                            style={{
                                height: "45px",
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                width: 250,
                                padding: "10px 40px 10px 12px",
                                borderRadius: "15px",
                                border: "1px solid rgba(255, 255, 255, 0.4)",
                                background: "rgba(255, 255, 255, 0.2)",
                                backdropFilter: "blur(12px)",
                                color: "#222",
                                fontFamily: "inherit",
                                fontSize: "16px",
                                cursor: "pointer",
                                outline: "none",
                            }}
                        >
                            <option value="">Select Payroll Duration</option>
                        </select>
                        <i
                            className="ri-arrow-down-s-line"
                            style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                color: "#222",
                                fontSize: "18px",
                            }}
                        ></i>
                    </Box>

                    <SearchBar
                        placeholder="Enter Employee Name"
                        width="450px"
                    />
                </Box>
            </Box>

            <Box
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius="12px"
                p="24px"
                color="#222"
                height="69%"
                sx={{
                    backdropFilter: "blur(12px)",
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
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                        alignItems: "left",
                        justifyItems: "center",
                        border: "none",
                        padding: "15px",
                        fontWeight: 600,

                    }}
                >
                    <span>Employee</span>
                    <span>SSS</span>
                    <span>PhilHealth</span>
                    <span>Pag-IBIG</span>
                    <span>WTAX</span>
                    <span>Total</span>
                </Box>

                <Box
                    sx={{
                        maxHeight: "100%",
                        overflowY: "auto",
                        pr: "8px",
                        display: "flex",
                        flexDirection: "column",
                        mt: "5px",
                        gap: "10px",
                        height: "85%",
                    }}
                >
                    {employeeContribution.map((item, index) => {
                        const total = item.SSS + item.PhilHealth + item.PagIBIG + item.WTAX;

                        return (
                            <Box
                                key={index}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                                    alignItems: "left",
                                    justifyItems: "center",
                                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                                    backdropFilter: "blur(12px)",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    marginTop: "3px",
                                    transition: "all 0.3s ease",
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    "&:hover": {
                                        backgroundColor: "rgba(255, 255, 255, 0.4)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                    },
                                }}
                            >
                                <span>{item.employee}</span>
                                <span>₱{item.SSS.toLocaleString()}</span>
                                <span>₱{item.PhilHealth.toLocaleString()}</span>
                                <span>₱{item.PagIBIG.toLocaleString()}</span>
                                <span>₱{item.WTAX.toLocaleString()}</span>
                                <span>₱{total.toLocaleString()}</span>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}