import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./test/renderApp";

const signIn = async (email: string, password: string) => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    return user;
}

describe("routing and auth", () => {
    it("redirects unauthenticated users from /requests to /login", async () => {
        const router = renderApp("/requests");
        expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/login");
    });

    it("redirects unknown routes to /not-found", async () => {
        const router = renderApp("/some/unknown/page");
        expect(await screen.findByText(/404/)).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/not-found");
    });

    it("focuses the first login field and shows validation errors", async () => {
        renderApp("/login");
        expect(screen.getByLabelText("Email")).toHaveFocus();

        await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
        expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
        expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    });

    it("shows an error notification for wrong credentials", async () => {
        renderApp("/login");
        await signIn("user@example.com", "wrong-password");
        expect(await screen.findByText(/Login failed: Invalid email or password/)).toBeInTheDocument();
    });
});

describe("user flow", () => {
    it("logs in, sees own requests, filters by status, creates a request and lands on its card", async () => {
        const router = renderApp("/login");
        const user = await signIn("user@example.com", "user123");

        expect(await screen.findByText("Logged in successfully")).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: "My requests" }, { timeout: 4000 })).toBeInTheDocument();
        expect(await screen.findByText("Printer is not working")).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/requests");

        await user.click(await screen.findByRole("button", { name: "Resolved" }));
        expect(router.state.location.search).toBe("?status=4");
        expect(screen.getByText("Monitor is flickering")).toBeInTheDocument();
        expect(screen.queryByText("Printer is not working")).not.toBeInTheDocument();

        await user.click(screen.getByRole("link", { name: "New request" }));
        await user.type(await screen.findByLabelText("Subject"), "Broken mouse");
        await user.type(screen.getByLabelText("Description"), "The mouse does not move at all");
        await screen.findByRole("option", { name: "Hardware" });
        await screen.findByRole("option", { name: "High" });
        await user.selectOptions(screen.getByLabelText("Category"), "Hardware");
        await user.selectOptions(screen.getByLabelText("Priority"), "High");
        await user.type(screen.getByLabelText("Name"), "John User");
        await user.type(screen.getByLabelText("Phone"), "+380501112233");
        await user.type(screen.getByLabelText("Contact email"), "user@example.com");
        await user.click(screen.getByRole("button", { name: "Create request" }));

        expect(await screen.findByText("Request created")).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: /Broken mouse/ })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/requests/7");
    });

    it("shows form validation errors and an error notification for a failed create", async () => {
        localStorage.setItem("accessToken", "token-1");
        localStorage.setItem("role", "user");
        renderApp("/requests/new");

        const user = userEvent.setup();
        await user.click(await screen.findByRole("button", { name: "Create request" }));
        expect(await screen.findByText("Subject must be at least 3 characters")).toBeInTheDocument();
        expect(screen.getByText("Select a category")).toBeInTheDocument();

        await user.type(screen.getByLabelText("Subject"), "Server problem [[500]");
        await user.type(screen.getByLabelText("Description"), "This request will fail on the server");
        await screen.findByRole("option", { name: "Hardware" });
        await screen.findByRole("option", { name: "Low" });
        await user.selectOptions(screen.getByLabelText("Category"), "Hardware");
        await user.selectOptions(screen.getByLabelText("Priority"), "Low");
        await user.type(screen.getByLabelText("Name"), "John");
        await user.type(screen.getByLabelText("Phone"), "12345");
        await user.type(screen.getByLabelText("Contact email"), "john@example.com");
        await user.click(screen.getByRole("button", { name: "Create request" }));

        expect(await screen.findByText(/Failed to create request: Internal server error/)).toBeInTheDocument();
    });

    it("shows the error state of the list for a 500 error", async () => {
        localStorage.setItem("accessToken", "token-1");
        localStorage.setItem("role", "user");

        renderApp("/requests?simulate=500");
        expect(await screen.findByText(/Failed to load requests: Internal server error/, {}, { timeout: 4000 })).toBeInTheDocument();
    });

    it("shows the error state of the list for a network error", async () => {
        localStorage.setItem("accessToken", "token-1");
        localStorage.setItem("role", "user");

        renderApp("/requests?simulate=network");
        expect(await screen.findByText(/Failed to load requests: Network error/, {}, { timeout: 4000 })).toBeInTheDocument();
    });

    it("keeps user away from /requests/new when role is operator", async () => {
        localStorage.setItem("accessToken", "token-2");
        localStorage.setItem("role", "operator");
        const router = renderApp("/requests/new");
        expect(await screen.findByRole("heading", { name: "All requests" }, { timeout: 4000 })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/requests");
    });
});

describe("operator flow", () => {
    it("sees all requests, changes status and adds a comment", async () => {
        const router = renderApp("/login");
        const user = await signIn("operator@example.com", "operator123");

        expect(await screen.findByRole("heading", { name: "All requests" }, { timeout: 4000 })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "New request" })).not.toBeInTheDocument();

        await user.click(await screen.findByRole("link", { name: "Cannot install software" }));
        expect(await screen.findByRole("heading", { name: /Cannot install software/ })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe("/requests/2");

        await user.selectOptions(await screen.findByLabelText("Status"), "Resolved");
        await user.click(screen.getByRole("button", { name: "Change status" }));
        expect(await screen.findByText("Status updated")).toBeInTheDocument();
        const historyList = await screen.findByRole("list");
        await waitFor(() => expect(within(historyList).getByText(/New → Resolved/)).toBeInTheDocument());

        await user.type(screen.getByLabelText("Comment"), "Fixed remotely");
        await user.click(screen.getByRole("button", { name: "Add comment" }));
        expect(await screen.findByText("Comment added")).toBeInTheDocument();
        expect(await screen.findByText(/Fixed remotely/)).toBeInTheDocument();
    });

    it("redirects to /login and clears auth when the token is invalid (401)", async () => {
        localStorage.setItem("accessToken", "token-999");
        localStorage.setItem("role", "operator");
        const router = renderApp("/requests");

        await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
        expect(localStorage.getItem("accessToken")).toBeNull();
    });
});
