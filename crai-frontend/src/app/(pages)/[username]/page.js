"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaUsers, FaHeart } from "react-icons/fa6";
import { LuLoaderCircle, LuLock, LuArrowRight, LuCalendar } from "react-icons/lu";

export default function PublicCreatorPage() {
    const locale = useLocale();
    const ar = locale === "ar";
    const params = useParams();
    const username = params?.username;

    const [creator, setCreator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!username) return;
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch(`/api/influencers/${username}`, { cache: "no-store" });
                const result = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(result?.detail || (ar ? "المبدع غير موجود" : "Creator not found"));
                }
                if (!cancelled) setCreator(result.data);
            } catch (err) {
                console.error(err);
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [username, ar]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <LuLoaderCircle className="text-primary text-4xl animate-spin" />
            </div>
        );
    }

    if (error || !creator) {
        return (
            <div className="max-w-xl mx-auto px-4 py-24 text-center">
                <div className="text-6xl mb-4">🙁</div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{ar ? "المبدع غير موجود" : "Creator not found"}</h1>
                <p className="text-gray-500 mb-6">{error || (ar ? "قد يكون الرابط غير صحيح أو أن المبدع غير متاح." : "The link may be incorrect or the creator is unavailable.")}</p>
                <Link href="/creators" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                    {ar ? "تصفح جميع المبدعين" : "Browse all creators"}
                </Link>
            </div>
        );
    }

    const name = [creator.first_name, creator.last_name].filter(Boolean).join(" ") || creator.username;
    console.log(creator);
    console.log(creator.avatar);
    return (
        <div className="w-full">
            <div className="max-w-4xl mx-auto px-4 pb-16">
                {/* Profile header card */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={creator.avatar || "/alaa-avatar.jpg"} alt={name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                                {name}
                                <span className="text-xl text-gray-400 font-normal">@{creator.username}</span>
                            </h1>
                            {creator.headline && <p className="text-primary font-medium mt-1">{creator.headline}</p>}
                            {creator.bio && <p className="text-gray-600 mt-2 max-w-lg">{creator.bio}</p>}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 sm:gap-8 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4">
                        <Stat label={ar ? "متابع" : "Followers"} value={creator.followers_count} icon={FaUsers} />
                        <Stat label={ar ? "محتوى" : "Content"} value={creator.content_count} icon={FaHeart} />
                    </div>
                </div>

                {/* Interests */}
                {creator.interests?.length > 0 && (
                    <div className="mt-6 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        {creator.interests.map((c) => (
                            <span key={c.id} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {ar ? (c.arabic_title || c.english_title) : (c.english_title || c.arabic_title)}
                            </span>
                        ))}
                    </div>
                )}

                {/* Content section */}
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{ar ? "المحتوى" : "Content"}</h2>
                    {creator.contents?.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
                            <p className="text-gray-400">{ar ? "لا يوجد محتوى بعد" : "No content yet"}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {creator.contents.map((content) => (
                                <Link
                                    key={content.id}
                                    href={`/content/${content.id}`}
                                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={content.cover_image} alt={content.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <span className={`absolute top-3 end-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${content.is_free ? "bg-white/90 text-emerald-600" : "bg-black/70 text-white"}`}>
                                            {content.is_free ? (
                                                ar ? "مجاني" : "Free"
                                            ) : (
                                                <>
                                                    <LuLock size={11} />
                                                    {ar ? "مدفوع" : "Paid"}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition">{content.title}</h3>
                                        <div className="mt-auto flex items-center justify-between pt-3">
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <LuCalendar size={12} />
                                                {new Date(content.created_at).toLocaleDateString(ar ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                                            </span>
                                            {content.price > 0 && <span className="text-sm font-semibold text-primary">{content.price.toLocaleString(ar ? "ar-SA" : "en-SA")} SAR</span>}
                                            <LuArrowRight className={`text-gray-300 group-hover:text-primary transition ${ar ? "rotate-180" : ""}`} size={16} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-br from-[#0b0b2b] via-[#102a4c] to-[#0bb2b0] rounded-3xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">{ar ? "مهتم بمحتوى " + name + "؟" : `Interested in ${name}'s content?`}</h3>
                    <p className="text-white/70 mb-6">{ar ? "انضم إلى المنصة لتتابع المبدعين وتتلقى محتواهم الحصري" : "Join the platform to follow creators and get exclusive content"}</p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link href="/register" className="px-6 py-2.5 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition">
                            {ar ? "إنشاء حساب" : "Sign up"}
                        </Link>
                        <Link href="/login" className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/30 font-semibold hover:bg-white/20 transition">
                            {ar ? "تسجيل الدخول" : "Log in"}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, icon: Icon }) {
    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xl font-bold text-gray-900">
                <Icon className="text-primary" size={16} />
                {value ?? 0}
            </div>
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}