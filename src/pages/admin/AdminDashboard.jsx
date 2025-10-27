import { Box, Typography} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { tokens } from "../../theme";
import DashboardCard from "../../components/DashboardCard.jsx";

const AdminDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box m="20px">
            {/* DASHBOARD CARDS */}
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px">
                <DashboardCard icon="ri-group-line" title="Total Employees" value="55" />
                <DashboardCard icon="ri-refund-2-line" title="Processed Payouts" value="XXXX" date="Sep. 11, 2025" />
                <DashboardCard icon="ri-timer-line" title="Pending Payouts" value="XXXX" date="Sep. 11, 2025" />
                <DashboardCard icon="ri-calendar-schedule-line" title="Upcoming Schedules" value="10/11/25" />
            </Box>

            {/* PAYOUT SCHEDULE TIMELINE */}
            <Box
                mt="30px"
                p="20px"
                backgroundColor={alpha(colors.white[500] || "#FFFFFF", 0.2)}
                borderRadius="8px"
                minHeight="250px"
                sx={{
                    boxShadow:
                        "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                }}
            >
                <div className="notifications-header">
                    <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                        <i className="ri-mail-unread-line"></i>
                        <Typography variant="h6">System Alerts and Notifications</Typography>
                    </div>
                </div>
            </Box>
        </Box>
    );
};

export default AdminDashboard;