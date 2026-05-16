"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { getMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { getPendingReviews } from "@/services/review.service";
import type { PendingProduct } from "@/types/review.types";

export default function NotReviewedPage() {
    const {
        data: pendingProducts,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["pending-reviews"],
        queryFn: getPendingReviews,
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse"
                    >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">
                    Failed to load pending reviews. Please try again.
                </p>
            </div>
        );
    }

    if (!pendingProducts || pendingProducts.length === 0) {
        return (
            <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    You have to order to review the products
                </h3>
                <p className="text-gray-600 mb-6">
                    Once you receive your orders, you can come back here to
                    share your experience.
                </p>
                <Button asChild>
                    <Link href="/products">Browse Products</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {pendingProducts.map((product) => (
                <div
                    key={product.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="relative w-16 h-16 shrink-0">
                        <Image
                            src={getMediaUrl(product.media) || product.thumbnail || "/jersey_cravings.png"}
                            alt={product.title}
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                            {product.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {product.variant.size &&
                                `Size: ${product.variant.size}`}
                            {product.variant.size &&
                                product.variant.type &&
                                " • "}
                            {product.variant.type &&
                                `Type: ${product.variant.type}`}
                        </p>
                    </div>

                    <Button asChild variant="outline">
                        <Link href={`/products/${product.slug}?review=true`}>
                            Write a Review
                        </Link>
                    </Button>
                </div>
            ))}
        </div>
    );
}
