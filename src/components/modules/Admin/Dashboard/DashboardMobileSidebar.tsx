"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SheetTitle } from "@/components/ui/sheet";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardMobileSidebarProps {
    userInfo: UserInfo;
    navItems: NavSection[];
    dashboardHome: string;
}

const DashboardMobileSidebar = ({
    dashboardHome,
    navItems,
    userInfo,
}: DashboardMobileSidebarProps) => {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Logo / Brand */}
            <div className="flex h-16 items-center gap-3 border-b border-border/60 px-5">
                {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"> */}
                    <Link href={dashboardHome}>
                        <Image
                            src="/jersey_cravings.png"
                            alt="Jersey Cravings"
                            width={32}
                            height={32}
                        />
                    </Link>
                {/* </div> */}
                <Link href={dashboardHome}>
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        Jersey <span className="text-primary">Cravings</span>
                    </span>
                </Link>
            </div>

            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

            {/* Navigation Area */}
            <ScrollArea className="flex-1 min-h-0 px-3 py-4">
                <nav className="space-y-4">
                    {navItems.map((section, sectionId) => (
                        <div key={sectionId}>
                            {section.title && (
                                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                                    {section.title}
                                </p>
                            )}

                            <div className="space-y-0.5">
                                {section.items.map((item, id) => {
                                    const isActive = pathname === item.href;
                                    const Icon = getIconComponent(item.icon);

                                    return (
                                        <Link
                                            href={item.href}
                                            key={id}
                                            onClick={(event) => event.stopPropagation()}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-xl px-3 py-1 text-sm font-medium transition-all duration-150",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                    isActive
                                                        ? "bg-primary-foreground/15"
                                                        : "bg-muted group-hover:bg-accent-foreground/10",
                                                )}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                            </span>
                                            <span className="flex-1 truncate">
                                                {item.title}
                                            </span>
                                            {isActive && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            {sectionId < navItems.length - 1 && (
                                <Separator className="mt-4 opacity-50" />
                            )}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* User Info */}
            <div className="border-t border-border/60 p-3">
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                    {/* Avatar */}
                    <div className="relative h-9 w-9 shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-full ring-2 ring-primary/20">
                            {userInfo.image ? (
                                <Image
                                    src={userInfo.image}
                                    alt={userInfo.name}
                                    width={36}
                                    height={36}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                    <span className="text-sm font-bold text-primary">
                                        {userInfo.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Online dot */}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                    </div>

                    {/* Name & Role */}
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-semibold text-foreground leading-tight">
                            {userInfo.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground capitalize leading-tight mt-0.5">
                            {userInfo.role.toLowerCase().replace("_", " ")}
                        </p>
                    </div>

                    {/* Role badge */}
                    <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {userInfo.role.charAt(0).toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DashboardMobileSidebar;
