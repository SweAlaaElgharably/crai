"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import about1 from "@/assets/images/about1.png";
import about2 from "@/assets/images/about2.jpg";
import about3 from "@/assets/images/about3.jpg";
import work1 from "@/assets/images/work1.svg";
import work2 from "@/assets/images/work2.svg";
import work3 from "@/assets/images/work3.svg";
import start1 from "@/assets/images/s1.png";
import start2 from "@/assets/images/s2.png";
import start3 from "@/assets/images/s3.png";
import start4 from "@/assets/images/s4.png";
import journey from "@/assets/images/journey.jpg";
import { FaCheck } from "react-icons/fa";
import devices from "@/assets/images/devices.png";
import appstore from "@/assets/images/appstore.svg";
import googleplay from "@/assets/images/googleplay.svg";

export default function About() {
    const t = useTranslations("about");
    const locale = useLocale();
    return(
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-3xl overflow-hidden">
                        <Image src={about1} alt="about" className="w-full h-full"></Image>
                    </div>
                    <div className="flex flex-col gap-4 py-4">
                        <Image src={about2} alt="about" className={`w-[70%] aspect-square rounded-2xl ${locale == "ar" ? "rounded-tl-4xl" : "rounded-tr-4xl"}`}></Image>
                        <Image src={about3} alt="about" className={`w-[80%] aspect-square rounded-2xl ${locale == "ar" ? "rounded-tl-4xl" : "rounded-tr-4xl"}`}></Image>
                    </div>
                </div>
                <div className="flex flex-col gap-4 py-4 justify-center">
                    <p className="text-3xl font-semibold uppercase text-primary">{locale == "ar" ? "رؤيتنا" : "Our Vision"}</p>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950">{locale == "ar" ? "صُنعت في السعودية." : "Made in Saudi Arabia."}<span className="block text-slate-700">{locale == "ar" ? "لتقدّم للعالم." : "Built for the world."}</span></h1>
                    <p className="text-base sm:text-lg text-slate-600">{t("herotext")}</p>
                    <div>
                        <Link href={`/register`} className="inline-flex h-16 items-center justify-center rounded-xl border-2 border-primary bg-transparent px-12 text-primary font-bold hover:bg-primary hover:text-white focus:outline-none focus:ring-2 ring-primary/50 transition-colors duration-200">{locale == "ar" ? " ابدأ رحلتك الأن" : "Start your CRAI journey now"}</Link>
                    </div>
                </div>     
            </div>
            <div className="bg-gray-100">
                <div className="flex flex-col items-center gap-8 px-4 py-16 max-w-350 w-full mx-auto">
                    <h1 className="text-5xl text-black font-medium">{locale == "ar" ? "كيف يعمل؟" : "How it works?"}</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-4 items-center justify-start">
                            <div className="relative w-32 h-32 flex justify-center items-center">
                                <div className="absolute top-0 h-10 w-10 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center shadow-md left-0">01</div>
                                <div className="w-28 h-28 rounded-full bg-primary/10 flex justify-center items-center">
                                    <Image src={work1} alt="work" className="w-11 h-11"></Image>
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-900 max-w-80 text-center">{t("wtitle1")}</h3>
                            <p className="text-slate-600 max-w-80 text-center">{t("wtext1")}</p>
                        </div>
                        <div className="flex flex-col gap-4 items-center justify-start">
                            <div className="relative w-32 h-32 flex justify-center items-center">
                                <div className="absolute top-0 h-10 w-10 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center shadow-md left-0">02</div>
                                <div className="w-28 h-28 rounded-full bg-primary/10 flex justify-center items-center">
                                    <Image src={work2} alt="work" className="w-11 h-11"></Image>
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-900 max-w-80 text-center">{t("wtitle2")}</h3>
                            <p className="text-slate-600 max-w-80 text-center">{t("wtext2")}</p>
                        </div>
                        <div className="flex flex-col gap-4 items-center justify-start">
                            <div className="relative w-32 h-32 flex justify-center items-center">
                                <div className="absolute top-0 h-10 w-10 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center shadow-md left-0">03</div>
                                <div className="w-28 h-28 rounded-full bg-primary/10 flex justify-center items-center">
                                    <Image src={work3} alt="work" className="w-11 h-11"></Image>
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-900 max-w-80 text-center">{t("wtitle3")}</h3>
                            <p className="text-slate-600 max-w-80 text-center">{t("wtext3")}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-primary">
                <div className="flex flex-col items-center gap-8 px-4 py-16 max-w-350 w-full mx-auto">
                    <h1 className="text-3xl sm:text-5xl text-white font-medium">{locale == "ar" ? "ابدأ رحلتك اليوم" : "Start Your Journey Today!"}</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-4 items-center justify-start rounded-2xl bg-white p-8 shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 flex justify-center items-center">
                                <Image src={start1} alt="start" className="w-14 h-14"></Image>
                            </div>
                            <h3 className="font-semibold text-slate-900 max-w-80 text-center">{t("stitle1")}</h3>
                            <p className="text-slate-600 max-w-80 text-center">{t("stext1")}</p>
                        </div>
                        <div className="flex flex-col gap-4 items-center justify-start rounded-2xl bg-white p-8 shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 flex justify-center items-center">
                                <Image src={start2} alt="start" className="w-14 h-14"></Image>
                            </div>
                            <h3 className="font-semibold text-slate-900 max-w-80 text-center">{t("stitle2")}</h3>
                            <p className="text-slate-600 max-w-80 text-center">{t("stext2")}</p>
                        </div>
                        <div className="flex flex-col gap-4 items-center justify-start rounded-2xl bg-white p-8 shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 flex justify-center items-center">
                                <Image src={start3} alt="start" className="w-14 h-14"></Image>
                            </div>
                            <h3 className="font-semibold text-slate-900 max-w-80 text-center">{t("stitle3")} </h3>
                            <p className="text-slate-600 max-w-80 text-center">{t("stext3")}</p>
                        </div>
                        <div className="flex flex-col gap-4 items-center justify-start rounded-2xl bg-white p-8 shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 flex justify-center items-center">
                                <Image src={start4} alt="start" className="w-14 h-14"></Image>
                            </div>
                            <h3 className="font-semibold text-slate-900 max-w-80 text-center">{t("stitle4")}</h3>
                            <p className="text-slate-600 max-w-80 text-center">{t("stext4")}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                <div className="flex flex-col gap-4 py-4 justify-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950"><span className="text-primary">{locale == "ar" ? "ابدأ" : "Start"}</span> {t("jtitle")}</h1>
                    <p className="text-base sm:text-lg text-slate-600">{t("jdes")}</p>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex justify-center items-center">
                            <FaCheck className="text-white" />
                        </div>
                        <p className="text-base sm:text-lg text-slate-600">{t("jtext1")}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex justify-center items-center">
                            <FaCheck className="text-white" />
                        </div>
                        <p className="text-base sm:text-lg text-slate-600">{t("jtext2")}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex justify-center items-center">
                            <FaCheck className="text-white" />
                        </div>
                        <p className="text-base sm:text-lg text-slate-600">{t("jtext3")}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex justify-center items-center">
                            <FaCheck className="text-white" />
                        </div>
                        <p className="text-base sm:text-lg text-slate-600">{t("jtext4")}</p>
                    </div>
                    <div>
                        <Link href={`/register`} className="inline-flex h-16 items-center justify-center rounded-xl hover:border-2 hover:border-primary hover:bg-transparent px-12 hover:text-primary font-bold bg-primary text-white focus:outline-none focus:ring-2 ring-primary/50 transition-colors duration-200">{t("jtext5")}</Link>
                    </div>
                </div> 
                <Image src={journey} alt="journey" className="w-full md:w-[80%] h-auto rounded-xl"></Image>
            </div>
            <div className="bg-primary">
                <div className="flex flex-col items-center gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                    <h1 className="text-3xl sm:text-5xl text-white font-medium">{locale == "ar" ? "ابدأ رحلتك اليوم" : "Start Your Journey Today!"}</h1>
                    <p className="text-white/85 text-center">{locale == "ar" ? "استمع إلى آراء مستخدمينا حول العالم" : "Hear from our users around the world"}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <div className="flex flex-col gap-4 items-start justify-start overflow-hidden rounded-xl bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_5px_5px_rgba(32,36,69,0.05)]">
                            <p className="text-primary">{locale == "ar" ? "عمل رائع" : "Great Work"}</p>
                            <p>"{locale == "ar" ? "لقد وفر لي CRAI مكانًا واحدًا لمشاركة المحتوى الحصري، والتفاعل مع جمهوري، وبناء مجتمع يهتم حقًا." : "CRAI gave me one place to share exclusive content, interact with my audience and build a community that truly cares."}"</p>
                            <span className="w-full h-px bg-gray-200"></span>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-slate-900 max-w-80">{locale == "ar" ?  "نوف الشمري" : "Nouf Alshammari"}</h3>
                                <p className="text-slate-600 max-w-80">{locale == "ar" ?  "صانع محتوى في مجال أسلوب الحياه، الرياض" : "Lifestyle Creator, Riyadh"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 items-start justify-start overflow-hidden rounded-xl bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_5px_5px_rgba(32,36,69,0.05)]">
                            <p className="text-primary">{locale == "ar" ? "عمل رائع" : "Great Work"}</p>
                            <p>"{locale == "ar" ? "لم يستغرق إطلاق صفحة العضوية الخاصة بي سوى دقائق، وبدأت أتلقى الدعم من جمهوري على الفور تقريبًا." : "Launching my membership page took minutes, and I started receiving support from my audience almost immediately."}"</p>
                            <span className="w-full h-px bg-gray-200"></span>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-slate-900 max-w-80">{locale == "ar" ?  "عبدالله العتيبي" : "Abdullah Alotaibi"}</h3>
                                <p className="text-slate-600 max-w-80">{locale == "ar" ?  "صانع محتوى في مجال الألعاب، الرياض" : "Gaming Creator, Riyadh"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 items-start justify-start overflow-hidden rounded-xl bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_5px_5px_rgba(32,36,69,0.05)]">
                            <p className="text-primary">{locale == "ar" ? "عمل رائع" : "Great Work"}</p>
                            <p>"{locale == "ar" ? "شعور المجتمع في CRAI مختلف. لم يعد جمهوري مجرد متابعين، بل أصبحوا جزءًا من رحلتي الإبداعية." : "The community on CRAI feels different. My supporters aren't just followers anymore—they're part of my creative journey."}</p>
                            <span className="w-full h-px bg-gray-200"></span>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-slate-900 max-w-80">{locale == "ar" ?  "ريم المطيري" : "Reem Almutairi"}</h3>
                                <p className="text-slate-600 max-w-80">{locale == "ar" ?  "مصوره فوتوغرافية، الخبر" : "Photographer, Al Khobar"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-350 w-full px-4 py-16 mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <Image src={devices} alt="Devices" className="w-full h-auto rounded-xl"></Image>
                <div className="flex flex-col gap-4 justify-center">
                    <h1 className="text-3xl sm:text-4xl text-black font-medium">{locale == "ar" ? "مجتمك دائماً معك" : "Your Community, Always With You"}</h1>
                    <p className="text-black/80">{locale == "ar" ? "اكتشف المبدعين، ادعم أعمالهم، ولا تفوّت أبدًا آخر المستجدات من المجتمعات التي تحبها." : "Discover creators, support their work, and never miss exclusive updates from the communities you love."}</p>
                    <div className="flex gap-2">
                        <Link href="#">
                            <Image src={appstore} alt="appstore" className="w-44 h-14"></Image>
                        </Link>
                        <Link href="#">
                            <Image src={googleplay} alt="googleplay" className="w-44 h-14"></Image>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}