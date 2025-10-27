import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DashboardCard from "../../components/DashboardCard.jsx";

const PayrollDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box
            width="100%"
            height="50vh"
        >
            <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="20px"
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
                backgroundColor="rgba(255, 255, 255, 0.2)"
                mt = "30px"
                borderRadius="12px"
                height="100%"
                p="24px"
                color="#222"
                sx={{
                    fontFamily: "'TTHoves-Regular', sans-serif",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    }
                }}
            >
                <Typography variant="h4">Payout Schedule Timeline</Typography>
            </Box>
        </Box>
    );
};

export default PayrollDashboard;
