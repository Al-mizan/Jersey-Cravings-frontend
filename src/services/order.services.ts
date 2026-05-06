import { orderApiClient } from "@/lib/axios/orderApiClient";
import { safeServiceCall, safeServiceMutation } from "@/services/service-utils";
import type {
    ICreateOrderPayload,
    IOrder,
    IOrderListResponse,
    IPaymentListResponse,
    IPayment,
} from "@/types/order.types";

export async function createMyOrder(
    payload: ICreateOrderPayload,
): Promise<IOrder> {
    return safeServiceMutation(
        () => orderApiClient.createMyOrder(payload),
        "Failed to create order:",
    );
}

// Orders
export async function getMyOrders(
    status?: string,
    page: number = 1,
    limit: number = 10,
): Promise<IOrderListResponse | null> {
    return safeServiceCall(
        () => orderApiClient.getMyOrders(status, page, limit),
        null,
        "Failed to fetch my orders:",
    );
}

export async function getMyOrderById(orderId: string): Promise<IOrder | null> {
    return safeServiceCall(
        () => orderApiClient.getMyOrderById(orderId),
        null,
        "Failed to fetch order:",
    );
}

export async function getAllOrders(
    searchTerm?: string,
    status?: string,
    paymentStatus?: string,
    needsManualReview?: boolean,
    page: number = 1,
    limit: number = 10,
): Promise<IOrderListResponse | null> {
    return safeServiceCall(
        () =>
            orderApiClient.getAllOrders(
                searchTerm,
                status,
                paymentStatus,
                needsManualReview,
                page,
                limit,
            ),
        null,
        "Failed to fetch orders:",
    );
}

export async function getOrderById(orderId: string): Promise<IOrder | null> {
    return safeServiceCall(
        () => orderApiClient.getOrderById(orderId),
        null,
        "Failed to fetch order:",
    );
}

// Payments
export async function getMyPayments(
    page: number = 1,
    limit: number = 10,
): Promise<IPaymentListResponse | null> {
    return safeServiceCall(
        () => orderApiClient.getMyPayments(page, limit),
        null,
        "Failed to fetch payments:",
    );
}

export async function getPaymentByOrder(
    orderId: string,
): Promise<IPayment | null> {
    return safeServiceCall(
        () => orderApiClient.getPaymentByOrder(orderId),
        null,
        "Failed to fetch payment:",
    );
}

export async function getAllPayments(
    status?: string,
    page: number = 1,
    limit: number = 10,
): Promise<IPaymentListResponse | null> {
    return safeServiceCall(
        () => orderApiClient.getAllPayments(status, page, limit),
        null,
        "Failed to fetch payments:",
    );
}
