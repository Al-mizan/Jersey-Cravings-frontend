"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createReview, updateReview } from "@/services/review.service";
import { reviewKeys } from "@/hooks/queries/reviewQueryKeys";
import type { CreateReviewData, UpdateReviewData } from "@/types/review.types";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMediaUrl } from "@/lib/media";
import Image from "next/image";

interface Product {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    slug: string;
    media?: {
        secureUrl: string;
    }[];
}

interface Review {
    id?: string;
    rating: number;
    comment?: string;
    media?: string[];
}

interface WriteReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    existingReview?: Review;
}

export function WriteReviewDialog({
    open,
    onOpenChange,
    product,
    existingReview,
}: WriteReviewDialogProps) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState(existingReview?.comment || "");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<string[]>(
        existingReview?.media || [],
    );
    const [ratingError, setRatingError] = useState("");
    const queryClient = useQueryClient();

    const isEditMode = !!existingReview?.id;

    useEffect(() => {
        if (open) {
            setRating(existingReview?.rating || 0);
            setComment(existingReview?.comment || "");
            setMediaFiles([]);
            setMediaPreviews(existingReview?.media || []);
            setRatingError("");
        }
    }, [open, existingReview]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(
            (file) =>
                file.type.startsWith("image/") &&
                mediaFiles.length + files.length <= 5,
        );

        if (validFiles.length !== files.length) {
            toast.error("You can only upload up to 5 images");
            return;
        }

        setMediaFiles((prev) => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setMediaPreviews((prev) => [
                    ...prev,
                    e.target?.result as string,
                ]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMedia = (index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
        setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const submitMutation = useMutation({
        mutationFn: async () => {
            const reviewData: CreateReviewData | UpdateReviewData = {
                productId: product.id,
                rating,
                comment: comment.trim() || undefined,
                mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
            };

            if (isEditMode && existingReview?.id) {
                return updateReview(
                    existingReview.id,
                    reviewData as UpdateReviewData,
                );
            } else {
                return createReview(reviewData as CreateReviewData);
            }
        },
        onSuccess: () => {
            toast.success(
                isEditMode
                    ? "Review updated successfully"
                    : "Review submitted successfully",
            );
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
        if (rating === 0) {
            setRatingError("Please select a rating");
            return;
        }
        setRatingError("");

        submitMutation.mutate();
    };

    const commentLength = comment.length;
    const maxCommentLength = 500;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Review" : "Write a Review"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Product Info */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="relative w-16 h-16">
                            <Image
                                src={
                                    getMediaUrl(product.media) ||
                                    product.thumbnail ||
                                    "/jersey_cravings.png"
                                }
                                alt={product.title}
                                fill
                                className="object-cover rounded-lg"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                                {product.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                ${product.price.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please rate this product
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRating(i + 1)}
                                    onMouseEnter={() => setHoveredRating(i + 1)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1 transition-colors"
                                >
                                    <Star
                                        className={cn(
                                            "w-8 h-8 transition-colors",
                                            (
                                                hoveredRating
                                                    ? i < hoveredRating
                                                    : i < rating
                                            )
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-300 hover:text-amber-400",
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        {ratingError && (
                            <p className="text-sm text-red-600 mt-1">
                                {ratingError}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label
                            htmlFor="comment"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Describe your experience (optional)
                        </label>
                        <Textarea
                            id="comment"
                            placeholder="Share your thoughts about this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={maxCommentLength}
                            rows={4}
                            className="resize-none"
                        />
                        <p className="text-sm text-gray-500 mt-1 text-right">
                            {commentLength}/{maxCommentLength}
                        </p>
                    </div>

                    {/* Media Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Photos (optional)
                        </label>
                        <div className="space-y-3">
                            {mediaPreviews.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {mediaPreviews.map((preview, index) => (
                                        <div
                                            key={index}
                                            className="relative group"
                                        >
                                            <div className="relative w-20 h-20">
                                                <Image
                                                    src={preview}
                                                    alt={`Upload ${index + 1}`}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMedia(index)
                                                }
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {mediaPreviews.length < 5 && (
                                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500">
                                                Add
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            )}

                            {mediaPreviews.length === 0 && (
                                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 mb-1">
                                        Click to upload images
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 5 images
                                    </p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
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
                                ? isEditMode
                                    ? "Updating..."
                                    : "Submitting..."
                                : isEditMode
                                  ? "Update Review"
                                  : "Submit Review"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
