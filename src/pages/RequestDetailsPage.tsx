import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { buttonClass, inputClass, linkClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
    useAddComment, useChangeStatus, useHistory, useRequest, useStatuses
} from "../hooks/useRequestQueries";
import { formatDate } from "../utils/format";

function RequestDetailsPage(){
    const { id } = useParams();
    const requestId = Number(id);
    const { role } = useAuth();

    const request = useRequest(requestId);
    const history = useHistory(requestId);
    const statuses = useStatuses();
    const changeStatusMutation = useChangeStatus(requestId);
    const addCommentMutation = useAddComment(requestId);

    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [commentText, setCommentText] = useState<string>("");

    if (request.isPending) return <p>Loading request...</p>;

    if (request.isError) {
        return(
            <div>
                <p className="text-red-700 mb-3">Failed to load request: {getErrorMessage(request.error)}</p>
                <Link to="/requests" className={linkClass}>Back to requests</Link>
            </div>
        )
    }

    const data = request.data;
    const statusValue = selectedStatus || String(data.status.id);

    const handleChangeStatus = () => {
        changeStatusMutation.mutate(Number(statusValue), { onSuccess: () => setSelectedStatus("") });
    }

    const handleAddComment = () => {
        addCommentMutation.mutate(commentText, { onSuccess: () => setCommentText("") });
    }

    return(
        <div>
            <Link to="/requests" className={linkClass}>← Back to requests</Link>

            <h2 className="text-2xl font-bold mt-4 mb-2">#{data.id} {data.subject}</h2>
            <p className="mb-2">{data.description}</p>
            <p className="mb-1">Category: {data.category.name} | Priority: {data.priority.name}</p>
            <p className="mb-1">Status: <strong>{data.status.name}</strong></p>
            <p className="mb-1">Created: {formatDate(data.createdAt)}</p>
            <p className="mb-1">Contact: {data.contact.name}, {data.contact.phone}, {data.contact.email}</p>

            {role === "operator" && (
                <div className="border border-slate-300 rounded-lg p-3 my-4 flex flex-col gap-2 items-start">
                    <h3 className="text-lg font-bold">Change status</h3>
                    <select
                        aria-label="Status"
                        className={inputClass}
                        value={statusValue}
                        onChange={e => setSelectedStatus(e.target.value)}
                    >
                        {statuses.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button
                        onClick={handleChangeStatus}
                        disabled={changeStatusMutation.isPending || statusValue === String(data.status.id)}
                        className={buttonClass}
                    >
                        {changeStatusMutation.isPending ? "Saving..." : "Change status"}
                    </button>
                </div>
            )}

            <h3 className="text-lg font-bold mt-6 mb-2">Comments</h3>
            {data.comments.length === 0 && <p>No comments yet.</p>}
            {data.comments.map(c => (
                <p key={c.id} className="mb-1">
                    <strong>{c.author}:</strong> {c.text} <small className="text-slate-500">({formatDate(c.createdAt)})</small>
                </p>
            ))}

            {role === "operator" && (
                <div className="border border-slate-300 rounded-lg p-3 my-4 flex flex-col gap-2 items-start">
                    <textarea
                        aria-label="Comment"
                        rows={3}
                        className={`${inputClass} w-full`}
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={addCommentMutation.isPending || commentText.trim() === ""}
                        className={buttonClass}
                    >
                        {addCommentMutation.isPending ? "Sending..." : "Add comment"}
                    </button>
                </div>
            )}

            <h3 className="text-lg font-bold mt-6 mb-2">Status history</h3>
            {history.isPending && <p>Loading history...</p>}
            {history.isError && <p className="text-red-700">Failed to load history: {getErrorMessage(history.error)}</p>}
            {history.isSuccess && (
                <ul className="list-disc pl-6">
                    {history.data.map(h => (
                        <li key={h.id}>
                            {h.fromStatus ? h.fromStatus.name : "Created"} → {h.toStatus.name}{" "}
                            <small className="text-slate-500">({h.changedBy}, {formatDate(h.changedAt)})</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default RequestDetailsPage;
