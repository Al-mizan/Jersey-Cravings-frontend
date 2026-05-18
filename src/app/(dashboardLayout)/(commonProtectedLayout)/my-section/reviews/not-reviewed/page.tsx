"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPendingReviews } from "@/services/review.service";
import { reviewKeys } from "@/hooks/queries/reviewQueryKeys";
import { ReviewComposerDialog } from "@/components/modules/Customer/Reviews/ReviewComposerDialog";
import type { PendingReviewItem } from "@/types/review.types";

export default function NotReviewedPage() {
    const [selectedItem, setSelectedItem] = useState<PendingReviewItem | null>(
        null,
    );
    const {
        data: pendingProducts,
        isLoading,
        error,
    } = useQuery({
        queryKey: reviewKeys.pending(),
        queryFn: getPendingReviews,
    });

    const stats = useMemo(() => {
        if (!pendingProducts) {
            return null;
        }

        return {
            count: pendingProducts.length,
            orders: new Set(pendingProducts.map((item) => item.orderId)).size,
        };
    }, [pendingProducts]);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse border-muted/60">
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                <div className="h-44 rounded-2xl bg-muted" />
                                <div className="space-y-2">
                                    <div className="h-4 w-2/3 rounded-full bg-muted" />
                                    <div className="h-3 w-1/2 rounded-full bg-muted" />
                                    <div className="h-3 w-3/4 rounded-full bg-muted" />
                                </div>
                                <div className="h-10 rounded-full bg-muted" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-dashed p-10 text-center">
                <p className="text-sm font-medium text-destructive">
                    Failed to load pending reviews. Please try again.
                </p>
            </div>
        );
    }

    if (!pendingProducts || pendingProducts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-16 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold">
                    Nothing left to review
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Delivered orders that still need feedback will appear here.
                    Once you submit a review, it moves to the reviewed tab.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/products">Browse products</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border bg-background p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Pending reviews
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {stats?.count ?? 0}
                    </p>
                </div>
                <div className="rounded-3xl border bg-background p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Delivered orders represented
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                        {stats?.orders ?? 0}
                    </p>
                </div>
                <div
                    className="rounded-3xl border p-5 shadow-sm"
                    style={{
                        backgroundImage:
                            "linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, hsl(var(--background)) 100%)",
                    }}
                >
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        Quick action
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Leave a rating for each delivered jersey so the reviewed
                        tab stays up to date.
                    </p>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {pendingProducts.map((item) => {
                    const imageUrl =
                        getMediaUrl(item.product.media) ||
                        item.product.thumbNail ||
                        item.product.thumbnail ||
                        "/jersey_cravings.png";

                    return (
                        <Card
                            key={`${item.orderId}-${item.product.id}`}
                            className="overflow-hidden border-muted/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="relative h-52 overflow-hidden">
                                <Image
                                    src={imageUrl}
                                    alt={item.product.title}
                                    fill
                                    className="object-cover"
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.2) 55%, transparent 100%)",
                                    }}
                                />
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-white">
                                    <div className="min-w-0">
                                        <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                                            Order #{item.orderNumber}
                                        </p>
                                        <h3 className="truncate text-lg font-semibold">
                                            {item.product.title}
                                        </h3>
                                    </div>
                                    <Badge className="shrink-0 bg-white/15 text-white hover:bg-white/15">
                                        ৳{item.price.toLocaleString("en-US")}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    {new Date(
                                        item.orderDate,
                                    ).toLocaleDateString()}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {item.variant.size && (
                                        <Badge variant="outline">
                                            Size: {item.variant.size}
                                        </Badge>
                                    )}
                                    {item.variant.fit && (
                                        <Badge variant="outline">
                                            Fit: {item.variant.fit}
                                        </Badge>
                                    )}
                                    {item.variant.sleeveType && (
                                        <Badge variant="outline">
                                            Sleeve: {item.variant.sleeveType}
                                        </Badge>
                                    )}
                                    {item.customPlayerName && (
                                        <Badge variant="secondary">
                                            Name: {item.customPlayerName}
                                        </Badge>
                                    )}
                                    {item.customJerseyNumber && (
                                        <Badge variant="secondary">
                                            Number: {item.customJerseyNumber}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2 rounded-2xl border bg-muted/20 p-4 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Ready to review
                                        </span>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <p className="text-muted-foreground">
                                        Share your rating and a short note about
                                        the fit, quality, or printing.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1"
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        Write Review
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                        >
                                            View
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <ReviewComposerDialog
                open={Boolean(selectedItem)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedItem(null);
                    }
                }}
                item={selectedItem}
            />
        </>
    );
}
