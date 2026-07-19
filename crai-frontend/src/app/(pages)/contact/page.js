'use client';
import { useLocale, useTranslations } from 'next-intl';
import { MdLocationOn, MdEmail } from 'react-icons/md';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { useState } from 'react';

export default function Contact() {
    const locale = useLocale();
    const t = useTranslations('');
    const [activeAccordion, setActiveAccordion] = useState(null);
    const toggleAccordion = (index) => {setActiveAccordion(activeAccordion === index ? null : index);};
    return(
        <>
            <div className="h-[400px] w-full">
                <iframe src="https://www.google.com/maps?q=Riyadh%2C+Saudi+Arabia&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe> 
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                <div className='flex flex-col gap-4'>
                    <h2 className="text-3xl font-bold text-[#1a0b40] lg:text-4xl">{locale == "ar" ? "ابقَ على تواصل معنا" : "Keep In Touch With Us"}</h2>
                    <p className="text-gray-600">{locale == "ar" ? "نحن هنا لمساعدتك والإجابة على جميع أسئلتك المتعلقة بخدماتنا." : "We are here to help you and answer all your questions regarding our services."}</p>    
                    <div className="flex justify-start items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <MdLocationOn className="text-2xl text-primary" />
                        </div>
                        <p className="text-gray-700">{locale == "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</p>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <h2 className="text-3xl font-bold text-[#1a0b40] lg:text-4xl">{locale == "ar" ? "بريد إلكتروني للتواصل المباشر" : "Direct contact emails"}</h2>
                    <div className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm items-center justify-between">
                        <span className="text-sm font-medium text-[#1a0b40]">{locale == "ar" ? "للإستفسارات العامة" : "For general questions"}</span>
                        <a href="mailto:support@cr-ai.cloud" className="text-sm font-semibold text-[#0ABAB5] transition hover:text-[#088984] hover:underline">support@cr-ai.cloud</a>
                    </div>
                    <div className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm items-center justify-between">
                        <span className="text-sm font-medium text-[#1a0b40]">{locale == "ar" ? "للمسائل المتعلقة بالخصوصية" : "For privacy matters"}</span>
                        <a href="mailto:privacy@cr-ai.cloud" className="text-sm font-semibold text-[#0ABAB5] transition hover:text-[#088984] hover:underline">privacy@cr-ai.cloud</a>
                    </div>
                    <div className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm items-center justify-between">
                        <span className="text-sm font-medium text-[#1a0b40]">{locale == "ar" ? "لشراكات الأعمال" : "For business partnerships"}</span>
                        <a href="mailto:partners@cr-ai.cloud" className="text-sm font-semibold text-[#0ABAB5] transition hover:text-[#088984] hover:underline">partners@cr-ai.cloud</a>
                    </div>
                    <div className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm items-center justify-between">
                        <span className="text-sm font-medium text-[#1a0b40]">{locale == "ar" ? "للإستفسارات الإعلامية" : "For media inquiries"}</span>
                        <a href="mailto:media@cr-ai.cloud" className="text-sm font-semibold text-[#0ABAB5] transition hover:text-[#088984] hover:underline">media@cr-ai.cloud</a>
                    </div>
                </div>
            </div>
            <div id="faq" className="flex flex-col items-center gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                <h2 className="text-3xl font-bold text-[#1a0b40] lg:text-4xl">{locale == "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</h2>
                <p className="text-gray-600">{locale == "ar" ? "هل لديك أسئلة؟ نحن هنا للمساعدة" : "Still have questions? We're here to help"}</p>                
                {t.raw('faqs').map((faq, index) => (
                    <div key={index} className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-all w-full max-w-200">
                        <button onClick={() => toggleAccordion(index)} className="flex w-full items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-gray-50">
                            <span className="flex-1 font-semibold text-[#1a0b40] text-start">{faq.question}</span>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform">
                                {activeAccordion === index ? (<FiMinus className="text-sm" />) : (<FiPlus className="text-sm" />)}
                            </span>
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${activeAccordion === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className='overflow-hidden'>
                                <p className={`border-t border-gray-100 px-6 py-5 text-[15px] text-gray-600 text-start`}>{faq.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

{/* <div className="flex justify-start items-center gap-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <MdEmail className="text-2xl text-primary" />
    </div>
    <p className="text-gray-700">{locale == "ar" ? "بريد إلكتروني للتواصل المباشر" : "Direct contact emails"}</p>
</div>
 */}
    



