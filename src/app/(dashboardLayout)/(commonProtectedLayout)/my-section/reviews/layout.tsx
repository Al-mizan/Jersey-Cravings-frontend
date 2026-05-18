"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ReviewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="container mx-auto px-4 py-8">
            <div
                className="mb-8 rounded-3xl border p-6 shadow-sm"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background)) 55%, hsl(var(--muted)) 100%)",
                }}
            >
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    My account
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    My Ratings & Reviews
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Track the products you still need to review and revisit the
                    feedback you have already posted.
                </p>
            </div>

            <div className="mb-8 flex gap-2 rounded-full border bg-muted/30 p-1">
                <Link
                    href="/my-section/reviews/not-reviewed"
                    className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        pathname === "/my-section/reviews/not-reviewed"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    Not Reviewed
                </Link>
                <Link
                    href="/my-section/reviews/reviewed"
                    className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        pathname === "/my-section/reviews/reviewed"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    Reviewed
                </Link>
            </div>

            {children}
        </div>
    );
}
