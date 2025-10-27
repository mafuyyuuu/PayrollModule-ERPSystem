import { useUser } from "./UserContext.jsx";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user } = useUser();

    // if no user, redirect to login
    if (!user) return <Navigate to="/login" replace />;

    // if user's role is not allowed, show access denied
    if (!allowedRoles.includes(user.role)) return <h1>Access Denied</h1>;

    return children;
}