import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { inputClass, primaryButtonClass } from "../components/ui";
import { useCategories, useCreateRequest, usePriorities } from "../hooks/useRequestQueries";
import { requestSchema } from "../schemas";
import type { RequestForm } from "../schemas";

function NewRequestPage(){
    const navigate = useNavigate();
    const categories = useCategories();
    const priorities = usePriorities();
    const createMutation = useCreateRequest();

    const { register, handleSubmit, formState: { errors } } = useForm<RequestForm>({
        resolver: zodResolver(requestSchema),
        defaultValues: { categoryId: "", priorityId: "" }
    });

    const onSubmit = (values: RequestForm) => {
        createMutation.mutate(
            {
                subject: values.subject,
                description: values.description,
                categoryId: Number(values.categoryId),
                priorityId: Number(values.priorityId),
                contact: { name: values.contactName, phone: values.contactPhone, email: values.contactEmail }
            },
            { onSuccess: created => navigate(`/requests/${created.id}`) }
        );
    }

    return(
        <div>
            <h2 className="text-2xl font-bold mb-4">New request</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Field id="subject" label="Subject" error={errors.subject?.message}>
                    <input id="subject" className={inputClass} {...register("subject")} />
                </Field>

                <Field id="description" label="Description" error={errors.description?.message}>
                    <textarea id="description" rows={4} className={inputClass} {...register("description")} />
                </Field>

                <Field id="category" label="Category" error={errors.categoryId?.message}>
                    <select id="category" className={inputClass} {...register("categoryId")}>
                        <option value="">Select category</option>
                        {categories.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </Field>

                <Field id="priority" label="Priority" error={errors.priorityId?.message}>
                    <select id="priority" className={inputClass} {...register("priorityId")}>
                        <option value="">Select priority</option>
                        {priorities.data?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </Field>

                <h3 className="text-lg font-bold mt-6 mb-2">Contact details</h3>

                <Field id="contactName" label="Name" error={errors.contactName?.message}>
                    <input id="contactName" className={inputClass} {...register("contactName")} />
                </Field>

                <Field id="contactPhone" label="Phone" error={errors.contactPhone?.message}>
                    <input id="contactPhone" className={inputClass} {...register("contactPhone")} />
                </Field>

                <Field id="contactEmail" label="Contact email" error={errors.contactEmail?.message}>
                    <input id="contactEmail" type="email" className={inputClass} {...register("contactEmail")} />
                </Field>

                <button type="submit" disabled={createMutation.isPending} className={primaryButtonClass}>
                    {createMutation.isPending ? "Submitting..." : "Create request"}
                </button>
            </form>

            <p className="text-slate-500 text-sm mt-4">Demo errors: put [500] or [network] in the subject.</p>
        </div>
    )
}

export default NewRequestPage;
