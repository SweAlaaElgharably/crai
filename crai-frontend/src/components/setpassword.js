"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const createSchema = (locale) =>
    z.object({
        current_password: z.string().min(8, locale === "ar" ? "كلمة المرور الحالية مطلوبة" : "Current password is required"),
        new_password: z.string().min(8, locale === "ar" ? "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" : "New password must be at least 8 characters"),
        re_new_password: z.string().min(1, locale === "ar" ? "تأكيد كلمة المرور مطلوب" : "Please confirm your new password"),
    }).refine(
        (data) => data.new_password === data.re_new_password,
        {message: locale === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match", path: ["re_new_password"]}
    );

export default function SetPassword() {
    const locale = useLocale();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showReNewPassword, setShowReNewPassword] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const passwordSchema = createSchema(locale);
    const {register, handleSubmit, reset, formState: { errors, isSubmitting }} = useForm({resolver: zodResolver(passwordSchema),
        defaultValues: {current_password: "", new_password: "", re_new_password: ""}
    });
    const onSubmit = async (data) => {
        setServerError("");
        setSuccessMessage("");
        try {
            const response = await fetch("/api/setpassword", {
                method: "POST",
                headers: {"Content-Type": "application/json",},
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const result = await response.json();
                setServerError(result.detail || result.current_password?.[0] || result.new_password?.[0] || (locale === "ar" ? "حدث خطأ أثناء تغيير كلمة المرور" : "Failed to change password"));
                return;
            }
            setSuccessMessage(locale === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully");
            reset();
        } catch (error) {
            console.error(error);
            setServerError(locale === "ar" ? "حدث خطأ أثناء الاتصال بالخادم" : "An error occurred while connecting to the server");
        }
    };

    const passwordInput = (name, label, showPassword, setShowPassword, error) => (
        <div className="flex flex-col gap-1">
            <label htmlFor={name}>{label}</label>
            <div className="relative">
                <input id={name} type={showPassword ? "text" : "password"} {...register(name)} className="w-full border border-gray-200 rounded-lg px-4 py-2 pe-11 outline-none focus:border-primary"/>
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
            </div>
            {error && (<span className="text-red-500 text-sm">{error.message}</span>
            )}
        </div>
    );
    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold">{locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}</h2>
                <p className="text-gray-500 mt-2">{locale === "ar" ? "قم بتحديث كلمة المرور الخاصة بحسابك" : "Update your account password"}</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {passwordInput("current_password",
                    locale === "ar" ? "كلمة المرور الحالية" : "Current Password",
                    showCurrentPassword, setShowCurrentPassword,
                    errors.current_password
                )}
                {passwordInput("new_password",
                    locale === "ar" ? "كلمة المرور الجديدة" : "New Password",
                    showNewPassword,
                    setShowNewPassword,
                    errors.new_password
                )}
                {passwordInput("re_new_password",
                    locale === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password",
                    showReNewPassword,
                    setShowReNewPassword,
                    errors.re_new_password
                )}

                {serverError && (
                    <div className="rounded-md bg-red-700 px-4 py-3 text-white">
                        {serverError}
                    </div>
                )}
                {successMessage && (
                    <div className="rounded-md bg-green-700 px-4 py-3 text-white">
                        {successMessage}
                    </div>
                )}
                <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting}
                        className="cursor-pointer px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/80 rounded-lg disabled:opacity-50"
                    >
                        {isSubmitting ? locale === "ar"
                                ? "جاري التغيير..."
                                : "Changing..."
                            : locale === "ar"
                              ? "تغيير كلمة المرور" : "Change Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}