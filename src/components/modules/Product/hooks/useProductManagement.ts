"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    adminProductKeys,
    type AdminProductListQueryParams,
} from "@/hooks/queries/adminQueryKeys";
import {
    bulkArchiveProducts,
    bulkPublishProducts,
    createProduct,
    deleteProduct,
    getAllProducts,
    updateProduct,
    updateProductStatus,
} from "@/services/product.services";
import type {
    ICreateProductPayload,
    IProduct,
    IProductListResponse,
    IUpdateProductPayload,
    IUpdateProductStatusPayload,
    IBulkProductActionPayload,
} from "@/types/product.types";

const emptyProductsResponse: IProductListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

const invalidateProductQueries = (
    queryClient: ReturnType<typeof useQueryClient>,
) => {
    queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
};

export const useAdminProducts = (params: AdminProductListQueryParams) => {
    return useQuery({
        queryKey: adminProductKeys.list(params),
        queryFn: async () => {
            const response = await getAllProducts(
                params.searchTerm || undefined,
                params.status,
                params.categoryId,
                params.page,
                params.limit,
                false,
                params.sortBy,
                params.sortOrder,
            );
            return response ?? { ...emptyProductsResponse, page: params.page };
        },
        placeholderData: (previousData) => previousData,
        staleTime: 30_000,
    });
};

export const useProductFormMutation = (
    mode: "create" | "edit",
    productId?: string,
) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (
            payload: ICreateProductPayload | IUpdateProductPayload,
        ) => {
            if (mode === "edit" && productId) {
                return await updateProduct(
                    productId,
                    payload as IUpdateProductPayload,
                );
            }

            return await createProduct(payload as ICreateProductPayload);
        },
        onSuccess: () => invalidateProductQueries(queryClient),
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
};

export const useDeleteAdminProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => deleteProduct(productId),
        onSuccess: () => invalidateProductQueries(queryClient),
    });
};

export const useUpdateAdminProductStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            payload,
        }: {
            productId: string;
            payload: IUpdateProductStatusPayload;
        }) => updateProductStatus(productId, payload),
        onSuccess: () => invalidateProductQueries(queryClient),
    });
};

export const useBulkPublishAdminProducts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IBulkProductActionPayload) =>
            bulkPublishProducts(payload),
        onSuccess: () => invalidateProductQueries(queryClient),
    });
};

export const useBulkArchiveAdminProducts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IBulkProductActionPayload) =>
            bulkArchiveProducts(payload),
        onSuccess: () => invalidateProductQueries(queryClient),
    });
};
