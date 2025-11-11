import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import 'boxicons/css/boxicons.min.css';
import 'remixicon/fonts/remixicon.css';

import { UserProvider } from "./components/UserContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// auth pages
import Auth from "./pages/auth/Auth.jsx";
import Landing from "./pages/auth/Landing.jsx";
import Login from "./pages/auth/Login.jsx";

// layout
import Layout from "./components/Layout.jsx";

// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminConfiguration from "./pages/admin/AdminConfiguration.jsx";
import AdminUserManagement from "./pages/admin/AdminUserManagement.jsx";
import AdminApprovals from "./pages/admin/AdminApprovals.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminPayrollSetup from "./pages/admin/AdminPayrollSetup.jsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.jsx";

// payroll pages
import PayrollDashboard from "./pages/payroll/PayrollDashboard.jsx";
import PayrollEmployeeRecords from "./pages/payroll/PayrollEmployeeRecords.jsx";
import PayrollProcess from "./pages/payroll/PayrollProcess.jsx";
import PayrollPendingRequest from "./pages/payroll/PayrollPendingRequest.jsx";
import PayrollReports from "./pages/payroll/PayrollReports.jsx";
import PayrollTaxContribution from "./pages/payroll/PayrollTaxContribution.jsx";

// manager pages
import ManagerDashboard from "./pages/manager/ManagerDashboard.jsx";
import ManagerTimesheets from "./pages/manager/ManagerTimesheets.jsx";
import ManagerPayrollManagement from "./pages/manager/ManagerPayrollManagement.jsx";
import ManagerPendingRequest from "./pages/manager/ManagerPendingRequest.jsx";
import ManagerReports from "./pages/manager/ManagerReports.jsx";

// employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import EmployeePayoutHistory from "./pages/employee/EmployeePayoutHistory.jsx";
import EmployeeTax from "./pages/employee/EmployeeTax.jsx";
import EmployeeProfile from "./pages/employee/EmployeeProfile.jsx";

function App() {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    {/* landing and login */}
                    <Route element={<Auth />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                    </Route>

                    {/* all protected routes share the same layout */}
                    <Route element={<Layout />}>
                        {/* admin routes */}
                        <Route path="/admin/*" element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <Routes>
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="configuration" element={<AdminConfiguration />} />
                                    <Route path="user" element={<AdminUserManagement />} />
                                    <Route path="approvals" element={<AdminApprovals />} />
                                    <Route path="reports" element={<AdminReports />} />
                                    <Route path="setup" element={<AdminPayrollSetup />} />
                                    <Route path="audit" element={<AdminAuditLogs />} />
                                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        {/* payroll routes */}
                        <Route path="/payroll/*" element={
                            <ProtectedRoute allowedRoles={["payroll"]}>
                                <Routes>
                                    <Route path="dashboard" element={<PayrollDashboard />} />
                                    <Route path="employee" element={<PayrollEmployeeRecords />} />
                                    <Route path="payroll" element={<PayrollProcess />} />
                                    <Route path="pending" element={<PayrollPendingRequest />} />
                                    <Route path="reports" element={<PayrollReports />} />
                                    <Route path="tax" element={<PayrollTaxContribution />} />
                                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        {/* manager routes */}
                        <Route path="/manager/*" element={
                            <ProtectedRoute allowedRoles={["manager"]}>
                                <Routes>
                                    <Route path="dashboard" element={<ManagerDashboard />} />
                                    <Route path="timesheets" element={<ManagerTimesheets />} />
                                    <Route path="payroll" element={<ManagerPayrollManagement />} />
                                    <Route path="pending" element={<ManagerPendingRequest />} />
                                    <Route path="reports" element={<ManagerReports />} />
                                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        {/* employee routes */}
                        <Route path="/employee/*" element={
                            <ProtectedRoute allowedRoles={["employee"]}>
                                <Routes>
                                    <Route path="dashboard" element={<EmployeeDashboard />} />
                                    <Route path="history" element={<EmployeePayoutHistory />} />
                                    <Route path="tax" element={<EmployeeTax />} />
                                    <Route path="profile" element={<EmployeeProfile />} />
                                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                                </Routes>
                            </ProtectedRoute>
                        } />

                        {/* fallback for any unknown route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;