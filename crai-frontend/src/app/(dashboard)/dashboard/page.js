"use client";
import { useLocale } from "next-intl";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";

export default function Dashboard() {
    const swiperRef1 = useRef(null);
    const locale = useLocale();
    const [data, setData] = useState([]);
    const user = useUserStore((state) => state.user);
    useEffect(() => {
        const getData = async () => {
            const response = await fetch(`/api/influencer-discovery`, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setData(data.data);
            }
        }
        getData();
    }, []);
    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto px-4 py-8">
            {user?.user_type == "influencer" && <div className="flex items-center justify-center">
                <Link href={`/creators/${user?.username}`} className="text-white font-medium bg-primary px-4 py-2 rounded-lg">{locale == "ar" ? "صفحتي" : "My Page"}</Link>            
            </div>}
            <h1 className="font-semibold text-2xl">{locale == "ar" ? "المؤثرين المميزين" : "Featured Influencers"}</h1>
            {data?.featured?.length > 0 ? 
            <>
                <div className="w-full overflow-hidden">
                    <Swiper spaceBetween={16} slidesPerView={"auto"} onSwiper={(swiper) => (swiperRef1.current = swiper)}>
                        {data.featured.map((creator) => (
                            <SwiperSlide className="!w-[240px]">
                                <Link href={`/creators/${creator.username}`} className="flex flex-col justify-center items-start gap-1 p-2 transition duration-300 hover:bg-gray-50 rounded-lg">
                                    <img src={creator.avatar || "/alaa-avatar.jpg"} alt={creator.username} className="w-full aspect-square rounded-lg"></img>
                                    <p className="font-semibold text-lg">{`${creator.first_name} ${creator.last_name}`}</p>
                                    <p className="text-gray-500 text-sm truncate w-full">{creator.headline}</p>                                    
                                </Link>
                            </SwiperSlide>))
                        }
                    </Swiper>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => swiperRef1.current.slidePrev()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowRight /> : <FaArrowLeft />}
                    </button>
                    <button onClick={() => swiperRef1.current.slideNext()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowLeft /> : <FaArrowRight />}
                    </button>
                </div>
            </>: <div className="flex items-center justify-center p-4"><p>{locale == "ar" ? "لا يوجد بيانات متاحة" : "No Available Data"}</p></div>
            }
            <h1 className="font-semibold text-2xl">{locale == "ar" ? "المؤثرين الرائجين" : "Trending Influencers"}</h1>
            {data?.trending?.length > 0 ? 
            <>
                <div className="w-full overflow-hidden">
                    <Swiper spaceBetween={16} slidesPerView={"auto"} onSwiper={(swiper) => (swiperRef1.current = swiper)}>
                        {data.trending.map((creator) => (
                            <SwiperSlide className="!w-[240px]">
                                <Link href={`/creators/${creator.username}`} className="flex flex-col justify-center items-start gap-1 p-2 transition duration-300 hover:bg-gray-50 rounded-lg">
                                    <img src={creator.avatar || "/alaa-avatar.jpg"} alt={creator.username} className="w-full aspect-square rounded-lg"></img>
                                    <p className="font-semibold text-lg">{`${creator.first_name} ${creator.last_name}`}</p>
                                    <p className="text-gray-500 text-sm truncate w-full">{creator.headline}</p>                                    
                                </Link>
                            </SwiperSlide>))
                        }
                    </Swiper>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => swiperRef1.current.slidePrev()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowRight /> : <FaArrowLeft />}
                    </button>
                    <button onClick={() => swiperRef1.current.slideNext()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowLeft /> : <FaArrowRight />}
                    </button>
                </div>
            </>: <div className="flex items-center justify-center p-4"><p>{locale == "ar" ? "لا يوجد بيانات متاحة" : "No Available Data"}</p></div>
            }
            <h1 className="font-semibold text-2xl">{locale == "ar" ? "أفضل المؤثرين" : "Top Influencers"}</h1>
            {data?.top?.length > 0 ? 
            <>
                <div className="w-full overflow-hidden">
                    <Swiper spaceBetween={16} slidesPerView={"auto"} onSwiper={(swiper) => (swiperRef1.current = swiper)}>
                        {data.top.map((creator) => (
                            <SwiperSlide className="!w-[240px]">
                                <Link href={`/creators/${creator.username}`} className="flex flex-col justify-center items-start gap-1 p-2 transition duration-300 hover:bg-gray-50 rounded-lg">
                                    <img src={creator.avatar || "/alaa-avatar.jpg"} alt={creator.username} className="w-full aspect-square rounded-lg"></img>
                                    <p className="font-semibold text-lg">{`${creator.first_name} ${creator.last_name}`}</p>
                                    <p className="text-gray-500 text-sm truncate w-full">{creator.headline}</p>                                    
                                </Link>
                            </SwiperSlide>))
                        }
                    </Swiper>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => swiperRef1.current.slidePrev()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowRight /> : <FaArrowLeft />}
                    </button>
                    <button onClick={() => swiperRef1.current.slideNext()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowLeft /> : <FaArrowRight />}
                    </button>
                </div>
            </>: <div className="flex items-center justify-center p-4"><p>{locale == "ar" ? "لا يوجد بيانات متاحة" : "No Available Data"}</p></div>
            }
            <h1 className="font-semibold text-2xl">{locale == "ar" ? "المؤثرين الجدد" : "New Influencers"}</h1>
            {data?.new?.length > 0 ? 
            <>
                <div className="w-full overflow-hidden">
                    <Swiper spaceBetween={16} slidesPerView={"auto"} onSwiper={(swiper) => (swiperRef1.current = swiper)}>
                        {data.new.map((creator) => (
                            <SwiperSlide className="!w-[240px]">
                                <Link href={`/creators/${creator.username}`} className="flex flex-col justify-center items-start gap-1 p-2 transition duration-300 hover:bg-gray-50 rounded-lg">
                                    <img src={creator.avatar || "/alaa-avatar.jpg"} alt={creator.username} className="w-full aspect-square rounded-lg"></img>
                                    <p className="font-semibold text-lg">{`${creator.first_name} ${creator.last_name}`}</p>
                                    <p className="text-gray-500 text-sm truncate w-full">{creator.headline}</p>                                    
                                </Link>
                            </SwiperSlide>))
                        }
                    </Swiper>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => swiperRef1.current.slidePrev()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowRight /> : <FaArrowLeft />}
                    </button>
                    <button onClick={() => swiperRef1.current.slideNext()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowLeft /> : <FaArrowRight />}
                    </button>
                </div>
            </>: <div className="flex items-center justify-center p-4"><p>{locale == "ar" ? "لا يوجد بيانات متاحة" : "No Available Data"}</p></div>
            }
            <h1 className="font-semibold text-2xl">{locale == "ar" ? "المؤثرين الموصى بهم" : "Recommended Influencers"}</h1>
            {data?.recommended?.length > 0 ? 
            <>
                <div className="w-full overflow-hidden">
                    <Swiper spaceBetween={16} slidesPerView={"auto"} onSwiper={(swiper) => (swiperRef1.current = swiper)}>
                        {data.recommended.map((creator) => (
                            <SwiperSlide className="!w-[240px]">
                                <Link href={`/creators/${creator.username}`} className="flex flex-col justify-center items-start gap-1 p-2 transition duration-300 hover:bg-gray-50 rounded-lg">
                                    <img src={creator.avatar || "/alaa-avatar.jpg"} alt={creator.username} className="w-full aspect-square rounded-lg"></img>
                                    <p className="font-semibold text-lg">{`${creator.first_name} ${creator.last_name}`}</p>
                                    <p className="text-gray-500 text-sm truncate w-full">{creator.headline}</p>                                    
                                </Link>
                            </SwiperSlide>))
                        }
                    </Swiper>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => swiperRef1.current.slidePrev()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowRight /> : <FaArrowLeft />}
                    </button>
                    <button onClick={() => swiperRef1.current.slideNext()} className="cursor-pointer w-8 h-8 rounded-full bg-stone-200 text-black flex items-center justify-center transition duration-300 hover:bg-white hover:text-primary">
                        {locale == "ar" ? <FaArrowLeft /> : <FaArrowRight />}
                    </button>
                </div>
            </>: <div className="flex items-center justify-center p-4"><p>{locale == "ar" ? "لا يوجد بيانات متاحة" : "No Available Data"}</p></div>
            }
        </div>
    );
}
