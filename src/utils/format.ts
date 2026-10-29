export const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleString();
}
