"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commerceQueryKeys } from "../constants/query-keys";
import {
    clearMyCart,
    getActivePickupLocations,
    getMyCart,
    removeMyCartItem,
    updateMyCartItem,
} from "@/services/commerce.services";

export const useMyCart = () => {
    return useQuery({
        queryKey: commerceQueryKeys.myCart(),
        queryFn: () => getMyCart(),
        staleTime: 30_000,
    });
};

export const useUpdateMyCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, qty }: { itemId: string; qty: number }) =>
            updateMyCartItem(itemId, { qty }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: commerceQueryKeys.myCart(),
            });
        },
    });
};

export const useRemoveMyCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: string) => removeMyCartItem(itemId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: commerceQueryKeys.myCart(),
            });
        },
    });
};

export const useClearMyCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => clearMyCart(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: commerceQueryKeys.myCart(),
            });
        },
    });
};

export const useActivePickupLocations = () => {
    return useQuery({
        queryKey: commerceQueryKeys.activePickupLocations(),
        queryFn: () => getActivePickupLocations(),
        staleTime: 30_000,
    });
};
