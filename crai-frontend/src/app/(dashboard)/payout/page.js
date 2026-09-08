"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import {
    LuLoaderCircle, LuWallet, LuBuilding2, LuArrowUpRight, LuCircleDollarSign,
    LuClock, LuPencil, LuTrash2, LuPlus, LuX, LuTrendingUp, LuLandmark,
    LuBadgeCheck, LuFileText, LuChevronDown, LuCalendar
} from "react-icons/lu";

const STATUS_META = {
    pending: { labelEn: "Pending", labelAr: "قيد الانتظار", cls: "bg-amber-50 text-amber-600 ring-amber-200", icon: LuClock },
    processing: { labelEn: "Processing", labelAr: "قيد المعالجة", cls: "bg-blue-50 text-blue-600 ring-blue-200", icon: LuLoaderCircle },
    completed: { labelEn: "Completed", labelAr: "مكتمل", cls: "bg-emerald-50 text-emerald-600 ring-emerald-200", icon: LuBadgeCheck },
    rejected: { labelEn: "Rejected", labelAr: "مرفوض", cls: "bg-rose-50 text-rose-600 ring-rose-200", icon: LuX },
};

function formatMoney(val, locale) {
    const n = Number(val) || 0;
    return n.toLocaleString(locale === "ar" ? "ar-SA" : "en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr, locale) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" });
}

const EMPTY_BANK = { iban: "", account_file: null };

export default function Payout() {
    const locale = useLocale();
    const ar = locale === "ar";
    const router = useRouter();
    const user = useUserStore((s) => s.user);

    const [tab, setTab] = useState("overview");
    const [summary, setSummary] = useState(null);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawBankId, setWithdrawBankId] = useState("");
    const [withdrawNotes, setWithdrawNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [withdrawError, setWithdrawError] = useState("");

    const [showBankForm, setShowBankForm] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [bankForm, setBankForm] = useState({ ...EMPTY_BANK });
    const [bankError, setBankError] = useState("");
    const [bankSubmitting, setBankSubmitting] = useState(false);

    useEffect(() => {
        if (user && user.user_type !== "influencer" && !user.is_staff) {
            router.replace("/analytics");
            return;
        }
        loadData();
    }, [user, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const [sumRes, banksRes, wRes] = await Promise.all([
                fetch("/api/payout/summary", { credentials: "include" }),
                fetch("/api/payout/bank-accounts", { credentials: "include" }),
                fetch("/api/payout/withdrawals", { credentials: "include" }),
            ]);
            if (sumRes.ok) setSummary(await sumRes.json());
            if (banksRes.ok) {
                const data = await banksRes.json();
                setBankAccounts(Array.isArray(data) ? data : data.results || []);
            }
            if (wRes.ok) {
                const data = await wRes.json();
                setWithdrawals(Array.isArray(data) ? data : data.results || []);
            }
        } catch {
            setError(ar ? "حدث خطأ أثناء تحميل البيانات" : "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawError("");
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount < 500) {
            setWithdrawError(ar ? "الحد الأدنى للسحب 500 ريال" : "Minimum withdrawal is 500 SAR");
            return;
        }
        if (!withdrawBankId) {
            setWithdrawError(ar ? "اختر حساب بنكي مفعّل" : "Select an active bank account");
            return;
        }
        try {
            setSubmitting(true);
            const res = await fetch("/api/payout/withdrawals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ amount, bank_account: parseInt(withdrawBankId), notes: withdrawNotes }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = data.amount?.[0] || data.detail || (ar ? "فشل إنشاء الطلب" : "Failed to create withdrawal");
                setWithdrawError(msg);
                return;
            }
            setShowWithdraw(false);
            setWithdrawAmount("");
            setWithdrawBankId("");
            setWithdrawNotes("");
            loadData();
        } catch {
            setWithdrawError(ar ? "حدث خطأ" : "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBankSubmit = async (e) => {
        e.preventDefault();
        setBankError("");
        const iban = (bankForm.iban || "").replace(/\s+/g, "");
        if (!iban || iban.length < 15) {
            setBankError(ar ? "أدخل رقم IBAN صحيح" : "Enter a valid IBAN");
            return;
        }
        if (!bankForm.account_file) {
            setBankError(ar ? "ارفع ملف تفاصيل الحساب (PDF)" : "Upload the account details file (PDF)");
            return;
        }
        try {
            setBankSubmitting(true);
            const fd = new FormData();
            fd.append("iban", iban);
            fd.append("account_file", bankForm.account_file);
            const url = editingBank ? `/api/payout/bank-accounts/${editingBank.id}` : "/api/payout/bank-accounts";
            const method = editingBank ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                credentials: "include",
                body: fd,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setBankError(data.detail || data.iban?.[0] || data.account_file?.[0] || (ar ? "حدث خطأ" : "An error occurred"));
                return;
            }
            setShowBankForm(false);
            setEditingBank(null);
            setBankForm({ ...EMPTY_BANK });
            loadData();
        } catch {
            setBankError(ar ? "حدث خطأ" : "An error occurred");
        } finally {
            setBankSubmitting(false);
        }
    };

    const deleteBank = async (id) => {
        if (!confirm(ar ? "هل أنت متأكد من حذف هذا الحساب؟" : "Are you sure you want to delete this account?")) return;
        try {
            await fetch(`/api/payout/bank-accounts/${id}`, { method: "DELETE", credentials: "include" });
            loadData();
        } catch {}
    };

    const startEditBank = (bank) => {
        setEditingBank(bank);
        setBankForm({ iban: bank.iban, account_file: null });
        setShowBankForm(true);
    };

    const hasActiveBank = bankAccounts.some((b) => b.is_active);
    const activeBanks = bankAccounts.filter((b) => b.is_active);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                    <LuLoaderCircle className="text-primary text-4xl animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
                    <p className="text-rose-600 font-medium">{error}</p>
                    <button onClick={loadData} className="mt-4 text-sm text-primary underline cursor-pointer">{ar ? "إعادة المحاولة" : "Retry"}</button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: ar ? "الملخص" : "Overview", icon: LuCircleDollarSign },
        { id: "withdrawals", label: ar ? "السحوبات" : "Withdrawals", icon: LuArrowUpRight },
        { id: "banks", label: ar ? "الحسابات البنكية" : "Bank Accounts", icon: LuLandmark },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{ar ? "الدفعات" : "Payouts"}</h1>
                    <p className="text-gray-500 mt-1">{ar ? "تتبّع أرباحك وإدارة سحوباتك وحساباتك البنكية" : "Track your earnings, manage withdrawals & bank accounts"}</p>
                </div>
                <button
                    onClick={() => setShowWithdraw(true)}
                    disabled={!summary || Number(summary.available_balance) <= 0 || !hasActiveBank}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[#0a9d9b] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
                >
                    <LuPlus size={18} />
                    {ar ? "طلب سحب" : "Request Withdrawal"}
                </button>
            </div>

            {/* Tabs */}
            <div className="inline-flex flex-wrap gap-1 bg-gray-100/80 rounded-2xl p-1 mb-8">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${tab === id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {tab === "overview" && summary && (
                <div className="space-y-6">
                    {/* Hero balance card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0b2b] via-[#102a4c] to-[#0bb2b0] p-8 text-white shadow-xl">
                        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />
                        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
                                    <LuWallet size={16} />
                                    {ar ? "الرصيد المتاح للسحب" : "Available for withdrawal"}
                                </div>
                                <p className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                                    {formatMoney(summary.available_balance, locale)} <span className="text-xl font-semibold text-white/70">SAR</span>
                                </p>
                                <p className="text-white/70 text-sm">
                                    {ar ? `صافي الأرباح ${formatMoney(summary.net_earnings, locale)} SAR` : `Net earnings ${formatMoney(summary.net_earnings, locale)} SAR`}
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-primary/30 flex items-center justify-center">
                                    <LuTrendingUp size={22} />
                                </div>
                                <div>
                                    <p className="text-xs text-white/60">{ar ? "إجمالي الأرباح" : "Total earnings"}</p>
                                    <p className="font-semibold text-lg">{formatMoney(summary.total_earnings, locale)} SAR</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={LuCircleDollarSign}
                            title={ar ? "إجمالي الأرباح" : "Gross sales"}
                            value={`${formatMoney(summary.total_earnings, locale)} SAR`}
                            accent="text-primary bg-primary/10"
                        />
                        <StatCard
                            icon={LuBuilding2}
                            title={ar ? "رسوم المنصة" : "Platform fee"}
                            value={`${formatMoney(summary.platform_fee, locale)} SAR`}
                            subtitle="15%"
                            accent="text-rose-500 bg-rose-50"
                        />
                        <StatCard
                            icon={LuClock}
                            title={ar ? "قيد المعالجة" : "In processing"}
                            value={`${formatMoney(summary.pending_withdrawals, locale)} SAR`}
                            accent="text-amber-500 bg-amber-50"
                        />
                        <StatCard
                            icon={LuBadgeCheck}
                            title={ar ? "سحوبات مكتملة" : "Completed"}
                            value={`${formatMoney(summary.completed_withdrawals, locale)} SAR`}
                            accent="text-emerald-500 bg-emerald-50"
                        />
                    </div>

                    {/* Earnings breakdown */}
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                            <LuFileText className="text-primary" size={18} />
                            <h2 className="text-base font-semibold text-gray-900">{ar ? "تفاصيل الأرباح" : "Earnings breakdown"}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <BreakdownRow label={ar ? "إجمالي المبيعات" : "Gross sales"} value={`${formatMoney(summary.total_earnings, locale)} SAR`} />
                            <BreakdownRow label={ar ? "رسوم المنصة (15%)" : "Platform fee (15%)"} value={`-${formatMoney(summary.platform_fee, locale)} SAR`} subtract />
                            <div className="border-t border-dashed border-gray-200" />
                            <BreakdownRow label={ar ? "صافي الأرباح" : "Net earnings"} value={`${formatMoney(summary.net_earnings, locale)} SAR`} strong />
                            <BreakdownRow label={ar ? "سحوبات مكتملة" : "Completed withdrawals"} value={`-${formatMoney(summary.completed_withdrawals, locale)} SAR`} subtract />
                            <BreakdownRow label={ar ? "سحوبات قيد المعالجة" : "Pending withdrawals"} value={`-${formatMoney(summary.pending_withdrawals, locale)} SAR`} subtract />
                            <div className="border-t border-dashed border-gray-200" />
                            <BreakdownRow label={ar ? "المتاح للسحب الآن" : "Available to withdraw"} value={`${formatMoney(summary.available_balance, locale)} SAR`} strong highlight />
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawals Tab */}
            {tab === "withdrawals" && (
                <div className="space-y-4">
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-gray-900">{ar ? "سجل السحوبات" : "Withdrawal history"}</h2>
                        </div>
                        {withdrawals.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                    <LuArrowUpRight className="text-gray-300" size={28} />
                                </div>
                                <p className="text-gray-400 font-medium">{ar ? "لا توجد سحوبات بعد" : "No withdrawals yet"}</p>
                                <p className="text-sm text-gray-400 mt-1">{ar ? "ابدأ بطلب أول سحب لك" : "Request your first withdrawal"}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {withdrawals.map((w) => {
                                    const meta = STATUS_META[w.status] || STATUS_META.pending;
                                    const Icon = meta.icon;
                                    return (
                                        <div key={w.id} className="group p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary shrink-0">
                                                        <LuArrowUpRight size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-[15px]">{formatMoney(w.amount, locale)} <span className="text-gray-400 text-sm font-normal">SAR</span></p>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <LuLandmark size={12} />
                                                            {w.bank_account_details?.iban || ar ? "حساب بنكي" : "Bank account"}
                                                            <span className="mx-1">•</span>
                                                            <LuCalendar size={12} />
                                                            {formatDate(w.created_at, locale)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${meta.cls}`}>
                                                    <Icon size={13} />
                                                    {ar ? meta.labelAr : meta.labelEn}
                                                </span>
                                            </div>
                                            {w.notes && <p className="mt-3 text-sm text-gray-400 pl-16">{w.notes}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bank Accounts Tab */}
            {tab === "banks" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{ar ? "استخدم حسابك البنكي لاستلام سحوباتك" : "Receive your withdrawals to your bank account"}</p>
                        <button onClick={() => { setEditingBank(null); setBankForm({ ...EMPTY_BANK }); setShowBankForm(true); }} className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-[#0a9d9b] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all cursor-pointer">
                            <LuPlus size={16} />
                            {ar ? "إضافة حساب" : "Add Account"}
                        </button>
                    </div>

                    {bankAccounts.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-12 text-center">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                <LuLandmark className="text-gray-300" size={28} />
                            </div>
                            <p className="text-gray-500 font-medium">{ar ? "لا توجد حسابات بنكية" : "No bank accounts"}</p>
                            <p className="text-sm text-gray-400 mt-1">{ar ? "أضف حسابك البنكي للبدء في السحب" : "Add your bank account to start withdrawing"}</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {bankAccounts.map((bank) => (
                                <div key={bank.id} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                    <div className={`h-1.5 ${bank.is_active ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-amber-400 to-orange-400"}`} />
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <LuLandmark size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-mono font-semibold text-gray-900">{bank.iban}</p>
                                                    <span className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${bank.is_active ? "bg-emerald-50 text-emerald-600 ring-emerald-200" : "bg-amber-50 text-amber-600 ring-amber-200"}`}>
                                                        {bank.is_active ? (
                                                            <><LuBadgeCheck size={12} />{ar ? "مفعّل" : "Active"}</>
                                                        ) : (
                                                            <><LuClock size={12} />{ar ? "قيد المراجعة" : "Pending review"}</>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => startEditBank(bank)} className="p-2 text-gray-300 hover:text-primary transition cursor-pointer rounded-lg hover:bg-gray-50" title={ar ? "تعديل" : "Edit"}>
                                                    <LuPencil size={15} />
                                                </button>
                                                <button onClick={() => deleteBank(bank.id)} className="p-2 text-gray-300 hover:text-rose-500 transition cursor-pointer rounded-lg hover:bg-rose-50" title={ar ? "حذف" : "Delete"}>
                                                    <LuTrash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-50">
                                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                                <LuFileText size={13} />
                                                {ar ? "ملف الحساب" : "Account file"}
                                            </span>
                                            {bank.account_file_url ? (
                                                <a href={bank.account_file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">{ar ? "عرض" : "View"}</a>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </div>
                                        {!bank.is_active && (
                                            <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                                                {ar ? "الحساب بانتظار موافقة الإدارة قبل إتمام السحب" : "Account awaiting admin approval before withdrawals"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdraw && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowWithdraw(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_.2s_ease]" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{ar ? "طلب سحب" : "Request Withdrawal"}</h3>
                            <button onClick={() => setShowWithdraw(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                                <LuX size={20} />
                            </button>
                        </div>
                        {activeBanks.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                    <LuLandmark className="text-gray-300" size={24} />
                                </div>
                                <p className="text-gray-500 font-medium mb-2">{ar ? "لا يوجد حساب بنكي مفعّل" : "No active bank account"}</p>
                                <p className="text-sm text-gray-400 mb-4">{ar ? "أضف حسابًا بنكيًا وانتظر موافقة الإدارة قبل السحب" : "Add a bank account and wait for admin approval to withdraw"}</p>
                                <button onClick={() => { setShowWithdraw(false); setTab("banks"); }} className="text-primary text-sm font-semibold underline cursor-pointer">{ar ? "إدارة الحسابات البنكية" : "Manage Bank Accounts"}</button>
                            </div>
                        ) : (
                            <form onSubmit={handleWithdraw} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{ar ? "المبلغ (SAR)" : "Amount (SAR)"}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="500"
                                            max={summary?.available_balance}
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-lg font-semibold"
                                            placeholder="500"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">SAR</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-gray-400">{ar ? "الحد الأدنى" : "Minimum"}</span>
                                        <span className="text-xs text-gray-400">{ar ? "500 SAR" : "500 SAR"}</span>
                                    </div>
                                    {summary && (
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs text-gray-400">{ar ? "المتاح" : "Available"}</span>
                                            <button type="button" onClick={() => setWithdrawAmount(String(summary.available_balance))} className="text-xs font-semibold text-primary hover:underline cursor-pointer">
                                                {formatMoney(summary.available_balance, locale)} SAR · {ar ? "سحب الكل" : "Withdraw all"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{ar ? "الحساب البنكي" : "Bank account"}</label>
                                    <div className="relative">
                                        <select value={withdrawBankId} onChange={(e) => setWithdrawBankId(e.target.value)} className="appearance-none w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white">
                                            <option value="">{ar ? "اختر حسابًا" : "Select an account"}</option>
                                            {activeBanks.map((b) => (
                                                <option key={b.id} value={b.id}>{b.iban}</option>
                                            ))}
                                        </select>
                                        <LuChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{ar ? "ملاحظات (اختياري)" : "Notes (optional)"}</label>
                                    <textarea rows={2} value={withdrawNotes} onChange={(e) => setWithdrawNotes(e.target.value)} placeholder={ar ? "أي تفاصيل إضافية..." : "Any additional details..."} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none" />
                                </div>
                                {withdrawError && <p className="text-sm text-rose-500 font-medium">{withdrawError}</p>}
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer">{ar ? "إلغاء" : "Cancel"}</button>
                                    <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-[#0a9d9b] text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition disabled:opacity-50 cursor-pointer">{submitting ? <LuLoaderCircle className="mx-auto animate-spin" size={18} /> : (ar ? "تأكيد السحب" : "Confirm")}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Bank Account Modal */}
            {showBankForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowBankForm(false); setEditingBank(null); }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_.2s_ease]" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{editingBank ? (ar ? "تعديل الحساب" : "Edit Account") : (ar ? "إضافة حساب بنكي" : "Add Bank Account")}</h3>
                            <button onClick={() => { setShowBankForm(false); setEditingBank(null); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                                <LuX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBankSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">IBAN</label>
                                <input type="text" value={bankForm.iban} onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value.toUpperCase() })} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-mono" placeholder="SA..." maxLength={34} />
                                <p className="text-xs text-gray-400 mt-1.5">{ar ? "رقم الآيبان الخاص بحسابك البنكي" : "Your bank account IBAN"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{ar ? "تفاصيل الحساب (PDF/صورة)" : "Account details file (PDF/Image)"}</label>
                                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary/50 transition text-center">
                                    <input
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) => setBankForm({ ...bankForm, account_file: e.target.files?.[0] || null })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <LuFileText size={18} />
                                        </div>
                                        {bankForm.account_file ? (
                                            <p className="text-sm font-medium text-gray-700">{bankForm.account_file.name}</p>
                                        ) : editingBank ? (
                                            <p className="text-sm text-gray-400">{ar ? "اضغط لرفع ملف جديد (اختياري)" : "Click to upload a new file (optional)"}</p>
                                        ) : (
                                            <p className="text-sm text-gray-400">{ar ? "اضغط لرفع تفاصيل الحساب" : "Click to upload account details"}</p>
                                        )}
                                        {bankForm.account_file && (
                                            <span className="text-xs text-gray-400">{ar ? "اضغط مرة أخرى لتغيير الملف" : "Click again to change file"}</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">{ar ? "PDF أو صورة، بحد أقصى 5MB. سيُراجع الحساب من الإدارة قبل تفعيله" : "PDF or image, up to 5MB. Admin reviews before activation"}</p>
                            </div>
                            {editingBank && bankForm.account_file && (
                                <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                                    {ar ? "بعد التعديل، سيُعاد تعطيل الحساب لحين موافقة الإدارة" : "After editing, the account will be deactivated until admin approves"}
                                </p>
                            )}
                            {bankError && <p className="text-sm text-rose-500 font-medium">{bankError}</p>}
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => { setShowBankForm(false); setEditingBank(null); }} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer">{ar ? "إلغاء" : "Cancel"}</button>
                                <button type="submit" disabled={bankSubmitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-[#0a9d9b] text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition disabled:opacity-50 cursor-pointer">{bankSubmitting ? <LuLoaderCircle className="mx-auto animate-spin" size={18} /> : (ar ? "حفظ" : "Save")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, title, value, subtitle, accent }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent || "text-primary bg-primary/10"}`}>
                <Icon size={20} />
            </div>
            <p className="text-xs text-gray-400 mb-1">{title}</p>
            <p className="text-base font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
    );
}

function BreakdownRow({ label, value, strong, subtract, highlight }) {
    return (
        <div className={`flex items-center justify-between ${strong ? (highlight ? "bg-primary/5 rounded-xl px-4 py-3 -mx-4" : "px-4 py-2 -mx-4") : ""} `}>
            <span className={`text-sm ${strong ? "font-semibold text-gray-900" : "text-gray-500"}`}>{label}</span>
            <span className={`text-sm ${strong ? "font-bold text-gray-900" : "text-gray-700"} ${subtract ? "text-rose-500" : ""}`}>{value}</span>
        </div>
    );
}
