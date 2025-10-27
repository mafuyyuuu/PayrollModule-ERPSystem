import {NavLink, useNavigate} from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import "../components/Sidebar.css";
import { useUser } from "./UserContext.jsx";
import logo from "../assets/lenscape.png";

export default function Sidebar() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const roleBasePath = {
        admin: "/admin",
        payroll: "/payroll",
        manager: "/manager",
        employee: "/employee",
    };

    const handleLogout = () => {
        // clear user data
        setUser(null);
        localStorage.removeItem("user");
        navigate("/");
    };

    const basePath = roleBasePath[user?.role] || "";

    const roleBasedNav = {
        admin: [
            { name: "Dashboard", path: "dashboard", icon: "ri-home-5-fill" },
            { name: "Configuration", path: "configuration", icon: "ri-tools-fill" },
            { name: "User Management", path: "user", icon: "ri-user-settings-fill" },
            { name: "Approvals", path: "approvals", icon: "ri-checkbox-multiple-fill" },
            { name: "Reports and Analytics", path: "reports", icon: "ri-bar-chart-2-fill" },
            { name: "Payroll Setup", path: "setup", icon: "ri-hand-coin-fill" },
            { name: "Audit Logs", path: "audit", icon: "ri-chat-history-fill" },
            { name: "Notifications", path: "notifications", icon: "ri-notification-2-fill" },
        ],
        payroll: [
            { name: "Dashboard", path: "dashboard", icon: "ri-home-5-fill" },
            { name: "Employee Records", path: "employee", icon: "ri-group-fill" },
            { name: "Process Payroll", path: "payroll", icon: "ri-bank-card-fill" },
            { name: "Pending Request", path: "pending", icon: "ri-clipboard-fill" },
            { name: "Reports and History", path: "reports", icon: "ri-bar-chart-2-fill" },
            { name: "Tax Contributions", path: "tax", icon: "ri-file-text-fill" },
        ],
        manager: [
            { name: "Dashboard", path: "dashboard", icon: "ri-home-5-fill" },
            { name: "Timesheets", path: "timesheets", icon: "ri-time-fill" },
            { name: "Payroll Management", path: "payroll", icon: "ri-briefcase-fill" },
            { name: "Pending Request", path: "pending", icon: "ri-timer-2-fill" },
            { name: "Reports and Analytics", path: "reports", icon: "ri-bar-chart-2-fill" },
            { name: "Notifications", path: "notifications", icon: "ri-notification-2-fill" },
        ],
        employee: [
            { name: "Dashboard", path: "dashboard", icon: "ri-home-5-fill" },
            { name: "Payout History", path: "history", icon: "ri-calendar-check-fill" },
            { name: "Tax and Contributions", path: "tax", icon: "ri-file-text-fill" },
        ],
    };

    const navItems = roleBasedNav[user?.role] || [];

    return (
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

            <div className="logout-section">
                <NavLink to={`${basePath}/logout`} className="logout-link">
                    <i className="ri-logout-box-r-fill icon"></i>
                    <span onClick={handleLogout}>Logout</span>                </NavLink>
            </div>
        </nav>
    );
}