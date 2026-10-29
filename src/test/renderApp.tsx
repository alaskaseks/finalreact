import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { NotificationProvider } from "../context/NotificationContext";
import { routes } from "../routes";

export function renderApp(path: string){
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createMemoryRouter(routes, { initialEntries: [path] });

    render(
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <RouterProvider router={router} />
            </NotificationProvider>
        </QueryClientProvider>
    );

    return router;
}
