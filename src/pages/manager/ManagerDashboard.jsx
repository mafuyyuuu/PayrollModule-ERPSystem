import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DashboardCard from "../../components/DashboardCard.jsx";

const ManagerDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box m="20px">
            {/* DASHBOARD CARDS */}
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px">
                <DashboardCard title="Total Employees" value="55" />
                <DashboardCard title="Processed Payouts" value="XXXX" date="Sep. 11, 2025" />
                <DashboardCard title="Pending Payouts" value="XXXX" date="Sep. 11, 2025" />
                <DashboardCard title="Upcoming Schedules" value="10/11/25" />
            </Box>

            {/* PAYOUT SCHEDULE TIMELINE */}
            <Box
                mt="30px"
                p="20px"
                backgroundColor={colors.white?.[500] || "#F8F8F9"}
                borderRadius="8px"
                minHeight="250px"
            >
                <Typography variant="h6">Payout Schedule Timeline</Typography>
            </Box>
        </Box>
    );
};

export default ManagerDashboard;