"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Star, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IProduct } from "@/types/product.types";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMediaUrl } from "@/lib/media";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ProductCardProps {
    product: IProduct;
    showBadge?: boolean;
    className?: string;
    hrefOverride?: string;
}

export function ProductCard({
    product,
    showBadge = true,
    className,
    hrefOverride,
}: ProductCardProps) {
    // Determine if it's new (created in the last 14 days)
    const isNew = useMemo(() => {
        const createdAtDate = new Date(product.createdAt);
        const now = new Date();
        const diffInDays =
            (now.getTime() - createdAtDate.getTime()) / (1000 * 3600 * 24);
        return diffInDays <= 14;
    }, [product.createdAt]);

    // Format prices based on the first variant or defaults
    const defaultVariant = product.variants?.[0];
    const priceAmount = defaultVariant?.priceAmount || 0;
    const compareAtAmount = defaultVariant?.compareAtAmount;
    // Actual rating and review count from backend schema
    const rating = product.totalRating || 0;
    const reviewCount = product.reviewCount || 0;

    // Discount percentage for badge
    const discountPercent = useMemo(() => {
        if (compareAtAmount && compareAtAmount > priceAmount && priceAmount > 0) {
            return Math.round(((compareAtAmount - priceAmount) / compareAtAmount) * 100);
        }
        return 0;
    }, [compareAtAmount, priceAmount]);

    // Cart mutation
    const addToCartMutation = useMutation({
        mutationFn: async (variantId: string) => {
            return await axios.post("/api/proxy/cart/items", {
                variantId,
                quantity: 1,
            });
        },
        onSuccess: () => {
            // toast.success("Added to cart");
        },
        onError: () => {
            toast.error("Failed to add to cart");
        },
    });

    const handleAddToCart = (variantId: string) => {
        addToCartMutation.mutate(variantId);
    };

    return (
        <div
            className={cn(
                "group relative flex flex-col bg-background rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border/40 hover:border-primary/20",
                className
            )}
        >
            {/* Absolute link to handle entire card click minus the z-20 layer */}
            <Link
                href={hrefOverride || `/products/${product.slug}`}
                className="absolute inset-0 z-10"
                aria-label={product.title}
            />

            {/* Image Container */}
            <div className="relative aspect-[3/4] h-50 md:h-80 w-full overflow-hidden bg-muted/30">
                {getMediaUrl(product.media) || product.thumbNail ? (
                    <Image
                        src={getMediaUrl(product.media) || product.thumbNail || ""}
                        alt={product.title}
                        fill
                        className="object-fill md:object-cover md:object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        No Image
                    </div>
                )}

                {/* Badge Overlay */}
                {showBadge && isNew && (
                    <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-zinc-900 text-white hover:bg-zinc-800 rounded shadow-md border-none px-2 py-1 text-xs font-bold uppercase tracking-wider">
                            New
                        </Badge>
                    </div>
                )}

                {/* Discount Badge */}
                {discountPercent > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-block bg-red-600 text-white font-bold text-[11px] md:text-xs px-2 py-0.5 md:px-2.5 md:py-1 rounded-full shadow-lg tracking-wide">
                            -{discountPercent}%
                        </span>
                    </div>
                )}

                {/* Hover Action Overlay (Desktop) */}
                {/* <div className="hidden md:block absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        {renderActionBtn()}
                    </div>
                </div> */}
            </div>

            {/* Content Container */}
            <div className="flex flex-col flex-1 p-4 gap-1.5 z-10 pointer-events-none bg-background">
                {/* Team & Ratings */}
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground truncate">
                        {product.teamName}
                    </p>

                    <div className="flex items-center justify-center text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-1.5 py-0.5 rounded-sm min-h-[24px]">
                        {reviewCount > 0 ? (
                            <div className="flex items-center">
                                <span className="font-bold text-foreground mr-1">{rating.toFixed(1)}</span>
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                                <span className="text-[10px] font-medium">({reviewCount})</span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-medium">No reviews yet</span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-sm md:text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors mt-0.5">
                    {product.title}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mt-auto pt-2">
                    <span className="text-base md:text-lg font-black text-foreground">
                        ৳ {priceAmount.toLocaleString()}
                    </span>
                    {compareAtAmount && compareAtAmount > priceAmount && (
                        <span className="text-xs md:text-sm text-muted-foreground line-through font-semibold">
                            ৳ {compareAtAmount.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Mobile Fallback Action Btn */}
            {/* <div className="p-3 pt-0 md:hidden z-20 pointer-events-auto relative bg-background">
                 {renderActionBtn()}
            </div> */}
        </div>
    );
}
