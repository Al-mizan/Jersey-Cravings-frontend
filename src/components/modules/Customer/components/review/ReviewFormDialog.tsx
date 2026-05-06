"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IReview } from "@/types/customer.types";
import { createReviewZodSchema, updateReviewZodSchema } from "@/zod/customer.validation";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateReview, useUpdateReview } from "../../hooks";

interface ReviewFormDialogProps {
    isOpen: boolean;
    onOpenChange: (nextOpen: boolean) => void;
    initialReview?: IReview;
}

export const ReviewFormDialog = ({
    isOpen,
    onOpenChange,
    initialReview,
}: ReviewFormDialogProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const { mutateAsync: createReview, isPending: isCreatingReview } = useCreateReview();
    const { mutateAsync: updateReview, isPending: isUpdatingReview } = useUpdateReview();

    const isEditMode = Boolean(initialReview);
    const isPending = isCreatingReview || isUpdatingReview;

    const form = useForm({
        defaultValues: {
            productId: initialReview?.productId ?? "",
            rating: initialReview?.rating ?? 5,
            comment: initialReview?.comment ?? "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null);

            try {
                if (isEditMode && initialReview) {
                    const updatePayload = {
                        rating: Number(value.rating),
                        comment: value.comment.trim() || undefined,
                    };

                    const validationResult = updateReviewZodSchema.safeParse(updatePayload);

                    if (!validationResult.success) {
                        setServerError(
                            validationResult.error.issues[0]?.message ?? "Validation failed",
                        );
                        return;
                    }

                    await updateReview({
                        reviewId: initialReview.id,
                        payload: validationResult.data,
                    });

                    toast.success("Review updated successfully");
                    onOpenChange(false);
                    return;
                }

                const createPayload = {
                    productId: value.productId.trim(),
                    rating: Number(value.rating),
                    comment: value.comment.trim() || undefined,
                };

                const validationResult = createReviewZodSchema.safeParse(createPayload);

                if (!validationResult.success) {
                    setServerError(
                        validationResult.error.issues[0]?.message ?? "Validation failed",
                    );
                    return;
                }

                await createReview(validationResult.data);
                toast.success("Review created successfully");
                onOpenChange(false);
            } catch (error) {
                setServerError(
                    error instanceof Error ? error.message : "Unable to submit review",
                );
            }
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Review" : "Create Review"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update your rating or feedback."
                            : "Share your experience for a product."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    {!isEditMode && (
                        <form.Field
                            name="productId"
                            validators={{ onChange: createReviewZodSchema.shape.productId }}
                        >
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Product ID"
                                    placeholder="Enter product ID"
                                />
                            )}
                        </form.Field>
                    )}

                    <form.Field name="rating">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor={field.name}>Rating (1-5)</Label>
                                <input
                                    id={field.name}
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                        field.handleChange(Number(event.target.value))
                                    }
                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                />
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="comment">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor={field.name}>Comment</Label>
                                <Textarea
                                    id={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    rows={4}
                                    placeholder="Share your thoughts"
                                />
                            </div>
                        )}
                    </form.Field>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <AppSubmitButton
                                    isPending={isSubmitting || isPending}
                                    pendingLabel={isEditMode ? "Updating..." : "Submitting..."}
                                    disabled={!canSubmit}
                                >
                                    {isEditMode ? "Update Review" : "Create Review"}
                                </AppSubmitButton>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
