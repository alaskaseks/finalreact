import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

type NotificationType = "success" | "error";

interface Notification{
    id: number;
    type: NotificationType;
    message: string;
}

type NotifyFn = (type: NotificationType, message: string) => void;

const NotificationContext = createContext<NotifyFn>(() => {});

export const useNotify = (): NotifyFn => {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }){
    const [items, setItems] = useState<Notification[]>([]);
    const nextId = useRef<number>(1);

    const notify = useCallback<NotifyFn>((type, message) => {
        const id = nextId.current++;

        setItems(prev => [...prev, { id, type, message }]);

        setTimeout(() => {
            setItems(prev => prev.filter(n => n.id !== id));
        }, 4000);
    }, []);

    return(
        <NotificationContext.Provider value={notify}>
            {children}
            <div className="fixed top-4 right-4 z-10 flex flex-col gap-2" role="status">
                {items.map(n => (
                    <div
                        key={n.id}
                        className={`px-4 py-2 rounded text-white ${n.type === "success" ? "bg-green-700" : "bg-red-700"}`}
                    >
                        {n.message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    )
}
