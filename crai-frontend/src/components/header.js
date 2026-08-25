"use client";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { GrLanguage } from "react-icons/gr";
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { useUserStore } from "@/stores/userStore";
import { IoPersonSharp } from "react-icons/io5";
import { HiOutlineLogout } from "react-icons/hi";

export default function Header() {
    const user = useUserStore((state) => state.user);
    const logoutStore = useUserStore((state) => state.logout);
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations("home");
    const [open, setOpen] = useState(false);
    const changeLang = async () => {
        const newLocale = locale === "ar" ? "en" : "ar";
        await fetch("/api/lang", {method: "POST", body: JSON.stringify({ locale: newLocale })});
        router.refresh();
    };
    const logout = async () => {
        await fetch("/api/logout", {method: "POST"});
        logoutStore();
        router.push("/");
        router.refresh();
    };
    console.log(user);    
    return (
        <header className="bg-primary shadow-sm z-10 sticky top-0 w-full">
            <div className="max-w-350 h-24 w-full px-4 mx-auto grid grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center justify-start col-span-1">
                    <Link href="/">
                        <Image src={logo} alt="Logo" width={120} height={60} priority className="w-30 h-15" />
                    </Link>
                </div>
                <nav className="hidden lg:flex justify-center items-center gap-6 font-medium col-span-1">
                    <HeaderLink href="/" text={t("home")} />
                    <HeaderLink href="/about" text={t("about")} />
                    <HeaderLink href="/creators" text={t("creators")} />
                    <HeaderLink href="/explore" text={t("explore")} />
                    <HeaderLink href="/contact" text={t("contact")} />                    
                </nav>
                <nav className="flex justify-end items-center gap-2 col-span-1">
                    <button onClick={() => changeLang()} className='bg-white/10 transition hover:bg-white/20 h-10 w-10 rounded-full cursor-pointer flex justify-center items-center gap-0.5 relative w-6 h-6'>
                        <GrLanguage className="text-white text-[20px]" />
                        {locale === "ar" ? (
                            <p className="absolute font-medium left-0 -bottom-2 text-[10px] font-bold bg-white px-1 rounded text-primary">EN</p>
                        ) : (
                            <p className="absolute font-medium right-0 -bottom-2 text-[10px] font-bold bg-white px-1 rounded text-primary">AR</p>
                        )}
                    </button>
                    {user ? (
                        <div className="flex gap-2">
                            <Link href="/dashboard" className="hidden sm:flex gap-1 items-center justify-center text-[14px] rounded-full border border-white/50 bg-white/5 px-5 py-2.5 font-semibold text-white/90 transition-all duration-300 hover:border-white hover:bg-white/25 hover:text-white">
                                <IoPersonSharp /> 
                                <p>{user.first_name}</p>
                            </Link>
                            <button onClick={() => {logout();}} className="hidden sm:flex bg-white/10 transition hover:bg-white/20 h-10 w-10 rounded-full cursor-pointer flex justify-center items-center gap-0.5 relative w-6 h-6"><HiOutlineLogout className="text-white text-[20px]" /></button>
                        </div>
                    ) : (
                        <>
                            <Link className="hidden md:flex text-[14px] rounded-full border border-white/50 bg-white/5 px-5 py-2.5 font-semibold text-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/25 hover:text-white" href="/login">{t("login")}</Link>
                            <Link className="hidden md:flex text-[14px] rounded-full border border-white/50 bg-white px-5 py-2.5 font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5" href="/register">{t("register")}</Link>
                        </>
                    )}
                    <button onClick={() => setOpen(!open)} className="bg-white/10 transition hover:bg-white/20 h-10 w-10 rounded-full cursor-pointer flex lg:hidden justify-center items-center gap-0.5 relative">
                        {open ? <IoClose className="text-white text-[20px]" /> : <FaBars className="text-white text-[20px]" />}
                    </button>
                </nav>
            </div>
            <MobilNav open={open} setOpen={setOpen} />
        </header>
    );
}

export function HeaderLink({ href, text }) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link className={`text-gray-200 hover:text-white transition-all duration-200 relative ${isActive ? "text-white" : ""}`} href={href}>
            <span>{text}</span>
            {isActive && <span className="pointer-events-none absolute -bottom-6 left-0 right-0 h-1 bg-white"></span>}
        </Link>
    );
}
 
export function MobilNav({open, setOpen}) {
    const locale = useLocale();
    const t = useTranslations("home");
    const user = useUserStore((state) => state.user);
    return(
        open &&
        <div className="lg:hidden w-screen h-[calc(100vh-96px)] overflow-y-auto transition-all duration-300 ease-in-out bg-linear-to-b bg-white from-[#0ABAB5] via-[#0ABAB5] to-[#08a39e] fixed top-24 left-0 z-[9999]">
            <nav className="flex flex-col lg:hidden justify-center items-start gap-4 font-medium p-4">
                <Link className={`hover:text-white transition-all duration-200 relative text-white`} href={'/'} onClick={() => setOpen(false)}>{t("home")}</Link>
                <Link className={`hover:text-white transition-all duration-200 relative text-white`} href={'/about'} onClick={() => setOpen(false)}>{t("about")}</Link>
                <Link className={`hover:text-white transition-all duration-200 relative text-white`} href={'/creators'} onClick={() => setOpen(false)}>{t("creators")}</Link>
                <Link className={`hover:text-white transition-all duration-200 relative text-white`} href={'/explore'} onClick={() => setOpen(false)}>{t("explore")}</Link>
                <Link className={`hover:text-white transition-all duration-200 relative text-white`} href={'/contact'} onClick={() => setOpen(false)}>{t("contact")}</Link>                                           
            </nav>
            {user ? (
                <div className="flex flex-col sm:hidden justify-center items-start gap-4 font-medium px-4">
                    <Link className={`hover:text-white transition-all duration-200 relative text-white flex items-center gap-2`} href={'/dashboard'} onClick={() => setOpen(false)}>{locale == "ar" ? "لوحة التحكم" : "Dashboard"}</Link>
                    <button className={`hover:text-white transition-all duration-200 relative text-white`} onClick={() => {setOpen(false); logout();}}>{locale == "ar" ? "تسجيل الخروج" : "logout"}</button>
                </div>
            ): (
                <nav className="grid grid-cols-2 gap-4 p-4">
                    <Link onClick={() => setOpen(false)} className="flex md:hidden justify-center items-center text-[14px] rounded-full border border-white/50 bg-white/5 px-5 py-2.5 font-semibold text-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/25 hover:text-white" href="/login">{t("login")}</Link>
                    <Link onClick={() => setOpen(false)} className="flex md:hidden justify-center items-center text-[14px] rounded-full border border-white/50 bg-white px-5 py-2.5 font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5" href="/register">{t("register")}</Link>
                </nav>
            )}
        </div>
    );
}

        