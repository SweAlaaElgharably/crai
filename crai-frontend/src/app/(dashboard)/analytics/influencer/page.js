"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { FaMoneyBillWave, FaCalendarAlt, FaUsers, FaCrown } from "react-icons/fa";
import EChart from "@/components/echart";
import { useUserStore } from "@/stores/userStore";

const PRIMARY = "#0bb2b0";
const ACCENT = "#f59e0b";
const VIOLET = "#8b5cf6";

function formatMoney(value, locale) {
    return new Intl.NumberFormat(
        locale === "ar" ? "ar-EG" : "en-US",
        {style: "currency", currency: "SAR", minimumFractionDigits: 2}
    ).format(Number(value || 0));
}

function StatCard({ icon, title, value }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>

                    <h3 className="text-2xl font-semibold mt-2">{value}</h3>
                </div>

                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function PeriodChips({ data, labels }) {
    const periods = [
        ["daily", labels.daily],
        ["weekly", labels.weekly],
        ["monthly", labels.monthly],
        ["forever", labels.forever],
    ];

    return (
        <div className="grid grid-cols-2 gap-3 mb-5">
            {periods.map(([key, label]) => (
                <div key={key} className="bg-stone-50 border border-gray-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400">{label}</p>

                    <p className="text-xl font-semibold mt-1">{data[key]}</p>
                </div>
            ))}
        </div>
    );
}

function GrowthCard({ title, icon, data, color, locale, labels }) {
    const option = useMemo(() => {
        if (!data) return null;
        return {
            tooltip: {
                trigger: "axis",
                valueFormatter: (value) => `${value} ${labels.users}`,
            },
            grid: { left: 40, right: 16, top: 16, bottom: 28 },
            xAxis: { type: "category", data: data.growth.labels, inverse: locale === "ar", boundaryGap: false },
            yAxis: { type: "value", minInterval: 1 },
            series: [
                {
                    name: title,
                    type: "line",
                    smooth: true,
                    symbol: "none",
                    data: data.growth.values,
                    itemStyle: { color },
                    lineStyle: { width: 3 },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: `${color}55` },
                                { offset: 1, color: `${color}05` },
                            ],
                        },
                    },
                },
            ],
        };
    }, [data, color, locale, title, labels.users]);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{icon}</span>
                    {title}
                </h2>
            </div>

            <PeriodChips data={data} labels={labels} />

            <EChart option={option} height={240} />
        </div>
    );
}

export default function InfluencerAnalyticsPage() {
    const locale = useLocale();
    const ar = locale === "ar";
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user && user.user_type !== "influencer" && !user.is_staff) {
            router.replace("/analytics");
        }
    }, [user, router]);

    useEffect(() => {
        const getAnalytics = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/analytics/", {
                    credentials: "include",
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result?.detail || (ar ? "حدث خطأ أثناء تحميل البيانات" : "Failed to load analytics"));
                }

                setData(result);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        getAnalytics();
    }, [ar]);

    const t = useMemo(() => ({
        page: ar ? "التحليلات" : "Analytics",
        subtitle: ar ? "تابع أرباحك ونمو جمهورك" : "Track your revenue and audience growth",
        revenueTitle: ar ? "الأرباح" : "Revenue",
        revenueForever: ar ? "إجمالي الأرباح" : "Total Revenue",
        revenueMonthly: ar ? "أرباح هذا الشهر" : "This Month",
        revenueChart: ar ? "الأرباح الشهرية" : "Monthly Revenue",
        followersCard: ar ? "المتابعون" : "Followers",
        subscribersCard: ar ? "المشترون" : "Buyers",
        daily: ar ? "يومي" : "Daily",
        weekly: ar ? "أسبوعي" : "Weekly",
        monthly: ar ? "شهري" : "Monthly",
        forever: ar ? "الكل" : "All time",
        growth: ar ? "منحنى النمو (٣٠ يوم)" : "Growth (30 days)",
        users: ar ? "مستخدم" : "users",
    }), [ar]);

    const revenueOption = useMemo(() => {
        if (!data) return null;
        return {
            tooltip: {
                trigger: "axis",
                valueFormatter: (value) => formatMoney(value, locale),
            },
            grid: { left: 60, right: 16, top: 24, bottom: 28 },
            xAxis: { type: "category", data: data.revenue.monthly.labels, inverse: ar },
            yAxis: { type: "value" },
            series: [
                {
                    name: t.revenueChart,
                    type: "bar",
                    data: data.revenue.monthly.values,
                    barMaxWidth: 36,
                    itemStyle: { color: PRIMARY, borderRadius: [6, 6, 0, 0] },
                },
            ],
        };
    }, [data, ar, locale, t]);

    if (loading || !data) {
        const message = error || "";
        if (message) {
            return (
                <div className="w-full max-w-7xl mx-auto px-4 py-8">
                    <div className="rounded-md bg-red-700 px-4 py-3 text-white">{message}</div>
                </div>
            );
        }

        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-48" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-28 bg-gray-200 rounded-2xl" />
                        <div className="h-28 bg-gray-200 rounded-2xl" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="h-96 bg-gray-200 rounded-2xl" />
                        <div className="h-96 bg-gray-200 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold">{t.page}</h1>

                <p className="text-gray-500 mt-2">{t.subtitle}</p>
            </div>

            {/* Revenue stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <StatCard
                    icon={<FaMoneyBillWave size={18} />}
                    title={`${t.revenueForever} (${t.forever})`}
                    value={formatMoney(data.revenue.total, locale)}
                />

                <StatCard
                    icon={<FaCalendarAlt size={18} />}
                    title={`${t.revenueMonthly} (${t.monthly})`}
                    value={formatMoney(data.revenue.this_month, locale)}
                />
            </div>

            {/* Followers & Subscribers growth */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                <GrowthCard
                    title={t.followersCard}
                    icon={<FaUsers size={16} />}
                    data={data.followers}
                    color={PRIMARY}
                    locale={locale}
                    labels={{ ...t, users: t.users }}
                />

                <GrowthCard
                    title={t.subscribersCard}
                    icon={<FaCrown size={16} />}
                    data={data.subscribers}
                    color={ACCENT}
                    locale={locale}
                    labels={{ ...t, users: t.users }}
                />
            </div>

            {/* Revenue chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="font-semibold text-lg mb-4">{t.revenueChart}</h2>

                <EChart option={revenueOption} height={300} />
            </div>

        </div>
    );
}
