import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { clearAuth } from "../auth/storage";
import { resetDb } from "../mocks/db";
import { server } from "../mocks/node";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(() => {
    server.resetHandlers();
    resetDb();
    clearAuth();
});

afterAll(() => server.close());
