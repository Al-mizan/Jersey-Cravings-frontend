"use client";

import { customerApiClient } from "@/features/customers/services/customer.api";
import {
    IAddressQueryParams,
    ICreateAddressPayload,
    IUpdateAddressPayload,
} from "@/types/customer.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerQueryKeys } from "../constants/query-keys";
import { toQueryKeyString } from "./query-param-utils";

export const useMyAddresses = (params?: IAddressQueryParams) => {
    const searchKey = toQueryKeyString(params as Record<string, unknown>);

    return useQuery({
        queryKey: customerQueryKeys.myAddresses(searchKey),
        queryFn: () => customerApiClient.getMyAddresses(params),
    });
};

export const useCreateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ICreateAddressPayload) =>
            customerApiClient.createAddress(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};

export const useUpdateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            addressId,
            payload,
        }: {
            addressId: string;
            payload: IUpdateAddressPayload;
        }) => customerApiClient.updateAddress(addressId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};

export const useDeleteAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (addressId: string) => customerApiClient.deleteAddress(addressId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: customerQueryKeys.all,
            });
        },
    });
};

export const useCustomerAddressesForAdmin = (customerId: string) => {
    return useQuery({
        queryKey: customerQueryKeys.customerAddresses(customerId),
        queryFn: () => customerApiClient.getCustomerAddressesForAdmin(customerId),
        enabled: Boolean(customerId),
    });
};
