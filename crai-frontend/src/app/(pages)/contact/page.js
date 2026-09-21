'use client';
import { useLocale, useTranslations } from 'next-intl';
import { MdLocationOn, MdEmail } from 'react-icons/md';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { useState } from 'react';

const PROBLEM_TYPES = [
    { value: "support", ar: "الدعم العام", en: "General Support" },
    { value: "privacy", ar: "الخصوصية", en: "Privacy" },
    { value: "partners", ar: "شراكات الأعمال", en: "Business Partnerships" },
    { value: "media", ar: "الاستفسارات الإعلامية", en: "Media Inquiries" },
];

export default function Contact() {
    const locale = useLocale();
    const t = useTranslations('');
    const [activeAccordion, setActiveAccordion] = useState(null);
    const toggleAccordion = (index) => {setActiveAccordion(activeAccordion === index ? null : index);};
    const [form, setForm] = useState({ title: "", message: "", type: "support", name: "", email: "" });
    const [formStatus, setFormStatus] = useState({ submitted: false, ok: false, error: "" });
    const [sending, setSending] = useState(false);
    const updateForm = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
    const submitForm = async (e) => {
        e.preventDefault();
        setSending(true);
        setFormStatus({ submitted: false, ok: false, error: "" });
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const result = await response.json().catch(() => ({}));
            if (response.ok) {
                setFormStatus({ submitted: true, ok: true, error: "" });
                setForm({ title: "", message: "", type: "support", name: "", email: "" });
            } else {
                setFormStatus({ submitted: true, ok: false, error: result?.detail || (locale == "ar" ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, please try again.") });
            }
        } catch {
            setFormStatus({ submitted: true, ok: false, error: locale == "ar" ? "تعذر الاتصال بالخادم" : "Unable to connect to the server." });
        } finally {
            setSending(false);
        }
    };
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
                    <h2 className="text-3xl font-bold text-[#1a0b40] lg:text-4xl">{locale == "ar" ? "بريد إلكتروني للتواصل المباشر" : "Direct Contact Emails"}</h2>
                    <div className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm items-center justify-between">
                        <span className="text-sm font-medium text-[#1a0b40]">{locale == "ar" ? "للإستفسارات العامة" : "For General Questions"}</span>
                        <a href="mailto:support@cr-ai.cloud" className="text-sm font-semibold text-[#0ABAB5] transition hover:text-[#088984] hover:underline">support@cr-ai.cloud</a>
                    </div>
                    <div className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm items-center justify-between">
                        <span className="text-sm font-medium text-[#1a0b40]">{locale == "ar" ? "للمسائل المتعلقة بالخصوصية" : "For Privacy Matters"}</span>
                        <a href="mailto:privacy@cr-ai.cloud" className="text-sm font-semibold text-[#0ABAB5] transition hover:text-[#088984] hover:underline">privacy@cr-ai.cloud</a>
                    </div>
                    <div className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm items-center justify-between">
                        <span className="text-sm font-medium text-[#1a0b40]">{locale == "ar" ? "لشراكات الأعمال" : "For Business Partnerships"}</span>
                        <a href="mailto:partners@cr-ai.cloud" className="text-sm font-semibold text-[#0ABAB5] transition hover:text-[#088984] hover:underline">partners@cr-ai.cloud</a>
                    </div>
                    <div className="flex gap-2 rounded-xl bg-white px-4 py-3 shadow-sm items-center justify-between">
                        <span className="text-sm font-medium text-[#1a0b40]">{locale == "ar" ? "للإستفسارات الإعلامية" : "For Media Inquiries"}</span>
                        <a href="mailto:media@cr-ai.cloud" className="text-sm font-semibold text-[#0ABAB5] transition hover:text-[#088984] hover:underline">media@cr-ai.cloud</a>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                <h2 className="text-3xl font-bold text-[#1a0b40] lg:text-4xl">{locale == "ar" ? "أرسل لنا رسالة" : "Send Us a Message"}</h2>
                <p className="text-gray-600">{locale == "ar" ? "اختر نوع المشكلة وسيتم إرسال رسالتك إلى الفريق المختص." : "Choose the problem type and your message will be sent to the right team."}</p>
                {formStatus.submitted && (
                    <div className={`w-full max-w-150 rounded-xl px-4 py-3 text-white ${formStatus.ok ? "bg-green-700" : "bg-red-700"}`}>
                        {formStatus.ok
                            ? (locale == "ar" ? "تم إرسال رسالتك بنجاح، سنتواصل معك قريباً." : "Your message was sent successfully. We will get back to you soon.")
                            : formStatus.error}
                    </div>
                )}
                <form onSubmit={submitForm} method="POST" className="grid grid-cols-1 gap-4 w-full max-w-150 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="contact_title">{locale == "ar" ? "العنوان" : "Title"}</label>
                        <input type="text" id="contact_title" required value={form.title} onChange={updateForm("title")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="contact_type">{locale == "ar" ? "نوع المشكلة" : "Problem Type"}</label>
                        <select id="contact_type" value={form.type} onChange={updateForm("type")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none bg-white cursor-pointer appearance-none">
                            {PROBLEM_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{locale == "ar" ? type.ar : type.en}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="contact_message">{locale == "ar" ? "وصف المشكلة" : "Description"}</label>
                        <textarea id="contact_message" required rows={6} value={form.message} onChange={updateForm("message")} className="border border-gray-200 rounded-lg px-4 py-2 outline-none resize-y"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="contact_name">{locale == "ar" ? "الاسم (اختياري)" : "Name (optional)"}</label>
                            <input type="text" id="contact_name" value={form.name} onChange={updateForm("name")} autoComplete="name" className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="contact_email">{locale == "ar" ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}</label>
                            <input type="email" id="contact_email" value={form.email} onChange={updateForm("email")} autoComplete="email" className="border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                        </div>
                    </div>
                    <button type="submit" disabled={sending} className="cursor-pointer px-4 py-3 text-sm font-semibold text-white transition bg-primary hover:bg-primary/80 disabled:opacity-50 rounded-lg">
                        {sending
                            ? (locale == "ar" ? "جاري الإرسال..." : "Sending...")
                            : (locale == "ar" ? "إرسال" : "Send")}
                    </button>
                </form>
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
    



