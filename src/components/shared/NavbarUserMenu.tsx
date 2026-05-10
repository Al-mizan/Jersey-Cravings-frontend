"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { customerProfileKeys } from "@/hooks/queries/customerQueryKeys";
import { getMyProfile } from "@/services/customer.service";
import { customerNavItems } from "@/lib/navItems";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    UserCircle,
    ShoppingBag,
    MessageSquare,
    MapPin,
    Gift,
    Share2,
    LogOut,
    Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── icon map ──────────────────────────────────────────────────────── */

const iconMap: Record<string, LucideIcon> = {
    UserCircle,
    ShoppingBag,
    MessageSquare,
    MapPin,
    Gift,
    Share2,
    LogOut,
};

/* ─── helpers ───────────────────────────────────────────────────────── */

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

/* ─── component ─────────────────────────────────────────────────────── */

export function NavbarUserMenu() {
    const { user, isAuthenticated, logout, isLoggingOut } = useAuth();

    /* Read cached customer profile — no extra fetch if already loaded */
    const { data: profile } = useQuery({
        queryKey: customerProfileKeys.me(),
        queryFn: () => getMyProfile(),
        enabled: isAuthenticated && user?.role === "CUSTOMER",
        staleTime: 60_000,
    });

    if (!isAuthenticated || !user) return null;

    const displayName = profile?.name || user.name || "User";
    const displayEmail = profile?.email || user.email || "";
    const displayPhoto = profile?.profilePhoto || user.image;

    /* Filter out the Logout item — we render it separately at the bottom */
    const navItems =
        customerNavItems[0]?.items.filter(
            (item) => item.title !== "Logout",
        ) ?? [];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    id="navbar-user-avatar"
                    className="relative flex items-center justify-center rounded-full outline-none ring-2 ring-transparent transition-all duration-200 hover:ring-primary/40 data-[state=open]:ring-primary/60 data-[state=open]:scale-[1.04]"
                    aria-label="User menu"
                >
                    <Avatar className="size-9 text-sm">
                        {displayPhoto ? (
                            <AvatarImage
                                src={displayPhoto}
                                alt={displayName}
                            />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(displayName)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56"
            >
                {/* ── Header section ────────────────────────── */}
                <div className="px-2 py-2.5">
                    <p className="text-sm font-medium truncate">
                        {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {displayEmail}
                    </p>
                </div>

                <DropdownMenuSeparator />

                {/* ── Nav items ─────────────────────────────── */}
                <DropdownMenuGroup>
                    {navItems.map((item) => {
                        const Icon = iconMap[item.icon];
                        return (
                            <DropdownMenuItem key={item.href} asChild>
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    {Icon && (
                                        <Icon className="size-4 text-muted-foreground" />
                                    )}
                                    {item.title}
                                </Link>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* ── Sign out ──────────────────────────────── */}
                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="cursor-pointer"
                >
                    {isLoggingOut ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <LogOut className="size-4" />
                    )}
                    {isLoggingOut ? "Signing out…" : "Sign Out"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
