import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginForm = z.infer<typeof loginSchema>;

export const requestSchema = z.object({
    subject: z.string().min(3, "Subject must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    categoryId: z.string().min(1, "Select a category"),
    priorityId: z.string().min(1, "Select a priority"),
    contactName: z.string().min(2, "Enter your name"),
    contactPhone: z.string().min(5, "Enter a valid phone number"),
    contactEmail: z.email("Enter a valid email")
});

export type RequestForm = z.infer<typeof requestSchema>;
