import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";
import Root from "./layouts/Root";
import LoginPage from "./pages/LoginPage";
import NewRequestPage from "./pages/NewRequestPage";
import NotFoundPage from "./pages/NotFoundPage";
import RequestDetailsPage from "./pages/RequestDetailsPage";
import RequestsPage from "./pages/RequestsPage";

export const routes: RouteObject[] = [
    {
        element: <Root />,
        children: [

            {
                element: <PublicLayout />,
                children: [
                    { path: "login", element: <LoginPage /> },
                    { path: "not-found", element: <NotFoundPage /> }
                ]
            },

            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <AppLayout />,
                        children: [
                            { path: "requests", element: <RequestsPage /> },
                            {

                                element: <ProtectedRoute role="user" />,
                                children: [{ path: "requests/new", element: <NewRequestPage /> }]
                            },
                            { path: "requests/:id", element: <RequestDetailsPage /> }
                        ]
                    }
                ]
            },
            { path: "/", element: <Navigate to="/requests" replace /> },

            { path: "*", element: <Navigate to="/not-found" replace /> }
        ]
    }
];
