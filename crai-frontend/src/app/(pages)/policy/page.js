import { getTranslations, getLocale } from "next-intl/server";

export default async function Policy() {
    const locale = await getLocale();
    const t = await getTranslations("policy");
    return(
        <>
            <div className="flex flex-col justify-center items-start gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                <h1 className="text-xl font-semibold text-primary">{locale == "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
                <p className="text-lg font-semibold text-slate-900">{locale == "ar" ? "أخر تحديث: 2 يوليو 2026" : "Last Updated: July 2, 2026"}</p>
                <p>{t("text0")}</p>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "المعلومات التي نجمعها" : "Information We Collect"}</h2>
                <div className="flex flex-col">
                    <p>{t("text1")}</p>
                    <p>{t("text2")}</p>  
                    <p>{t("text3")}</p>  
                    <p>{t("text4")}</p>  
                    <p>{t("text5")}</p>  
                    <p>{t("text6")}</p>  
                    <p>{t("text7")}</p>  
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "كيف نستخدم معلوماتك" : "How We Use Your Information"}</h2> 
                <div className="flex flex-col">
                    <p>{t("text8")}</p>
                    <p>{t("text9")}</p> 
                    <p>{t("text10")}</p> 
                    <p>{t("text11")}</p> 
                    <p>{t("text12")}</p> 
                    <p>{t("text13")}</p>
                    <p>{t("text14")}</p>
                    <p>{t("text15")}</p>
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "مشاركة معلوماتك" : "Sharing Your Information"} </h2>
                <div className="flex flex-col">
                    <p>{t("text16")}</p>
                    <p>{t("text17")}</p>
                    <p>{t("text18")}</p>
                    <p>{t("text19")}</p>
                    <p>{t("text20")}</p>
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "ملفات تعريف الارتباط (Cookies)" : "Cookies"} </h2>
                <div className="flex flex-col">
                    <p>{t("text21")}</p>
                    <p>{t("text22")}</p>
                    <p>{t("text23")}</p>
                    <p>{t("text24")}</p>
                    <p>{t("text25")}</p>
                    <p>{t("text26")}</p>
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "أمان البيانات" : "Data Security"} </h2>
                <div className="flex flex-col">
                    <p>{t("text27")}</p>
                    <p>{t("text28")}</p>
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "الاحتفاظ بالبيانات" : "Data Retention"} </h2>
                <div className="flex flex-col">
                    <p>{t("text29")}</p>
                    <p>{t("text30")}</p>
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "حقوقك" : "Your Rights"} </h2>
                <div className="flex flex-col">
                    <p>{t("text31")}</p>
                    <p>{t("text32")}</p>
                    <p>{t("text33")}</p>
                    <p>{t("text34")}</p>
                    <p>{t("text35")}</p>
                    <p>{t("text36")}</p>
                    <p>{t("text37")}</p>
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "نقل البيانات الدولي" : "International Data Transfers"} </h2>
                <div className="flex flex-col">
                    <p>{t("text38")}</p>
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "التعديلات على سياسة الخصوصية" : "Changes to This Privacy Policy"} </h2>
                <div className="flex flex-col">
                    <p>{t("text39")}</p>
                </div>
                <h2 className="font-semibold text-primary">{locale == "ar" ? "تواصل معنا" : "Contact Us"} </h2>
                <div className="flex flex-col">
                    <p>{t("text40")}</p>
                </div>
            </div>
        </>
    );
}

