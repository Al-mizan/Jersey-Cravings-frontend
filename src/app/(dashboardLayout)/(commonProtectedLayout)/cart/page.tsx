"use client";

import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import CartTable from "@/components/modules/Commerce/CartTable";
import { commerceApiClient } from "@/lib/axios/commerceApiClient";
import { getMyCart } from "@/services/commerce.services";
import { Button } from "@/components/ui/button";
import { orderApiClient } from "@/lib/axios/orderApiClient";

export default function CartPage() {
    const {
        data: cart,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["my-cart"],
        queryFn: () => getMyCart(),
        staleTime: 30000,
    });

    const { mutateAsync: updateCartItem } = useMutation({
        mutationFn: async ({ itemId, qty }: { itemId: string; qty: number }) =>
            commerceApiClient.updateCartItem(itemId, { qty }),
    });

    const { mutateAsync: removeItem } = useMutation({
        mutationFn: async (itemId: string) =>
            commerceApiClient.removeCartItem(itemId),
    });

    const { mutateAsync: createOrder, isPending: creating } = useMutation({
        mutationFn: async () => orderApiClient.createMyOrder({}),
    });

    const handleIncrease = async (itemId: string, qty: number) => {
        await updateCartItem({ itemId, qty: qty + 1 });
        refetch();
    };

    const handleDecrease = async (itemId: string, qty: number) => {
        if (qty <= 1) return;
        await updateCartItem({ itemId, qty: qty - 1 });
        refetch();
    };

    const handleRemove = async (itemId: string) => {
        await removeItem(itemId);
        refetch();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Cart</h1>
                <p className="text-muted-foreground mt-1">
                    Review your cart and place the order when ready.
                </p>
            </div>

            <CartTable
                cart={cart}
                isLoading={isLoading}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
            />

            <div className="flex justify-end">
                <Button onClick={() => createOrder()} disabled={creating}>
                    {creating ? "Placing Order..." : "Place Order"}
                </Button>
            </div>
        </div>
    );
}
