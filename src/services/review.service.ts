"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, safeServiceMutation } from "@/services/service-utils";
import type {
    PendingProduct,
    Review,
    CreateReviewData,
    UpdateReviewData,
} from "@/types/review.types";

const REVIEW_ENDPOINTS = {
    pending: "/reviews/pending",
    myReviews: "/reviews/my-reviews",
    reviews: "/reviews",
    review: (id: string) => `/reviews/${id}`,
};

export async function getPendingReviews(): Promise<PendingProduct[]> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<PendingProduct[]>(
                REVIEW_ENDPOINTS.pending,
            );
            return response.data;
        },
        [],
        "Failed to fetch pending reviews:",
    );
}

export async function getMyReviews(): Promise<Review[]> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<Review[]>(
                REVIEW_ENDPOINTS.myReviews,
            );
            return response.data;
        },
        [],
        "Failed to fetch reviews:",
    );
}

export async function getReviewById(id: string): Promise<Review | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<Review>(
                REVIEW_ENDPOINTS.review(id),
            );
            return response.data;
        },
        null,
        "Failed to fetch review:",
    );
}

export async function createReview(data: CreateReviewData): Promise<Review> {
    return safeServiceMutation(async () => {
        const formData = new FormData();
        formData.append("productId", data.productId);
        formData.append("rating", data.rating.toString());

        if (data.comment) {
            formData.append("comment", data.comment);
        }

        if (data.mediaFiles) {
            data.mediaFiles.forEach((file) => {
                formData.append("mediaFiles", file);
            });
        }

        const response = await httpClient.post<Review>(
            REVIEW_ENDPOINTS.reviews,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return response.data;
    }, "Failed to create review:");
}

export async function updateReview(
    id: string,
    data: UpdateReviewData,
): Promise<Review> {
    return safeServiceMutation(async () => {
        const formData = new FormData();

        if (data.rating !== undefined) {
            formData.append("rating", data.rating.toString());
        }

        if (data.comment !== undefined) {
            formData.append("comment", data.comment);
        }

        if (data.mediaFiles) {
            data.mediaFiles.forEach((file) => {
                formData.append("mediaFiles", file);
            });
        }

        const response = await httpClient.patch<Review>(
            REVIEW_ENDPOINTS.review(id),
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return response.data;
    }, "Failed to update review:");
}
