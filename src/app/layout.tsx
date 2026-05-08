import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProviders from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const interHeading = Inter({ subsets: ["latin"], variable: "--font-heading" });

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Jersey Cravings",
    description:
        "Jersey Cravings is an e-commerce platform for selling football jerseys with variant-based inventory, customer accounts, admin governance, orders, and payments.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                geistSans.variable,
                geistMono.variable,
                "font-sans",
                notoSans.variable,
                interHeading.variable,
            )}
        >
            <body>
                <QueryProviders>
                    {children}
                    <Toaster position="bottom-right" richColors />
                </QueryProviders>
            </body>
        </html>
    );
}
