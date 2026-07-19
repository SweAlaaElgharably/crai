"use client";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import alaa from "@/assets/images/alaa-avatar.jpg";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Creators() {
    const [influencers, setInfluencers] = useState([]);
    const locale = useLocale();

    useEffect(() => {
        const getInfluencers = async () => {
            const response = await fetch(`/api/influencer/influencerpreview/`);
            if (response.ok) {
                const data = await response.json();
                setInfluencers(data.data);
            } 
        };
        getInfluencers();
    }, []);
    return(
        <>
            <div className="flex flex-col gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-3xl sm:text-5xl text-black font-medium">{locale == "ar" ? "تعرّف على أشهر المبدعين لدينا" : "Check Our Most Popular Creators"}</h1>
                        <p className="text-black/85">{locale == "ar" ? "اكتشف أبرز المبدعين وتأثيرهم من خلال محتواهم ومجتمعهم" : "Discover top creators making an impact with their content and community"}</p>
                    </div>
                    <Link className="inline-flex items-center gap-3 rounded-full border border-primary bg-primary px-6 py-3 font-medium text-white shadow-[0_12px_24px_rgba(10,186,181,0.35)] transition hover:border-primary hover:bg-white hover:text-primary" href="register">{locale == "ar" ? "ابدأ كمبدع" : "Become a creator"}</Link>
                </div>
                {influencers?.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full py-4">
                    {influencers.map((influencer) => (<div key={influencer.id} className="flex flex-col gap-2 group items-center">
                        <div className="relative rounded-2xl overflow-hidden">
                            <img src={influencer.avatar} alt="creator image" className="w-full aspect-square transition-transform duration-300 group-hover:scale-105"></img>
                            <div className="pointer-events-none absolute inset-0 bg-[#0ABAB5cc] opacity-0 transition duration-300 group-hover:opacity-100 z-10"></div>
                        </div>
                        <h3 className="text-lg font-medium text-black transition duration-300 group-hover:text-primary">{influencer.first_name + " " + influencer.last_name}</h3>
                        <p className="text-sm text-black/80 transition duration-300 group-hover:text-primary">{influencer.headline}</p>
                    </div>))}
                </div> : <></>}
            </div>
        </>
    );
}