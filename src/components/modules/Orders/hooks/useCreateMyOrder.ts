"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMyOrder } from "@/services/order.services";
import { commerceQueryKeys } from "@/components/modules/Commerce/constants/query-keys";
import { orderQueryKeys } from "@/hooks/queries/orderQueryKeys";

export const useCreateMyOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createMyOrder,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: commerceQueryKeys.myCart(),
                }),
                queryClient.invalidateQueries({
                    queryKey: orderQueryKeys.myOrders.all,
                }),
            ]);
        },
    });
};
