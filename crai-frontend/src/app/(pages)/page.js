"use client";
import HeroSection from "@/components/home/heroSection";
import Image from "next/image";
import earth from "@/assets/images/earth.png";
import dollar from "@/assets/images/dollar.png";
import shield from "@/assets/images/shield.png";
import teamwork from "@/assets/images/teamwork.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import logo from "@/assets/images/logo.png";
import alaa from "@/assets/images/alaa-avatar.jpg";
import become from "@/assets/images/become.jpg";
import discover from "@/assets/images/discover.jpg";
import { ImQuotesLeft, ImQuotesRight } from "react-icons/im";
import a from "@/assets/images/a.png";
import b from "@/assets/images/b.png";

export default function Home() {
    const swiperRef1 = useRef(null);
    const swiperRef2 = useRef(null);
    const locale = useLocale();
    const t = useTranslations("home");
    const [categories, setCategories] = useState();
    const [contents, setContents] = useState();
    const [activeTestimonials, setActiveTestimonials] = useState("a")
    const changeTestimonials = (type) => {
        setActiveTestimonials(type);
    }
    useEffect(() => {
        const getCategories = async () => {
            const response = await fetch(`/api/categories`, {method: "GET"});
            if (response.ok) {
                const data = await response.json();
                setCategories(data.data);
            }
        }
        getCategories();
        const getContents = async () => {
            const response = await fetch(`/api/content/contentpreview?show_in_home=true`, {method: "GET"});
            if (response.ok) {
                const data = await response.json();
                setContents(data.data);
            }
        }
        getContents();
    }, []);
    return (
        <>
            <HeroSection />
            <div className="flex flex-col justify-center items-center gap-4 px-4 py-16 max-w-350 h-24 w-full mx-auto">
                <h1 className="text-5xl text-primary font-medium">{locale == "ar" ? "ما هو CRAI؟" : "What is CRAI?"}</h1>
                <p className="text-gray-700 max-w-150 text-center">{t("whocrai")}</p>
            </div>
            <div className="max-w-350 w-full px-4 py-16 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-10 py-12 text-gray-900 transition duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_24px_60px_rgba(10,186,181,0.15)]"> 
                    <div className="w-16 h-16 m-8">
                        <Image src={earth} alt="Earth"></Image>
                    </div>
                    <p className="font-semibold text-lg">{locale == "ar" ? "1. حول العالم" : "1. Worldwide"}</p>
                    <p className="text-sm font-medium text-center">{locale == "ar" ? "للمبدعين في كل مكان، صنع في المملكة العربية السعودية." : "For creators everywhere, made in Saudi Arabia."}</p>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-10 py-12 text-gray-900 transition duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_24px_60px_rgba(10,186,181,0.15)]"> 
                    <div className="w-16 h-16 m-8">
                        <Image src={dollar} alt="Dollar"></Image>
                    </div>
                    <p className="font-semibold text-lg">2. {locale == "ar" ? "الأرباح" : "Earnings"}</p>
                    <p className="text-sm font-medium text-center">{locale == "ar" ? "اربح مباشرة من جمهورك. بدون وسطاء." : "Earn directly from your audience. No middlemen."}</p>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-10 py-12 text-gray-900 transition duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_24px_60px_rgba(10,186,181,0.15)]"> 
                    <div className="w-16 h-16 m-8">
                        <Image src={shield} alt="Shield"></Image>
                    </div>
                    <p className="font-semibold text-lg">3. {locale == "ar" ? "آمن وخاص" : "Secure & Private"}</p>
                    <p className="text-sm font-medium text-center">{locale == "ar" ? "آمن وخاص بنسبة 100%." : "100% secure and private."}</p>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-10 py-12 text-gray-900 transition duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_24px_60px_rgba(10,186,181,0.15)]"> 
                    <div className="w-16 h-16 m-8">
                        <Image src={teamwork} alt="Teamwork"></Image>
                    </div>
                    <p className="font-semibold text-lg">{locale == "ar" ? "4. مجتمع" : "4. Community"}</p>
                    <p className="text-sm font-medium text-center">{locale == "ar" ? "مجتمع مبني على الثقة والإبداع." : "A community built on trust and creativity."}</p>
                </div>
            </div>
            {categories?.length > 0 ? <div id="popular-categories" className="w-full bg-primary">
                <div className="max-w-350 w-full px-4 py-16 mx-auto flex flex-col items-center justify-center gap-4">
                    <h1 className="text-4xl sm:text-5xl text-white font-medium">{locale == "ar" ? "أفضل الأقسام" : "Top Categories"}</h1>
                    <p className="text-white/85 text-center">{locale == "ar" ? "تصفح أقسامنا للعثور على المحتوى الذي تبحث عنه" : "Explore a variety of categories to find the perfect creator content for you."}</p>
                    <div className="w-full overflow-hidden">
                        <Swiper spaceBetween={16} slidesPerView={"auto"} onSwiper={(swiper) => (swiperRef1.current = swiper)}>
                            {categories.map((category) => (
                                <SwiperSlide className="!min-w-50 !max-w-60">
                                    <Link href={`/category/${category.slug}`} className="h-60 border border-white/20 bg-white/10 flex flex-col justify-center items-center gap-6 p-10 text-white transition duration-300 ease-out hover:bg-white hover:text-primary">
                                        <div className="w-16 h-16">
                                            <img src={category.image || earth.src} alt={category.slug} width={64} height={64}></img>
                                        </div>
                                    <p className="font-semibold text-lg">{locale == "en" ? category.english_title : category.arabic_title}</p>
                                </Link>
                            </SwiperSlide>))}
                        </Swiper>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => swiperRef1.current.slidePrev()} className="cursor-pointer w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                            {locale == "ar" ? <FaArrowRight /> : <FaArrowLeft />}
                        </button>
                        <button onClick={() => swiperRef1.current.slideNext()} className="cursor-pointer w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                            {locale == "ar" ? <FaArrowLeft /> : <FaArrowRight />}
                        </button>
                    </  div>
                </div>
            </div> : <></>}
            {contents?.length > 0 ? <div id="popular-contents" className="max-w-350 w-full px-4 py-16 mx-auto flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl sm:text-5xl text-primary font-medium">{locale == "en" ? "Our Most Popular Content" : "المحتوى الأكثر شعبية"}</h1>
                <div className="w-full overflow-hidden">
                    <Swiper spaceBetween={16} slidesPerView={"auto"} onSwiper={(swiper) => (swiperRef2.current = swiper)}>
                        {contents.map((content) => (
                            <SwiperSlide className="!w-70 !my-4">
                                <Link href={`/content/${content.slug}`} className="flex flex-col overflow-hidden rounded-xl border border-[#e6e7f2] bg-white justify-start items-start transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_5px_5px_rgba(32,36,69,0.05)]">
                                    <div className="relative w-full aspect-1/1 overflow-hidden bg-primary">
                                        <img src={content.image || logo.src} alt={content.slug} className="w-full h-full"></img>
                                    </div>
                                    <div className="flex flex-col items-start justify-start px-4 py-2">
                                        <p className="font-semibold text-lg">{locale == "en" ? content.english_title : content.arabic_title}</p>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2 w-full">
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-[30px] h-[30px] rounded-full overflow-hidden">
                                                <img src={content?.owner_avatar || alaa.src} alt="Create By" className="w-full h-full"></img>
                                            </div>
                                            <p>{content?.owner_first_name || "Admin"} {content?.owner_last_name || "Alaa"}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm line-through">{content?.fake_price}</p>
                                            <p className="font-semibold text-lg">{content?.real_price}</p>
                                        </div>
                                    </div>
                            </Link>
                        </SwiperSlide>))}
                    </Swiper>

                </div>
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => swiperRef2.current.slidePrev()} className="cursor-pointer w-8 h-8 rounded-full bg-primary/80 text-white flex items-center justify-center transition duration-300 hover:bg-primary">
                        {locale == "ar" ? <FaArrowRight /> : <FaArrowLeft />}
                    </button>
                    <button onClick={() => swiperRef2.current.slideNext()} className="cursor-pointer w-8 h-8 rounded-full bg-primary/80 text-white flex items-center justify-center transition duration-300 hover:bg-primary">
                        {locale == "ar" ? <FaArrowLeft /> : <FaArrowRight />}
                    </button>
                </div>
            </div> : <></>}
            <div className="bg-gray-100">
                <div className="max-w-350 w-full px-4 py-16 mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4 justify-center">
                        <h1 className="text-3xl sm:text-4xl text-black font-medium">{t("becometitle")}</h1>
                        <p className="text-black/80">{t("becometext")}</p>
                        <Link className='flex items-center justify-center w-fit rounded-xl border-2 border-primary bg-white px-12 py-4 text-lg font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white' href="/register">{locale == "ar" ? "كن مبدعاً" : "Become a Creator"}</Link>
                    </div>
                    <Image src={become} alt="Become" className="w-full md:w-[80%] h-auto rounded-xl"></Image>
                </div>
                <div className="max-w-350 w-full px-4 py-16 mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Image src={discover} alt="Discover" className="w-full md:w-[80%] h-auto rounded-xl"></Image>
                    <div className="flex flex-col gap-4 justify-center">
                        <h1 className="text-3xl sm:text-4xl text-black font-medium">{t("discovertitle")}</h1>
                        <p className="text-black/80">{t("discovertext")}</p>
                        <Link className='flex items-center justify-center w-fit rounded-xl border-2 border-primary bg-white px-12 py-4 text-lg font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white' href="/creators">{locale == "ar" ? "اكتشف المبدعين" : "Discover Creators"}</Link>
                    </div>
                </div>
            </div>
            <div id="testimonials" className="max-w-350 w-full px-4 py-16 mx-auto flex flex-col items-center justify-center gap-4">
                <h1 className="mt-2 text-5xl sm:text-6xl font-bold">{locale == "en" ? "Testimonials" : "آراء صناع المحتوى"}</h1>
                {locale == "en" ? <ImQuotesLeft className="text-4xl text-violet-950 mb-4" /> : <ImQuotesRight className="text-4xl text-violet-950 mb-4" />}
                <div className="flex flex-col gap-1 items-center">
                    { activeTestimonials === "a" ? 
                        <>
                            <p className="text-center text-2xl sm:text-3xl lg:text-4xl font-semibold transition-all duration-500 opacity-100 translate-y-0">{locale == "en" ? "CRAI gave me the confidence to share my art and turn it into a living." : "CRAI أعطتني الثقة لمشاركة فني وتحويله إلى مصدر دخل."}</p>
                            <p className="font-medium">{locale == "en" ? "Mansour" : "منصور"}</p>
                            <p className="text-gray-600 text-sm">{locale == "en" ? "Content Creator, Jeddah" : "صانع محتوى، جدة"}</p>
                        </> 
                        : 
                        <>
                            <p className="text-center text-2xl sm:text-3xl lg:text-4xl font-semibold transition-all duration-500 opacity-100 translate-y-0">{locale == "en" ? "Finally, a platform that understands both creators and fans in our region." : "أخيراً، منصة تفهم المبدعين والمعجبين في منطقتنا."}</p>
                            <p className="font-medium">{locale == "en" ? "Sara" : "سارة"}</p>
                            <p className="text-gray-600 text-sm">{locale == "en" ? "Digital Artist, Riyadh" : "فنانة رقمية، الرياض"}</p>
                        </>
                    }
                </div>
                <div className="flex gap-4">
                    <button onClick={() => changeTestimonials("a")} className={`w-14 h-14 relative rounded-full overflow-hidden cursor-pointer hover:-translate-y-1 transition duration-300 border-3 ${activeTestimonials === "a" ? "scale-110 border-primary" : "border-gray-200"}`}>
                        <Image src={a} alt="a" fill></Image>
                    </button>
                    <button onClick={() => changeTestimonials("b")} className={`w-14 h-14 relative rounded-full overflow-hidden cursor-pointer hover:-translate-y-1 transition duration-300 border-3 ${activeTestimonials === "b" ? "scale-110 border-primary" : "border-gray-200"}`}>
                        <Image src={b} alt="b" fill></Image>
                    </button>
                </div>
            </div>
        </>
    );
}


  