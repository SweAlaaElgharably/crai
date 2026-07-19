'use client'
import { useLocale } from "next-intl";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const createRegisterSchema = (locale) =>
    z.object({
        first_name: z.string().min(2, locale === "ar" ? "الاسم الأول مطلوب" : "First name is required"),
        last_name: z.string().min(2, locale === "ar" ? "الاسم الأخير مطلوب" : "Last name is required"),
        username: z.string().min(3, locale === "ar" ? "اسم المستخدم مطلوب" : "Username is required"),
        email: z.email(locale === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email"),
        password: z.string().min(8, locale === "ar" ? "كلمة المرور يجب ان تكون 8 أحرف على الأقل" : "Password must be at least 8 characters"),
        re_password: z.string(),
        is_influencer: z.boolean().default(false),
        country_code: z.string().min(1, locale === "ar" ? "رمز الدولة مطلوب" : "Country code is required"),
        phone: z.string().min(8, locale === "ar" ? "رقم الهاتف مطلوب" : "Phone is required"),
    }).refine((data) => data.password === data.re_password, {message: locale === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match", path: ["re_password"]});

export default function Register() {
    const locale = useLocale();
    const registerSchema = createRegisterSchema(locale);
    const {register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }} = useForm({resolver: zodResolver(registerSchema), defaultValues: {first_name: "", last_name: "", username: "", email: "", password: "", re_password: "", is_influencer: false, country_code: "", phone: ""}});
    const isInfluencer = watch("is_influencer");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [apiErrors, setApiErrors] = useState([]);
    const onSubmit = async (values) => {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(values),
        });
        const data = await response.json();
        console.log(data);
        if (data.status < 300 && data.status >= 200) {setSuccess(true);}
        else {setError(true); setApiErrors(Object.values(data.data).flat());}
    }
    return(
        <div className="flex justify-center items-center px-4 py-16">
            <div className="flex flex-col gap-2 w-full max-w-150 rounded-3xl shadow-[0_10px_40px_rgba(13,13,18,0.08)] p-4 border border-gray-200">
                <h1 className="text-[26px] font-bold text-[#0b0b2b]">{locale == "ar" ? "التسجيل" : "Register"}</h1>
                <p className="text-[14px] text-gray-500">{locale == "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}<Link className="ms-2 font-semibold text-primary hover:text-primary" href="/login">{locale == "ar" ? "تسجيل الدخول" : "Login"}</Link></p>
                {success && <div className="rounded-md bg-green-700 px-4 py-3 text-white">
                    {locale == "ar" ? "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني" : "Registration completed successfully. Check Your Email."}
                </div>}
                {error && apiErrors.map((e, index) => (
                    <div key={index} className="rounded-md bg-red-700 px-4 py-3 text-white">
                        {e}
                    </div>
                ))}
                <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
                    <button type="button" onClick={() => setValue("is_influencer", false)} className={`cursor-pointer flex-1 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${!isInfluencer ? "bg-white text-[#0b0b2b] shadow-sm" : "text-gray-600"}`}>{locale == "ar" ? "مستخدم" : "User"}</button>
                    <button type="button" onClick={() => setValue("is_influencer", true)} className={`cursor-pointer flex-1 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${isInfluencer ? "bg-white text-[#0b0b2b] shadow-sm" : "text-gray-600"}`}>{locale == "ar" ? "مبدع" : "Influencer"}</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="first_name">{locale == "ar" ? "الاسم الأول" : "First Name"}</label>
                        <input type="text" id="first_name" {...register("first_name")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.first_name && <span className="text-red-500 text-sm">{errors.first_name.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="last_name">{locale == "ar" ? "الاسم الأخير" : "Last Name"}</label>
                        <input type="text" id="last_name" {...register("last_name")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.last_name && <span className="text-red-500 text-sm">{errors.last_name.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="username">{locale == "ar" ? "اسم المستخدم" : "Username"}</label>
                        <input type="text" id="username" {...register("username")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email">{locale == "ar" ? "البريد الإلكتروني" : "Email"}</label>
                        <input type="email" id="email" {...register("email")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password">{locale == "ar" ? "كلمة المرور" : "Password"}</label>
                        <input type="password" id="password" {...register("password")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="re_password">{locale == "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                        <input type="password" id="re_password" {...register("re_password")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.re_password && <span className="text-red-500 text-sm">{errors.re_password.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="country_code">{locale == "ar" ? "رمز الدولة" : "Country Code"}</label>
                        <input type="text" id="country_code" {...register("country_code")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.country_code && <span className="text-red-500 text-sm">{errors.country_code.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="phone">{locale == "ar" ? "رقم الهاتف" : "Phone"}</label>
                        <input type="tel" id="phone" {...register("phone")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="cursor-pointer col-span-1 md:col-span-2 px-4 py-3 text-sm font-semibold text-white transition bg-primary hover:bg-primary/80 rounded-lg">{locale == "ar" ? "التسجيل" : "Register"}</button>
                </form>
            </div>
        </div>        
    );
}
