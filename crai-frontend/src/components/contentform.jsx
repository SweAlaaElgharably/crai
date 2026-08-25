"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { FaImage, FaTrash } from "react-icons/fa6";
import ContentEditor from "@/components/editor/editor";
import { extractApiError } from "@/lib/errors";

function toLocalInputValue(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ContentForm({ contentId = null }) {
    const locale = useLocale();
    const ar = locale === "ar";
    const router = useRouter();

    const editorRef = useRef(null);
    const coverInputRef = useRef(null);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("0");
    const [accessDuration, setAccessDuration] = useState("30");
    const [categoryId, setCategoryId] = useState("");
    const [status, setStatus] = useState("draft");
    const [scheduledAt, setScheduledAt] = useState("");
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [initialBody, setInitialBody] = useState(null);

    const handleEditorReady = useCallback((editor) => {
        editorRef.current = editor;
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setError("");

                const categoriesResponse = await fetch("/api/categories/", { credentials: "include", cache: "no-store" });
                const categoriesResult = await categoriesResponse.json();
                if (categoriesResponse.ok) {
                    const list = Array.isArray(categoriesResult?.data) ? categoriesResult.data : [];
                    setCategories(list);
                    if (!contentId && list.length > 0) setCategoryId(String(list[0].id));
                }

                if (contentId) {
                    const response = await fetch(`/api/contents/${contentId}/`, { credentials: "include", cache: "no-store" });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result?.detail || (ar ? "فشل تحميل المحتوى" : "Failed to load content"));

                    setTitle(result.title || "");
                    setPrice(result.price ?? "0");
                    setAccessDuration(result.access_duration_days ?? 30);
                    setCategoryId(result.category ? String(result.category) : "");
                    setStatus(result.status || "draft");
                    setScheduledAt(toLocalInputValue(result.scheduled_at));
                    setCoverPreview(result.cover_image || null);
                    setInitialBody(result.body || null);
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [contentId, ar]);

    const pickCover = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
        e.target.value = "";
    };

    const removeCover = () => {
        setCoverFile(null);
        setCoverPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError("");

            const bodyJson = JSON.stringify(editorRef.current ? editorRef.current.getJSON() : {});

            const formData = new FormData();
            formData.append("title", title);
            formData.append("price", price === "" ? "0" : price);
            formData.append("access_duration_days", accessDuration === "" ? "30" : accessDuration);
            formData.append("category", categoryId);
            formData.append("body", bodyJson);
            formData.append("status", status);
            if (status === "scheduled" && scheduledAt) {
                formData.append("scheduled_at", new Date(scheduledAt).toISOString());
            }
            if (coverFile) {
                formData.append("cover_image", coverFile);
            }

            const response = await fetch(contentId ? `/api/contents/${contentId}/` : "/api/contents/", {
                method: contentId ? "PATCH" : "POST",
                credentials: "include",
                body: formData,
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(extractApiError(result, ar ? "حدث خطأ أثناء الحفظ" : "Failed to save content"));
            }

            router.push("/contents");
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const t = {
        titlePlaceholder: ar ? "عنوان المحتوى" : "Content title",
        cover: ar ? "صورة الغلاف" : "Cover image",
        chooseCover: ar ? "اختر صورة" : "Choose image",
        price: ar ? "السعر" : "Price",
        free: ar ? "مجاني عند 0" : "Free when 0",
        category: ar ? "التصنيف" : "Category",
        duration: ar ? "مدة الوصول (يوم)" : "Access duration (days)",
        status: ar ? "الحالة" : "Status",
        draft: ar ? "مسودة" : "Draft",
        published: ar ? "منشور" : "Published",
        scheduled: ar ? "مجدول" : "Scheduled",
        scheduleTime: ar ? "موعد النشر" : "Publish time",
        save: ar ? "حفظ" : "Save",
        saving: ar ? "جارٍ الحفظ…" : "Saving…",
        back: ar ? "رجوع" : "Back",
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-2/3" />
                <div className="h-40 bg-gray-200 rounded-2xl" />
                <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-5">

            {error && <div className="rounded-md bg-red-700 px-4 py-3 text-white">{error}</div>}

            {/* Title */}
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder={t.titlePlaceholder}
                className="p-3 outline-none text-2xl font-medium border-b border-gray-100 focus:border-primary transition"
            />

            {/* Cover */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-sm font-medium mb-3">{t.cover}</p>

                {coverPreview ? (
                    <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverPreview} alt="cover" className="h-36 rounded-xl object-cover" />

                        <button
                            type="button"
                            onClick={removeCover}
                            className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"
                        >
                            <FaTrash size={11} />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 flex flex-col items-center justify-center gap-1.5 hover:border-primary hover:text-primary transition"
                    >
                        <FaImage size={20} />
                        <span className="text-sm">{t.chooseCover}</span>
                    </button>
                )}

                <input ref={coverInputRef} type="file" accept="image/*" onChange={pickCover} className="hidden" />
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-gray-500">{t.price}</span>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary"
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-gray-500">{t.category}</span>

                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        className="border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary bg-white"
                    >
                        <option value="" disabled>—</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{locale === "ar" ? cat.arabic_title ?? cat.english_title : cat.english_title}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-gray-500">{t.duration}</span>

                    <input
                        type="number"
                        min="1"
                        value={accessDuration}
                        onChange={(e) => setAccessDuration(e.target.value)}
                        className="border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary"
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-gray-500">{t.status}</span>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary bg-white"
                    >
                        <option value="draft">{t.draft}</option>
                        <option value="published">{t.published}</option>
                        <option value="scheduled">{t.scheduled}</option>
                    </select>
                </label>
            </div>

            {/* Scheduled time */}
            {status === "scheduled" && (
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm text-gray-500">{t.scheduleTime}</span>

                    <input
                        type="datetime-local"
                        required
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="border border-gray-200 rounded-xl p-2.5 outline-none focus:border-primary"
                    />
                </label>
            )}

            {/* Editor */}
            <div className="bg-white border border-gray-100 rounded-2xl p-2">
                <ContentEditor initialContent={initialBody} onReady={handleEditorReady} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={() => router.push("/contents")}
                    className="py-2.5 px-6 rounded-lg bg-stone-100 text-stone-600 font-medium transition hover:bg-stone-200"
                >
                    {t.back}
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="py-2.5 px-8 rounded-lg bg-primary text-white font-medium shadow-lg shadow-primary/20 transition hover:bg-primary/80 disabled:opacity-50 min-w-32"
                >
                    {saving ? t.saving : t.save}
                </button>
            </div>

        </form>
    );
}
