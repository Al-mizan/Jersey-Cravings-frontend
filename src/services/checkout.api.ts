/**
 * Client-side Axios API calls for the checkout flow.
 * These are NOT "use server" — they run in the browser and go through the Next.js proxy.
 */

import type { ApiResponse } from "@/types/api.types";
import type { IOrder } from "@/types/order.types";
import type { ICart } from "@/types/commerce.types";
import axios from "axios";

const PROXY = "/api/proxy";

// ── Cart ──────────────────────────────────────────────
export async function fetchMyCart(): Promise<ICart | null> {
    const res = await axios.get<ApiResponse<ICart>>(`${PROXY}/carts/my`);
    return res.data.data ?? null;
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
    const res = await axios.post<ApiResponse<CouponValidateResponse>>(
        `${PROXY}/coupons/validate`,
        payload,
    );
    return res.data.data;
}

// ── Order ──────────────────────────────────────────────
export interface CreateOrderPayload {
    fulfillmentMethod?: "DELIVERY" | "PICKUP";
    paymentMethod?: "STRIPE" | "COD";
    shippingAddressId?: string;
    pickupLocationId?: string;
    billingAddressSnapshot?: Record<string, unknown>;
    notes?: string;
    couponCode?: string;
    redeemPoints?: number;
    referralCode?: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<IOrder> {
    const res = await axios.post<ApiResponse<IOrder>>(
        `${PROXY}/orders/my`,
        payload,
    );
    return res.data.data;
}

export async function getMyOrders(): Promise<IOrder[]> {
    const res = await axios.get<ApiResponse<IOrder[]>>(`${PROXY}/orders/my`);
    return res.data.data ?? [];
}

export async function getMyOrderById(orderId: string): Promise<IOrder> {
    const res = await axios.get<ApiResponse<IOrder>>(
        `${PROXY}/orders/my/${orderId}`,
    );
    return res.data.data;
}

export async function cancelMyOrder(orderId: string): Promise<IOrder> {
    const res = await axios.patch<ApiResponse<IOrder>>(
        `${PROXY}/orders/my/${orderId}/cancel`,
    );
    return res.data.data;
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
    const res = await axios.post<ApiResponse<PaymentResult>>(
        `${PROXY}/payments/initiate`,
        payload,
    );
    return res.data.data;
}

export interface FinalizePaymentPayload {
    transactionId: string;
    status: "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED";
    paymentGatewayData?: Record<string, unknown>;
}

export async function finalizePayment(
    payload: FinalizePaymentPayload,
): Promise<PaymentResult> {
    const res = await axios.post<ApiResponse<PaymentResult>>(
        `${PROXY}/payments/webhook/finalize`,
        payload,
    );
    return res.data.data;
}
