import { httpClient } from "./httpClient";
import type {
    ICollectCodPayload,
    ICreateOrderPayload,
    IInitiatePaymentPayload,
    IOrder,
    IOrderListResponse,
    IRefundPaymentPayload,
    IUpdateOrderStatusPayload,
    IPayment,
    IPaymentListResponse,
} from "@/types/order.types";
import type { IApiResponse } from "@/types/auth.types";

class OrderApiClient {
    // Customer Orders
    async createMyOrder(payload: ICreateOrderPayload): Promise<IOrder> {
        const { data } = await httpClient.post<IApiResponse<IOrder>>(
            "/orders/my",
            payload,
        );
        return data.data as IOrder;
    }

    async getMyOrders(
        status?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<IOrderListResponse> {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const { data } = await httpClient.get<IApiResponse<IOrderListResponse>>(
            `/orders/my?${params.toString()}`,
        );
        return data.data as IOrderListResponse;
    }

    async getMyOrderById(orderId: string): Promise<IOrder> {
        const { data } = await httpClient.get<IApiResponse<IOrder>>(
            `/orders/my/${orderId}`,
        );
        return data.data as IOrder;
    }

    async cancelMyOrder(orderId: string): Promise<IOrder> {
        const { data } = await httpClient.patch<IApiResponse<IOrder>>(
            `/orders/my/${orderId}/cancel`,
            {},
        );
        return data.data as IOrder;
    }

    // Admin Orders
    async getAllOrders(
        searchTerm?: string,
        status?: string,
        paymentStatus?: string,
        needsManualReview?: boolean,
        page: number = 1,
        limit: number = 10,
    ): Promise<IOrderListResponse> {
        const params = new URLSearchParams();
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (status) params.append("status", status);
        if (paymentStatus) params.append("paymentStatus", paymentStatus);
        if (needsManualReview !== undefined)
            params.append("needsManualReview", String(needsManualReview));
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const { data } = await httpClient.get<IApiResponse<IOrderListResponse>>(
            `/orders?${params.toString()}`,
        );
        return data.data as IOrderListResponse;
    }

    async getOrderById(orderId: string): Promise<IOrder> {
        const { data } = await httpClient.get<IApiResponse<IOrder>>(
            `/orders/${orderId}`,
        );
        return data.data as IOrder;
    }

    async updateOrderStatus(
        orderId: string,
        payload: IUpdateOrderStatusPayload,
    ): Promise<IOrder> {
        const { data } = await httpClient.patch<IApiResponse<IOrder>>(
            `/orders/${orderId}/status`,
            payload,
        );
        return data.data as IOrder;
    }

    // Payments
    async initiatePayment(payload: IInitiatePaymentPayload): Promise<IPayment> {
        const { data } = await httpClient.post<IApiResponse<IPayment>>(
            "/payments/initiate",
            payload,
        );
        return data.data as IPayment;
    }

    async getMyPayments(
        page: number = 1,
        limit: number = 10,
    ): Promise<IPaymentListResponse> {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const { data } = await httpClient.get<
            IApiResponse<IPaymentListResponse>
        >(`/payments/my?${params.toString()}`);
        return data.data as IPaymentListResponse;
    }

    async getPaymentByOrder(orderId: string): Promise<IPayment> {
        const { data } = await httpClient.get<IApiResponse<IPayment>>(
            `/payments/my/order/${orderId}`,
        );
        return data.data as IPayment;
    }

    async getAllPayments(
        status?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<IPaymentListResponse> {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const { data } = await httpClient.get<
            IApiResponse<IPaymentListResponse>
        >(`/payments?${params.toString()}`);
        return data.data as IPaymentListResponse;
    }

    async refundPayment(
        paymentId: string,
        payload: IRefundPaymentPayload,
    ): Promise<IPayment> {
        const { data } = await httpClient.patch<IApiResponse<IPayment>>(
            `/payments/${paymentId}/refund`,
            payload,
        );
        return data.data as IPayment;
    }

    async collectCodPayment(
        paymentId: string,
        payload: ICollectCodPayload,
    ): Promise<IPayment> {
        const { data } = await httpClient.patch<IApiResponse<IPayment>>(
            `/payments/${paymentId}/collect-cod`,
            payload,
        );
        return data.data as IPayment;
    }
}

export const orderApiClient = new OrderApiClient();
