"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    fetchMyCart,
    validateCoupon,
    createOrder,
    getMyOrders,
    getMyOrderById,
    cancelMyOrder,
    initiatePayment,
    verifyTrxId,
    getMyLoyaltySummary,
    getMyPointTransactions,
    redeemPoints,
    getMyReferralCode,
    getMyReferralEvents,
    type CreateOrderPayload,
    type CouponValidateResponse,
    type RedeemPointsResponse,
    type VerifyTrxIdPayload,
} from "@/services/checkout.service";
import type { IPickupLocation } from "@/types/commerce.types";

// ── Query Keys ────────────────────────────────────────
export const checkoutKeys = {
    cart: ["cart", "my"] as const,
    orders: ["orders", "my"] as const,
    order: (id: string) => ["orders", "my", id] as const,
    loyalty: ["loyalty", "me"] as const,
    pointTransactions: {
        all: ["loyalty", "transactions"] as const,
        list: (params?: Record<string, unknown>) =>
            ["loyalty", "transactions", params ?? {}] as const,
    },
    referralCode: ["referral", "code"] as const,
    referralEvents: {
        all: ["referral", "events"] as const,
        list: (params?: Record<string, unknown>) =>
            ["referral", "events", params ?? {}] as const,
    },
    pickupLocations: ["fulfillment", "active"] as const,
};

// ── Cart ──────────────────────────────────────────────
export function useMyCart() {
    return useQuery({
        queryKey: checkoutKeys.cart,
        queryFn: fetchMyCart,
        staleTime: 60_000,
    });
}

// ── Fulfillment ────────────────────────────────────────
export function useActivePickupLocations() {
    const HARDCODED_PICKUP_LOCATIONS: IPickupLocation[] = [
        {
            id: "ju-main",
            name: "Jahangirnagar University Pickup Point",
            slug: "jahangirnagar-university",
            addressLine: "Jahangirnagar University, Savar, Dhaka",
            city: "Savar",
            district: "Dhaka",
            postalCode: null,
            phone: "",
            openingHours: null,
            status: "ACTIVE",
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    return useQuery({
        queryKey: checkoutKeys.pickupLocations,
        queryFn: async () => HARDCODED_PICKUP_LOCATIONS,
        staleTime: 60_000,
    });
}

// ── Coupon ─────────────────────────────────────────────
export function useValidateCoupon() {
    return useMutation({
        mutationFn: validateCoupon,
        onError: (error: unknown) => {
            const message = getErrorMessage(error);
            toast.error(message || "Invalid coupon code");
        },
    });
}

// ── Loyalty & Points ─────────────────────────────────
export function useMyLoyaltySummary() {
    return useQuery({
        queryKey: checkoutKeys.loyalty,
        queryFn: getMyLoyaltySummary,
        staleTime: 30_000,
    });
}

export function useMyPointTransactions(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    return useQuery({
        queryKey: checkoutKeys.pointTransactions.list(params),
        queryFn: () => getMyPointTransactions(params),
        staleTime: 30_000,
    });
}

export function useRedeemPoints() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { pointsToRedeem: number }) =>
            redeemPoints(payload),
        onSuccess: (data: RedeemPointsResponse) => {
            queryClient.invalidateQueries({ queryKey: checkoutKeys.loyalty });
            queryClient.invalidateQueries({
                queryKey: checkoutKeys.pointTransactions.all,
            });
            toast.success(
                `Redeemed ${data.pointsRedeemed} points successfully`,
            );
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error);
            toast.error(message || "Failed to redeem points");
        },
    });
}

// ── Order ──────────────────────────────────────────────
export function useCreateOrder() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
        onSuccess: (order) => {
            toast.success("Order placed successfully!");
            // Invalidate cart so navbar count resets to 0
            queryClient.invalidateQueries({ queryKey: checkoutKeys.cart });

            // Route based on payment method
            const paymentMethod = order.paymentMethod as string | undefined;
            if (paymentMethod === "COD") {
                // COD orders go directly to orders page
                router.push(`/my-section/orders/${order.id}`);
            } else {
                // Bkash/Nagad orders go to payment page
                router.push(`/make-payment/${order.id}`);
            }
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error);
            toast.error(message || "Failed to place order");
        },
    });
}

export function useMyOrders() {
    return useQuery({
        queryKey: checkoutKeys.orders,
        queryFn: getMyOrders,
        staleTime: 30_000,
    });
}

export function useMyOrderById(orderId: string) {
    return useQuery({
        queryKey: checkoutKeys.order(orderId),
        queryFn: () => getMyOrderById(orderId),
        enabled: !!orderId,
        staleTime: 30_000,
        refetchInterval: (query) => {
            const order = query.state.data as any;
            if (!order) return false;
            // Stop polling if order is in a terminal status
            if (
                ["DELIVERED", "CANCELLED", "REFUNDED", "EXPIRED"].includes(
                    order.status,
                )
            ) {
                return false;
            }
            return 10_000; // Poll every 10s for active orders
        },
    });
}

export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelMyOrder,
        onSuccess: (_data, orderId) => {
            toast.success("Order cancelled successfully");
            queryClient.invalidateQueries({
                queryKey: checkoutKeys.order(orderId),
            });
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders });
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error);
            toast.error(message || "Failed to cancel order");
        },
    });
}

// ── Payment ────────────────────────────────────────────
export function useInitiatePayment() {
    return useMutation({
        mutationFn: initiatePayment,
        onError: (error: unknown) => {
            const message = getErrorMessage(error);
            toast.error(message || "Failed to initiate payment");
        },
    });
}

export function useVerifyTrxId() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: async (payload: VerifyTrxIdPayload) => {
            const res = await axios.post("/api/proxy/payments/verify-trxid", payload);
            return res.data.data;
        },
        onSuccess: (order) => {
            toast.success("Payment verified successfully!");
            queryClient.invalidateQueries({
                queryKey: checkoutKeys.order(order.id),
            });
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders });
            router.push(`/my-section/orders/${order.id}`);
        },
        // onError intentionally omitted — BkashPaymentDialog handles errors inline
    });
}

// ── Referral ─────────────────────────────────────────
export function useMyReferralCode() {
    return useQuery({
        queryKey: checkoutKeys.referralCode,
        queryFn: getMyReferralCode,
        staleTime: 60_000,
    });
}

export function useMyReferralEvents(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    return useQuery({
        queryKey: checkoutKeys.referralEvents.list(params),
        queryFn: () => getMyReferralEvents(params),
        staleTime: 30_000,
    });
}

// ── Error Helpers ──────────────────────────────────────
function getErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "response" in error) {
        const axiosErr = error as {
            response?: { data?: { message?: string } };
        };
        return axiosErr.response?.data?.message ?? "";
    }
    if (error instanceof Error) return error.message;
    return "";
}
