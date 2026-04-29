"use client";

import { customerApiClient } from "@/features/customers/services/customer.api";
import {
    IOverrideReferralStatusPayload,
    IReferralEventQueryParams,
} from "@/types/customer.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerQueryKeys } from "../constants/query-keys";
import { toQueryKeyString } from "./query-param-utils";

export const useMyReferralCode = () => {
    return useQuery({
        queryKey: customerQueryKeys.myReferralCode(),
        queryFn: () => customerApiClient.getOrCreateMyReferralCode(),
    });
};

export const useMyReferralEvents = (params?: IReferralEventQueryParams) => {
    const searchKey = toQueryKeyString(params as Record<string, unknown>);

    return useQuery({
        queryKey: customerQueryKeys.myReferralEvents(searchKey),
        queryFn: () => customerApiClient.getMyReferralEvents(params),
    });
};

export const useAdminReferralEvents = (
    params?: IReferralEventQueryParams,
) => {
    const searchKey = toQueryKeyString(params as Record<string, unknown>);

    return useQuery({
        queryKey: customerQueryKeys.adminReferralEvents(searchKey),
        queryFn: () => customerApiClient.getAllReferralEventsForAdmin(params),
    });
};

export const useOverrideReferralStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IOverrideReferralStatusPayload) =>
            customerApiClient.overrideReferralStatus(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};
