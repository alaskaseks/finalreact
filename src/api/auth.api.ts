import { api } from "./client";
import type { LoginDto, LoginResponse, User } from "../types";

export const login = (dto: LoginDto): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/auth/login", dto).then(r => r.data);
}

export const getMe = (): Promise<User> => {
    return api.get<User>("/auth/me").then(r => r.data);
}
