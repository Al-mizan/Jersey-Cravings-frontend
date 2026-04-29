"use server";

import { orderApiClient } from "@/lib/axios/orderApiClient";
import type {
    IOrder,
    IOrderListResponse,
    IPaymentListResponse,
    IPayment,
} from "@/types/order.types";

// Orders
export async function getMyOrders(
    status?: string,
    page: number = 1,
    limit: number = 10,
): Promise<IOrderListResponse | null> {
    try {
        return await orderApiClient.getMyOrders(status, page, limit);
    } catch (error) {
        console.error("Failed to fetch my orders:", error);
        return null;
    }
}

export async function getMyOrderById(orderId: string): Promise<IOrder | null> {
    try {
        return await orderApiClient.getMyOrderById(orderId);
    } catch (error) {
        console.error("Failed to fetch order:", error);
        return null;
    }
}

export async function getAllOrders(
    searchTerm?: string,
    status?: string,
    paymentStatus?: string,
    needsManualReview?: boolean,
    page: number = 1,
    limit: number = 10,
): Promise<IOrderListResponse | null> {
    try {
        return await orderApiClient.getAllOrders(
            searchTerm,
            status,
            paymentStatus,
            needsManualReview,
            page,
            limit,
        );
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return null;
    }
}

export async function getOrderById(orderId: string): Promise<IOrder | null> {
    try {
        return await orderApiClient.getOrderById(orderId);
    } catch (error) {
        console.error("Failed to fetch order:", error);
        return null;
    }
}

// Payments
export async function getMyPayments(
    page: number = 1,
    limit: number = 10,
): Promise<IPaymentListResponse | null> {
    try {
        return await orderApiClient.getMyPayments(page, limit);
    } catch (error) {
        console.error("Failed to fetch payments:", error);
        return null;
    }
}

export async function getPaymentByOrder(
    orderId: string,
): Promise<IPayment | null> {
    try {
        return await orderApiClient.getPaymentByOrder(orderId);
    } catch (error) {
        console.error("Failed to fetch payment:", error);
        return null;
    }
}

export async function getAllPayments(
    status?: string,
    page: number = 1,
    limit: number = 10,
): Promise<IPaymentListResponse | null> {
    try {
        return await orderApiClient.getAllPayments(status, page, limit);
    } catch (error) {
        console.error("Failed to fetch payments:", error);
        return null;
    }
}
