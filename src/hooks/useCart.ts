"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { CartResponse } from "@/services/cart.service";

export const cartQueryKey = ["cart", "my"] as const;

// server action না — client থেকে proxy route এ call
const fetchMyCart = async (): Promise<CartResponse> => {
    try {
        const res = await axios.get("/api/proxy/carts/my");
        return res.data.data;
    } catch (err: any) {
        console.log("Status:", err.response?.status);
        console.log("Response data:", err.response?.data); // ← exact error message দেখাবে
        throw err;
    }
};

export function useCart() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const { data: cart, isLoading: cartLoading } = useQuery({
        queryKey: cartQueryKey,
        queryFn: fetchMyCart,
        enabled: !authLoading && isAuthenticated,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });

    const cartItems = cart?.items ?? [];
    const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

    return {
        cart: cart ?? null,
        cartItems,
        itemCount,
        isLoading: authLoading || cartLoading,
    };
}
