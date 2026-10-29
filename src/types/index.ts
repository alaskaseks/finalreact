export type Role = "user" | "operator";

export interface Dict{
    id: number;
    name: string;
}

export interface User{
    id: number;
    name: string;
    email: string;
    role: Role;
}

export interface Contact{
    name: string;
    phone: string;
    email: string;
}

export interface ServiceRequest{
    id: number;
    subject: string;
    description: string;
    category: Dict;
    priority: Dict;
    status: Dict;
    createdAt: string;
    contact: Contact;
}

export interface RequestComment{
    id: number;
    requestId: number;
    author: string;
    text: string;
    createdAt: string;
}

export interface RequestDetails extends ServiceRequest{
    comments: RequestComment[];
}

export interface HistoryEntry{
    id: number;
    requestId: number;
    fromStatus: Dict | null;
    toStatus: Dict;
    changedBy: string;
    changedAt: string;
}

export interface LoginDto{
    email: string;
    password: string;
}

export interface LoginResponse{
    accessToken: string;
    role: Role;
}

export interface CreateRequestDto{
    subject: string;
    description: string;
    categoryId: number;
    priorityId: number;
    contact: Contact;
}

export interface ChangeStatusDto{
    statusId: number;
}

export interface AddCommentDto{
    text: string;
}
