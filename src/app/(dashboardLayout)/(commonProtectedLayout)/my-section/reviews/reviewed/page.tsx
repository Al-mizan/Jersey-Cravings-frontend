"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, MessageSquare } from "lucide-react";
import { getMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyReviews } from "@/services/review.service";
import { reviewKeys } from "@/hooks/queries/reviewQueryKeys";
import { ReviewStars } from "@/components/modules/Customer/Reviews/ReviewComposerDialog";

export default function ReviewedPage() {
    const {
        data: reviews,
        isLoading,
        error,
    } = useQuery({
        queryKey: reviewKeys.reviewed(),
        queryFn: getMyReviews,
    });

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <Card
                        key={index}
                        className="animate-pulse overflow-hidden border-muted/60"
                    >
                        <CardContent className="p-0">
                            <div className="h-48 bg-muted" />
                            <div className="space-y-3 p-5">
                                <div className="h-4 w-2/3 rounded-full bg-muted" />
                                <div className="h-3 w-1/3 rounded-full bg-muted" />
                                <div className="h-24 rounded-2xl bg-muted/70" />
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
                    Failed to load your reviews. Please try again.
                </p>
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-16 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold">
                    You haven't reviewed any products yet.
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Once you submit a review, it will appear here with the
                    rating, written feedback, and date.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/my-section/reviews/not-reviewed">
                        Review products
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => {
                const imageUrl =
                    getMediaUrl(review.product.media) ||
                    review.product.thumbNail ||
                    review.product.thumbnail ||
                    "/jersey_cravings.png";

                return (
                    <Card
                        key={review.id}
                        className="overflow-hidden border-muted/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="relative h-52 overflow-hidden">
                            <Image
                                src={imageUrl}
                                alt={review.product.title}
                                fill
                                className="object-cover"
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.2) 55%, transparent 100%)",
                                }}
                            />
                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                                        Reviewed product
                                    </p>
                                    <h3 className="truncate text-lg font-semibold">
                                        {review.product.title}
                                    </h3>
                                </div>
                                <Badge className="shrink-0 bg-white/15 text-white hover:bg-white/15">
                                    {review.rating.toFixed(1)} / 5
                                </Badge>
                            </div>
                        </div>

                        <CardContent className="space-y-4 p-5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                {format(
                                    new Date(review.createdAt),
                                    "dd MMM yyyy",
                                )}
                            </div>

                            <ReviewStars value={review.rating} />

                            {review.comment ? (
                                <p className="rounded-2xl border bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
                                    {review.comment}
                                </p>
                            ) : (
                                <p className="rounded-2xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
                                    No written comment was added for this
                                    review.
                                </p>
                            )}

                            {review.reviewMedias.length > 0 && (
                                <div className="flex gap-2">
                                    {review.reviewMedias
                                        .slice(0, 3)
                                        .map((media, index) => (
                                            <div
                                                key={index}
                                                className="relative h-16 w-16 overflow-hidden rounded-xl border"
                                            >
                                                <Image
                                                    src={media.secureUrl}
                                                    alt={`${review.product.title} review image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    {review.reviewMedias.length > 3 && (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-muted text-sm font-medium text-muted-foreground">
                                            +{review.reviewMedias.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button asChild variant="outline" className="w-full">
                                <Link
                                    href={`/products/${review.product.slug}?editReviewId=${review.id}`}
                                >
                                    View product
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
