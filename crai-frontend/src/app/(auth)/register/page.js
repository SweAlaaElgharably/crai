"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

const createRegisterSchema = (locale) =>
    z
        .object({
            first_name: z.string().min(
                2,
                locale === "ar"
                    ? "الاسم الأول مطلوب"
                    : "First name is required"
            ),

            last_name: z.string().min(
                2,
                locale === "ar"
                    ? "الاسم الأخير مطلوب"
                    : "Last name is required"
            ),

            username: z.string().min(
                3,
                locale === "ar"
                    ? "اسم المستخدم مطلوب"
                    : "Username is required"
            ),

            email: z.email(
                locale === "ar"
                    ? "البريد الإلكتروني غير صحيح"
                    : "Invalid email"
            ),

            password: z.string().min(
                8,
                locale === "ar"
                    ? "كلمة المرور يجب ان تكون 8 أحرف على الأقل"
                    : "Password must be at least 8 characters"
            ),

            re_password: z.string(),

            user_type: z.enum(["client", "influencer"]),

            country_code: z.string().min(
                1,
                locale === "ar"
                    ? "رمز الدولة مطلوب"
                    : "Country code is required"
            ),

            phone: z.string().min(
                8,
                locale === "ar"
                    ? "رقم الهاتف مطلوب"
                    : "Phone is required"
            ),

            interests: z.array(z.number()).default([]),
        })
        .refine(
            (data) => data.password === data.re_password,
            {
                message:
                    locale === "ar"
                        ? "كلمة المرور غير متطابقة"
                        : "Passwords do not match",
                path: ["re_password"],
            }
        );

export default function Register() {
    const locale = useLocale();

    const registerSchema = createRegisterSchema(locale);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm({
        resolver: zodResolver(registerSchema),

        defaultValues: {
            first_name: "",
            last_name: "",
            username: "",
            email: "",
            password: "",
            re_password: "",
            user_type: "client",
            country_code: "",
            phone: "",
            interests: [],
        },
    });

    const [step, setStep] = useState(1);

    const [categories, setCategories] = useState([]);

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [apiErrors, setApiErrors] = useState([]);

    const userType = watch("user_type");
    const selectedInterests = watch("interests");

    // --------------------------------
    // Fetch Categories
    // --------------------------------

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/categories");

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                setCategories(data.data);
            } catch (error) {
                console.error(
                    "Failed to fetch categories:",
                    error
                );
            }
        };

        fetchCategories();
    }, []);
    const toggleInterest = (categoryId) => {
        const currentInterests = selectedInterests || [];
        if (currentInterests.includes(categoryId)) {
            setValue("interests", currentInterests.filter((id) => id !== categoryId), {shouldValidate: true});
        } else {
            setValue("interests", [...currentInterests, categoryId], {shouldValidate: true});
        }
    };
    const handleNext = async () => {
        const isValid = await trigger([
            "first_name",
            "last_name",
            "username",
            "email",
            "password",
            "re_password",
            "user_type",
            "country_code",
            "phone",
        ]);
        if (!isValid) {return;}
        setStep(2);
    };
    const handleBack = () => {setStep(1);};
    const onSubmit = async (values) => {
        setSuccess(false);
        setError(false);
        setApiErrors([]);
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values),
            });
            if (response.ok) {
                setSuccess(true);
                return;
            }
            const data = await response.json();
            setError(true);
            setApiErrors(data?.data ? Object.values(data.data).flat() : [
                        locale === "ar" ? "حدث خطأ أثناء التسجيل" : "Registration failed"]
            );
        } catch (error) {
            console.error(error);
            setError(true);
            setApiErrors([locale === "ar"? "حدث خطأ في الاتصال بالخادم" : "Unable to connect to the server",]);
        }
    };
    return (
        <div className="flex justify-center items-center px-4 py-16">
            <div className="flex flex-col gap-4 w-full max-w-150 rounded-3xl shadow-[0_10px_40px_rgba(13,13,18,0.08)] p-4 border border-gray-200">
                <div>
                    <h1 className="text-[26px] font-bold text-[#0b0b2b]">
                        {locale === "ar"? "التسجيل": "Register"}
                    </h1>
                    <p className="text-[14px] text-gray-500">
                        {locale === "ar"? "لديك حساب بالفعل؟": "Already have an account?"}
                        <Link className="ms-2 font-semibold text-primary" href="/login">
                            {locale === "ar"? "تسجيل الدخول": "Login"}
                        </Link>
                    </p>
                </div>
                {success && (
                    <div className="rounded-md bg-green-700 px-4 py-3 text-white">
                        {locale === "ar"? "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني": "Registration completed successfully. Check Your Email."}
                    </div>
                )}
                {error &&
                    apiErrors.map((message, index) => (
                        <div key={index} className="rounded-md bg-red-700 px-4 py-3 text-white">
                            {message}
                        </div>
                    ))}
                {step === 1 && (
                    <>
                        <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
                            <button
                                type="button"
                                onClick={() =>
                                    setValue(
                                        "user_type",
                                        "client"
                                    )
                                }
                                className={`
                                    cursor-pointer
                                    flex-1
                                    rounded-lg
                                    px-4
                                    py-1.5
                                    text-sm
                                    font-semibold
                                    transition
                                    ${
                                        userType === "client"
                                            ? "bg-white text-[#0b0b2b] shadow-sm"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                {locale === "ar"
                                    ? "مستخدم"
                                    : "User"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setValue(
                                        "user_type",
                                        "influencer"
                                    )
                                }
                                className={`
                                    cursor-pointer
                                    flex-1
                                    rounded-lg
                                    px-4
                                    py-1.5
                                    text-sm
                                    font-semibold
                                    transition
                                    ${
                                        userType === "influencer"
                                            ? "bg-white text-[#0b0b2b] shadow-sm"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                {locale === "ar"
                                    ? "مبدع"
                                    : "Influencer"}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="first_name">
                                    {locale === "ar"
                                        ? "الاسم الأول"
                                        : "First Name"}
                                </label>

                                <input
                                    type="text"
                                    id="first_name"
                                    {...register("first_name")}
                                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none"
                                />

                                {errors.first_name && (
                                    <span className="text-red-500 text-sm">
                                        {errors.first_name.message}
                                    </span>
                                )}
                            </div>

                            {/* Last Name */}

                            <div className="flex flex-col gap-1">
                                <label htmlFor="last_name">
                                    {locale === "ar"
                                        ? "الاسم الأخير"
                                        : "Last Name"}
                                </label>

                                <input
                                    type="text"
                                    id="last_name"
                                    {...register("last_name")}
                                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none"
                                />

                                {errors.last_name && (
                                    <span className="text-red-500 text-sm">
                                        {errors.last_name.message}
                                    </span>
                                )}
                            </div>

                            {/* Username */}

                            <div className="flex flex-col gap-1">
                                <label htmlFor="username">
                                    {locale === "ar"
                                        ? "اسم المستخدم"
                                        : "Username"}
                                </label>

                                <input
                                    type="text"
                                    id="username"
                                    {...register("username")}
                                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none"
                                />

                                {errors.username && (
                                    <span className="text-red-500 text-sm">
                                        {errors.username.message}
                                    </span>
                                )}
                            </div>

                            {/* Email */}

                            <div className="flex flex-col gap-1">
                                <label htmlFor="email">
                                    {locale === "ar"
                                        ? "البريد الإلكتروني"
                                        : "Email"}
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    {...register("email")}
                                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none"
                                />

                                {errors.email && (
                                    <span className="text-red-500 text-sm">
                                        {errors.email.message}
                                    </span>
                                )}
                            </div>

                            {/* Password */}

                            <div className="flex flex-col gap-1">
                                <label htmlFor="password">
                                    {locale === "ar"
                                        ? "كلمة المرور"
                                        : "Password"}
                                </label>

                                <input
                                    type="password"
                                    id="password"
                                    {...register("password")}
                                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none"
                                />

                                {errors.password && (
                                    <span className="text-red-500 text-sm">
                                        {errors.password.message}
                                    </span>
                                )}
                            </div>

                            {/* Confirm Password */}

                            <div className="flex flex-col gap-1">
                                <label htmlFor="re_password">
                                    {locale === "ar"
                                        ? "تأكيد كلمة المرور"
                                        : "Confirm Password"}
                                </label>

                                <input
                                    type="password"
                                    id="re_password"
                                    {...register("re_password")}
                                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none"
                                />

                                {errors.re_password && (
                                    <span className="text-red-500 text-sm">
                                        {errors.re_password.message}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="country_code">
                                    {locale === "ar"
                                        ? "رمز الدولة"
                                        : "Country Code"}
                                </label>
                                <input
                                    type="text"
                                    id="country_code"
                                    {...register("country_code")}
                                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none"
                                />
                                {errors.country_code && (<span className="text-red-500 text-sm">{errors.country_code.message}</span>)}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="phone">{locale === "ar" ? "رقم الهاتف": "Phone"}</label>
                                <input type="tel" id="phone" {...register("phone")}
                                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none"
                                />
                                {errors.phone && (<span className="text-red-500 text-sm">{errors.phone.message}</span>)}
                            </div>
                            <button type="button" onClick={handleNext}
                                className="cursor-pointer col-span-1 md:col-span-2 px-4 py-3 text-sm font-semibold text-white transition bg-primary hover:bg-primary/80 rounded-lg"
                            >
                                {locale === "ar" ? "التالي" : "Next"}
                            </button>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <div>
                            <h2 className="text-xl font-bold text-[#0b0b2b]">
                                {locale === "ar" ? "اختر اهتماماتك" : "Choose Your Interests"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {locale === "ar" ? "اختر المجالات التي تهتم بها" : "Choose the categories you are interested in"}
                            </p>
                        </div>
                        {categories.length === 0 ? (
                            <div className="text-sm text-gray-500">
                                {locale === "ar" ? "لا توجد تصنيفات متاحة" : "No categories available"}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {categories.map((category) => {
                                    const isSelected = selectedInterests.includes(category.id);
                                    return (
                                        <button key={category.id} type="button" onClick={() => toggleInterest(category.id)} 
                                            className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition
                                                ${isSelected
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-white text-gray-700 border-gray-200 hover:border-primary"
                                                }
                                            `}
                                        >
                                            {locale === "ar"
                                                ? category.arabic_title ?? category.english_title
                                                : category.english_title
                                            }
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <div className="text-sm text-gray-500">
                            {locale === "ar"
                                ? `تم اختيار ${selectedInterests.length} اهتمامات`
                                : `${selectedInterests.length} interests selected`}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleBack}
                                className="cursor-pointer flex-1 px-4 py-3 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                {locale === "ar" ? "السابق" : "Back"}
                            </button>
                            <button type="submit" disabled={isSubmitting}
                                className="cursor-pointer flex-1 px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/80 disabled:opacity-50 rounded-lg"
                            >
                                {isSubmitting
                                    ? locale === "ar" ? "جاري التسجيل..." : "Registering..."
                                    : locale === "ar" ? "التسجيل" : "Register"
                                }
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}