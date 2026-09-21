import {NextIntlClientProvider} from 'next-intl';
import { Jost, Cairo } from "next/font/google";
import "./globals.css";
import { getLocale, getTranslations } from 'next-intl/server';
import { headers } from "next/headers";
import UserProvider from '@/components/userProvider';

const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-jost",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

const TITLE_PATHS = {
  "/": "home",
  "/about": "about",
  "/contact": "contact",
  "/terms": "terms",
  "/policy": "policy",
  "/creators": "creators",
  "/explore": "explore",
  "/feed": "feed",
  "/checkout": "checkout",
  "/successpayment": "paymentSuccess",
  "/login": "login",
  "/register": "register",
  "/forgotpassword": "forgotPassword",
  "/dashboard": "dashboard",
  "/profile": "profile",
  "/subscribers": "subscribers",
  "/payout": "payout",
  "/analytics": "analytics",
  "/analytics/influencer": "influencerAnalytics",
  "/contents": "contents",
  "/contents/create": "createContent",
};

function resolveTitleKey(pathname) {
  if (TITLE_PATHS[pathname]) return TITLE_PATHS[pathname];
  if (pathname.startsWith("/@/")) return "creatorProfile";
  if (/^\/[^/]+$/.test(pathname)) return "creatorProfile";
  if (/^\/contents\/[^/]+\/edit/.test(pathname)) return "editContent";
  if (/^\/content\/[^/]+/.test(pathname)) return "contentDetails";
  if (/^\/resetpassword\//.test(pathname)) return "resetPassword";
  if (/^\/activation\//.test(pathname)) return "accountActivation";
  if (/^\/creators\/[^/]+/.test(pathname)) return "creatorProfile";
  return "home";
}

export async function generateMetadata() {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/";
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const titleKey = resolveTitleKey(pathname);
  return {
    title: `${t(titleKey)} | CRAI`,
    description: "sell digital products Saudi Arabia,creator monetization Saudi Arabia,Saudi creator payment platform,get paid online Saudi Arabia,sell courses online Saudi,accept Mada payments creators,Saudi Arabia digital products platform,monetize Instagram Saudi Arabia,creator tools Saudi Arabia,sell ebooks Saudi Arabia,online payments for creators Saudi,Saudi influencer monetization,Arabic creator monetization platform,receive payments SAR online,sell digital downloads Saudi Arabia",
    metadataBase: new URL("https://cr-ai.cloud"),
    alternates: { canonical: pathname },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${jost.variable} ${cairo.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col`}>
        <UserProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </UserProvider>
      </body>
    </html>
  );
}
