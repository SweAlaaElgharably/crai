"use client";
import { CiCreditCard1 } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { Suspense, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { LuLoaderCircle } from "react-icons/lu";

// method = creditcard || mada || applepay || samsungpay || stcpay
// phone
// content = <single id>

function CheckoutContent() {
    const [payment, setPayment] = useState("creditcard");
    const [content, setContent] = useState(null);
    const [contentError, setContentError] = useState("");
    const [loadingContent, setLoadingContent] = useState(true);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpStage, setOtpStage] = useState(false);
    const [chargeId, setChargeId] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const locale = useLocale();
    const ar = locale === "ar";
    const t = useTranslations("home");
    const router = useRouter();
    const searchParams = useSearchParams();
    const contentId = searchParams.get("id");

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoadingContent(true);
                setContentError("");
                if (!contentId || !/^\d+$/.test(contentId)) {
                    throw new Error(ar ? "لم يتم تحديد المحتوى" : "No content selected");
                }
                const response = await fetch(`/api/contents/${contentId}`, { credentials: "include", cache: "no-store" });
                if (response.status === 401) {
                    router.replace("/login");
                    return;
                }
                const result = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(result?.detail || (ar ? "تعذر تحميل المحتوى" : "Failed to load content"));
                }
                if (!cancelled) setContent(result);
            } catch (err) {
                console.error(err);
                if (!cancelled) setContentError(err.message);
            } finally {
                if (!cancelled) setLoadingContent(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [contentId, ar, router]);

    const completePayment = (url) => {
        if (!url) {
            throw new Error(ar ? "لم يتم استلام رابط الدفع" : "No payment URL received");
        }
        const opened = window.open(url, "_blank");
        if (!opened) { window.location.href = url; }
    };

    const handleVerifyOtp = async () => {
        if (processing) return;
        try {
            setError("");
            if (!/^\d{4,8}$/.test(otp)) {
                throw new Error(ar ? "أدخل رمز التحقق المرسل إلى جوالك" : "Enter the OTP sent to your phone");
            }
            setProcessing(true);
            const response = await fetch("/api/updatecharge", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id: chargeId, otp }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(
                    (result?.data?.ok === false && typeof result.data.error === "string" && result.data.error) ||
                    (ar ? "رمز التحقق غير صحيح" : "Invalid OTP code")
                );
            }
            setOtpStage(false);
            setChargeId(null);
            completePayment(result?.data?.transaction?.url);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckout = async () => {
        if (processing) return;
        try {
            setError("");
            if (!content) return;
            if (payment === "stcpay") {
                if (!/^\d{8,12}$/.test(phone)) {
                    throw new Error(ar ? "أدخل رقم هاتف صحيح" : "Enter a valid phone number");
                }
                if (otpStage) {
                    await handleVerifyOtp();
                    return;
                }
            }
            setProcessing(true);
            const payload = {
                method: payment,
                content: content.id,
            };
            if (payment === "stcpay") { payload.phone = phone; }
            const response = await fetch("/api/createcharge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const result = await response.json().catch(() => ({}));
            const data = result?.data;
            if (!response.ok) {
                throw new Error(
                    (typeof data?.error === "string" ? data.error : null) ||
                    data?.detail ||
                    (ar ? "فشل إنشاء عملية الدفع" : "Failed to create the charge")
                );
            }
            // Free content is unlocked instantly without any charge.
            if (!data?.url && !data?.id) {
                window.location.href = "/successpayment?free=1";
                return;
            }
            if (payment === "stcpay") {
                // Tap sends an OTP to the customer's phone; the charge is completed after verifying it.
                if (!data?.id) {
                    throw new Error(ar ? "تعذر بدء عملية الدفع" : "Could not start the payment");
                }
                setChargeId(data.id);
                setOtp("");
                setOtpStage(true);
                return;
            }
            completePayment(data?.url);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };
    const selectPayment = (method) => {
        setPayment(method);
        setOtpStage(false);
        setChargeId(null);
        setOtp("");
    };

    if (loadingContent) {
        return (
            <div className="max-w-125 w-full mx-auto px-4 py-16 animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded-xl" />
                <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center gap-5 py-24 px-4 text-center">
                <p className="text-red-500">{contentError || (ar ? "المحتوى غير موجود" : "Content not found")}</p>
                <a href="/explore" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/80">
                    {t("exploreButton")}
                </a>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-350 w-full px-4 py-16 mx-auto flex flex-col items-center justify-center gap-4">
                <div className="flex flex-col gap-1 items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                        <CiCreditCard1 className="text-white text-[36px]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{locale == "ar"? "إتمام الدفع" : "Secure Checkout"}</h1>
                    <p className="text-sm text-gray-500">{locale == "ar" ? "أكمل الدفع للوصول إلى محتواك" : "Complete your payment to access your content"}</p>
                </div>
                <div className="flex flex-col border border-gray-200 rounded-lg p-6 shadow max-w-125 w-full">
                    <div className="mb-5 flex items-center gap-2">
                        <span className="h-4 w-0.5 rounded-full bg-primary"></span>
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{locale == "ar" ? "طريقة الدفع" : "Payment Method"}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <button onClick={() => { selectPayment("creditcard"); }} className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-4 text-center transition-all duration-150 cursor-pointer ${payment == "creditcard" ? "border-primary bg-primary/5" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/60"}`}>
                            <div className="w-12 h-12 flex justify-center items-center">
                                <img src="/credit-card.jpg" alt="credit card" className="w-full h-auto" />
                            </div>
                            <p className={`text-xs font-semibold ${payment == "creditcard" ? "text-primary" : "text-gray-500"}`}>Credit Card</p>
                            {payment == "creditcard" && <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-white">
                                <FaCheck className="text-white text-[8px]" />
                            </span>}
                        </button>
                        <button onClick={() => { selectPayment("mada"); }} className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-4 text-center transition-all duration-150 cursor-pointer ${payment == "mada" ? "border-primary bg-primary/5" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/60"}`}>
                            <div className="w-12 h-12 flex justify-center items-center">
                                <img src="/mada-pay.jpg" alt="mada" className="w-full h-auto" />
                            </div>
                            <p className={`text-xs font-semibold ${payment == "mada" ? "text-primary" : "text-gray-500"}`}>Mada</p>
                            {payment == "mada" && <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-white">
                                <FaCheck className="text-white text-[8px]" />
                            </span>}
                        </button>
                        <button onClick={() => { selectPayment("applepay"); }} className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-4 text-center transition-all duration-150 cursor-pointer ${payment == "applepay" ? "border-primary bg-primary/5" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/60"}`}>
                            <div className="w-12 h-12 flex justify-center items-center">
                                <img src="/apple-pay.png" alt="apple pay" className="w-full h-auto" />
                            </div>
                            <p className={`text-xs font-semibold ${payment == "applepay" ? "text-primary" : "text-gray-500"}`}>Apple Pay</p>
                            {payment == "applepay" && <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-white">
                                <FaCheck className="text-white text-[8px]" />
                            </span>}
                        </button>
                        <button onClick={() => { selectPayment("samsungpay"); }} className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-4 text-center transition-all duration-150 cursor-pointer ${payment == "samsungpay" ? "border-primary bg-primary/5" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/60"}`}>
                            <div className="w-12 h-12 flex justify-center items-center">
                                <img src="/samsung-pay.webp" alt="samsung pay" className="w-full h-auto" />
                            </div>
                            <p className={`text-xs font-semibold ${payment == "samsungpay" ? "text-primary" : "text-gray-500"}`}>Samsung Pay</p>
                            {payment == "samsungpay" && <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-white">
                                <FaCheck className="text-white text-[8px]" />
                            </span>}
                        </button>
                        <button onClick={() => { selectPayment("stcpay"); }} className={`relative flex flex-col items-center gap-1 rounded-xl border px-3 py-4 text-center transition-all duration-150 cursor-pointer ${payment == "stcpay" ? "border-primary bg-primary/5" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/60"}`}>
                            <div className="w-12 h-12 flex justify-center items-center">
                                <img src="/stc-pay.png" alt="stc pay" className="w-full h-auto" />
                            </div>
                            <p className={`text-xs font-semibold ${payment == "stcpay" ? "text-primary" : "text-gray-500"}`}>STC Pay</p>
                            {payment == "stcpay" && <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-white">
                                <FaCheck className="text-white text-[8px]" />
                            </span>}
                        </button>
                    </div>
                    {payment == "stcpay" && (
                        otpStage ? (
                            <div className="flex flex-col gap-1 py-4">
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">{locale == "ar" ? "رمز التحقق (OTP)" : "Verification Code (OTP)"}</label>
                                <input
                                    type="text"
                                    id="otp"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={8}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    onKeyDown={(e) => { if (e.key === "Enter") { handleCheckout(); } }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none tracking-[0.4em] text-center text-lg font-semibold"
                                />
                                <p className="text-sm text-gray-400">{locale == "ar" ? `أرسلنا رمز التحقق إلى ${phone} عبر رسالة نصية` : `We sent a verification code to ${phone}`}</p>
                                <button onClick={() => selectPayment("stcpay")} className="self-start mt-1 text-xs font-semibold text-primary hover:underline cursor-pointer">
                                    {locale == "ar" ? "تغيير رقم الهاتف" : "Change phone number"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1 py-4">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{locale == "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none" />
                                <p className="text-sm text-gray-400">{locale == "ar" ? "أدخل رقم الجوال المسجل في حساب STC Pay الخاص بك، وسيصلك رمز تحقق عبر رسالة نصية" : "Enter the phone number registered with your STC Pay account — you'll receive a verification code by SMS"}</p>
                            </div>
                        )
                    )}
                </div>
                <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-2 w-full max-w-125 border border-gray-200 rounded-xl shadow">
                    <div className="mb-1 flex items-center gap-2">
                        <span className="h-4 w-0.5 rounded-full bg-primary"></span>
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{locale == "ar" ? "ملخص الطلب" : "Order Summary"}</h2>
                    </div>
                    <div className="flex items-center justify-start gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-xl shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={content.cover_image || "/placeholder-content.jpg"} alt={content.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-1 flex-1 h-full justify-between py-1">
                            <span className="text-sm font-medium text-gray-900">{content.title}</span>
                            <span className="text-xs font-medium text-primary">{Number(content.price).toFixed(2)} {t("currency")}</span>
                        </div>
                    </div>
                    {content.is_free && (
                        <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                            {ar ? "هذا المحتوى مجاني وسيتم فتحه فورًا." : "This content is free and will be unlocked instantly."}
                        </p>
                    )}
                </div>
                <div className="p-5">
                    {error && <p className="mb-3 rounded-md bg-red-700 px-4 py-2.5 text-sm text-white">{error}</p>}
                    <div className="flex justify-between items-center gap-4 pb-4">
                        <span className="font-medium">{t("total")}</span>
                        <span>{Number(content.price).toFixed(2)} {t("currency")}</span>
                    </div>
                    <button onClick={handleCheckout} disabled={processing} className="flex item-center justify-center bg-[#0bb2b0] text-white w-full rounded-lg py-3 font-bold hover:bg-[#0bb2b0]/90 transition cursor-pointer disabled:opacity-60">{processing ? (ar ? "جارٍ المعالجة…" : "Processing…") : otpStage ? (ar ? "تحقق وادفع" : "Verify & pay") : content.is_free ? (ar ? "افتح المحتوى" : "Unlock content") : t("checkout")}</button>
                </div>
            </div>
        </>
    );
}

export default function Checkout() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-32">
                    <LuLoaderCircle className="text-primary text-4xl animate-spin" />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
