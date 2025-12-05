import { NavLink, useNavigate } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import "../components/Sidebar.css";
import { useUser } from "./UserContext.jsx";
import logo from "../assets/violin.png";
import { useState } from "react";
import LogoutModal from '../pages/auth/LogoutModal.jsx';
import BoxModal from './BoxModal.jsx';
import { Box, Typography, Button } from "@mui/material";

export default function Sidebar() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const roleBasePath = {
        admin: "/admin",
        payroll: "/payroll",
        manager: "/manager",
        employee: "/employee",
    };

    const handleLogout = () => {
        if (user?.role === 'employee') {
            setShowLogoutModal(true);
        } else {
            setShowConfirmModal(true);
        }
    };

    const handleConfirmLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST", credentials: "include" });
        } catch (err) {
            console.error("Session logout failed:", err);
        }
        setUser(null);
        localStorage.removeItem("user");
        setShowConfirmModal(false);
        navigate("/", { replace: true });
    };

    const basePath = roleBasePath[user?.role] || "";

    const roleBasedNav = {
        admin: [
            { name: "Dashboard", path: "dashboard", icon: "ri-home-5-fill" },
            { name: "Configuration", path: "configuration", icon: "ri-tools-fill" },
            { name: "User Management", path: "user", icon: "ri-user-settings-fill" },
            { name: "Reports and Analytics", path: "reports", icon: "ri-bar-chart-2-fill" },
            { name: "Payroll Setup", path: "setup", icon: "ri-hand-coin-fill" },
            { name: "Audit Logs", path: "audit", icon: "ri-chat-history-fill" },
        ],
        payroll: [
            { name: "Dashboard", path: "dashboard", icon: "ri-home-5-fill" },
            { name: "Employee Records", path: "employee", icon: "ri-group-fill" },
            { name: "Process Payroll", path: "payroll", icon: "ri-bank-card-fill" },
            { name: "Pending Request", path: "pending", icon: "ri-clipboard-fill" },
            { name: "Reports and History", path: "reports", icon: "ri-bar-chart-2-fill" },
            { name: "Tax Contribution", path: "tax", icon: "ri-file-text-fill" },
        ],
        manager: [
            { name: "Dashboard", path: "dashboard", icon: "ri-home-5-fill" },
            { name: "Timesheets", path: "timesheets", icon: "ri-time-fill" },
            { name: "Payroll Management", path: "payroll", icon: "ri-briefcase-fill" },
            { name: "Pending Request", path: "pending", icon: "ri-timer-2-fill" },
            { name: "Reports and Analytics", path: "reports", icon: "ri-bar-chart-2-fill" },
        ],
        employee: [
            { name: "Dashboard", path: "dashboard", icon: "ri-home-5-fill" },
            { name: "Payout History", path: "history", icon: "ri-calendar-check-fill" },
            { name: "Tax and Contribution", path: "tax", icon: "ri-file-text-fill" },
        ],
    };

    const navItems = roleBasedNav[user?.role] || [];

    return (
        <>
            <nav className="sidebar">
                <div className="top-section">
                    <div className="logo-section">
                        <img src={logo} alt="Logo" className="logo" />
                        <span className="logo-text">Payroll</span>
                    </div>

                    <ul className="nav-list">
                        {navItems.map((item) => (
                            <li key={item.name} className="nav-item">
                                <NavLink
                                    to={`${basePath}/${item.path}`}
                                    end={item.path === "dashboard"}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? "active" : ""}`
                                    }
                                >
                                    <i className={`${item.icon} icon`}></i>
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bottom-section">
                    {user?.role === "employee" && (
                        <NavLink
                            to={`${basePath}/profile`}
                            className={({ isActive }) => `profile-link ${isActive ? "active" : ""}`}
                        >
                            <i className="ri-user-3-fill icon"></i>
                            <span>User Profile</span>
                        </NavLink>
                    )}
                    <button className="logout-link" onClick={handleLogout}>
                        <i className="ri-logout-box-r-fill icon"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            <LogoutModal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
            />

            <BoxModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} width={400}>
                <Box sx={{ textAlign: "center" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "24px",
                            fontFamily: "'TTHoves-Bold', sans-serif",
                            color: "#fff",
                            mb: 1
                        }}
                    >
                        Are you sure you want to logout?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
                        <Box
                            variant="outlined"
                            onClick={() => setShowConfirmModal(false)}
                            sx={{
                                fontSize: "14px",
                                backgroundColor: "#bdbdbd",
                                color: "#333",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                "&:hover": { backgroundColor: "#a0a0a0" }
                            }}
                        >
                            Cancel
                        </Box>
                        <Box
                            variant="contained"
                            onClick={handleConfirmLogout}
                            sx={{
                                fontSize: "14px",
                                fontFamily: "'TTHoves-Regular', sans-serif",
                                backgroundColor: "#dc3545",
                                padding: "10px 24px",
                                borderRadius: "15px",
                                cursor: "pointer",
                                border: "none",
                                "&:hover": { backgroundColor: "#c82333" }
                            }}
                        >
                            Logout
                        </Box>
                    </Box>
                </Box>
            </BoxModal>
        </>
    );
}
