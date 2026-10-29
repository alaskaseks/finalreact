import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive
        ? "bg-white text-blue-600 font-semibold px-3 py-1.5 rounded"
        : "text-white hover:bg-blue-400 px-3 py-1.5 rounded";
}

function AppLayout(){
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.logout();
        navigate("/login");
    }

    return(
        <div className="box-border min-h-screen flex flex-col bg-slate-100">
            <header className="bg-blue-500 w-full flex items-center gap-6 px-6 py-3">
                <h1 className="text-white text-xl uppercase font-bold">Service Desk</h1>
                <nav className="flex gap-2 grow">
                    <NavLink to="/requests" end className={getLinkClass}>
                        {auth.role === "operator" ? "All requests" : "My requests"}
                    </NavLink>
                    {auth.role === "user" && (
                        <NavLink to="/requests/new" className={getLinkClass}>New request</NavLink>
                    )}
                </nav>
                <div className="flex items-center gap-3 text-white">
                    <span>{auth.user ? `${auth.user.name} (${auth.user.role})` : ""}</span>
                    <button onClick={handleLogout} className="bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
                        Log out
                    </button>
                </div>
            </header>
            <main className="grow w-full max-w-4xl mx-auto bg-white p-6">
                <Outlet />
            </main>
            <footer className="bg-blue-500 text-white text-center py-3">© 2026 Service Desk</footer>
        </div>
    )
}

export default AppLayout;
