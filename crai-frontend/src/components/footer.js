import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import logo from "@/assets/images/logo.png";
import facebook from "@/assets/images/facebook.svg";
import x from "@/assets/images/x.svg";
import instagram from "@/assets/images/instagram.svg";
import linkedin from "@/assets/images/linkedin.svg";
import Link from "next/link";

export default function Footer() {
    const locale = useLocale();
    const t = useTranslations("");
    return(
        <footer className="bg-primary text-white">
            <div className="max-w-350 w-full px-4 py-16 mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="flex items-center justify-center">
                    <Image src={logo} alt="CRAI" className="w-full h-auto"></Image>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                    <p>{locale == "ar" ? "أول منصة سعودية تمكّن صنّاع المحتوى من مشاركة محتوى حصري والتواصل مع معجبيهم وبناء مجتمعات حول الشغف والإبداع." : "The first Saudi platform that empowers creators to share exclusive content, connect with their fans, and build communities around passion and creativity."}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-bold">{locale == "ar" ? "الصفحة الرئيسية": "Home"}</p>
                    <div className="flex flex-col gap-1">
                        <Link href="#hero-section">{locale == "ar" ? "قسم البطل": "Hero Section"}</Link>
                        <Link href="#popular-categories">{locale == "ar" ? "المبدعين المشهورين": "Popular Categories"}</Link>
                        <Link href="#popular-content">{locale == "ar" ? "المحتوى الرائج": "Popular Content"}</Link>
                        <Link href="#testimonials">{locale == "ar" ? "آراء العملاء": "Testimonials"}</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-bold">{locale == "ar" ? "الصفحات": "Pages"}</p>
                    <div className="flex flex-col gap-1">
                        <Link href="/about">{locale == "ar" ? "من نحن": "About Us"}</Link>
                        <Link href="/creators">{locale == "ar" ? "المبدعين": "Creators"}</Link>
                        <Link href="/explore">{locale == "ar" ? "استكشف": "Explore"}</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-bold">{locale == "ar" ? "الخصوصية": "Privacy"}</p>
                    <div className="flex flex-col gap-1">
                        <Link href="/policy">{locale == "ar" ? "سياسة الخصوصية": "Privacy Policy"}</Link>
                        <Link href="/terms">{locale == "ar" ? "شروط الاستخدام": "Terms of Use"}</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-bold">{locale == "ar" ? "الدعم": "Support"}</p>
                    <div className="flex flex-col gap-1">
                        <Link href="/contact">{locale == "ar" ? "اتصل بنا": "Contact Us"}</Link>
                        <Link href="/contact#faq">{locale == "ar" ? "الأسئلة الشائعة": "FAQ"}</Link>
                    </div>
                </div>
                <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                    <p>{locale == "ar" ? "تابعونا على منصات التواصل الاجتماعي": "Follow us on social media"}</p>
                    <div className="flex gap-2">
                        <Link href=""><Image src={facebook} alt="facebook" className="w-8 h-8"></Image></Link>
                        <Link href=""><Image src={x} alt="x" className="w-8 h-8"></Image></Link>
                        <Link href=""><Image src={instagram} alt="instagram" className="w-8 h-8"></Image></Link>
                        <Link href=""><Image src={linkedin} alt="linkedin" className="w-8 h-8"></Image></Link>
                    </div>
                </div>
            </div>
            <div className="max-w-350 w-full px-4 pb-8 mx-auto text-center">
                <p>{locale == "ar" ? "© 2026 CRAI. جميع الحقوق محفوظة. صنع في المملكة العربية السعودية": "© 2026 CRAI. All rights reserved. Made in Saudi Arabia"}</p>
            </div>
        </footer>
    );
}


            
            // <p>{locale == "ar" ? "جميع الحقوق محفوظة": "All rights reserved"}</p>
