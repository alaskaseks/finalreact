import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../api/client";
import { getCategories, getPriorities, getStatuses } from "../api/dictionaries.api";
import {
    addComment, changeStatus, createRequest, getAllRequests,
    getHistory, getMyRequests, getRequest
} from "../api/requests.api";
import { useNotify } from "../context/NotificationContext";
import type { RequestDetails, Role } from "../types";

export const useStatuses = () => useQuery({ queryKey: ["statuses"], queryFn: getStatuses });
export const useCategories = () => useQuery({ queryKey: ["categories"], queryFn: getCategories });
export const usePriorities = () => useQuery({ queryKey: ["priorities"], queryFn: getPriorities });

export const useRequestsList = (role: Role, simulate: string | null) => {
    const scope = role === "operator" ? "all" : "my";
    return useQuery({
        queryKey: ["requests", scope, simulate],
        queryFn: () => role === "operator" ? getAllRequests(simulate) : getMyRequests(simulate)
    });
}

export const useRequest = (id: number) => {
    return useQuery({ queryKey: ["request", id], queryFn: () => getRequest(id) });
}

export const useHistory = (id: number) => {
    return useQuery({ queryKey: ["history", id], queryFn: () => getHistory(id) });
}

export const useCreateRequest = () => {
    const queryClient = useQueryClient();
    const notify = useNotify();

    return useMutation({
        mutationFn: createRequest,
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: ["requests"] });
            notify("success", "Request created");
        },
        onError: error => notify("error", `Failed to create request: ${getErrorMessage(error)}`)
    });
}

export const useChangeStatus = (id: number) => {
    const queryClient = useQueryClient();
    const notify = useNotify();

    return useMutation({
        mutationFn: (statusId: number) => changeStatus(id, { statusId }),
        onSuccess: updated => {

            queryClient.setQueryData<RequestDetails>(["request", id], old => {
                return old ? { ...old, status: updated.status } : old;
            });

            queryClient.invalidateQueries({ queryKey: ["request", id] });
            queryClient.invalidateQueries({ queryKey: ["history", id] });
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            notify("success", "Status updated");
        },
        onError: error => notify("error", `Failed to update status: ${getErrorMessage(error)}`)
    });
}

export const useAddComment = (id: number) => {
    const queryClient = useQueryClient();
    const notify = useNotify();

    return useMutation({
        mutationFn: (text: string) => addComment(id, { text }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["request", id] });
            notify("success", "Comment added");
        },
        onError: error => notify("error", `Failed to add comment: ${getErrorMessage(error)}`)
    });
}
