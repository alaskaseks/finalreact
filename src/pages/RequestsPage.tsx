import { Link, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { buttonClass, filterButtonClass, linkClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useRequestsList, useStatuses } from "../hooks/useRequestQueries";
import { formatDate } from "../utils/format";

function RequestsPage(){
    const { role } = useAuth();
    const isOperator = role === "operator";

    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get("status");
    const simulate = searchParams.get("simulate");

    const statuses = useStatuses();
    const requests = useRequestsList(isOperator ? "operator" : "user", simulate);

    const title = isOperator ? "All requests" : "My requests";

    if (requests.isPending) return <p>Loading requests...</p>;

    if (requests.isError) {
        return(
            <div>
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-red-700 mb-3">Failed to load requests: {getErrorMessage(requests.error)}</p>
                <button onClick={() => requests.refetch()} className={buttonClass}>Try again</button>
                <p className="text-slate-500 text-sm mt-4">
                    <Link to="/requests" className={linkClass}>Back to normal list</Link>
                </p>
            </div>
        )
    }

    const visible = statusFilter
        ? requests.data.filter(r => r.status.id === Number(statusFilter))
        : requests.data;

    return(
        <div>
            <h2 className="text-2xl font-bold mb-4">{title}</h2>

            <div className="flex flex-wrap gap-2 mb-4">
                <button aria-pressed={!statusFilter} onClick={() => setSearchParams({})} className={filterButtonClass}>
                    All
                </button>
                {statuses.data?.map(s => (
                    <button
                        key={s.id}
                        aria-pressed={statusFilter === String(s.id)}
                        onClick={() => setSearchParams({ status: String(s.id) })}
                        className={filterButtonClass}
                    >
                        {s.name}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <p>No requests found.</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left p-2 border-b border-slate-300">#</th>
                            <th className="text-left p-2 border-b border-slate-300">Subject</th>
                            <th className="text-left p-2 border-b border-slate-300">Category</th>
                            <th className="text-left p-2 border-b border-slate-300">Priority</th>
                            <th className="text-left p-2 border-b border-slate-300">Status</th>
                            <th className="text-left p-2 border-b border-slate-300">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map(r => (
                            <tr key={r.id}>
                                <td className="p-2 border-b border-slate-200">{r.id}</td>
                                <td className="p-2 border-b border-slate-200">
                                    <Link to={`/requests/${r.id}`} className={linkClass}>{r.subject}</Link>
                                </td>
                                <td className="p-2 border-b border-slate-200">{r.category.name}</td>
                                <td className="p-2 border-b border-slate-200">{r.priority.name}</td>
                                <td className="p-2 border-b border-slate-200">{r.status.name}</td>
                                <td className="p-2 border-b border-slate-200">{formatDate(r.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <p className="text-slate-500 text-sm mt-4">
                Demo errors:{" "}
                <Link to="/requests?simulate=500" className={linkClass}>server error (500)</Link>
                {" | "}
                <Link to="/requests?simulate=network" className={linkClass}>network error</Link>
            </p>
        </div>
    )
}

export default RequestsPage;
