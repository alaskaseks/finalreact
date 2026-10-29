import { api } from "./client";
import type {
    AddCommentDto, ChangeStatusDto, CreateRequestDto, HistoryEntry,
    RequestComment, RequestDetails, ServiceRequest
} from "../types";

export const getMyRequests = (simulate?: string | null): Promise<ServiceRequest[]> => {
    return api.get<ServiceRequest[]>("/requests/my", { params: { simulate } }).then(r => r.data);
}

export const getAllRequests = (simulate?: string | null): Promise<ServiceRequest[]> => {
    return api.get<ServiceRequest[]>("/requests", { params: { simulate } }).then(r => r.data);
}

export const getRequest = (id: number): Promise<RequestDetails> => {
    return api.get<RequestDetails>(`/requests/${id}`).then(r => r.data);
}

export const createRequest = (dto: CreateRequestDto): Promise<ServiceRequest> => {
    return api.post<ServiceRequest>("/requests", dto).then(r => r.data);
}

export const changeStatus = (id: number, dto: ChangeStatusDto): Promise<ServiceRequest> => {
    return api.patch<ServiceRequest>(`/requests/${id}/status`, dto).then(r => r.data);
}

export const addComment = (id: number, dto: AddCommentDto): Promise<RequestComment> => {
    return api.post<RequestComment>(`/requests/${id}/comments`, dto).then(r => r.data);
}

export const getHistory = (id: number): Promise<HistoryEntry[]> => {
    return api.get<HistoryEntry[]>(`/requests/${id}/history`).then(r => r.data);
}
