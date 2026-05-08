import HomeNavbar from "@/components/shared/HomeNavbar";

export default function CommonLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <HomeNavbar />
            {children}
        </>
    );
}
