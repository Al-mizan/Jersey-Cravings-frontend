"use client";

import {
    IChangeCustomerStatusPayload,
    ICustomerQueryParams,
    IUpdateMyProfilePayload,
} from "@/types/customer.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerQueryKeys } from "../constants/query-keys";
import { toQueryKeyString } from "./query-param-utils";
import { customerApiClient } from "../services";

export const useMyCustomerProfile = () => {
    return useQuery({
        queryKey: customerQueryKeys.myProfile(),
        queryFn: () => customerApiClient.getMyProfile(),
    });
};

export const useUpdateMyCustomerProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IUpdateMyProfilePayload) =>
            customerApiClient.updateMyProfile(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};

export const useCustomers = (params?: ICustomerQueryParams) => {
    const searchKey = toQueryKeyString(params as Record<string, unknown>);

    return useQuery({
        queryKey: customerQueryKeys.customerList(searchKey),
        queryFn: () => customerApiClient.getAllCustomers(params),
    });
};

export const useCustomerById = (customerId: string) => {
    return useQuery({
        queryKey: customerQueryKeys.customerById(customerId),
        queryFn: () => customerApiClient.getCustomerById(customerId),
        enabled: Boolean(customerId),
    });
};

export const useChangeCustomerStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IChangeCustomerStatusPayload) =>
            customerApiClient.changeCustomerStatus(payload),
        onSuccess: (_result, payload) => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.customerById(payload.customerId),
            });
        },
    });
};

export const useRestoreCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (customerId: string) =>
            customerApiClient.restoreCustomer(customerId),
        onSuccess: (_result, customerId) => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.customerById(customerId),
            });
        },
    });
};
