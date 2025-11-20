import {Box, Typography, useTheme} from "@mui/material";
import {tokens} from "../../theme";
import DashboardCard from "../../components/DashboardCard.jsx";

const PayrollDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (<Box
            width="100%"
            height="80%"
        >
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="20px"
                marginBottom="30px"
            >
                <DashboardCard
                    icon="ri-group-line"
                    title="Total Employees"
                    value="32"
                />
                <DashboardCard
                    icon="ri-group-line"
                    title="Processed Payouts"
                    value="30"
                />
                <DashboardCard
                    icon="ri-hand-coin-line"
                    title="Pending Payouts"
                    value="2"
                />
                <DashboardCard
                    icon="ri-timer-line"
                    title="Upcoming Schedules"
                    value="October 30, 2025"
                />
            </Box>

            {/* PAYOUT SCHEDULE TIMELINE */}
            <Box
                sx={{
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    p: "24px",
                    color: theme.palette.text.primary,
                    height: "97.5%",
                    backdropFilter: "blur(12px)",
                    fontFamily: theme.typography.fontFamily,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    },
                    gap: "10px",
                }}
            >
                <Typography variant="h4">Payout Schedule Timeline</Typography>
            </Box>
        </Box>);
};

export default PayrollDashboard;
