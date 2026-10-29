import type { Contact, Dict, RequestComment, Role } from "../types";

export interface DbUser{
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
}

export interface DbRequest{
    id: number;
    subject: string;
    description: string;
    categoryId: number;
    priorityId: number;
    statusId: number;
    createdAt: string;
    userId: number;
    contact: Contact;
}

export interface DbHistory{
    id: number;
    requestId: number;
    fromStatusId: number | null;
    toStatusId: number;
    changedBy: string;
    changedAt: string;
}

export const categories: Dict[] = [
    { id: 1, name: "Hardware" },
    { id: 2, name: "Software" },
    { id: 3, name: "Network" },
    { id: 4, name: "Other" }
];

export const priorities: Dict[] = [
    { id: 1, name: "Low" },
    { id: 2, name: "Medium" },
    { id: 3, name: "High" }
];

export const statuses: Dict[] = [
    { id: 1, name: "New" },
    { id: 2, name: "In progress" },
    { id: 3, name: "Waiting for customer" },
    { id: 4, name: "Resolved" }
];

const contact: Contact = { name: "John User", phone: "+380501112233", email: "user@example.com" };

const makeSeed = () => {
    const users: DbUser[] = [
        { id: 1, name: "John User", email: "user@example.com", password: "user123", role: "user" },
        { id: 2, name: "Olga Operator", email: "operator@example.com", password: "operator123", role: "operator" }
    ];

    const requests: DbRequest[] = [
        { id: 1, subject: "Printer is not working", description: "The office printer shows a paper jam error, but there is no paper inside.", categoryId: 1, priorityId: 3, statusId: 2, createdAt: "2026-10-01T09:00:00.000Z", userId: 1, contact },
        { id: 2, subject: "Cannot install software", description: "The installer stops at 40% and shows an unknown error.", categoryId: 2, priorityId: 2, statusId: 1, createdAt: "2026-10-03T10:30:00.000Z", userId: 1, contact },
        { id: 3, subject: "Wi-Fi keeps disconnecting", description: "Wi-Fi disconnects every 10-15 minutes on the second floor.", categoryId: 3, priorityId: 3, statusId: 3, createdAt: "2026-10-05T12:15:00.000Z", userId: 1, contact },
        { id: 4, subject: "Monitor is flickering", description: "The monitor flickers when the brightness is above 50%.", categoryId: 1, priorityId: 1, statusId: 4, createdAt: "2026-10-07T08:45:00.000Z", userId: 1, contact },
        { id: 5, subject: "Request for a new keyboard", description: "The old keyboard has several broken keys, please replace it.", categoryId: 4, priorityId: 1, statusId: 1, createdAt: "2026-10-10T14:00:00.000Z", userId: 1, contact },
        { id: 6, subject: "VPN access denied", description: "VPN client says that my account has no access to the server.", categoryId: 3, priorityId: 2, statusId: 1, createdAt: "2026-10-12T16:20:00.000Z", userId: 1, contact }
    ];

    const comments: RequestComment[] = [
        { id: 1, requestId: 1, author: "Olga Operator", text: "We are checking the printer, a technician will visit you today.", createdAt: "2026-10-01T11:00:00.000Z" },
        { id: 2, requestId: 3, author: "Olga Operator", text: "Please send us your router model.", createdAt: "2026-10-06T09:30:00.000Z" }
    ];

    const historyEntries: Omit<DbHistory, "id">[] = [
        { requestId: 1, fromStatusId: null, toStatusId: 1, changedBy: "John User", changedAt: "2026-10-01T09:00:00.000Z" },
        { requestId: 1, fromStatusId: 1, toStatusId: 2, changedBy: "Olga Operator", changedAt: "2026-10-01T11:00:00.000Z" },
        { requestId: 2, fromStatusId: null, toStatusId: 1, changedBy: "John User", changedAt: "2026-10-03T10:30:00.000Z" },
        { requestId: 3, fromStatusId: null, toStatusId: 1, changedBy: "John User", changedAt: "2026-10-05T12:15:00.000Z" },
        { requestId: 3, fromStatusId: 1, toStatusId: 2, changedBy: "Olga Operator", changedAt: "2026-10-05T13:00:00.000Z" },
        { requestId: 3, fromStatusId: 2, toStatusId: 3, changedBy: "Olga Operator", changedAt: "2026-10-06T09:30:00.000Z" },
        { requestId: 4, fromStatusId: null, toStatusId: 1, changedBy: "John User", changedAt: "2026-10-07T08:45:00.000Z" },
        { requestId: 4, fromStatusId: 1, toStatusId: 2, changedBy: "Olga Operator", changedAt: "2026-10-07T09:10:00.000Z" },
        { requestId: 4, fromStatusId: 2, toStatusId: 4, changedBy: "Olga Operator", changedAt: "2026-10-08T15:00:00.000Z" },
        { requestId: 5, fromStatusId: null, toStatusId: 1, changedBy: "John User", changedAt: "2026-10-10T14:00:00.000Z" },
        { requestId: 6, fromStatusId: null, toStatusId: 1, changedBy: "John User", changedAt: "2026-10-12T16:20:00.000Z" }
    ];
    const history: DbHistory[] = historyEntries.map((h, i) => ({ id: i + 1, ...h }));

    return {
        users,
        requests,
        comments,
        history,
        nextId: { request: requests.length + 1, comment: comments.length + 1, history: history.length + 1 }
    };
}

export const db = makeSeed();

export const resetDb = () => {
    Object.assign(db, makeSeed());
}
