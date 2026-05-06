"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    adminCategoryKeys,
    adminProductKeys,
    type ListQueryParams,
} from "@/hooks/queries/adminQueryKeys";
import {
    bulkToggleCategories,
    createCategory,
    deleteCategory,
    getAllCategories,
    restoreCategory,
    updateCategory,
} from "@/services/product.services";
import type {
    IBulkCategoryTogglePayload,
    ICategoryListResponse,
    ICreateCategoryPayload,
    IUpdateCategoryPayload,
} from "@/types/product.types";

const emptyCategoriesResponse: ICategoryListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

const invalidateCategoryRelatedQueries = (
    queryClient: ReturnType<typeof useQueryClient>,
) => {
    queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all });
    queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
};

export const useCategoryOptions = () => {
    return useQuery({
        queryKey: adminCategoryKeys.options(),
        queryFn: async () => {
            const response = await getAllCategories(
                undefined,
                1,
                100,
                true,
                false,
            );
            return response ?? { ...emptyCategoriesResponse, limit: 100 };
        },
        staleTime: 60_000,
    });
};

export const useManagedCategories = (page: number, limit = 10) => {
    return useQuery({
        queryKey: adminCategoryKeys.list({ page, limit }),
        queryFn: async () => {
            const response = await getAllCategories(
                undefined,
                page,
                limit,
                undefined,
                undefined,
                "updatedAt",
                "desc",
            );
            return response ?? { ...emptyCategoriesResponse, page, limit };
        },
        staleTime: 30_000,
    });
};

export const useCategoryFormMutation = (
    mode: "create" | "edit",
    categoryId?: string,
) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (
            payload: ICreateCategoryPayload | IUpdateCategoryPayload,
        ) => {
            if (mode === "edit" && categoryId) {
                return await updateCategory(
                    categoryId,
                    payload as IUpdateCategoryPayload,
                );
            }

            return await createCategory(payload as ICreateCategoryPayload);
        },
        onSuccess: () => invalidateCategoryRelatedQueries(queryClient),
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
};

export const useDeleteCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryId: string) => deleteCategory(categoryId),
        onSuccess: () => invalidateCategoryRelatedQueries(queryClient),
    });
};

export const useRestoreCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryId: string) => restoreCategory(categoryId),
        onSuccess: () => invalidateCategoryRelatedQueries(queryClient),
    });
};

export const useUpdateCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            categoryId,
            payload,
        }: {
            categoryId: string;
            payload: IUpdateCategoryPayload;
        }) => updateCategory(categoryId, payload),
        onSuccess: () => invalidateCategoryRelatedQueries(queryClient),
    });
};

export const useBulkToggleCategoriesMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IBulkCategoryTogglePayload) =>
            bulkToggleCategories(payload),
        onSuccess: () => invalidateCategoryRelatedQueries(queryClient),
    });
};
