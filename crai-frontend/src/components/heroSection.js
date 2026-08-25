'use client';
import Image from 'next/image';
import {useRef} from 'react';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import homehero1 from "@/assets/images/homehero-1.jpg";
import homehero2 from "@/assets/images/homehero-2.jpg";
import homehero3 from "@/assets/images/homehero-3.jpg";
import wave from "@/assets/images/wave.svg";
import alaa from "@/assets/images/alaa-avatar.jpg";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function HeroSection() {
    const t = useTranslations('home');
    const locale = useLocale();
    return(
        <>
            <div className='overflow-hidden text-white bg-linear-to-b bg-white from-[#0ABAB5] via-[#0ABAB5] to-[#08a39e]'>
                <div className='mx-auto max-w-350 w-full px-4 grid grid-cols-1 lg:grid-cols-2 gap-4 py-8'>
                    <div className='flex flex-col justify-start items-start gap-10 py-10'>
                        <p className="flex items-center w-fit rounded-full border border-white/15 bg-white/5 px-6 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white">{t("inspire")}</p>
                        <h1 className='text-6xl font-extrabold'>{t("herotitle")}</h1>
                        <p className='text-lg font-medium text-white/85'>{t("herotext")}</p>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <Link className='flex items-center justify-center rounded-sm border-2 border-transparent bg-white px-12 py-4 text-lg font-semibold text-primary shadow-[0_18px_38px_rgba(10,186,181,0.45)] transition-colors duration-300 hover:border-white hover:bg-transparent hover:text-white' href="/register">{locale == "ar" ? "ابدأ الإبداع" : "Start Creating"}</Link>
                            <Link className='flex items-center justify-center rounded-sm border-2 border-white bg-primary px-12 py-4 text-lg font-semibold text-white shadow-[0_18px_38px_rgba(10,186,181,0.45)] transition-colors duration-300 hover:border-white hover:bg-white hover:text-primary' href="/explore">{locale == "ar" ? "ادعم مبدعًا" : "Support a Creator"}</Link>
                        </div>
                    </div>
                    <HeroImages />
                </div>
            </div>
            <div className='h-50 overflow-hidden'>
                <Image className='w-full rotate-180' src={wave} alt='wave' priority></Image>
            </div>
            
        </>
        
    );
}

export function HeroImages() {
    const locale = useLocale();
    const containerRef = useRef(null);
    const leftX = useMotionValue(0);
    const leftY = useMotionValue(0);
    const rightX = useMotionValue(0);
    const rightY = useMotionValue(0);
    const leftXSmooth = useSpring(leftX, {stiffness: 120, damping: 20});
    const leftYSmooth = useSpring(leftY, {stiffness: 120, damping: 20});
    const rightXSmooth = useSpring(rightX, {stiffness: 120, damping: 20});
    const rightYSmooth = useSpring(rightY, {stiffness: 120, damping: 20});
    const handleMove = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        leftX.set(-x * 80);
        rightX.set(x * 80);
        leftY.set(y * 80);
        rightY.set(-y * 80);
    };
    const reset = () => {
        leftX.set(0);
        leftY.set(0);
        rightX.set(0);
        rightY.set(0);
    };
    return (
        <div id='hero-section' ref={containerRef} onMouseMove={handleMove} onMouseLeave={reset} className="flex justify-center items-center relative h-140">
            <motion.div style={{x: leftXSmooth, y: leftYSmooth}} className="absolute bottom-0 left-6 z-1">
                <div className='w-50 h-50 z-10 absolute p-3 rounded-3xl bg-white/5 bottom-0 left-6 border border-white/10 shadow-[0_24px_70px_rgba(18,12,68,0.35)] transition-transform duration-300 ease-out pointer-events-none'>
                    <Image className='w-full h-ful rounded-3xl' src={homehero3} alt='hero' priority></Image>
                </div>
            </motion.div>
            <div className='w-90 h-auto rounded-3xl bg-white/5 border border-white/10 shadow-[0_24px_70px_rgba(18,12,68,0.35)] transition-transform duration-300 ease-out pointer-events-none'>
                <Image className='w-full h-full rounded-3xl' src={homehero2} alt='hero' priority></Image>
            </div>
            <motion.div style={{x: rightXSmooth, y: rightYSmooth}} className="absolute top-24 right-1 z-1">
                <div className='w-50 h-80 z-10 absolute p-3 rounded-3xl bg-white/5 top-36 right-1 border border-white/10 shadow-[0_24px_70px_rgba(18,12,68,0.35)] transition-transform duration-300 ease-out pointer-events-none'>
                    <Image className='w-full h-full rounded-3xl' src={homehero1} alt='hero' priority></Image>
                </div>
            </motion.div>
            <motion.div style={{x: leftXSmooth, y: leftYSmooth}} className="absolute top-6 left-0 z-1">
                <div className='pointer-events-none absolute left-0 top-6 w-32 rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-white/85 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur transition-transform duration-300 ease-out'>
                    <Image src={alaa} alt="Alaa Elgharably" className='w-10 h-10 mb-3 rounded-full object-cover' priority></Image>
                    <p className="font-semibold text-white">{locale === "ar" ? "علاء الغربلي" : "Alaa Elgharably"}</p>
                    <p className="text-[11px] text-white">{locale === "ar" ? "مهندس برمجيات" : "Software Engineer"}</p>
                    <p className="mt-2 text-[11px] text-yellow-300">★★★★★</p>
                </div>
            </motion.div>
        </div>
    );
}