import Footer from "@/components/footer";
import Header from "@/components/header";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { HiOutlineHome } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: `${t("notFound")} | CRAI`,
    description: locale == "ar" ? "الصفحة غير موجودة" : "Page not found",
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const locale = await getLocale();
  return (
    <>
      <div className="flex flex-col justify-center items-center gap-6 px-4 py-28 max-w-350 w-full mx-auto text-center">
        <p className="text-[120px] leading-none font-bold text-primary sm:text-[170px]">404</p>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">{locale == "ar" ? "الصفحة غير موجودة" : "Page Not Found"}</h1>
          <p className="text-slate-700 max-w-md">{locale == "ar" ? "عذراً، يبدو أن الصفحة التي تبحث عنها غير متوفرة أو تم نقلها." : "Sorry, the page you are looking for doesn't exist or has been moved."}</p>
        </div>
        <div className="flex gap-2 w-full max-w-sm">
          <Link href="/" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-primary border border-primary">
            <HiOutlineHome className="text-lg" />
            {locale == "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Link>
          <Link href="/creators" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary bg-white px-6 py-3 font-semibold text-primary transition hover:bg-primary hover:text-white">
            <FiSearch className="text-lg" />
            {locale == "ar" ? "تصفح المبدعين" : "Browse Creators"}
          </Link>
        </div>
      </div>
    </>
  );
}