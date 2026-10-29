import axios from "axios";
import { clearAuth, getToken } from "../auth/storage";

export const api = axios.create({
    baseURL: "/api"
});

api.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
    onUnauthorized = handler;
}

api.interceptors.response.use(
    response => response,
    error => {

        if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.url !== "/auth/login") {
            clearAuth();
            onUnauthorized?.();
        }
        return Promise.reject(error);
    }
);

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        if (!error.response) return "Network error. Please check your connection.";
        return error.response.data?.message ?? "Server error. Please try again later.";
    }
    return "Something went wrong.";
}
