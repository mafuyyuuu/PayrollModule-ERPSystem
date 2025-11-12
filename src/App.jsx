import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

import { UserProvider } from "./components/UserContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Auth pages
import Auth from "./pages/auth/Auth.jsx";
import Landing from "./pages/auth/Landing.jsx";
import Login from "./pages/auth/Login.jsx";

// Layout
import Layout from "./components/Layout.jsx";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminConfiguration from "./pages/admin/AdminConfiguration.jsx";
import AdminUserManagement from "./pages/admin/AdminUserManagement.jsx";
import AdminApprovals from "./pages/admin/AdminApprovals.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminPayrollSetup from "./pages/admin/AdminPayrollSetup.jsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.jsx";

// Payroll pages
import PayrollDashboard from "./pages/payroll/PayrollDashboard.jsx";
import PayrollEmployeeRecords from "./pages/payroll/PayrollEmployeeRecords.jsx";
import PayrollProcess from "./pages/payroll/PayrollProcess.jsx";
import PayrollPendingRequest from "./pages/payroll/PayrollPendingRequest.jsx";
import PayrollReports from "./pages/payroll/PayrollReports.jsx";
import PayrollTaxContribution from "./pages/payroll/PayrollTaxContribution.jsx";

// Manager pages
import ManagerDashboard from "./pages/manager/ManagerDashboard.jsx";
import ManagerTimesheets from "./pages/manager/ManagerTimesheets.jsx";
import ManagerPayrollManagement from "./pages/manager/ManagerPayrollManagement.jsx";
import ManagerPendingRequest from "./pages/manager/ManagerPendingRequest.jsx";
import ManagerReports from "./pages/manager/ManagerReports.jsx";

// Employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import EmployeePayoutHistory from "./pages/employee/EmployeePayoutHistory.jsx";
import EmployeeTax from "./pages/employee/EmployeeTax.jsx";
import EmployeeProfile from "./pages/employee/EmployeeProfile.jsx";

function App() {
    const [theme, colorMode] = useMode();

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                    sx={(theme) => ({
                        backgroundColor: theme.palette.background.default,
                        minHeight: "100vh",
                        color: theme.palette.text.primary,
                        fontFamily: theme.typography.fontFamily,
                    })}
                >
                    <UserProvider>
                        <Router>
                            <Routes>
                                {/* Auth routes */}
                                <Route element={<Auth />}>
                                    <Route path="/" element={<Landing />} />
                                    <Route path="/login" element={<Login />} />
                                </Route>

                                {/* Protected routes with Layout */}
                                <Route element={<Layout />}>
                                    {/* Admin routes */}
                                    <Route
                                        path="/admin/dashboard"
                                        element={
                                            <ProtectedRoute allowedRoles={["admin"]}>
                                                <AdminDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/configuration"
                                        element={
                                            <ProtectedRoute allowedRoles={["admin"]}>
                                                <AdminConfiguration />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/user"
                                        element={
                                            <ProtectedRoute allowedRoles={["admin"]}>
                                                <AdminUserManagement />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/approvals"
                                        element={
                                            <ProtectedRoute allowedRoles={["admin"]}>
                                                <AdminApprovals />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/reports"
                                        element={
                                            <ProtectedRoute allowedRoles={["admin"]}>
                                                <AdminReports />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/setup"
                                        element={
                                            <ProtectedRoute allowedRoles={["admin"]}>
                                                <AdminPayrollSetup />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/admin/audit"
                                        element={
                                            <ProtectedRoute allowedRoles={["admin"]}>
                                                <AdminAuditLogs />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Payroll routes */}
                                    <Route
                                        path="/payroll/dashboard"
                                        element={
                                            <ProtectedRoute allowedRoles={["payroll"]}>
                                                <PayrollDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/payroll/employee"
                                        element={
                                            <ProtectedRoute allowedRoles={["payroll"]}>
                                                <PayrollEmployeeRecords />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/payroll/payroll"
                                        element={
                                            <ProtectedRoute allowedRoles={["payroll"]}>
                                                <PayrollProcess />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/payroll/pending"
                                        element={
                                            <ProtectedRoute allowedRoles={["payroll"]}>
                                                <PayrollPendingRequest />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/payroll/reports"
                                        element={
                                            <ProtectedRoute allowedRoles={["payroll"]}>
                                                <PayrollReports />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/payroll/tax"
                                        element={
                                            <ProtectedRoute allowedRoles={["payroll"]}>
                                                <PayrollTaxContribution />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Manager routes */}
                                    <Route
                                        path="/manager/dashboard"
                                        element={
                                            <ProtectedRoute allowedRoles={["manager"]}>
                                                <ManagerDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/manager/timesheets"
                                        element={
                                            <ProtectedRoute allowedRoles={["manager"]}>
                                                <ManagerTimesheets />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/manager/payroll"
                                        element={
                                            <ProtectedRoute allowedRoles={["manager"]}>
                                                <ManagerPayrollManagement />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/manager/pending"
                                        element={
                                            <ProtectedRoute allowedRoles={["manager"]}>
                                                <ManagerPendingRequest />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/manager/reports"
                                        element={
                                            <ProtectedRoute allowedRoles={["manager"]}>
                                                <ManagerReports />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Employee routes */}
                                    <Route
                                        path="/employee/dashboard"
                                        element={
                                            <ProtectedRoute allowedRoles={["employee"]}>
                                                <EmployeeDashboard />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/employee/history"
                                        element={
                                            <ProtectedRoute allowedRoles={["employee"]}>
                                                <EmployeePayoutHistory />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/employee/tax"
                                        element={
                                            <ProtectedRoute allowedRoles={["employee"]}>
                                                <EmployeeTax />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/employee/profile"
                                        element={
                                            <ProtectedRoute allowedRoles={["employee"]}>
                                                <EmployeeProfile />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Fallback route */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Route>
                            </Routes>
                        </Router>
                    </UserProvider>
                </Box>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;