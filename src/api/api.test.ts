import { clearAuth, saveAuth } from "../auth/storage";
import { getMe, login } from "./auth.api";
import { getCategories } from "./dictionaries.api";
import {
    addComment, changeStatus, createRequest, getAllRequests, getHistory, getMyRequests, getRequest
} from "./requests.api";
import type { Role } from "../types";

const loginAs = async (role: Role) => {
    const dto = role === "user"
        ? { email: "user@example.com", password: "user123" }
        : { email: "operator@example.com", password: "operator123" };
    const result = await login(dto);
    saveAuth(result.accessToken, result.role);
}

const newRequest = {
    subject: "Test subject",
    description: "Test description for the request",
    categoryId: 1,
    priorityId: 2,
    contact: { name: "John", phone: "12345", email: "john@example.com" }
};

describe("mock API (msw/node)", () => {
    it("logs in with valid credentials", async () => {
        const result = await login({ email: "user@example.com", password: "user123" });
        expect(result.role).toBe("user");
        expect(result.accessToken).toBeTruthy();
    });

    it("returns 401 for a wrong password", async () => {
        await expect(login({ email: "user@example.com", password: "wrong" }))
            .rejects.toMatchObject({ response: { status: 401 } });
    });

    it("returns 401 without Authorization header", async () => {
        await expect(getMe()).rejects.toMatchObject({ response: { status: 401 } });
        await expect(getCategories()).rejects.toMatchObject({ response: { status: 401 } });
    });

    it("returns the current user via /auth/me", async () => {
        await loginAs("operator");
        const me = await getMe();
        expect(me).toMatchObject({ email: "operator@example.com", role: "operator" });
    });

    it("user sees only own requests, operator can see all, user cannot", async () => {
        await loginAs("user");
        const mine = await getMyRequests();
        expect(mine.length).toBeGreaterThanOrEqual(5);
        await expect(getAllRequests()).rejects.toMatchObject({ response: { status: 403 } });

        clearAuth();
        await loginAs("operator");
        expect((await getAllRequests()).length).toBeGreaterThanOrEqual(5);
    });

    it("creates a request with initial history", async () => {
        await loginAs("user");
        const created = await createRequest(newRequest);
        expect(created.status.name).toBe("New");

        expect((await getMyRequests()).some(r => r.id === created.id)).toBe(true);
        expect(await getHistory(created.id)).toHaveLength(1);
    });

    it("operator changes status (history grows) and adds a comment", async () => {
        await loginAs("operator");
        const before = await getHistory(1);

        const updated = await changeStatus(1, { statusId: 4 });
        expect(updated.status.name).toBe("Resolved");
        expect(await getHistory(1)).toHaveLength(before.length + 1);

        await addComment(1, { text: "Done" });
        expect((await getRequest(1)).comments.some(c => c.text === "Done")).toBe(true);
    });

    it("user cannot change status or add comments (403)", async () => {
        await loginAs("user");
        await expect(changeStatus(1, { statusId: 4 })).rejects.toMatchObject({ response: { status: 403 } });
        await expect(addComment(1, { text: "Hi" })).rejects.toMatchObject({ response: { status: 403 } });
    });

    it("has 500 and network error scenarios", async () => {
        await loginAs("user");
        await expect(getMyRequests("500")).rejects.toMatchObject({ response: { status: 500 } });
        await expect(getMyRequests("network")).rejects.toMatchObject({ code: "ERR_NETWORK" });
    });
});
