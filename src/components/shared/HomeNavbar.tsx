"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { GlowEffect } from "../ui/glow-effect";
import { useAuth } from "@/hooks/useAuth";
import { NavbarUserMenu } from "./NavbarUserMenu";

const primaryLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Collections", href: "/collections" },
    { label: "About", href: "/about" },
];

const HomeNavbar = () => {
    const cartCount = 0;
    const { isAuthenticated, user } = useAuth();
    const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0">
                            <SheetHeader className="border-b">
                                <SheetTitle>JerseyCravings</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-5 px-4 py-6">
                                <form action="/products" className="space-y-2">
                                    <label
                                        htmlFor="mobile-search"
                                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                    >
                                        Search
                                    </label>
                                    {/* <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="mobile-search"
                                            name="q"
                                            type="search"
                                            placeholder="Search jerseys, clubs, accessories"
                                            className="pl-9"
                                        />
                                    </div> */}
                                </form>
                                <nav className="grid gap-1">
                                    {primaryLinks.map((link) => (
                                        <Button
                                            key={link.href}
                                            variant="ghost"
                                            className="justify-start"
                                            asChild
                                        >
                                            <Link href={link.href}>
                                                {link.label}
                                            </Link>
                                        </Button>
                                    ))}
                                </nav>
                                <Separator />
                                <div className="grid gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href="/contact">Contact us</Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/jersey_cravings.png"
                            alt="JerseyCravings Logo"
                            width={32} // todo: width and height increase with the device pixel ratio
                            height={32}
                            className="rounded-full"
                        />
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {primaryLinks.map((link) => (
                            <Button
                                key={link.href}
                                variant="ghost"
                                size="sm"
                                asChild
                            >
                                <Link href={link.href}>{link.label}</Link>
                            </Button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <form
                        action="/products"
                        className="relative hidden w-65 items-center md:flex lg:w-[320px]"
                    >
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="q"
                            type="search"
                            placeholder="Search jerseys, clubs"
                            className="pl-9"
                        />
                    </form>


                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cart" aria-label="View cart">
                            <div className="relative">
                                <ShoppingCart className="size-5" />
                                {cartCount > 0 && (
                                    <Badge className="absolute -right-2 -top-2 h-4 px-1 text-[10px]">
                                        {cartCount}
                                    </Badge>
                                )}
                            </div>
                        </Link>
                    </Button>

                    {/* Auth-aware: avatar dropdown or sign-in button */}
                    {isCustomer ? (
                        <NavbarUserMenu />
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="inline-flex"
                            asChild
                        >
                            <Link href="/login">
                                {/* <User className="size-4" /> */}
                                <div className="relative">
                                    <GlowEffect
                                        colors={[
                                            "#FF5733",
                                            "#33FF57",
                                            "#3357FF",
                                            "#F1C40F",
                                        ]}
                                        mode="colorShift"
                                        blur="soft"
                                        duration={3}
                                        scale={1.0}
                                    />
                                    <button className="relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline outline-1 outline-[#fff2f21f]">
                                        Sign In
                                    </button>
                                </div>
                            </Link>
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:inline-flex"
                        asChild
                    >
                        <Link href="/contact">Contact us</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default HomeNavbar;

