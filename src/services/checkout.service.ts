"use server";

import type { IOrder } from "@/types/order.types";
import type { ICart, IPickupLocation } from "@/types/commerce.types";
import type {
    IMyLoyaltySummary,
    IPointTransaction,
    IReferralCode,
    IReferralEvent,
    IPaginatedData,
} from "@/types/customer.types";
import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, unwrapData } from "@/services/service-utils";

// ── Cart ──────────────────────────────────────────────
export async function fetchMyCart(): Promise<ICart | null | undefined> {
    return safeServiceCall(
        () => unwrapData<ICart>(httpClient.get("/carts/my")),
        null,
        "Failed to fetch cart:",
    );
}

// ── Coupon ─────────────────────────────────────────────
export interface CouponValidateResponse {
    discountAmount: number;
    discountType: "PERCENT" | "FLAT";
    value: number;
    code: string;
}

export async function validateCoupon(payload: {
    code: string;
    orderAmount: number;
}): Promise<CouponValidateResponse> {
    return unwrapData<CouponValidateResponse>(
        httpClient.post("/coupons/validate", payload),
    );
}

export interface ReferralValidateResponse {
    code: string;
    valid: boolean;
}

export async function verifyReferralCode(
    code: string,
): Promise<ReferralValidateResponse> {
    return unwrapData<ReferralValidateResponse>(
        httpClient.get(
            `/customers/referrals/verify/${encodeURIComponent(code)}`,
        ),
    );
}

// ── Loyalty & Points ─────────────────────────────────
export interface RedeemPointsResponse {
    pointsRedeemed: number;
    pointsBalance: number;
    maxRedeemable: number;
}

export async function getMyLoyaltySummary(): Promise<IMyLoyaltySummary> {
    return unwrapData<IMyLoyaltySummary>(
        httpClient.get("/customers/loyalty/me"),
    );
}

export async function getMyPointTransactions(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}): Promise<IPaginatedData<IPointTransaction>> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<IPointTransaction[]>(
                "/customers/loyalty/me/transactions",
                { params },
            );

            return {
                data: response.data,
                meta: response.meta ?? {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? response.data.length,
                    total: response.data.length,
                    totalPages: 1,
                },
            };
        },
        {
            data: [],
            meta: {
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                total: 0,
                totalPages: 0,
            },
        },
        "Failed to fetch point transactions:",
    );
}

export async function redeemPoints(payload: {
    pointsToRedeem: number;
}): Promise<RedeemPointsResponse> {
    return unwrapData<RedeemPointsResponse>(
        httpClient.post("/customers/loyalty/points/redeem", payload),
    );
}

// ── Referral ─────────────────────────────────────────
export async function getMyReferralCode(): Promise<IReferralCode> {
    return unwrapData<IReferralCode>(
        httpClient.get("/customers/referrals/my-code"),
    );
}

export async function getMyReferralEvents(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}): Promise<IPaginatedData<IReferralEvent>> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<IReferralEvent[]>(
                "/customers/referrals/my-events",
                { params },
            );

            return {
                data: response.data,
                meta: response.meta ?? {
                    page: params?.page ?? 1,
                    limit: params?.limit ?? response.data.length,
                    total: response.data.length,
                    totalPages: 1,
                },
            };
        },
        {
            data: [],
            meta: {
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                total: 0,
                totalPages: 0,
            },
        },
        "Failed to fetch referral events:",
    );
}

// ── Order ──────────────────────────────────────────────
export interface CreateOrderPayload {
    fulfillmentMethod?: "DELIVERY" | "PICKUP";
    paymentMethod?: "BKASH" | "NAGAD" | "COD";
    shippingAddressId?: string;
    pickupLocationId?: string;
    billingAddressSnapshot?: Record<string, unknown>;
    notes?: string;
    couponCode?: string;
    redeemPoints?: number;
    referralCode?: string;
}

export async function createOrder(
    payload: CreateOrderPayload,
): Promise<IOrder> {
    return unwrapData<IOrder>(httpClient.post("/orders/my", payload));
}

export async function getMyOrders(): Promise<IOrder[]> {
    return safeServiceCall(
        () => unwrapData<IOrder[]>(httpClient.get("/orders/my")),
        [],
        "Failed to fetch my orders:",
    );
}

export async function getMyOrderById(
    orderId: string,
): Promise<IOrder | null | undefined> {
    return safeServiceCall(
        () => unwrapData<IOrder>(httpClient.get(`/orders/my/${orderId}`)),
        null,
        "Failed to fetch order:",
    );
}

export async function cancelMyOrder(orderId: string): Promise<IOrder> {
    return unwrapData<IOrder>(
        httpClient.patch(`/orders/my/${orderId}/cancel`, {}),
    );
}

// ── Payment ────────────────────────────────────────────
export interface InitiatePaymentPayload {
    orderId: string;
}

export interface PaymentResult {
    id: string;
    transactionId: string;
    status: string;
    amount: number;
    method: string;
    orderId: string;
}

export async function initiatePayment(
    payload: InitiatePaymentPayload,
): Promise<PaymentResult> {
    return unwrapData<PaymentResult>(
        httpClient.post("/payments/initiate", payload),
    );
}

export interface FinalizePaymentPayload {
    transactionId: string;
    status: "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED";
    paymentGatewayData?: Record<string, unknown>;
}

export async function finalizePayment(
    payload: FinalizePaymentPayload,
): Promise<PaymentResult> {
    return unwrapData<PaymentResult>(
        httpClient.post("/payments/webhook/finalize", payload),
    );
}
