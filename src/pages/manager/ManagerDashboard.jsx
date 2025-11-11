import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DashboardCard from "../../components/DashboardCard.jsx";


const ManagerDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box mb="20px" mr="20px" ml="20px" >
            {/* DASHBOARD CARDS */}
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="20px">
                <DashboardCard
                    icon="ri-user-2-line"
                    title="Active Employees"
                    value="55"
                />
                <DashboardCard
                    icon="ri-pass-pending-line"
                    title="Pending Approvals"
                    value="XXXX"
                />
                <DashboardCard
                    icon="ri-briefcase-4-line"
                    title="Total Department Payroll"
                    value="₱520,000"
                />
                <DashboardCard
                    icon="ri-percent-fill"
                    title="Attendance Rate"
                    value="96%" />
            </Box>

            {/* LOWER SECTION: PERFORMANCE + EARNINGS */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(2, 1fr)"
                gap="20px"
                mt="30px"
            >
                {/* Top Performing Employees */}
                <Box
                    backgroundColor="rgba(255, 255, 255, 0.4)"
                    borderRadius="12px"
                    p="20px"
                    minHeight="300px"
                    boxShadow="0 2px 8px rgba(0,0,0,0.05)"
                    sx={{
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                    }}
                >

                    <Typography variant="h6" mb="15px">
                        Top Performing Employees
                    </Typography>
                    {/* Placeholder for chart or list */}
                </Box>

                {/* Total Earning */}
                <Box
                    backgroundColor="rgba(255, 255, 255, 0.4)"
                    borderRadius="12px"
                    p="20px"
                    minHeight="300px"
                    boxShadow="0 2px 8px rgba(0,0,0,0.05)"
                    sx={{
                        fontFamily: "'TTHoves-Regular', sans-serif",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <Typography variant="h6" mb="15px">
                        Total Earning
                    </Typography>
                    {/* Placeholder for graph */}
                </Box>
            </Box>
        </Box>
    );
};

export default ManagerDashboard;
