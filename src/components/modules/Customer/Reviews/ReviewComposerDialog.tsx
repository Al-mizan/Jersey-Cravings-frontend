"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/media";
import { createReview } from "@/services/review.service";
import { reviewKeys } from "@/hooks/queries/reviewQueryKeys";
import type { PendingReviewItem } from "@/types/review.types";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ReviewComposerDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: PendingReviewItem | null;
};

export function ReviewComposerDialog({
    open,
    onOpenChange,
    item,
}: ReviewComposerDialogProps) {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        setRating(0);
        setHoveredRating(0);
        setComment("");
    }, [open, item]);

    const submitMutation = useMutation({
        mutationFn: async () => {
            if (!item) {
                throw new Error("No product selected for review");
            }

            return createReview({
                productId: item.product.id,
                rating,
                comment: comment.trim() || undefined,
            });
        },
        onSuccess: () => {
            toast.success("Review submitted successfully");
            queryClient.invalidateQueries({ queryKey: reviewKeys.all });
            queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
            queryClient.invalidateQueries({ queryKey: reviewKeys.reviewed() });
            onOpenChange(false);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleSubmit = () => {
        if (!item) {
            return;
        }

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        submitMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>

                {!item ? null : (
                    <div className="space-y-6">
                        <div
                            className="overflow-hidden rounded-3xl border"
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg, hsl(var(--muted) / 0.6) 0%, hsl(var(--background)) 55%, hsl(var(--muted) / 0.4) 100%)",
                            }}
                        >
                            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                                <div className="relative h-24 w-full overflow-hidden rounded-2xl sm:h-20 sm:w-20">
                                    <Image
                                        src={
                                            getMediaUrl(item.product.media) ||
                                            item.product.thumbNail ||
                                            item.product.thumbnail ||
                                            "/jersey_cravings.png"
                                        }
                                        alt={item.product.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span>Order #{item.orderNumber}</span>
                                        <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                                        <span>
                                            {format(
                                                new Date(item.orderDate),
                                                "PPP",
                                            )}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold leading-tight">
                                        {item.product.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        {item.customPlayerName && (
                                            <span className="rounded-full border bg-background px-3 py-1">
                                                Custom Name:{" "}
                                                {item.customPlayerName}
                                            </span>
                                        )}
                                        {item.customJerseyNumber && (
                                            <span className="rounded-full border bg-background px-3 py-1">
                                                Custom Number:{" "}
                                                {item.customJerseyNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border bg-background px-4 py-3 text-right">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                        Price
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">
                                        ৳{item.price.toLocaleString("en-US")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                Rate your experience
                            </label>
                            <ReviewStars
                                value={hoveredRating || rating}
                                interactive
                                onValueChange={setRating}
                                onHoverChange={setHoveredRating}
                            />
                        </div>

                        <div className="space-y-3">
                            <label
                                htmlFor="review-comment"
                                className="text-sm font-medium"
                            >
                                Share a few details
                            </label>
                            <Textarea
                                id="review-comment"
                                value={comment}
                                onChange={(event) =>
                                    setComment(event.target.value)
                                }
                                placeholder="Tell other customers what stood out about this product..."
                                rows={5}
                                maxLength={500}
                                className="resize-none"
                            />
                            <p className="text-right text-xs text-muted-foreground">
                                {comment.length}/500
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={submitMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitMutation.isPending}
                            >
                                {submitMutation.isPending
                                    ? "Submitting..."
                                    : "Submit Review"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

type ReviewStarsProps = {
    value: number;
    interactive?: boolean;
    onValueChange?: (value: number) => void;
    onHoverChange?: (value: number) => void;
};

export function ReviewStars({
    value,
    interactive = false,
    onValueChange,
    onHoverChange,
}: ReviewStarsProps) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= value;

                if (!interactive) {
                    return (
                        <Star
                            key={star}
                            className={cn(
                                "h-5 w-5",
                                filled
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30",
                            )}
                        />
                    );
                }

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onValueChange?.(star)}
                        onMouseEnter={() => onHoverChange?.(star)}
                        onMouseLeave={() => onHoverChange?.(0)}
                        className="rounded-full p-1 transition-transform hover:scale-110"
                        aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                    >
                        <Star
                            className={cn(
                                "h-6 w-6 transition-colors",
                                filled
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30",
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
