"use client";

import {
    ICreateReviewPayload,
    IModerateReviewPayload,
    IReviewQueryParams,
    IUpdateReviewPayload,
} from "@/types/customer.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerQueryKeys } from "../constants/query-keys";
import { toQueryKeyString } from "./query-param-utils";
import { customerApiClient } from "../services";

export const usePublicReviews = (params?: IReviewQueryParams) => {
    const searchKey = toQueryKeyString(params as Record<string, unknown>);

    return useQuery({
        queryKey: customerQueryKeys.publicReviews(searchKey),
        queryFn: () => customerApiClient.getAllReviews(params),
    });
};

export const useMyReviews = (params?: IReviewQueryParams) => {
    const searchKey = toQueryKeyString(params as Record<string, unknown>);

    return useQuery({
        queryKey: customerQueryKeys.myReviews(searchKey),
        queryFn: () => customerApiClient.getMyReviews(params),
    });
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ICreateReviewPayload) =>
            customerApiClient.createReview(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};

export const useUpdateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId,
            payload,
        }: {
            reviewId: string;
            payload: IUpdateReviewPayload;
        }) => customerApiClient.updateReview(reviewId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: string) => customerApiClient.deleteReview(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};

export const useModerateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId,
            payload,
        }: {
            reviewId: string;
            payload: IModerateReviewPayload;
        }) => customerApiClient.moderateReview(reviewId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};
