import {NextIntlClientProvider} from 'next-intl';
import { Jost, Cairo } from "next/font/google";
import "./globals.css";
import { getLocale } from 'next-intl/server';
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

export const metadata = {
  title: "Home - CRAI",
  description: "sell digital products Saudi Arabia,creator monetization Saudi Arabia,Saudi creator payment platform,get paid online Saudi Arabia,sell courses online Saudi,accept Mada payments creators,Saudi Arabia digital products platform,monetize Instagram Saudi Arabia,creator tools Saudi Arabia,sell ebooks Saudi Arabia,online payments for creators Saudi,Saudi influencer monetization,Arabic creator monetization platform,receive payments SAR online,sell digital downloads Saudi Arabia",
};

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
