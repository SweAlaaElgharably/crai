"use client";
import Image from "next/image";
import Link from "next/link";
import { TiHome } from "react-icons/ti";
import { FiSearch } from "react-icons/fi";
import { MdOutlineLanguage } from "react-icons/md";
import { BsPeopleFill } from "react-icons/bs";
import { IoMdAnalytics } from "react-icons/io";
import { IoFileTrayFull } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import { BiLogOutCircle } from "react-icons/bi";
import { useUserStore } from "@/stores/userStore";

export default function DashboardNavbar() {
    const pathname = usePathname();
    const user = useUserStore((state) => state.user);
    const logoutStore = useUserStore((state) => state.logout);
    const router = useRouter();
    const logout = async () => {
        await fetch("/api/logout", {method: "POST"});
        logoutStore();
        router.push("/");
        router.refresh();
    };
    return (
        <div className="flex flex-col gap-4 w-18 shrink-0 py-8 items-center justify-between h-screen">
            <nav className="flex flex-col gap-2 items-center">
                <Link href="/">
                    <Image src="/icon.png" alt="logo" width={50} height={50} priority/>
                </Link>
                <Link href="/dashboard" className={`h-10 w-10 text-2xl rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === "/dashboard" ? "text-black bg-stone-200" : "text-stone-600 hover:bg-stone-100"}`}>
                    <TiHome />
                </Link>
                <Link href="/explore" className={`h-10 w-10 text-2xl rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === "/explore" ? "text-black bg-stone-200" : "text-stone-600 hover:bg-stone-100"}`}>
                    <FiSearch />
                </Link>
                {user?.user_type === "client" && (
                    <Link href="/feed" className={`h-10 w-10 text-2xl rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === "/feed" ? "text-black bg-stone-200" : "text-stone-600 hover:bg-stone-100"}`}>
                        <MdOutlineLanguage />
                    </Link>
                )}
                {user?.user_type === "influencer" && (
                    <Link href="/subscribers" className={`h-10 w-10 text-2xl rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === "/subscribers" ? "text-black bg-stone-200" : "text-stone-600 hover:bg-stone-100"}`}>
                        <BsPeopleFill />
                    </Link>
                )}
                <Link href={user?.user_type === "influencer" ? "/analytics/influencer" : "/analytics"} className={`h-10 w-10 text-2xl rounded-xl flex items-center justify-center transition-all duration-300 ${pathname.startsWith("/analytics") ? "text-black bg-stone-200" : "text-stone-600 hover:bg-stone-100"}`}>
                    <IoMdAnalytics />
                </Link>
                {user?.user_type === "influencer" && (
                    <Link href="/contents" className={`h-10 w-10 text-2xl rounded-xl flex items-center justify-center transition-all duration-300 ${pathname.startsWith("/contents") ? "text-black bg-stone-200" : "text-stone-600 hover:bg-stone-100"}`}>
                        <IoFileTrayFull />
                    </Link>
                )}
            </nav>
            <nav className="flex flex-col gap-2">
                <Link href="/profile" className="flex items-center justify-center">
                    <img src={user?.avatar || "/alaa-avatar.jpg"} className="w-8 h-8 rounded-full" alt="avatar" />
                </Link>
                <button onClick={() => {logout();}} className={`cursor-pointer h-10 w-10 text-2xl rounded-xl flex items-center justify-center transition-all duration-300 ${pathname === "contents" ? "text-black bg-stone-200" : "text-stone-600 hover:bg-stone-100"}`}>
                    <BiLogOutCircle />
                </button>
            </nav>
        </div>
    );
}