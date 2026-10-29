import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api/auth.api";
import { setUnauthorizedHandler } from "../api/client";
import { clearAuth, getRole, getToken, saveAuth } from "../auth/storage";
import type { Role, User } from "../types";

interface AuthContextValue{
    token: string | null;
    role: Role | null;
    user: User | undefined;
    login: (token: string, role: Role) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }){
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [token, setToken] = useState<string | null>(getToken());
    const [role, setRole] = useState<Role | null>(getRole());

    const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe, enabled: token !== null });

    const login = (newToken: string, newRole: Role) => {
        saveAuth(newToken, newRole);
        setToken(newToken);
        setRole(newRole);
    }

    const logout = useCallback(() => {
        clearAuth();
        setToken(null);
        setRole(null);
        queryClient.clear();
    }, [queryClient]);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            logout();
            navigate("/login", { replace: true });
        });
        return () => setUnauthorizedHandler(null);
    }, [logout, navigate]);

    return(
        <AuthContext.Provider value={{ token, role, user: meQuery.data, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
