// Order & Payment Types

export type OrderStatus =
    | "PENDING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED";

export type PaymentStatus =
    | "UNPAID"
    | "REQUIRES_PAYMENT_METHOD"
    | "REQUIRES_ACTION"
    | "PROCESSING"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELED"
    | "REFUNDED";

export type PaymentMethod = "BKASH" | "NAGAD" | "COD";

export type FulfillmentMethod = "DELIVERY" | "PICKUP";

export interface IOrderItem {
    id: string;
    productTitleSnapshot: string;
    variantSnapshot: Record<string, unknown>;
    unitPriceAmount: number;
    qty: number;
    lineTotalAmount: number;
    createdAt: string;
    updatedAt: string;
    productId: string;
    variantId: string;
    product?: {
        id: string;
        title: string;
        slug?: string;
        thumbNail?: string | null;
    };
    variant?: {
        id: string;
        size?: string | null;
        fit?: string | null;
        sleeveType?: string | null;
    };
}

export interface IOrderCoupon {
    id: string;
    appliedAmount: number;
    createdAt: string;
    couponId: string;
}

export interface IOrderGiftAddon {
    id: string;
    category: "FRIEND" | "PARTNER" | "FAMILY";
    cardChargeAmount: number;
    customMessage?: string | null;
    customMessageCharge: number;
    totalChargeAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface IOrder {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    fulfillmentMethod: FulfillmentMethod;
    subtotalAmount: number;
    discountAmount: number;
    couponUsed: boolean;
    shippingAmount: number;
    giftAddonAmount: number;
    pointsEarned: number;
    pointsRedeemed: number;
    totalAmount: number;
    currency: string;
    shippingAddressSnapshot?: Record<string, unknown> | null;
    billingAddressSnapshot: Record<string, unknown>;
    pickupNote?: string | null;
    notes?: string | null;
    placedAt: string;
    paidAt?: string | null;
    cancelledAt?: string | null;
    deliveredAt?: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    needsManualReview: boolean;
    items?: IOrderItem[];
    payment?: IPayment | null;
    coupons?: IOrderCoupon[];
    giftAddon?: IOrderGiftAddon | null;
    userId: string;
    pickupLocationId?: string | null;
    referralCodeId?: string | null;
}

export interface IPayment {
    id: string;
    amount: number;
    transactionId: string;
    method: PaymentMethod;
    stripeEventId?: string | null;
    status: PaymentStatus;
    paymentGatewayData?: Record<string, unknown> | null;
    invoiceUrl?: string | null;
    collectedAt?: string | null;
    collectedByAdminId?: string | null;
    createdAt: string;
    updatedAt: string;
    orderId: string;
}

export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IOrderListResponse extends IPaginatedResponse<IOrder> {}
export interface IPaymentListResponse extends IPaginatedResponse<IPayment> {}

/** Admin order list item (includes relations returned by `GET /orders`). */
export interface IAdminOrder extends IOrder {
    payment?: IPayment | null;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface IAdminOrderListResponse extends IPaginatedResponse<IAdminOrder> {}

// Request Payloads
export interface ICreateOrderPayload {
    addressId?: string;
    pickupLocationId?: string;
    couponCode?: string;
    notes?: string;
}

export interface IUpdateOrderStatusPayload {
    status: OrderStatus;
}

export interface IInitiatePaymentPayload {
    orderId: string;
    paymentMethod: PaymentMethod;
}

export interface IRefundPaymentPayload {
    amount: number;
    reason: string;
}

export interface ICollectCodPayload {
    collectedAt: string;
    note?: string;
}
