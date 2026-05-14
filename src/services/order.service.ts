"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall } from "@/services/service-utils";
import type {
    IAdminOrder,
    IAdminOrderListResponse,
    IPayment,
    IPaymentListResponse,
    ICollectCodPayload,
    IRefundPaymentPayload,
    IUpdateOrderStatusPayload,
} from "@/types/order.types";

const ORDER_ENDPOINTS = {
    orders: "/orders",
    payments: "/payments",
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

export async function getOrderByIdForAdmin(
    orderId: string,
): Promise<IAdminOrder | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<IAdminOrder>(
                `${ORDER_ENDPOINTS.orders}/${orderId}`,
            );
            return response.data;
        },
        null,
        "Failed to fetch order:",
    );
}

export async function getAllPaymentsForAdmin(
    searchTerm?: string,
    method?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
): Promise<IPaymentListResponse | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<IPayment[]>(
                ORDER_ENDPOINTS.payments,
                {
                    params: {
                        searchTerm,
                        method,
                        status,
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
        "Failed to fetch payments:",
    );
}

export async function updateOrderStatus(
    orderId: string,
    payload: IUpdateOrderStatusPayload,
): Promise<IAdminOrder | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.patch<IAdminOrder>(
                `${ORDER_ENDPOINTS.orders}/${orderId}/status`,
                payload,
            );
            return response.data;
        },
        null,
        "Failed to update order status:",
    );
}

export async function collectCod(
    paymentId: string,
    payload: ICollectCodPayload,
): Promise<IPayment | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.patch<IPayment>(
                `${ORDER_ENDPOINTS.payments}/${paymentId}/collect-cod`,
                payload,
            );
            return response.data;
        },
        null,
        "Failed to collect COD:",
    );
}

export async function refundPayment(
    paymentId: string,
    payload: IRefundPaymentPayload,
): Promise<IPayment | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.patch<IPayment>(
                `${ORDER_ENDPOINTS.payments}/${paymentId}/refund`,
                payload,
            );
            return response.data;
        },
        null,
        "Failed to refund payment:",
    );
}
