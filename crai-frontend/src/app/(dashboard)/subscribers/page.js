"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { FaUsers, FaCrown, FaPercentage, FaUserPlus, FaShoppingBag } from "react-icons/fa";
import EChart from "@/components/echart";

const PRIMARY = "#0bb2b0";
const ACCENT = "#f59e0b";
const FALLBACK_AVATAR = "/alaa-avatar.jpg";

function formatDate(date, locale) {
    if (!date) return "-";
    return new Intl.DateTimeFormat(
        locale === "ar" ? "ar-EG" : "en-US",
        {year: "numeric", month: "short", day: "numeric"}
    ).format(new Date(date));
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

function PeopleList({ data, locale, showPurchases = false, emptyText }) {
    if (!data?.length) {
        return (
            <div className="py-10 text-center">
                <FaUsers size={30} className="mx-auto text-gray-300 mb-3" />

                <p className="text-sm text-gray-400">{emptyText}</p>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
            {data.map((person) => (
                <li key={`${person.id}-${person.joined_at}`} className="flex items-center gap-3 py-3">
                    <img
                        src={person.avatar || FALLBACK_AVATAR}
                        alt={person.username}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                            {person.first_name} {person.last_name}
                        </p>

                        <p className="text-sm text-gray-400 truncate">@{person.username}</p>
                    </div>

                    <div className="text-end shrink-0">
                        {showPurchases && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5 mb-1">
                                <FaShoppingBag size={9} />

                                {person.purchases_count}
                            </span>
                        )}

                        <p className="text-xs text-gray-400">
                            {formatDate(person.joined_at, locale)}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function PeopleCard({ title, total, all, recent, locale, showPurchases, labels }) {
    const [tab, setTab] = useState("all");

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">
                    {title}
                    <span className="text-sm text-gray-400 font-normal ms-2">({total})</span>
                </h2>

                <div className="flex bg-stone-100 rounded-lg p-0.5 text-sm">
                    {[
                        ["all", labels.all],
                        ["recent", labels.recent],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={`px-3 py-1.5 rounded-md transition ${
                                tab === key
                                    ? "bg-white shadow-sm font-medium"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <PeopleList
                data={tab === "all" ? all : recent}
                locale={locale}
                showPurchases={showPurchases}
                emptyText={labels.empty}
            />
        </div>
    );
}

export default function SubscribersPage() {
    const locale = useLocale();
    const ar = locale === "ar";
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getSubscribers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/subscribers/", {
                    credentials: "include",
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result?.detail || (ar ? "حدث خطأ أثناء تحميل البيانات" : "Failed to load subscribers"));
                }

                setData(result);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        getSubscribers();
    }, [ar]);

    const t = useMemo(() => ({
        page: ar ? "المشتركون" : "Subscribers",
        subtitle: ar ? "تابع متابعيك والمشتركين في محتواك" : "Track your followers and content subscribers",
        followers: ar ? "المتابعون" : "Followers",
        subscribers: ar ? "المشترون" : "Buyers",
        totalFollowers: ar ? "إجمالي المتابعين" : "Total Followers",
        totalSubscribers: ar ? "إجمالي المشتركين" : "Total Subscribers",
        conversion: ar ? "نسبة التحويل" : "Conversion Rate",
        growthChart: ar ? "نمو المتابعين والمشتركين" : "Follower & Subscriber Growth",
        distributionChart: ar ? "التوزيع" : "Distribution",
        newFollowers: ar ? "متابعون جدد" : "New Followers",
        newSubscribers: ar ? "مشتركون جدد" : "New Subscribers",
        all: ar ? "الكل" : "All",
        recent: ar ? "الأحدث ١٠" : "Recent 10",
        joinedOn: ar ? "انضم بتاريخ" : "Joined",
        noFollowers: ar ? "لا يوجد متابعون حتى الآن" : "No followers yet",
        noSubscribers: ar ? "لا يوجد مشترون حتى الآن" : "No buyers yet",
    }), [ar]);

    const growthOption = useMemo(() => {
        if (!data) return null;
        return {
            tooltip: { trigger: "axis" },
            legend: { data: [t.newFollowers, t.newSubscribers], bottom: 0 },
            grid: { left: 40, right: 16, top: 24, bottom: 56 },
            xAxis: { type: "category", data: data.charts.months, inverse: ar },
            yAxis: { type: "value", minInterval: 1 },
            series: [
                {
                    name: t.newFollowers,
                    type: "bar",
                    data: data.charts.new_followers,
                    barMaxWidth: 28,
                    itemStyle: { color: PRIMARY, borderRadius: [6, 6, 0, 0] },
                },
                {
                    name: t.newSubscribers,
                    type: "line",
                    smooth: true,
                    symbolSize: 8,
                    data: data.charts.new_subscribers,
                    itemStyle: { color: ACCENT },
                    lineStyle: { width: 3 },
                },
            ],
        };
    }, [data, t, ar]);

    const donutOption = useMemo(() => {
        if (!data) return null;
        return {
            tooltip: { trigger: "item" },
            legend: { bottom: 0 },
            series: [
                {
                    type: "pie",
                    radius: ["45%", "72%"],
                    center: ["50%", "45%"],
                    avoidLabelOverlap: true,
                    itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
                    label: { show: true, formatter: "{b}: {c}" },
                    data: [
                        { name: t.followers, value: data.summary.followers_count, itemStyle: { color: PRIMARY } },
                        { name: t.subscribers, value: data.summary.subscribers_count, itemStyle: { color: ACCENT } },
                    ],
                },
            ],
        };
    }, [data, t]);

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-48" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-28 bg-gray-200 rounded-2xl" />
                        <div className="h-28 bg-gray-200 rounded-2xl" />
                        <div className="h-28 bg-gray-200 rounded-2xl" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="h-80 bg-gray-200 rounded-2xl lg:col-span-2" />
                        <div className="h-80 bg-gray-200 rounded-2xl" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="h-96 bg-gray-200 rounded-2xl" />
                        <div className="h-96 bg-gray-200 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="rounded-md bg-red-700 px-4 py-3 text-white">
                    {error || (ar ? "المشتركون غير متاحين" : "Subscribers not available")}
                </div>
            </div>
        );
    }

    const conversionRate =
        data.summary.followers_count > 0
            ? Math.round((data.summary.subscribers_count / data.summary.followers_count) * 100)
            : 0;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold">{t.page}</h1>

                <p className="text-gray-500 mt-2">{t.subtitle}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard icon={<FaUsers size={18} />} title={t.totalFollowers} value={data.summary.followers_count} />

                <StatCard icon={<FaCrown size={18} />} title={t.totalSubscribers} value={data.summary.subscribers_count} />

                <StatCard icon={<FaPercentage size={18} />} title={t.conversion} value={`${conversionRate}%`} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 lg:col-span-2">
                    <h2 className="font-semibold text-lg mb-4">{t.growthChart}</h2>

                    <EChart option={growthOption} height={320} />
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <h2 className="font-semibold text-lg mb-4">{t.distributionChart}</h2>

                    <EChart option={donutOption} height={320} />
                </div>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PeopleCard
                    title={t.followers}
                    total={data.followers.total}
                    all={data.followers.all}
                    recent={data.followers.recent}
                    locale={locale}
                    showPurchases={false}
                    labels={{ all: t.all, recent: t.recent, empty: t.noFollowers }}
                />

                <PeopleCard
                    title={t.subscribers}
                    total={data.subscribers.total}
                    all={data.subscribers.all}
                    recent={data.subscribers.recent}
                    locale={locale}
                    showPurchases={true}
                    labels={{ all: t.all, recent: t.recent, empty: t.noSubscribers }}
                />
            </div>

        </div>
    );
}
