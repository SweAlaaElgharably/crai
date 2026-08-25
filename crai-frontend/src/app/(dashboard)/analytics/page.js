"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {FaBookOpen, FaCheckCircle, FaClock, FaMoneyBillWave} from "react-icons/fa";
import { useUserStore } from "@/stores/userStore";

function formatDate(date, locale) {
    if (!date) return "-";
    return new Intl.DateTimeFormat(
        locale === "ar" ? "ar-EG" : "en-US", {year: "numeric", month: "short", day: "numeric"}
    ).format(new Date(date));
}

function formatMoney(value, locale) {
    return new Intl.NumberFormat(
        locale === "ar" ? "ar-EG" : "en-US",
        {style: "currency", currency: "SAR", minimumFractionDigits: 2,}
    ).format(Number(value || 0));
}

function StatCard({ icon, title, value, description }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <h3 className="text-2xl font-semibold mt-2">
                        {value}
                    </h3>

                    {description && (
                        <p className="text-xs text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>

                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function ClientDashboard() {
    const locale = useLocale();
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        if (user && user.user_type !== "client" && !user.is_staff) {
            router.replace("/analytics/influencer");
        }
    }, [user, router]);
    useEffect(() => {
        const getDashboard = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch("/api/clientdashboard/", {credentials: "include", cache: "no-store",});
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result || "Failed to load dashboard");
                }
                setData(result);
            } catch (error) {
                console.error(error);
                setError(locale === "ar" ? "حدث خطأ أثناء تحميل البيانات" : "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };
        getDashboard();
    }, [locale]);
    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-32 bg-gray-200 rounded-2xl" />
                        <div className="h-32 bg-gray-200 rounded-2xl" />
                        <div className="h-32 bg-gray-200 rounded-2xl" />
                    </div>
                    <div className="h-64 bg-gray-200 rounded-2xl" />
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="rounded-md bg-red-700 px-4 py-3 text-white">{error}</div>
            </div>
        );
    }
    const summary = data?.summary || {};
    const content = data?.content || [];
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold">
                    {locale === "ar"
                        ? "لوحة التحكم"
                        : "Dashboard"}
                </h1>

                <p className="text-gray-500 mt-2">
                    {locale === "ar"
                        ? "تابع مشترياتك والمحتوى المتاح لك"
                        : "Track your purchases and available content"}
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

                <StatCard
                    icon={<FaMoneyBillWave size={18} />}
                    title={
                        locale === "ar"
                            ? "إجمالي المدفوع"
                            : "Total Spent"
                    }
                    value={formatMoney(
                        summary.total_spent,
                        locale
                    )}
                />

                <StatCard
                    icon={<FaClock size={18} />}
                    title={
                        locale === "ar"
                            ? "المدفوع هذا الشهر"
                            : "Spent This Month"
                    }
                    value={formatMoney(
                        summary.spent_this_month,
                        locale
                    )}
                />

                <StatCard
                    icon={<FaBookOpen size={18} />}
                    title={
                        locale === "ar"
                            ? "المحتوى الخاص بي"
                            : "My Content"
                    }
                    value={summary.content_count || 0}
                    description={
                        locale === "ar"
                            ? "محتوى تم شراؤه"
                            : "Purchased content"
                    }
                />

            </div>

            {/* Content */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                        {locale === "ar"
                            ? "المحتوى الخاص بي"
                            : "My Content"}
                    </h2>
                </div>

                {content.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                        <FaBookOpen
                            size={32}
                            className="mx-auto text-gray-300 mb-4"
                        />

                        <h3 className="font-medium text-gray-700">
                            {locale === "ar"
                                ? "لا يوجد محتوى حتى الآن"
                                : "No content yet"}
                        </h3>

                        <p className="text-sm text-gray-400 mt-2">
                            {locale === "ar"
                                ? "المحتوى الذي تشتريه سيظهر هنا"
                                : "Content you purchase will appear here"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {content.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                            >
                                {/* Cover */}
                                <div className="relative aspect-video bg-gray-100">
                                    {item.cover ? (
                                        <img
                                            src={item.cover}
                                            alt={item.title}
                                            className="w-full aspect-video object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FaBookOpen
                                                size={35}
                                                className="text-gray-300"
                                            />
                                        </div>
                                    )}

                                    {/* Status */}
                                    <div className="absolute top-3 end-3">
                                        {item.is_available ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-medium">
                                                <FaCheckCircle size={11} />

                                                {locale === "ar"
                                                    ? "متاح"
                                                    : "Available"}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-medium">
                                                <FaClock size={11} />

                                                {locale === "ar"
                                                    ? "منتهي"
                                                    : "Expired"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">

                                    <h3 className="font-semibold text-lg line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <div className="mt-4 space-y-3">

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">
                                                {locale === "ar"
                                                    ? "السعر"
                                                    : "Price"}
                                            </span>

                                            <span className="font-medium">
                                                {formatMoney(
                                                    item.price,
                                                    locale
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">
                                                {locale === "ar"
                                                    ? "تم الدفع"
                                                    : "Amount Paid"}
                                            </span>

                                            <span className="font-medium">
                                                {formatMoney(
                                                    item.amount_paid,
                                                    locale
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">
                                                {locale === "ar"
                                                    ? "تاريخ الشراء"
                                                    : "Purchased"}
                                            </span>

                                            <span className="font-medium">
                                                {formatDate(
                                                    item.purchased_at,
                                                    locale
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">
                                                {locale === "ar"
                                                    ? "ينتهي في"
                                                    : "Expires"}
                                            </span>

                                            <span
                                                className={`font-medium ${
                                                    item.is_available
                                                        ? "text-gray-700"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {item.expires_at
                                                    ? formatDate(
                                                        item.expires_at,
                                                        locale
                                                    )
                                                    : locale === "ar"
                                                        ? "بدون انتهاء"
                                                        : "Never"}
                                            </span>
                                        </div>

                                    </div>

                                    {/* Action */}
                                    <button
                                        type="button"
                                        disabled={!item.is_available}
                                        onClick={() => router.push(`/content/${item.content_id}`)}
                                        className="w-full mt-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium transition hover:bg-primary/80 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {item.is_available
                                            ? locale === "ar"
                                                ? "فتح المحتوى"
                                                : "Open Content"
                                            : locale === "ar"
                                                ? "انتهى الوصول"
                                                : "Access Expired"}
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}