import { Outlet } from "react-router-dom";

function PublicLayout(){
    return(
        <div className="box-border min-h-screen flex flex-col bg-slate-100">
            <header className="bg-blue-500 w-full flex items-center px-6 py-3">
                <h1 className="text-white text-xl uppercase font-bold">Service Desk</h1>
            </header>
            <main className="grow w-full max-w-md mx-auto bg-white p-6">
                <Outlet />
            </main>
            <footer className="bg-blue-500 text-white text-center py-3">© 2026 Service Desk</footer>
        </div>
    )
}

export default PublicLayout;
