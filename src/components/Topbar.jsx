import {useContext, useState, useEffect} from "react";
import {
    Box, IconButton, Typography, useTheme, Badge, Menu, MenuItem,
} from "@mui/material";
import {ColorModeContext, tokens} from "../theme.js";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useUser } from "./UserContext.jsx";
import { useLocation } from "react-router-dom";

const Topbar = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const isLightMode = theme.palette.mode === "light";
    const { user } = useUser();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);

    // Get user's display name - prefer first name only
    const getUserName = () => {
        if (!user) return "User";
        
        // Priority 1: Use firstName if available (from employee data)
        if (user.firstName) return user.firstName;
        
        // Priority 2: Extract from full name if it looks like a real name (contains space)
        if (user.name && user.name.includes(' ')) {
            const nameParts = user.name.split(' ');
            return nameParts[0];
        }
        
        // Priority 3: If name looks like username (contains dots/underscores), parse it
        if (user.name && (user.name.includes('.') || user.name.includes('_'))) {
            const nameParts = user.name.split(/[._]/);
            return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
        }
        
        // Priority 4: Parse username if it contains separators
        if (user.username && (user.username.includes('.') || user.username.includes('_'))) {
            const usernameParts = user.username.split(/[._]/);
            return usernameParts[0].charAt(0).toUpperCase() + usernameParts[0].slice(1).toLowerCase();
        }
        
        // Priority 5: Use name as-is if it's a simple name
        if (user.name) return user.name;
        
        // Priority 6: Use username as-is
        if (user.username) return user.username;
        
        return "User";
    };

    // Get page title based on route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return "Here's your dashboard overview.";
        if (path.includes('/profile')) return "Manage your profile information.";
        if (path.includes('/history') || path.includes('/payout')) return "View your payout history.";
        if (path.includes('/tax')) return "View your tax contributions.";
        if (path.includes('/timesheets')) return "Manage employee timesheets.";
        if (path.includes('/payroll')) return "Process and manage payroll.";
        if (path.includes('/pending')) return "Review pending requests.";
        if (path.includes('/reports')) return "View reports and analytics.";
        if (path.includes('/employee')) return "Manage employee records.";
        if (path.includes('/user')) return "Manage system users.";
        if (path.includes('/configuration')) return "Configure system settings.";
        if (path.includes('/approvals')) return "Manage approval workflows.";
        if (path.includes('/audit')) return "View system audit logs.";
        if (path.includes('/setup')) return "Configure payroll settings.";
        return "Here's your dashboard overview.";
    };

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                let endpoint = 'http://localhost:8080/api/admin/notifications';
                
                // Use role-specific endpoints if available
                if (user?.role === 'employee') {
                    endpoint = `http://localhost:8080/api/employee/notifications/${user.employee_id || user.employeeId}`;
                } else if (user?.role === 'manager') {
                    endpoint = 'http://localhost:8080/api/manager/notifications';
                } else if (user?.role === 'payroll') {
                    endpoint = 'http://localhost:8080/api/payroll/notifications';
                }

                const response = await fetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.slice(0, 5));
                    setUnreadCount(data.filter(n => !n.read).length);
                }
            } catch (error) {
                setNotifications([
                    { id: 1, title: "System Ready", message: "All systems operational", read: true }
                ]);
            }
        };

        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setAnchorEl(null);
        setUnreadCount(0);
    };

    const formatTimeAgo = (date) => {
        if (!date) return "";
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (<Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        height="16vh"
        p="4rem"
        sx={{
            background: isLightMode ? tokens("light").gray[500] : `linear-gradient(to right, ${tokens("dark").bunker[500]} 50%, ${tokens("dark")["outer-space"][500]} 85%, ${tokens("dark")["outer-space"][500]} 100%)`, // subtle gradient on right end
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)"
        }}
    >
        <Box>
            <Typography
                variant="h2"
                sx={{
                    fontFamily: "TTHoves-Bold, sans-serif", color: theme.palette.text.primary, lineHeight: 1.2,
                }}
            >
                Welcome, {getUserName()}.
            </Typography>
            <Typography
                variant="h4"
                sx={{
                    fontFamily: "TTHoves-Regular, sans-serif", color: theme.palette.text.primary, mt: 0.5,
                }}
            >
                {getPageTitle()}
            </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap="1rem">
            <IconButton onClick={handleNotificationClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsNoneOutlinedIcon
                        sx={{
                            fontSize: "1.7rem",
                            color: isLightMode ? tokens("light").black[500] : tokens("dark").gallery[500],
                        }}
                    />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleNotificationClose}
                PaperProps={{
                    sx: {
                        width: 320,
                        maxHeight: 400,
                        mt: 1,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        borderRadius: "12px",
                    }
                }}
            >
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
                </Box>
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">No notifications</Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notif, index) => (
                        <MenuItem key={notif.id || index} onClick={handleNotificationClose}
                            sx={{ flexDirection: "column", alignItems: "flex-start", py: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{notif.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{notif.message}</Typography>
                        </MenuItem>
                    ))
                )}
            </Menu>
            <IconButton onClick={colorMode.toggleColorMode}>
                {isLightMode ? (<DarkModeOutlinedIcon
                    sx={{
                        fontSize: "1.7rem", color: tokens("light").black[500], fill: tokens("light").black[500],
                    }}
                />) : (<LightModeOutlinedIcon
                    sx={{
                        fontSize: "1.7rem",
                        color: tokens("dark")["white-ice"][100],
                        fill: tokens("dark")["white-ice"][100],
                    }}
                />)}
            </IconButton>
        </Box>
    </Box>);
};

export default Topbar;
