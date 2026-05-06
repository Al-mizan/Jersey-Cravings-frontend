export interface OrderListQueryParams {
    status?: string;
    page: number;
    limit: number;
}

export interface AdminPaymentListQueryParams {
    status?: string;
    page: number;
    limit: number;
}

export interface MyPaymentListQueryParams {
    page: number;
    limit: number;
}

export const orderQueryKeys = {
    all: ["orders"] as const,
    myOrders: {
        all: ["orders", "my"] as const,
        list: (params: OrderListQueryParams) =>
            [...orderQueryKeys.myOrders.all, "list", params] as const,
        detail: (orderId: string) =>
            [...orderQueryKeys.myOrders.all, "detail", orderId] as const,
    },
    payments: {
        all: ["orders", "payments"] as const,
        myList: (params: MyPaymentListQueryParams) =>
            [...orderQueryKeys.payments.all, "my", "list", params] as const,
        adminList: (params: AdminPaymentListQueryParams) =>
            [...orderQueryKeys.payments.all, "admin", "list", params] as const,
        byOrder: (orderId: string) =>
            [...orderQueryKeys.payments.all, "order", orderId] as const,
    },
};
