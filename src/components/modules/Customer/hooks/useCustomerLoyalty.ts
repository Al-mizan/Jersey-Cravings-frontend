"use client";

import {
    IPointTransactionQueryParams,
    IUpdateLoyaltySettingPayload,
} from "@/types/customer.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerQueryKeys } from "../constants/query-keys";
import { toQueryKeyString } from "./query-param-utils";
import { customerApiClient } from "../services";

export const useMyLoyaltySummary = () => {
    return useQuery({
        queryKey: customerQueryKeys.myLoyaltySummary(),
        queryFn: () => customerApiClient.getMyLoyaltySummary(),
    });
};

export const useMyPointTransactions = (
    params?: IPointTransactionQueryParams,
) => {
    const searchKey = toQueryKeyString(params as Record<string, unknown>);

    return useQuery({
        queryKey: customerQueryKeys.myPointTransactions(searchKey),
        queryFn: () => customerApiClient.getMyPointTransactions(params),
    });
};

export const useActiveLoyaltySetting = () => {
    return useQuery({
        queryKey: customerQueryKeys.activeLoyaltySetting(),
        queryFn: () => customerApiClient.getActiveLoyaltySetting(),
    });
};

export const useUpdateLoyaltySetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IUpdateLoyaltySettingPayload) =>
            customerApiClient.updateLoyaltySetting(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};

export const useCustomerLoyaltyByAdmin = (customerId: string) => {
    return useQuery({
        queryKey: customerQueryKeys.customerLoyalty(customerId),
        queryFn: () => customerApiClient.getCustomerLoyaltyByAdmin(customerId),
        enabled: Boolean(customerId),
    });
};
