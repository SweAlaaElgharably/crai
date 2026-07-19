'use client'
import { useLocale } from "next-intl";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

const createLoginSchema = (locale) =>
    z.object({
        username: z.string().min(1, locale === "ar" ? "اسم المستخدم غير صحيح" : "Invalid Username"),
        password: z.string().min(8, locale === "ar" ? "كلمة المرور يجب ان تكون 8 أحرف على الأقل" : "Password must be at least 8 characters"),
    });

export default function Login() {
    const locale = useLocale();
    const loginSchema = createLoginSchema(locale);
    const {register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }} = useForm({resolver: zodResolver(loginSchema), defaultValues: {username: "", password: ""}});
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [apiErrors, setApiErrors] = useState([]);
    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);
    const onSubmit = async (values) => {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(values),
        });
        const data = await response.json();
        console.log(data);
        if (data.status < 300 && data.status >= 200) {
            setSuccess(true);
            setError(false);
            const userRes = await fetch("/api/me");
            const userData = await userRes.json();
            if (userData.status >= 200 && userData.status <= 299) {
                setUser(userData.data);
            }
            router.push("/");
            router.refresh();
        }
        else {setError(true); setSuccess(false); setApiErrors(["Invalid Username or Password."])}
    }
    return(
        <div className="flex justify-center items-center px-4 py-16">
            <div className="flex flex-col gap-2 w-full max-w-150 rounded-3xl shadow-[0_10px_40px_rgba(13,13,18,0.08)] p-4 border border-gray-200">
                <h1 className="text-[26px] font-bold text-[#0b0b2b]">{locale == "ar" ? "تسجيل الدخول" : "Login"}</h1>
                <p className="text-[14px] text-gray-500">{locale == "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}<Link className="ms-2 font-semibold text-primary hover:text-primary" href="/register">{locale == "ar" ? "إنشاء حساب" : "Register"}</Link></p>
                {success && <div className="rounded-md bg-green-700 px-4 py-3 text-white">
                    {locale == "ar" ? "تم تسجيل الدخول بنجاح" : "Login successful."}
                </div>}
                {error && apiErrors.map((e, index) => (
                    <div key={index} className="rounded-md bg-red-700 px-4 py-3 text-white">
                        {e}
                    </div>
                ))}
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="username">{locale == "ar" ? "اسم المستخدم" : "Username"}</label>
                        <input type="text" id="username" {...register("username")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password">{locale == "ar" ? "كلمة المرور" : "Password"}</label>
                        <input type="password" id="password" {...register("password")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="cursor-pointer px-4 py-3 text-sm font-semibold text-white transition bg-primary hover:bg-primary/80 rounded-lg">{locale == "ar" ? "تسجيل الدخول" : "Login"}</button>
                </form>
            </div>
        </div>        
    );
}
