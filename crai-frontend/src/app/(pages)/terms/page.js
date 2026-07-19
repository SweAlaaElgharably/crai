import { getLocale, getTranslations } from "next-intl/server";

export default async function Terms() {
    const locale = await getLocale();
    const t = await getTranslations("terms");
    return(
        <>
            <div className="flex flex-col justify-center items-center gap-4 px-4 py-16 max-w-350 w-full mx-auto">
                <p className="text-2xl font-semibold text-primary">{locale == "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</p>
                <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">{locale == "ar" ? "التزامنا بإرشادات واضحة" : "Our commitment to clear guidelines"}</h1>
                <p className="text-slate-700 max-w-xl text-center">{t("text0")}</p>
                <h2 className="text-2xl font-semibold text-primary w-full text-start">{locale == "ar" ? "قبول الشروط" : "Acceptance of Terms"}</h2>
                <p className="text-slate-700 w-full text-start">{t("text1")}</p>
                <h2 className="text-2xl font-semibold text-primary w-full text-start">{locale == "ar" ? "مسؤوليات المستخدم" : "User Responsibilities"}</h2>
                <p className="text-slate-700 w-full text-start">{t("text2")}</p>
                <h2 className="text-2xl font-semibold text-primary w-full text-start">{locale == "ar" ? "حقوق الملكية الفكرية" : "Intellectual Property Rights"}</h2>
                <p className="text-slate-700 w-full text-start">{t("text3")}</p>
                <h2 className="text-2xl font-semibold text-primary w-full text-start">{locale == "ar" ? "تحديد المسؤولية" : "Limitation of Liability"}</h2>
                <p className="text-slate-700 w-full text-start">{t("text4")}</p>
                <h2 className="text-2xl font-semibold text-primary w-full text-start">{locale == "ar" ? "إنهاء الوصول" : "Termination of Access"}</h2>
                <p className="text-slate-700 w-full text-start">{t("text5")}</p>
                <h2 className="text-2xl font-semibold text-primary w-full text-start">{locale == "ar" ? "معلومات الاتصال" : "Contact Information"}</h2>
                <p className="text-slate-700 w-full text-start">{t("text6")}</p>
            </div>
        </>
    );
}