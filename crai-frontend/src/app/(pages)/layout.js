import Footer from "@/components/footer";
import Header from "@/components/header";

export default async function PagesLayout({ children }) {
  return (
    <>
        <Header />
        {children}
        <Footer />
    </>
  );
}
