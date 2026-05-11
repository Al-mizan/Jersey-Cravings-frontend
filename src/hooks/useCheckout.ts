"use client";

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
    finalizePayment,
    type CreateOrderPayload,
    type CouponValidateResponse,
    type FinalizePaymentPayload,
} from "@/services/checkout.api";

// ── Query Keys ────────────────────────────────────────
export const checkoutKeys = {
    cart: ["cart", "my"] as const,
    orders: ["orders", "my"] as const,
    order: (id: string) => ["orders", "my", id] as const,
};

// ── Cart ──────────────────────────────────────────────
export function useMyCart() {
    return useQuery({
        queryKey: checkoutKeys.cart,
        queryFn: fetchMyCart,
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
            router.push(`/make-payment/${order.id}`);
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

export function useFinalizePayment() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: FinalizePaymentPayload & { orderId: string }) => {
            const { orderId, ...rest } = payload;
            return finalizePayment(rest).then((result) => ({
                ...result,
                orderId,
            }));
        },
        onSuccess: (data) => {
            toast.success("Payment confirmed successfully!");
            queryClient.invalidateQueries({
                queryKey: checkoutKeys.order(data.orderId),
            });
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders });
            router.push(`/my-section/orders/${data.orderId}`);
        },
        onError: (error: unknown) => {
            const message = getErrorMessage(error);
            toast.error(message || "Payment verification failed");
        },
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
