import { api } from "./client";
import type { Dict } from "../types";

export const getCategories = (): Promise<Dict[]> => {
    return api.get<Dict[]>("/categories").then(r => r.data);
}

export const getPriorities = (): Promise<Dict[]> => {
    return api.get<Dict[]>("/priorities").then(r => r.data);
}

export const getStatuses = (): Promise<Dict[]> => {
    return api.get<Dict[]>("/request-statuses").then(r => r.data);
}
