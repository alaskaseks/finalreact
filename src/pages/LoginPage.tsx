import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMe, login } from "../api/auth.api";
import { getErrorMessage } from "../api/client";
import Field from "../components/Field";
import { inputClass, primaryButtonClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useNotify } from "../context/NotificationContext";
import { loginSchema } from "../schemas";
import type { LoginForm } from "../schemas";

function LoginPage(){
    const auth = useAuth();
    const notify = useNotify();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });

    const { ref: emailRegisterRef, ...emailField } = register("email");
    const emailRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        emailRef.current?.focus();
    }, [])

    const loginMutation = useMutation({
        mutationFn: async (dto: LoginForm) => {
            const result = await login(dto);
            auth.login(result.accessToken, result.role);
            await queryClient.fetchQuery({ queryKey: ["me"], queryFn: getMe });
            return result;
        },
        onSuccess: () => {
            notify("success", "Logged in successfully");
            navigate("/requests");
        },
        onError: error => notify("error", `Login failed: ${getErrorMessage(error)}`)
    });

    return(
        <div>
            <h2 className="text-2xl font-bold mb-4">Sign in</h2>
            <form onSubmit={handleSubmit(values => loginMutation.mutate(values))} noValidate>
                <Field id="email" label="Email" error={errors.email?.message}>
                    <input
                        id="email"
                        type="email"
                        className={inputClass}
                        {...emailField}
                        ref={el => {
                            emailRegisterRef(el);
                            emailRef.current = el;
                        }}
                    />
                </Field>

                <Field id="password" label="Password" error={errors.password?.message}>
                    <input id="password" type="password" className={inputClass} {...register("password")} />
                </Field>

                <button type="submit" disabled={loginMutation.isPending} className={primaryButtonClass}>
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <p className="text-slate-500 text-sm mt-4">
                Test accounts: user@example.com / user123, operator@example.com / operator123
            </p>
        </div>
    )
}

export default LoginPage;
