"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WriteReviewDialog } from "@/components/modules/reviews/write-review-dialog";
import { useQuery } from "@tanstack/react-query";
import { getReviewById } from "@/services/review.service";

interface Product {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    slug: string;
}

interface Review {
    id: string;
    rating: number;
    comment?: string;
    media?: string[];
}

interface UseReviewDialogProps {
    product: Product;
}

function ReviewDialogContent({ product }: { product: Product }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const reviewParam = searchParams.get("review");
    const editId = searchParams.get("edit");

    const { data: existingReview } = useQuery({
        queryKey: ["review", editId],
        queryFn: () => (editId ? getReviewById(editId) : Promise.resolve(null)),
        enabled: !!editId,
    });

    useEffect(() => {
        if (reviewParam === "true") {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [reviewParam]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // Remove query parameters when closing
            const params = new URLSearchParams(searchParams.toString());
            params.delete("review");
            params.delete("edit");
            router.replace(`${window.location.pathname}?${params.toString()}`, {
                scroll: false,
            });
        }
    };

    return (
        <WriteReviewDialog
            open={open}
            onOpenChange={handleOpenChange}
            product={product}
            existingReview={existingReview || undefined}
        />
    );
}

export function useReviewDialog({ product }: UseReviewDialogProps) {
    return function ReviewDialogWrapper() {
        return (
            <Suspense fallback={null}>
                <ReviewDialogContent product={product} />
            </Suspense>
        );
    };
}
