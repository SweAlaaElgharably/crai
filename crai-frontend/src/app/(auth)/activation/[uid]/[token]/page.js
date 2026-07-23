import { getLocale } from "next-intl/server";
import Link from "next/link";

export default async function Activation({params}) {
    const {uid, token} = await params;
    const locale = await getLocale();
    const response = await fetch(`${process.env.FRONTEND_URL}/api/activate`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({uid, token}),
    });
    const data = await response.json();
    let success = false;
    let error = false;
    let apiErrors = "";
    if (data.status < 300 && data.status >= 200) {success = true; error = false; apiErrors = locale == "ar" ? "تم التفعيل بنجاح." : "Activation completed successfully."}
    else {error = true; apiErrors = locale == "ar" ? "حدث خطأ" : "An error occurred"; success = false}
    return(
        <div className="flex justify-center items-center px-4 py-16">
            <div className="flex flex-col gap-2 w-full max-w-150 rounded-3xl shadow-[0_10px_40px_rgba(13,13,18,0.08)] p-4 border border-gray-200">
                <h1 className="text-[26px] font-bold text-[#0b0b2b]">{locale == "ar" ? "التفعيل" : "Activation"}</h1>
                <p className="text-[14px] text-gray-500">{locale == "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}<Link className="ms-2 font-semibold text-primary hover:text-primary" href="/login">{locale == "ar" ? "تسجيل الدخول" : "Login"}</Link></p>
                {success && <div className="rounded-md bg-green-700 px-4 py-3 text-white">
                    {locale == "ar" ? "تم التفعيل بنجاح." : "Activation completed successfully."}
                </div>}
                {error && <div className="rounded-md bg-red-700 px-4 py-3 text-white">
                    {apiErrors}
                </div>}
                <Link href="/login" className="cursor-pointer text-center px-4 py-3 text-sm font-semibold text-white transition bg-primary hover:bg-primary/80 rounded-lg">{locale == "ar" ? "الذهاب إلى تسجيل الدخول" : "Go to Login"}</Link>
            </div>
        </div>        
    );
}
