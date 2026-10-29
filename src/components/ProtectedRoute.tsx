import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

function ProtectedRoute({ role }: { role?: Role }){
    const auth = useAuth();

    if (!auth.token) return <Navigate to="/login" replace />;
    if (role && auth.role !== role) return <Navigate to="/requests" replace />;

    return <Outlet />;
}

export default ProtectedRoute;
