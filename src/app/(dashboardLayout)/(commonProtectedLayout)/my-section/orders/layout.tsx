import HomeNavbar from "@/components/shared/Navbar/HomeNavbar";
import Footer from "@/components/shared/Footer/Footer";

export default function OrdersLayout({
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
