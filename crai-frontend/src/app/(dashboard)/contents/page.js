"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { FaPlus, FaPen, FaTrash, FaGlobe, FaClock, FaFilePdf, FaMoneyBillWave } from "react-icons/fa6";
import { LuLoaderCircle } from "react-icons/lu";
import { useUserStore } from "@/stores/userStore";
import { extractApiError } from "@/lib/errors";

const FALLBACK_COVER = "/placeholder-cover.jpg";

function formatDate(date, locale) {
    if (!date) return "-";
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric", month: "short", day: "numeric",
    }).format(new Date(date));
}

function formatMoney(value, locale) {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
        style: "currency", currency: "SAR", minimumFractionDigits: 2,
    }).format(Number(value || 0));
}

const STATUS_STYLES = {
    draft: "bg-gray-100 text-gray-600",
    published: "bg-green-500 text-white",
    scheduled: "bg-amber-400 text-white",
};

export default function ContentsPage() {
    const locale = useLocale();
    const ar = locale === "ar";
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [busyId, setBusyId] = useState(null);
    const [scheduleFor, setScheduleFor] = useState(null);
    const [scheduleAt, setScheduleAt] = useState("");
    const [scheduleMin, setScheduleMin] = useState("");

    useEffect(() => {
        if (user && user.user_type !== "influencer" && !user.is_staff) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        const getContents = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch("/api/contents/", { credentials: "include", cache: "no-store" });
                const result = await response.json();
                if (!response.ok) throw new Error(result?.detail || (ar ? "حدث خطأ أثناء تحميل المحتوى" : "Failed to load contents"));
                setContents(Array.isArray(result) ? result : result?.results || []);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        getContents();
    }, [ar]);

    const patchStatus = async (id, payload) => {
        try {
            setBusyId(id);
            const response = await fetch(`/api/contents/${id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(extractApiError(result, ar ? "حدث خطأ" : "Something went wrong"));
            setContents((current) => current.map((item) => (item.id === id ? result : item)));
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setBusyId(null);
        }
    };

    const removeContent = async (id) => {
        if (!confirm(ar ? "هل أنت متأكد من حذف هذا المحتوى؟" : "Delete this content?")) return;
        try {
            setBusyId(id);
            const response = await fetch(`/api/contents/${id}/`, { method: "DELETE", credentials: "include" });
            if (!response.ok && response.status !== 204) throw new Error(ar ? "حدث خطأ أثناء الحذف" : "Failed to delete");
            setContents((current) => current.filter((item) => item.id !== id));
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setBusyId(null);
        }
    };

    const submitSchedule = async () => {
        if (!scheduleFor || !scheduleAt) return;
        await patchStatus(scheduleFor.id, { status: "scheduled", scheduled_at: new Date(scheduleAt).toISOString() });
        setScheduleFor(null);
        setScheduleAt("");
    };

    const t = useMemo(() => ({
        page: ar ? "المحتوى الخاص بي" : "My Content",
        create: ar ? "إنشاء محتوى" : "Create Content",
        all: ar ? "الكل" : "All",
        draft: ar ? "مسودة" : "Draft",
        published: ar ? "منشور" : "Published",
        scheduled: ar ? "مجدول" : "Scheduled",
        publish: ar ? "نشر" : "Publish",
        unpublish: ar ? "إلغاء النشر" : "Unpublish",
        schedule: ar ? "جدولة" : "Schedule",
        cancelSchedule: ar ? "إلغاء الجدولة" : "Cancel Schedule",
        edit: ar ? "تعديل" : "Edit",
        delete: ar ? "حذف" : "Delete",
        free: ar ? "مجاني" : "Free",
        empty: ar ? "لا يوجد محتوى حتى الآن" : "No content yet",
        emptyHint: ar ? "ابدأ بإنشاء أول محتوى لك" : "Start by creating your first content",
        scheduleTitle: ar ? "حدد موعد النشر" : "Schedule publish time",
        confirm: ar ? "تأكيد" : "Confirm",
        cancel: ar ? "إلغاء" : "Cancel",
    }), [ar]);

    const filtered = useMemo(
        () => (filter === "all" ? contents : contents.filter((item) => item.status === filter)),
        [contents, filter]
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-semibold">{t.page}</h1>

                <Link
                    href="/contents/create"
                    className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2 font-medium"
                >
                    <FaPlus />
                    {t.create}
                </Link>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
                {[["all", t.all], ["draft", t.draft], ["published", t.published], ["scheduled", t.scheduled]].map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filter === key ? "bg-primary text-white shadow shadow-primary/20" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {error && <div className="rounded-md bg-red-700 px-4 py-3 text-white mb-6">{error}</div>}

            {/* Loading */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="animate-pulse bg-white border border-gray-100 rounded-2xl overflow-hidden">
                            <div className="aspect-video bg-gray-200" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                <div className="h-9 bg-gray-200 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                    <FaFilePdf size={34} className="mx-auto text-gray-300 mb-4" />

                    <h3 className="font-semibold text-lg text-gray-700">{t.empty}</h3>

                    <p className="text-sm text-gray-400 mt-1">{t.emptyHint}</p>
                </div>
            ) : (
                /* Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col">
                            {/* Cover */}
                            <div className="relative aspect-video bg-gray-100">
                                {item.cover_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.cover_image} alt={item.title} className="w-full aspect-video object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><FaFilePdf size={32} /></div>
                                )}

                                <span className={`absolute top-3 start-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                                    {item.status === "published" ? <FaGlobe size={10} /> : <FaClock size={10} />}
                                    {t[item.status]}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>

                                <p className="text-sm text-gray-400 mt-1">{item.category_name}</p>

                                <div className="flex items-center justify-between mt-3 text-sm">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <FaMoneyBillWave size={13} className="text-primary" />
                                        {item.is_free ? t.free : formatMoney(item.price, locale)}
                                    </span>

                                    <span className="text-gray-400">{formatDate(item.created_at, locale)}</span>
                                </div>

                                {item.status === "scheduled" && item.scheduled_at && (
                                    <p className="mt-2 text-xs bg-amber-50 text-amber-600 rounded-lg px-3 py-1.5">
                                        {ar ? "ينشر في" : "Publishes"}: {formatDate(item.scheduled_at, locale)}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-50">
                                    {item.status !== "published" && (
                                        <button
                                            type="button"
                                            disabled={busyId === item.id}
                                            onClick={() => patchStatus(item.id, { status: "published" })}
                                            className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium transition hover:bg-primary/80 disabled:opacity-50"
                                        >
                                            {busyId === item.id ? <LuLoaderCircle className="animate-spin mx-auto" /> : t.publish}
                                        </button>
                                    )}

                                    {item.status !== "draft" && (
                                        <button
                                            type="button"
                                            disabled={busyId === item.id}
                                            onClick={() => patchStatus(item.id, { status: "draft" })}
                                            className="py-2 px-3 rounded-lg bg-stone-100 text-stone-600 text-sm font-medium transition hover:bg-stone-200 disabled:opacity-50"
                                        >
                                            {item.status === "scheduled" ? t.cancelSchedule : t.unpublish}
                                        </button>
                                    )}

                                    {item.status !== "scheduled" && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setScheduleFor(item);
                                                setScheduleAt("");
                                                setScheduleMin(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                                            }}
                                            title={t.schedule}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition ${item.status === "scheduled" ? "bg-amber-400 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                                        >
                                            <FaClock size={14} />
                                        </button>
                                    )}

                                    <Link
                                        href={`/contents/${item.id}/edit`}
                                        title={t.edit}
                                        className="py-2 px-3 rounded-lg bg-stone-100 text-stone-600 text-sm transition hover:bg-stone-200"
                                    >
                                        <FaPen size={13} />
                                    </Link>

                                    <button
                                        type="button"
                                        disabled={busyId === item.id}
                                        onClick={() => removeContent(item.id)}
                                        title={t.delete}
                                        className="py-2 px-3 rounded-lg bg-red-50 text-red-500 text-sm transition hover:bg-red-100 disabled:opacity-50 ms-auto"
                                    >
                                        <FaTrash size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Schedule modal */}
            {scheduleFor && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setScheduleFor(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-semibold text-lg mb-1">{t.scheduleTitle}</h3>

                        <p className="text-sm text-gray-400 mb-4 truncate">{scheduleFor.title}</p>

                        <input
                            type="datetime-local"
                            value={scheduleAt}
                            min={scheduleMin}
                            onChange={(e) => setScheduleAt(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-primary"
                        />

                        <div className="flex gap-3 mt-5">
                            <button
                                type="button"
                                disabled={!scheduleAt}
                                onClick={submitSchedule}
                                className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium transition hover:bg-primary/80 disabled:opacity-50"
                            >
                                {t.confirm}
                            </button>

                            <button
                                type="button"
                                onClick={() => setScheduleFor(null)}
                                className="flex-1 py-2.5 rounded-lg bg-stone-100 text-stone-600 font-medium transition hover:bg-stone-200"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
