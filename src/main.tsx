import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import { routes } from "./routes";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } }
});

const router = createBrowserRouter(routes);

async function start(){
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledFrame: "bypass" });

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                    <RouterProvider router={router} />
                </NotificationProvider>
            </QueryClientProvider>
        </StrictMode>
    );
}

start();
