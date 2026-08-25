"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaUsers, FaHeart } from "react-icons/fa6";

function CreatorCard({ influencer }) {
    const locale = useLocale();
    const ar = locale === "ar";
    const name = [influencer.first_name, influencer.last_name].filter(Boolean).join(" ") || influencer.username;
    return (
        <Link
            href={`/creators/${influencer.username}`}
            className="flex flex-col gap-2 group items-center"
        >
            <div className="relative rounded-2xl overflow-hidden w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={influencer.avatar || "/alaa-avatar.jpg"}
                    alt={name}
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/70 opacity-0 transition duration-300 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 text-white z-10">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                        <FaHeart size={12} />
                        {influencer.followers_count ?? 0} {ar ? "متابع" : "followers"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 border border-white/40 text-sm font-medium">
                        {ar ? "عرض الملف" : "View profile"}
                    </span>
                </div>
            </div>
            <h3 className="text-lg font-medium text-black line-clamp-1 transition duration-300 group-hover:text-primary">{name}</h3>
            {influencer.headline && (
                <p className="text-sm text-black/80 line-clamp-1 transition duration-300 group-hover:text-primary">{influencer.headline}</p>
            )}
        </Link>
    );
}

export default function Creators() {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const locale = useLocale();
    const ar = locale === "ar";

    useEffect(() => {
        let cancelled = false;
        const getInfluencers = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch("/api/influencers", { cache: "no-store" });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(result?.detail || (ar ? "تعذر تحميل المبدعين" : "Failed to load creators"));
                }
                const list = Array.isArray(result?.data) ? result.data : result?.data?.results || [];
                if (!cancelled) setInfluencers(list);
            } catch (err) {
                console.error(err);
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        getInfluencers();
        return () => { cancelled = true; };
    }, [ar]);

    return (
        <div className="flex flex-col gap-4 px-4 py-16 max-w-350 w-full mx-auto">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl sm:text-5xl text-black font-medium">{ar ? "تعرّف على أشهر المبدعين لدينا" : "Check Our Most Popular Creators"}</h1>
                    <p className="text-black/85">{ar ? "اكتشف أبرز المبدعين وتأثيرهم من خلال محتواهم ومجتمعهم" : "Discover top creators making an impact with their content and community"}</p>
                </div>
                <Link className="inline-flex items-center gap-3 rounded-full border border-primary bg-primary px-6 py-3 font-medium text-white shadow-[0_12px_24px_rgba(10,186,181,0.35)] transition hover:bg-white hover:text-primary" href="/register">{ar ? "ابدأ كمبدع" : "Become a creator"}</Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full py-4 animate-pulse">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="flex flex-col items-center gap-3">
                            <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
                            <div className="h-4 w-2/3 bg-gray-200 rounded" />
                            <div className="h-3 w-1/2 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="py-20 text-center text-red-500">{error}</div>
            ) : influencers.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50">
                        <FaUsers className="text-gray-300 text-[30px]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{ar ? "لا يوجد مبدعون بعد" : "No creators yet"}</h3>
                    <p className="text-sm text-gray-400">{ar ? "سيظهر المبدعون هنا بعد انضمامهم إلى المنصة." : "Creators will appear here once they join the platform."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 w-full py-4">
                    {influencers.map((influencer) => (
                        <CreatorCard key={influencer.id} influencer={influencer} />
                    ))}
                </div>
            )}
        </div>
    );
}
