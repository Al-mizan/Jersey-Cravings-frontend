"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall } from "@/services/service-utils";
import type { IAdminOrder, IAdminOrderListResponse } from "@/types/order.types";

const ORDER_ENDPOINTS = {
    orders: "/orders",
};

export async function getAllOrdersForAdmin(
    searchTerm?: string,
    status?: string,
    paymentStatus?: string,
    needsManualReview?: boolean,
    userId?: string,
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
): Promise<IAdminOrderListResponse | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<IAdminOrder[]>(
                ORDER_ENDPOINTS.orders,
                {
                    params: {
                        searchTerm,
                        status,
                        paymentStatus,
                        needsManualReview,
                        userId,
                        page,
                        limit,
                        sortBy,
                        sortOrder,
                    },
                },
            );

            const data = response.data;

            return {
                data,
                page: response.meta?.page ?? page,
                limit: response.meta?.limit ?? limit,
                total: response.meta?.total ?? data.length,
                totalPages: response.meta?.totalPages ?? 1,
            };
        },
        null,
        "Failed to fetch orders:",
    );
}
