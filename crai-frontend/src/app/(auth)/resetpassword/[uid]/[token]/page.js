'use client'
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const createResetSchema = (locale) =>
    z.object({
        new_password: z.string().min(8, locale === "ar" ? "كلمة المرور يجب ان تكون 8 أحرف على الأقل" : "Password must be at least 8 characters"),
        re_new_password: z.string(),
    }).refine((data) => data.new_password === data.re_new_password, {message: locale === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match", path: ["re_new_password"]});

export default function ResetPassword() {
    const params = useParams();
    const locale = useLocale();
    const resetSchema = createResetSchema(locale);
    const {register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }} = useForm({resolver: zodResolver(resetSchema), defaultValues: {new_password: "", re_new_password: ""}});
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [apiErrors, setApiErrors] = useState([]);
    const onSubmit = async (values) => {
        const response = await fetch("/api/resetpassword", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({...values, uid: params.uid, token: params.token}),
        });
        const data = await response.json();
        console.log(data);
        if (data.status < 300 && data.status >= 200) {setSuccess(true);}
        else {setError(true); setApiErrors(Object.values(data.data).flat());}
    }
    return(
        <div className="flex justify-center items-center px-4 py-16">
            <div className="flex flex-col gap-2 w-full max-w-150 rounded-3xl shadow-[0_10px_40px_rgba(13,13,18,0.08)] p-4 border border-gray-200">
                <h1 className="text-[26px] font-bold text-[#0b0b2b]">{locale == "ar" ? "إعادة تعيين كلمة المرور" : "Reset Password"}</h1>
                {success && <div className="rounded-md bg-green-700 px-4 py-3 text-white">
                    {locale == "ar" ? "تم إعادة تعيين كلمة المرور بنجاح." : "Password reset completed successfully."}
                </div>}
                {error && apiErrors.map((e, index) => (
                    <div key={index} className="rounded-md bg-red-700 px-4 py-3 text-white">
                        {e}
                    </div>
                ))}
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="new_password">{locale == "ar" ? "كلمة المرور الجديدة" : "New Password"}</label>
                        <input type="password" id="new_password" {...register("new_password")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.new_password && <span className="text-red-500 text-sm">{errors.new_password.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="re_new_password">{locale == "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</label>
                        <input type="password" id="re_new_password" {...register("re_new_password")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        {errors.re_new_password && <span className="text-red-500 text-sm">{errors.re_new_password.message}</span>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="cursor-pointer px-4 py-3 text-sm font-semibold text-white transition bg-primary hover:bg-primary/80 rounded-lg">{locale == "ar" ? "إعادة تعيين كلمة المرور" : "Reset Password"}</button>
                </form>
            </div>
        </div>        
    );
}
