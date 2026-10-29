import type { Role } from "../types";

const TOKEN_KEY = "accessToken";
const ROLE_KEY = "role";

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
}

export const getRole = (): Role | null => {
    const role = localStorage.getItem(ROLE_KEY);
    return role === "user" || role === "operator" ? role : null;
}

export const saveAuth = (token: string, role: Role): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
}

export const clearAuth = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
}
