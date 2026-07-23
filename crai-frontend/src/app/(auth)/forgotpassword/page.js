'use client'
import { useLocale } from "next-intl";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const createForgotSchema = (locale) =>
    z.object({
        email: z.email(locale === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid Email"),
    });

export default function ForgotPassword() {
    const locale = useLocale();
    const forgotSchema = createForgotSchema(locale);
    const {register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }} = useForm({resolver: zodResolver(forgotSchema), defaultValues: {email: ""}});
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [apiErrors, setApiErrors] = useState([]);
    const onSubmit = async (values) => {
        const response = await fetch("/api/forgotpassword", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(values),
        });
        const data = await response.json();
        console.log(data);
        if (data.status < 300 && data.status >= 200) {setSuccess(true);setError(false); setApiErrors([]);}
        else {setError(true); setSuccess(false); setApiErrors(Object.values(data.data).flat())}
    }
    return(
        <div className="flex justify-center items-center px-4 py-16">
            <div className="flex flex-col gap-2 w-full max-w-150 rounded-3xl shadow-[0_10px_40px_rgba(13,13,18,0.08)] p-4 border border-gray-200">
                <h1 className="text-[26px] font-bold text-[#0b0b2b]">{locale == "ar" ? "نسيت كلمة المرور" : "Forgot Password"}</h1>
                <p className="text-[14px] text-gray-500">{locale == "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}<Link className="ms-2 font-semibold text-primary hover:text-primary" href="/register">{locale == "ar" ? "إنشاء حساب" : "Register"}</Link></p>
                {success && <div className="rounded-md bg-green-700 px-4 py-3 text-white">
                    {locale == "ar" ? "من فضلك تحقق من بريدك الإلكتروني لإعادة تعيين كلمة السر" : "Please check your email for the reset link."}
                </div>}
                {error && apiErrors.map((e, index) => (
                    <div key={index} className="rounded-md bg-red-700 px-4 py-3 text-white">
                        {e}
                    </div>
                ))}
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email">{locale == "ar" ? "البريد الإلكتروني" : "Email"}</label>
                        <input type="text" id="email" {...register("email")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="cursor-pointer px-4 py-3 text-sm font-semibold text-white transition bg-primary hover:bg-primary/80 rounded-lg">{locale == "ar" ? "ارسال" : "Send"}</button>
                </form>
            </div>
        </div>        
    );
}
