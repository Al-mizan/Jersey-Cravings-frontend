"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CartTable from "@/components/modules/Commerce/CartTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    useClearMyCart,
    useMyCart,
    useRemoveMyCartItem,
    useUpdateMyCartItem,
} from "@/components/modules/Commerce/hooks/useCommerceCart";
import { parseAxiosError } from "@/lib/axios/parseAxiosError";
import { useState } from "react";

export default function CartPage() {
    const router = useRouter();
    const { data: cart, isLoading } = useMyCart();
    const updateCartItemMutation = useUpdateMyCartItem();
    const removeItemMutation = useRemoveMyCartItem();
    const clearCartMutation = useClearMyCart();
    const [serverError, setServerError] = useState<string | null>(null);

    const subtotal =
        cart?.items.reduce(
            (sum, item) => sum + item.qty * (item.variant?.priceAmount || 0),
            0,
        ) ?? 0;

    const handleIncrease = async (itemId: string, qty: number) => {
        setServerError(null);
        try {
            await updateCartItemMutation.mutateAsync({ itemId, qty: qty + 1 });
        } catch (error) {
            setServerError(parseAxiosError(error));
        }
    };

    const handleDecrease = async (itemId: string, qty: number) => {
        if (qty <= 1) return;
        setServerError(null);
        try {
            await updateCartItemMutation.mutateAsync({ itemId, qty: qty - 1 });
        } catch (error) {
            setServerError(parseAxiosError(error));
        }
    };

    const handleRemove = async (itemId: string) => {
        setServerError(null);
        try {
            await removeItemMutation.mutateAsync(itemId);
        } catch (error) {
            setServerError(parseAxiosError(error));
        }
    };

    const handleClearCart = async () => {
        setServerError(null);
        try {
            await clearCartMutation.mutateAsync();
        } catch (error) {
            setServerError(parseAxiosError(error));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Cart</h1>
                <p className="text-muted-foreground mt-1">
                    Review your cart and place the order when ready.
                </p>
            </div>

            {serverError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {serverError}
                </div>
            )}

            <CartTable
                cart={cart}
                isLoading={isLoading}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
            />

            <Card>
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Cart total
                        </p>
                        <p className="text-2xl font-semibold">৳{subtotal}</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={handleClearCart}
                            disabled={
                                !cart?.items.length ||
                                clearCartMutation.isPending
                            }
                        >
                            {clearCartMutation.isPending
                                ? "Clearing..."
                                : "Clear Cart"}
                        </Button>

                        <Button
                            onClick={() => router.push("/checkout")}
                            disabled={!cart?.items.length}
                        >
                            Proceed to Checkout
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
