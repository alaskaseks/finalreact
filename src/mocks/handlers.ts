import { delay, http, HttpResponse } from "msw";
import { categories, db, priorities, statuses } from "./db";
import type { DbHistory, DbRequest, DbUser } from "./db";
import type {
    AddCommentDto, ChangeStatusDto, CreateRequestDto, Dict, HistoryEntry,
    LoginDto, LoginResponse, RequestComment, RequestDetails, ServiceRequest, User
} from "../types";

const API = "/api";

const LIST_DELAY = 900;
const SHORT_DELAY = 200;

const error = (status: number, message: string) => {
    return HttpResponse.json({ message }, { status });
}

const getUser = (request: Request): DbUser | undefined => {
    const header = request.headers.get("Authorization");
    if (!header || !header.startsWith("Bearer token-")) return undefined;
    const id = Number(header.replace("Bearer token-", ""));
    return db.users.find(u => u.id === id);
}

const simulateFailure = (request: Request) => {
    const simulate = new URL(request.url).searchParams.get("simulate");
    if (simulate === "500") return error(500, "Internal server error");
    if (simulate === "network") return HttpResponse.error();
    return undefined;
}

const byId = (list: Dict[], id: number): Dict => {
    const item = list.find(i => i.id === id);
    if (!item) throw new Error(`Dictionary item ${id} not found`);
    return item;
}

const toDto = (r: DbRequest): ServiceRequest => ({
    id: r.id,
    subject: r.subject,
    description: r.description,
    category: byId(categories, r.categoryId),
    priority: byId(priorities, r.priorityId),
    status: byId(statuses, r.statusId),
    createdAt: r.createdAt,
    contact: r.contact
});

const toHistoryDto = (h: DbHistory): HistoryEntry => ({
    id: h.id,
    requestId: h.requestId,
    fromStatus: h.fromStatusId === null ? null : byId(statuses, h.fromStatusId),
    toStatus: byId(statuses, h.toStatusId),
    changedBy: h.changedBy,
    changedAt: h.changedAt
});

const addHistory = (requestId: number, fromStatusId: number | null, toStatusId: number, changedBy: string) => {
    db.history.push({
        id: db.nextId.history++,
        requestId,
        fromStatusId,
        toStatusId,
        changedBy,
        changedAt: new Date().toISOString()
    });
}

const canAccess = (user: DbUser, request: DbRequest): boolean => {
    return user.role === "operator" || request.userId === user.id;
}

export const handlers = [
    http.post(`${API}/auth/login`, async ({ request }) => {
        await delay(SHORT_DELAY);
        const body = await request.json() as LoginDto;
        const user = db.users.find(u => u.email === body.email && u.password === body.password);
        if (!user) return error(401, "Invalid email or password");

        const response: LoginResponse = { accessToken: `token-${user.id}`, role: user.role };
        return HttpResponse.json(response);
    }),

    http.get(`${API}/auth/me`, async ({ request }) => {
        await delay(SHORT_DELAY);
        const user = getUser(request);
        if (!user) return error(401, "Unauthorized");

        const me: User = { id: user.id, name: user.name, email: user.email, role: user.role };
        return HttpResponse.json(me);
    }),

    http.get(`${API}/requests/my`, async ({ request }) => {
        await delay(LIST_DELAY);
        const user = getUser(request);
        if (!user) return error(401, "Unauthorized");

        const failure = simulateFailure(request);
        if (failure) return failure;

        const list = db.requests.filter(r => r.userId === user.id).map(toDto);
        return HttpResponse.json(list);
    }),

    http.get(`${API}/requests`, async ({ request }) => {
        await delay(LIST_DELAY);
        const user = getUser(request);
        if (!user) return error(401, "Unauthorized");
        if (user.role !== "operator") return error(403, "Only operators can see all requests");

        const failure = simulateFailure(request);
        if (failure) return failure;

        return HttpResponse.json(db.requests.map(toDto));
    }),

    http.get(`${API}/requests/:id`, async ({ request, params }) => {
        await delay(SHORT_DELAY);
        const user = getUser(request);
        if (!user) return error(401, "Unauthorized");

        const found = db.requests.find(r => r.id === Number(params.id));
        if (!found) return error(404, "Request not found");
        if (!canAccess(user, found)) return error(403, "You have no access to this request");

        const details: RequestDetails = {
            ...toDto(found),
            comments: db.comments.filter(c => c.requestId === found.id)
        };
        return HttpResponse.json(details);
    }),

    http.post(`${API}/requests`, async ({ request }) => {
        await delay(SHORT_DELAY);
        const user = getUser(request);
        if (!user) return error(401, "Unauthorized");
        if (user.role !== "user") return error(403, "Only users can create requests");

        const body = await request.json() as CreateRequestDto;

        if (body.subject.includes("[500]")) return error(500, "Internal server error");
        if (body.subject.includes("[network]")) return HttpResponse.error();

        if (!categories.some(c => c.id === body.categoryId) || !priorities.some(p => p.id === body.priorityId)) {
            return error(400, "Unknown category or priority");
        }

        const created: DbRequest = {
            id: db.nextId.request++,
            subject: body.subject,
            description: body.description,
            categoryId: body.categoryId,
            priorityId: body.priorityId,
            statusId: 1,
            createdAt: new Date().toISOString(),
            userId: user.id,
            contact: body.contact
        };
        db.requests.push(created);
        addHistory(created.id, null, 1, user.name);

        return HttpResponse.json(toDto(created), { status: 201 });
    }),

    http.patch(`${API}/requests/:id/status`, async ({ request, params }) => {
        await delay(SHORT_DELAY);
        const user = getUser(request);
        if (!user) return error(401, "Unauthorized");
        if (user.role !== "operator") return error(403, "Only operators can change status");

        const found = db.requests.find(r => r.id === Number(params.id));
        if (!found) return error(404, "Request not found");

        const body = await request.json() as ChangeStatusDto;
        if (!statuses.some(s => s.id === body.statusId)) return error(400, "Unknown status");

        addHistory(found.id, found.statusId, body.statusId, user.name);
        found.statusId = body.statusId;

        return HttpResponse.json(toDto(found));
    }),

    http.post(`${API}/requests/:id/comments`, async ({ request, params }) => {
        await delay(SHORT_DELAY);
        const user = getUser(request);
        if (!user) return error(401, "Unauthorized");
        if (user.role !== "operator") return error(403, "Only operators can add comments");

        const found = db.requests.find(r => r.id === Number(params.id));
        if (!found) return error(404, "Request not found");

        const body = await request.json() as AddCommentDto;
        if (!body.text.trim()) return error(400, "Comment cannot be empty");

        const comment: RequestComment = {
            id: db.nextId.comment++,
            requestId: found.id,
            author: user.name,
            text: body.text,
            createdAt: new Date().toISOString()
        };
        db.comments.push(comment);

        return HttpResponse.json(comment, { status: 201 });
    }),

    http.get(`${API}/requests/:id/history`, async ({ request, params }) => {
        await delay(SHORT_DELAY);
        const user = getUser(request);
        if (!user) return error(401, "Unauthorized");

        const found = db.requests.find(r => r.id === Number(params.id));
        if (!found) return error(404, "Request not found");
        if (!canAccess(user, found)) return error(403, "You have no access to this request");

        const list = db.history.filter(h => h.requestId === found.id).map(toHistoryDto);
        return HttpResponse.json(list);
    }),

    http.get(`${API}/categories`, async ({ request }) => {
        await delay(SHORT_DELAY);
        if (!getUser(request)) return error(401, "Unauthorized");
        return HttpResponse.json(categories);
    }),

    http.get(`${API}/priorities`, async ({ request }) => {
        await delay(SHORT_DELAY);
        if (!getUser(request)) return error(401, "Unauthorized");
        return HttpResponse.json(priorities);
    }),

    http.get(`${API}/request-statuses`, async ({ request }) => {
        await delay(SHORT_DELAY);
        if (!getUser(request)) return error(401, "Unauthorized");
        return HttpResponse.json(statuses);
    })
];
