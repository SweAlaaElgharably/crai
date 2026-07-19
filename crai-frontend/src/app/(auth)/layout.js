import AuthHero from "@/components/authhero";
import Header from "@/components/header";

export default async function AuthLayout({ children }) {
  return (
    <>
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-14 gap-4 w-full mx-auto">
        <div className="w-full bg-primary md:col-span-6 hidden md:flex">
          <AuthHero />
        </div>
        <div className="w-full bg-white col-span-14 md:col-span-8">
          {children}
        </div>
      </div>
    </>
  );
}
