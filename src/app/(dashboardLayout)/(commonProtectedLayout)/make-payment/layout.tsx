import HomeNavbar from "@/components/shared/HomeNavbar";
import Footer from "@/components/shared/Footer";

export default function MakePaymentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col">
            <HomeNavbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
