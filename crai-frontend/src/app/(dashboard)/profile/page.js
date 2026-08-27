"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaCamera } from "react-icons/fa";
import SetPassword from "@/components/setpassword";
import { COUNTRIES } from "@/lib/countries";

const createSchema = (locale) => 
    z.object({
        first_name: z.string().min(1, locale == "ar" ? "الاسم الأول مطلوب" : "First name is required"),
        last_name: z.string().min(1, locale == "ar" ? "الاسم الأخير مطلوب" : "Last name is required"),
        email: z.email(locale == "ar" ? "البريد الإلكتروني غير صحيح" : "Email is invalid"),
        headline: z.string().max(255, locale == "ar" ? "العنوان طويل" : "Headline is too long").optional().or(z.literal("")),
        bio: z.string().optional().or(z.literal("")),
        country_code: z.string().min(1, locale == "ar" ? "رمز الدولة مطلوب" : "Country code is required"),
        phone: z.string().min(5, locale == "ar" ? "رقم الهاتف مطلوب" : "Phone is required"),
        interests: z.array(z.number()).optional(),
    });

export default function Profile() {
    const locale = useLocale();
    const profileSchema = createSchema(locale);
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [avatarError, setAvatarError] = useState("");
    const [loading, setLoading] = useState(true);
    const objectUrlRef = useRef(null);
    const {register, handleSubmit, setValue, watch, formState: {errors, isSubmitting}} = useForm({resolver: zodResolver(profileSchema),
        defaultValues: {first_name: "", last_name: "", email: "", headline: "", bio: "", country_code: "", phone: "", interests: []},
    });
    const selectedInterests = watch("interests") || [];
    useEffect(() => {
        const getData = async () => {
            try {
                const [userResponse, categoriesResponse] =
                    await Promise.all([
                        fetch("/api/me", {credentials: "include"}),
                        fetch("/api/categories"),
                    ]);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    const currentUser = userData;
                    setUser(currentUser);
                    setValue("first_name", currentUser.first_name || "");
                    setValue("last_name", currentUser.last_name || "");
                    setValue("email", currentUser.email || "");
                    setValue("headline", currentUser.headline || "");
                    setValue("bio", currentUser.bio || "");
                    setValue("country_code", currentUser.country_code || "");
                    setValue("phone", currentUser.phone || "");
                    setValue("interests", currentUser.interests?.map(Number) || []);
                    setAvatarPreview(currentUser.avatar || "/alaa-avatar.jpg");
                }
                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(categoriesData.data || []);
                }
            } catch (error) {console.error(error);} 
            finally {setLoading(false);}
        };
        getData();
        return () => {if (objectUrlRef.current) {URL.revokeObjectURL(objectUrlRef.current);}};
    }, [setValue]);
    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setAvatarError("");
        if (!file.type.startsWith("image/")) {
            setAvatarError(locale === "ar" ? "الملف لازم يكون صورة" : "File must be an image");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError(locale === "ar" ? "الحد الأقصى 5MB" : "Maximum size is 5MB");
            return;
        }
        setAvatar(file);
        if (objectUrlRef.current) {URL.revokeObjectURL(objectUrlRef.current);}
        const preview = URL.createObjectURL(file);
        objectUrlRef.current = preview;
        setAvatarPreview(preview);
    };
    const handleInterestChange = (id) => {
        const numericId = Number(id);
        const current = selectedInterests || [];
        if (current.includes(numericId)) {
            setValue("interests", current.filter((interestId) => interestId !== numericId), {shouldDirty: true, shouldValidate: true});
        } else {
            setValue("interests", [...current, numericId], {shouldDirty: true, shouldValidate: true});
        }
    };
    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append("first_name", data.first_name);
            formData.append("last_name", data.last_name);
            formData.append("headline", data.headline || "");
            formData.append("bio", data.bio || "");
            formData.append("country_code", data.country_code || "");
            formData.append("phone", data.phone || "");
            data.interests?.forEach((interest) => {formData.append("interests", interest);});
            if (avatar) {formData.append("avatar", avatar);}
            const response = await fetch("/api/me", {method: "PATCH", credentials: "include", body: formData});
            const result = await response.json();
            if (!response.ok) {
                console.error(result);
                return;
            }
            setUser(result);
            if (result.avatar) {setAvatarPreview(result.avatar);}
            setAvatar(null);
        } catch (error) {
            console.error(error);
        }
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p>{locale === "ar" ? "جاري التحميل..." : "Loading..."}</p>
            </div>
        );
    }
    if (!user) {
        return (
            <div className="flex items-center justify-center py-20">
                <p>{locale === "ar" ? "حدث خطأ أثناء تحميل البيانات" : "Failed to load profile"}</p>
            </div>
        );
    }
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold">{locale === "ar" ? "الملف الشخصي" : "Profile"}</h1>
                <p className="text-gray-500 mt-2">
                    {locale === "ar" ? "تعديل بيانات الملف الشخصي" : "Edit your profile information"}
                </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-3">
                    <label>{locale === "ar" ? "الصورة الشخصية" : "Profile Picture"}</label>
                    <div className="relative w-28 h-28">
                        <img src={avatarPreview || "/alaa-avatar.jpg"} alt={user.username} className="w-28 h-28 rounded-full object-cover border border-gray-200"/>
                        <label htmlFor="avatar" className="absolute bottom-0 end-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/80">
                            <FaCamera size={14} />
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>

                    <span className="text-gray-400 text-sm">
                        {locale === "ar" ? "الحد الأقصى 5MB" : "Maximum size 5MB"}
                    </span>
                    {avatarError && (
                        <span className="text-red-500 text-sm">{avatarError}</span>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="first_name">{locale === "ar" ? "الاسم الأول" : "First Name"}</label>
                        <input type="text" id="first_name" {...register("first_name")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none"/>
                        {errors.first_name && (<span className="text-red-500 text-sm">{errors.first_name.message}</span>)}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="last_name">{locale === "ar" ? "اسم العائلة" : "Last Name"}</label>
                        <input type="text" id="last_name" {...register("last_name")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none"/>
                        {errors.last_name && (<span className="text-red-500 text-sm">{errors.last_name.message}</span>)}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="username">{locale === "ar" ? "اسم المستخدم" : "Username"}</label>
                    <input type="text" id="username" value={user.username || ""} disabled className="border border-gray-200 rounded-lg px-4 py-2 outline-none bg-gray-100 text-gray-500"/>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" {...register("email")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none"/>
                    {errors.email && (<span className="text-red-500 text-sm">{errors.email.message}</span>)}
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="headline">{locale === "ar" ? "العنوان" : "Headline"}</label>
                    <input type="text" id="headline" {...register("headline")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none"/>
                    {errors.headline && (
                        <span className="text-red-500 text-sm">{errors.headline.message}</span>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="bio">{locale === "ar" ? "نبذة عني" : "Bio"}</label>
                    <textarea id="bio" rows={5} {...register("bio")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none resize-none"/>
                    {errors.bio && (
                        <span className="text-red-500 text-sm">{errors.bio.message}</span>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="country_code">{locale === "ar" ? "كود الدولة" : "Country Code"}</label>
                        <select id="country_code" {...register("country_code")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none">
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.dial}>{c.flag} {c.name} ({c.dial})</option>
                            ))}
                        </select>
                        {errors.country_code && (
                            <span className="text-red-500 text-sm">{errors.country_code.message}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label htmlFor="phone">{locale === "ar" ? "رقم الهاتف" : "Phone"}</label>
                        <input type="tel" id="phone" {...register("phone")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none"/>
                        {errors.phone && (
                            <span className="text-red-500 text-sm">{errors.phone.message}</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label>{locale === "ar" ? "الاهتمامات" : "Interests"}</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const selected = selectedInterests.includes(Number(category.id));
                            return (
                                <button
                                    type="button"
                                    key={category.id}
                                    onClick={() => handleInterestChange(category.id)}
                                    className={`
                                        px-4 py-2 rounded-lg border
                                        transition cursor-pointer
                                        ${selected
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-primary"
                                        }
                                    `}
                                >
                                    {locale === "ar" ? category.arabic_title || category.english_title : category.english_title}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label>{locale === "ar" ? "نوع الحساب" : "Account Type"}</label>
                    <input type="text" value={user.user_type || ""} disabled className="border border-gray-200 rounded-lg px-4 py-2 outline-none bg-gray-100 text-gray-500"/>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="cursor-pointer px-6 py-3 text-sm font-semibold text-white transition bg-primary hover:bg-primary/80 rounded-lg disabled:opacity-50"
                    >
                        {isSubmitting
                            ? locale === "ar" ? "جاري الحفظ..." : "Saving..."
                            : locale === "ar" ? "حفظ التغييرات" : "Save Changes"}
                    </button>
                </div>
            </form>
            <SetPassword />
        </div>
    );
}