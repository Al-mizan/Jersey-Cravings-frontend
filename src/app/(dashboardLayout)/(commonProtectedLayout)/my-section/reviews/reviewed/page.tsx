"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Star, Edit, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyReviews } from "@/services/review.service";
import type { Review } from "@/types/review.types";

export default function ReviewedPage() {
    const {
        data: reviews,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["my-reviews"],
        queryFn: getMyReviews,
    });

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="flex space-x-1">
                                        {[...Array(5)].map((_, j) => (
                                            <div
                                                key={j}
                                                className="w-4 h-4 bg-gray-200 rounded"
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">
                    Failed to load your reviews. Please try again.
                </p>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    You haven't reviewed any products yet
                </h3>
                <p className="text-gray-600">
                    Share your experience with products you've purchased to help
                    others make informed decisions.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
                <Card
                    key={review.id}
                    className="hover:shadow-lg transition-shadow"
                >
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                            <div className="relative w-12 h-12 shrink-0">
                                <Image
                                    src={review.product.media?.[0]?.secureUrl || review.product.thumbnail}
                                    alt={review.product.title}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate mb-1">
                                    {review.product.title}
                                </h3>

                                <div className="flex items-center space-x-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "w-4 h-4",
                                                i < review.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300",
                                            )}
                                        />
                                    ))}
                                </div>

                                {review.comment && (
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                                        {review.comment}
                                    </p>
                                )}

                                {review.media.length > 0 && (
                                    <div className="flex space-x-1 mb-3">
                                        {review.media
                                            .slice(0, 3)
                                            .map((media, index) => (
                                                <div
                                                    key={index}
                                                    className="relative w-8 h-8"
                                                >
                                                    <Image
                                                        src={media}
                                                        alt={`Review image ${index + 1}`}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                </div>
                                            ))}
                                        {review.media.length > 3 && (
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">
                                                +{review.media.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            review.createdAt,
                                        ).toLocaleDateString()}
                                    </p>
                                    <Button size="sm" variant="outline" asChild>
                                        <a
                                            href={`/products/${review.product.slug}?review=true&edit=${review.id}`}
                                        >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
