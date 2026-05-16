import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IReview } from "@/types/customer.types";
import { getMediaUrl } from "@/lib/media";
import { Star } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";


export const renderStars = (rating: number, className?: string) => {
    const fullStars = Math.round(rating);
    return Array.from({ length: 5 }, (_, index) => (
        <Star
            key={index}
            className={cn(
                "size-4",
                index < fullStars
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground",
                className,
            )}
        />
    ));
};


export function ReviewsSection({
    averageRating,
    reviewCount,
    reviews,
    isLoading,
}: {
    averageRating: number;
    reviewCount: number;
    reviews: IReview[];
    isLoading: boolean;
}) {
    const ratingCounts = useMemo(() => {
        return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: reviews.filter((review) => review.rating === star).length,
        }));
    }, [reviews]);

    const totalReviews = reviews.length || reviewCount || 0;

    return (
        <div id="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold">Ratings & Reviews</p>
                    <p className="text-xs text-muted-foreground">
                        Verified customer feedback
                    </p>
                </div>
                <Badge variant="outline">{reviewCount} total</Badge>
            </div>

            <Card className="border-border/60">
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-4xl font-bold">
                                {averageRating.toFixed(1)}
                            </p>
                            <div className="flex items-center gap-1">
                                {renderStars(averageRating)}
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            {ratingCounts.map((entry) => {
                                const percent = totalReviews
                                    ? Math.round(
                                          (entry.count / totalReviews) * 100,
                                      )
                                    : 0;
                                return (
                                    <div
                                        key={entry.star}
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        <span className="w-8 text-muted-foreground">
                                            {entry.star} star
                                        </span>
                                        <div className="h-2 flex-1 rounded-full bg-muted">
                                            <div
                                                className="h-2 rounded-full bg-amber-500"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <span className="w-8 text-right text-muted-foreground">
                                            {entry.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <Card className="border-border/60">
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Be the first to review this product
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <Card key={review.id} className="border-border/60">
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        {review.customer?.profilePhoto ? (
                                            <AvatarImage
                                                src={
                                                    review.customer.profilePhoto
                                                }
                                                alt={
                                                    review.customer?.name ||
                                                    "User"
                                                }
                                            />
                                        ) : null}
                                        <AvatarFallback>
                                            {(
                                                review.customer?.name || "U"
                                            ).charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {review.customer?.name ||
                                                "Anonymous"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(
                                                review.createdAt,
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {renderStars(review.rating, "size-3.5")}
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-muted-foreground">
                                        {review.comment}
                                    </p>
                                )}
                                {review.reviewMedias.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {review.reviewMedias.map((media) => (
                                            <div
                                                key={media.id}
                                                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                                            >
                                                {media.resourceType ===
                                                "video" ? (
                                                    <video
                                                        className="h-full w-full object-cover"
                                                        controls
                                                        preload="metadata"
                                                    >
                                                        <source
                                                            src={getMediaUrl(media)}
                                                            type="video/mp4"
                                                        />
                                                    </video>
                                                ) : (
                                                    <Image
                                                        src={getMediaUrl(media)}
                                                        alt="Review media"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}