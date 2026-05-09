"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, safeServiceMutation } from "@/services/service-utils";
import { ApiResponse } from "@/types/api.types";
import type {
    IChangeCustomerStatusPayload,
    ICustomerAdminListResponse,
    ICustomerProfile,
    ICustomerQueryParams,
    IUpdateMyProfilePayload,
} from "@/types/customer.types";

const CUSTOMER_PROFILE_ENDPOINTS = {
    base: "/customers/profile",
};

const unwrapData = async <TData>(
    request: Promise<ApiResponse<TData>>,
): Promise<TData> => {
    const response = await request;
    return response.data;
};

export async function getMyProfile(): Promise<ICustomerProfile | null> {
    return safeServiceCall(
        () =>
            unwrapData<ICustomerProfile>(
                httpClient.get(`${CUSTOMER_PROFILE_ENDPOINTS.base}/me`),
            ),
        null,
        "Failed to fetch customer profile:",
    );
}

export async function updateMyProfile(
    payload: IUpdateMyProfilePayload | FormData,
): Promise<ICustomerProfile> {
    return safeServiceMutation(
        () =>
            unwrapData<ICustomerProfile>(
                httpClient.patch(`${CUSTOMER_PROFILE_ENDPOINTS.base}/me`, payload),
            ),
        "Failed to update profile:",
    );
}

export async function getAllCustomers(
    searchTerm?: string,
    page: number = 1,
    limit: number = 10,
    isDeleted?: boolean,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
): Promise<ICustomerAdminListResponse | null> {
    const params: ICustomerQueryParams & Record<string, unknown> = {
        searchTerm,
        page,
        limit,
        sortBy,
        sortOrder,
    };

    if (typeof isDeleted === "boolean") {
        params.isDeleted = isDeleted;
    }

    return safeServiceCall(
        async () => {
            const response = await httpClient.get<ICustomerProfile[]>(
                CUSTOMER_PROFILE_ENDPOINTS.base,
                { params },
            );

            return {
                data: response.data,
                page: response.meta?.page ?? page,
                limit: response.meta?.limit ?? limit,
                total: response.meta?.total ?? response.data.length,
                totalPages: response.meta?.totalPages ?? 1,
            };
        },
        null,
        "Failed to fetch customers:",
    );
}

export async function getCustomerById(
    customerId: string,
): Promise<ICustomerProfile | null> {
    return safeServiceCall(
        () =>
            unwrapData<ICustomerProfile>(
                httpClient.get(`${CUSTOMER_PROFILE_ENDPOINTS.base}/${customerId}`),
            ),
        null,
        "Failed to fetch customer:",
    );
}

export async function changeCustomerStatus(payload: IChangeCustomerStatusPayload): Promise<unknown> {
    return safeServiceMutation(
        () =>
            unwrapData(
                httpClient.patch(`${CUSTOMER_PROFILE_ENDPOINTS.base}/status`, payload),
            ),
        "Failed to change customer status:",
    );
}

export async function restoreCustomer(customerId: string): Promise<unknown> {
    return safeServiceMutation(
        () =>
            unwrapData(
                httpClient.patch(`${CUSTOMER_PROFILE_ENDPOINTS.base}/${customerId}/restore`, {}),
            ),
        "Failed to restore customer:",
    );
}
