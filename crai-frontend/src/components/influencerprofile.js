"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";

export default function InfluencerProfile({ username }) {
    const locale = useLocale();
    const user = useUserStore((state) => state.user);
    const [influencer, setInfluencer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        const getInfluencer = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(`/api/influencers/${username}`, {credentials: "include", cache: "no-store"});
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result?.detail || (locale === "ar" ? "حدث خطأ أثناء تحميل البيانات" : "Failed to load influencer"));
                }
                setInfluencer(result.data);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        getInfluencer();
    }, [username, locale]);

    const handleFollow = async () => {
        if (!influencer || followLoading) return;
        try {
            setFollowLoading(true);
            const method = influencer.is_following ? "DELETE" : "POST";
            const response = await fetch(`/api/influencers/${username}/follow`, {method, credentials: "include"});
            const text = await response.text();
            const result = text ? JSON.parse(text) : null;
            if (!response.ok) {
                throw new Error(result?.detail || (locale === "ar" ? "حدث خطأ" : "Something went wrong"));
            }
            const isFollowing = result.following;
            setInfluencer((current) => ({
                ...current,
                is_following: isFollowing,
                followers_count: isFollowing
                    ? current.followers_count + 1
                    : Math.max(0, current.followers_count - 1),
            }));
        } catch (error) {console.error(error);} 
        finally {setFollowLoading(false);}
    };
    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-10">
                <div className="border border-gray-200 rounded-2xl p-6 animate-pulse">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-gray-100" />
                        <div className="h-6 bg-gray-100 rounded w-40 mt-5" />
                        <div className="h-4 bg-gray-100 rounded w-28 mt-3" />
                        <div className="h-10 bg-gray-100 rounded-lg w-32 mt-5" />
                    </div>
                    <div className="flex justify-center gap-12 mt-8">
                        <div className="h-10 bg-gray-100 rounded w-16" />
                        <div className="h-10 bg-gray-100 rounded w-16" />
                        <div className="h-10 bg-gray-100 rounded w-16" />
                    </div>
                </div>
            </div>
        );
    }
    if (error || !influencer) {
        return (
            <div className="flex justify-center py-20">
                <p className="text-red-500">
                    {error || (locale === "ar" ? "المؤثر غير موجود" : "Influencer not found")}
                </p>
            </div>
        );
    }
    console.log(influencer);
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col justify-center items-center gap-2">
                <img src={influencer.avatar || "/alaa-avatar.jpg"} alt={influencer.username} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"/>
                <h1 className="text-2xl font-medium">{influencer.first_name}{" "}{influencer.last_name}</h1>
                {influencer?.headline && (<p className="text-gray-700 max-w-xl">{influencer.headline}</p>)}
                {influencer?.bio && (<p className="text-gray-700 max-w-xl text-center">{influencer.bio}</p>)}
                {user && user.user_type !== "influencer" && (
                    <div className="flex items-center justify-center">
                        <button type="button" onClick={handleFollow} disabled={followLoading} className={`flex items-center justify-center gap-2 min-w-32 px-5 py-2.5 rounded-lg font-medium transition disabled:opacity-50 ${influencer.is_following ? `bg-gray-100 text-gray-700 hover:bg-gray-200` : `bg-primary text-white hover:bg-primary/80`}`}>
                            {influencer.is_following ? (
                                <>
                                    <FaUserCheck className="w-4 h-4" />
                                    {locale === "ar" ? "ألغاء المتابعة" : "Unfollow"}
                                </>
                            ) : (
                                <>
                                    <FaUserPlus className="w-4 h-4" />
                                    {locale === "ar" ? "متابعة" : "Follow"}
                                </>
                            )}
                        </button>
                    </div>
                )}
                <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-medium">{influencer.followers_count}</span>
                        <span className="text-gray-500 text-sm">{locale === "ar" ? "متابع" : "Followers"}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-medium">{influencer.following_count}</span>
                        <span className="text-gray-500 text-sm">{locale === "ar" ? "يتابعهم" : "Following"}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-medium">{influencer.content_count}</span>
                        <span className="text-gray-500 text-sm">{locale === "ar" ? "محتوى" : "Content"}</span>
                    </div>
                </div>
                <h2 className="text-2xl font-medium py-4">{locale === "ar" ? "المحتوى" : "Content"}</h2>
                {influencer.contents.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">
                            {locale === "ar" ? "لا يوجد محتوى" : "No content"}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4">
                        {influencer.contents.map((content) => (
                            <Link key={content.id} href={`/content/${content.id}`} className="w-full max-w-150 flex flex-col rounded-lg transition hover:bg-gray-50 border border-gray-200">
                                <img src={content.cover_image} alt={content.title} className="w-full aspect-video rounded-lg object-cover"/>
                                <h2 className="font-medium text-lg px-4 w-full truncate">{content.title}</h2>
                                <div className="flex items-center justify-between px-4 py-2">
                                    <p className="text-gray-400 text-sm">
                                        {new Date(content.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                                    </p>
                                    <span className="text-sm">
                                        {content.is_free? locale === "ar" ? "مجاني" : "Free" : locale === "ar" ? "مدفوع" : "Paid"}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

{/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {influencer.contents.map((content) => (
        <div key={content.id} className="group">
            <div className="aspect-video rounded-lg overflow-hidden relative">
                <img src={content.thumbnail} alt={content.cover_image} className="w-full h-full object-cover"/>
            </div>
            <h4 className="font-medium mt-2">{content.title}</h4>
        </div>
    ))}
</div> */}