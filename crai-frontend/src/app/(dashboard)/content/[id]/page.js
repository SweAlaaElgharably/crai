"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { FaHeart, FaRegHeart, FaRegComments, FaShareNodes, FaLock, FaTrash } from "react-icons/fa6";
import Link from "next/link";
import { extractApiError } from "@/lib/errors";
import { useUserStore } from "@/stores/userStore";
import ContentRenderer from "@/components/editor/contentrenderer";

export default function ContentView() {
    const params = useParams();
    const id = params?.id;
    const locale = useLocale();
    const ar = locale === "ar";
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentsCount, setCommentsCount] = useState(0);
    const [shareCount, setShareCount] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [shareLabel, setShareLabel] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(`/api/contents/${id}`, { credentials: "include", cache: "no-store" });
                if (response.status === 401) {
                    router.replace("/login");
                    return;
                }
                const result = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(extractApiError(result, ar ? "تعذر تحميل المحتوى" : "Failed to load content"));
                }
                setContent(result);
                setLiked(Boolean(result.is_liked));
                setLikesCount(Number(result.likes_count || 0));
                setCommentsCount(Number(result.comments_count || 0));
                setShareCount(Number(result.share_count || 0));
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id, ar, router]);

    useEffect(() => {
        let cancelled = false;
        const loadComments = async () => {
            try {
                const response = await fetch(`/api/contents/${id}/comments`, { credentials: "include", cache: "no-store" });
                if (!response.ok) return;
                const list = await response.json();
                if (!cancelled && Array.isArray(list)) {
                    setComments(list);
                    setCommentsCount(list.length);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (content?.has_access && user && id) loadComments();
        return () => { cancelled = true; };
    }, [content?.has_access, user, id]);

    const buyNow = () => {
        if (!content) return;
        router.push(`/checkout?id=${content.id}`);
    };

    const toggleLike = async () => {
        if (!user) {
            router.push("/login");
            return;
        }
        try {
            const response = await fetch(`/api/contents/${id}/like`, { method: "POST", credentials: "include" });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(extractApiError(result, ar ? "تعذر تنفيذ الإعجاب" : "Failed to like"));
            }
            setLiked(Boolean(result.is_liked));
            setLikesCount(Number(result.likes_count || 0));
        } catch (err) {
            console.error(err);
        }
    };

    const submitComment = async (event) => {
        event.preventDefault();
        const body = newComment.trim();
        if (!body || submittingComment) return;
        try {
            setSubmittingComment(true);
            const response = await fetch(`/api/contents/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ body }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(extractApiError(result, ar ? "تعذر إضافة التعليق" : "Failed to comment"));
            }
            setComments((prev) => [...prev, result]);
            setCommentsCount((count) => count + 1);
            setNewComment("");
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setSubmittingComment(false);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, { method: "DELETE", credentials: "include" });
            if (!response.ok && response.status !== 204) return;
            setComments((prev) => prev.filter((comment) => comment.id !== commentId));
            setCommentsCount((count) => Math.max(0, count - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const shareContent = async () => {
        const url = `${window.location.origin}/${locale}/content/${id}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: content.title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setShareLabel(ar ? "تم نسخ الرابط" : "Link copied");
                setTimeout(() => setShareLabel(""), 2000);
            }
            const response = await fetch(`/api/contents/${id}/share`, { method: "POST", credentials: "include" });
            const result = await response.json().catch(() => ({}));
            if (response.ok && typeof result.share_count === "number") {
                setShareCount(result.share_count);
            } else {
                setShareCount((count) => count + 1);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
                <div className="h-64 bg-gray-200 rounded-2xl" />
                <div className="h-10 bg-gray-200 rounded w-2/3" />
                <div className="h-40 bg-gray-200 rounded-2xl" />
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="flex justify-center py-20">
                <p className="text-red-500">{error || (ar ? "المحتوى غير موجود" : "Content not found")}</p>
            </div>
        );
    }

    const isOwner = user && (user.id === content.owner || user.is_staff);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-5">
            {/* Cover */}
            {content.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={content.cover_image} alt={content.title} className="w-full aspect-video rounded-2xl object-cover" />
            )}

            {/* Meta */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${content.is_free ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        {content.is_free ? (ar ? "مجاني" : "Free") : `${content.price} ${ar ? "ر.س" : "SAR"}`}
                    </span>
                    {content.category_name && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{content.category_name}</span>
                    )}
                    <span className="text-xs text-gray-400">
                        {new Date(content.created_at).toLocaleDateString(ar ? "ar-EG" : "en-US")}
                    </span>
                </div>

                <h1 className="text-3xl font-semibold">{content.title}</h1>

                {content.owner_details && (
                    <Link href={`/influencer/${content.owner_details.username}`} className="flex items-center gap-2 w-fit group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={content.owner_details.avatar || "/alaa-avatar.jpg"}
                            alt={content.owner_details.username}
                            className="w-9 h-9 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-500 group-hover:text-primary transition">
                            {content.owner_details.first_name} {content.owner_details.last_name}
                        </span>
                    </Link>
                )}
            </div>

            {/* Body or locked panel */}
            {content.has_access || isOwner ? (
                <article dir={ar ? "rtl" : "ltr"} className="bg-white border border-gray-100 rounded-2xl p-6 leading-[1.75] text-neutral-900">
                    <ContentRenderer doc={content.body} />
                </article>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <FaLock className="text-primary text-xl" />
                    </div>

                    <h2 className="text-xl font-semibold">{ar ? "هذا المحتوى مدفوع" : "This is paid content"}</h2>

                    <p className="text-sm text-gray-500 max-w-md">
                        {ar
                            ? "قم بشراء هذا المحتوى للوصول الفوري إليه."
                            : "Purchase this content to get instant access."}
                    </p>

                    <button
                        type="button"
                        onClick={buyNow}
                        className="min-w-40 py-3 px-8 rounded-lg bg-primary text-white font-medium shadow-lg shadow-primary/20 transition hover:bg-primary/80"
                    >
                        {ar ? `اشترِ الآن — ${content.price} ر.س` : `Buy now — ${content.price} SAR`}
                    </button>
                </div>
            )}

            {/* Engagement bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    type="button"
                    onClick={toggleLike}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition cursor-pointer ${liked ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                    title={user ? undefined : (ar ? "سجّل الدخول للإعجاب" : "Sign in to like")}
                >
                    {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    {likesCount}
                </button>

                <a href="#comments" className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50">
                    <FaRegComments />
                    {commentsCount}
                </a>

                <button
                    type="button"
                    onClick={shareContent}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition cursor-pointer ${shareLabel ? "border-primary/40 bg-primary/5 text-primary" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                >
                    <FaShareNodes />
                    {shareLabel || (ar ? "مشاركة" : "Share")}
                    {!shareLabel && shareCount > 0 && <span className="text-gray-400">({shareCount})</span>}
                </button>

                {!user && (
                    <span className="text-xs text-gray-400">
                        {ar ? "سجّل الدخول للإعجاب والتعليق" : "Sign in to like and comment"}
                    </span>
                )}
            </div>

            {/* Comments */}
            {content.has_access && user && (
                <section id="comments" className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold">
                        {ar ? `التعليقات (${commentsCount})` : `Comments (${commentsCount})`}
                    </h2>

                    <form onSubmit={submitComment} className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(event) => setNewComment(event.target.value)}
                            placeholder={ar ? "اكتب تعليقًا..." : "Write a comment..."}
                            maxLength={2000}
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                        />
                        <button
                            type="submit"
                            disabled={submittingComment || !newComment.trim()}
                            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium shadow-lg shadow-primary/20 transition hover:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {ar ? "نشر" : "Post"}
                        </button>
                    </form>

                    {comments.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            {ar ? "لا توجد تعليقات بعد — كن أول من يعلّق!" : "No comments yet — be the first!"}
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {comments.map((comment) => {
                                const isOwn = user && comment.user_details?.id === user.id;
                                return (
                                    <li key={comment.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={comment.user_details?.avatar || "/alaa-avatar.jpg"}
                                            alt={comment.user_details?.username}
                                            className="w-9 h-9 rounded-full object-cover shrink-0"
                                        />
                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 justify-between">
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {[comment.user_details?.first_name, comment.user_details?.last_name].filter(Boolean).join(" ") || comment.user_details?.username}
                                                </span>
                                                {(isOwn || user?.is_staff) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteComment(comment.id)}
                                                        className="text-gray-300 hover:text-red-500 transition cursor-pointer p-1"
                                                        title={ar ? "حذف التعليق" : "Delete comment"}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{comment.body}</p>
                                            <span className="text-[11px] text-gray-300">
                                                {new Date(comment.created_at).toLocaleString(ar ? "ar-EG" : "en-US")}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            )}

            {/* Access expiry notice */}
            {content.has_access && content.access_expires_at && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-4 py-2">
                    {ar ? "ينتهي وصولك في" : "Your access ends on"}{" "}
                    {new Date(content.access_expires_at).toLocaleString(ar ? "ar-EG" : "en-US")}
                </p>
            )}
        </div>
    );
}
