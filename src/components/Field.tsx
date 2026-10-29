import type { ReactNode } from "react";

interface FieldProps{
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps){
    return(
        <div className="flex flex-col mb-3">
            <label htmlFor={id} className="font-semibold mb-1">{label}</label>
            {children}
            {error && <span className="text-red-700 text-sm mt-1">{error}</span>}
        </div>
    )
}

export default Field;
