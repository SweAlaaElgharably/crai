"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { FaCircleCheck } from "react-icons/fa6";
import { LuLoaderCircle } from "react-icons/lu";

function SuccessPaymentContent() {
    const locale = useLocale();
    const ar = locale === "ar";
    const searchParams = useSearchParams();
    const free = searchParams.get("free") === "1";

    return (
        <div className="max-w-2xl w-full mx-auto px-4 py-16">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_rgba(11,178,176,0.10)] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-b from-primary/5 to-transparent pt-12 pb-8 flex flex-col items-center text-center gap-4 px-6">
                    <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></span>
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                            <FaCircleCheck className="text-green-500 text-5xl" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        {ar ? "تمت عملية الدفع بنجاح" : "Payment successful"}
                    </h1>

                    <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                        {free
                            ? ar
                                ? "تم فتح المحتوى المجاني وحصصك الجديدة لحسابك مباشرة."
                                : "Your free content has been unlocked and added to your account."
                            : ar
                                ? "شكرًا لثقتك بنا! تم تفعيل وصولك إلى المحتوى، وقد تصلك رسالة تأكيد من بوابة الدفع."
                                : "Thanks for your purchase! Your access is now active, and you may receive a confirmation email from the payment gateway."}
                    </p>
                </div>

                {/* Next steps */}
                <div className="px-6 pb-2">
                    <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                            <span className="h-4 w-1 rounded-full bg-primary"></span>
                            {ar ? "ماذا بعد؟" : "What happens next?"}
                        </h2>
                        <ul className="space-y-2.5 text-sm text-gray-500">
                            <li className="flex items-start gap-2">
                                <FaCircleCheck className="text-primary mt-0.5 shrink-0" size={13} />
                                {ar ? "أصبح المحتوى متاحًا الآن في صفحة لوحة التحكم الخاصة بك." : "Your content is now available in your dashboard."}
                            </li>
                            <li className="flex items-start gap-2">
                                <FaCircleCheck className="text-primary mt-0.5 shrink-0" size={13} />
                                {ar ? "يمكنك الوصول إليه في أي وقت من قائمة \"محتواي\"." : "You can access it anytime from your library."}
                            </li>
                            <li className="flex items-start gap-2">
                                <FaCircleCheck className="text-primary mt-0.5 shrink-0" size={13} />
                                {ar ? "إذا كانت مدة الوصول محدودة، سترى تاريخ الانتهاء داخل الصفحة." : "If your access is time-limited, the expiry date is shown inside the content page."}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/analytics"
                        className="flex-1 py-3 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/20 transition hover:bg-primary/80 text-center"
                    >
                        {ar ? "اذهب إلى التحليلات" : "Go to analytics"}
                    </Link>

                    <Link
                        href="/feed"
                        className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 font-medium transition hover:bg-stone-200 text-center"
                    >
                        {ar ? "متابعة إلى آخر المستجدات" : "Go to the feed"}
                    </Link>
                </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
                {ar ? "لأي استفسار عن الدفع، تواصل معنا عبر صفحة التواصل." : "For any billing questions, reach us via the contact page."}
            </p>
        </div>
    );
}

export default function SuccessPayment() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-32">
                    <LuLoaderCircle className="text-primary text-4xl animate-spin" />
                </div>
            }
        >
            <SuccessPaymentContent />
        </Suspense>
    );
}
