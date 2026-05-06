"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import CheckoutForm from "@/components/modules/Commerce/CheckoutForm";
import {
    useActivePickupLocations,
    useMyCart,
} from "@/components/modules/Commerce/hooks/useCommerceCart";
import { useMyAddresses } from "@/components/modules/Customer/hooks";

export default function CheckoutPage() {
    const { data: cart, isLoading: isCartLoading } = useMyCart();
    const { data: addressesData, isLoading: isAddressesLoading } =
        useMyAddresses();
    const { data: pickupLocationsData, isLoading: isPickupLocationsLoading } =
        useActivePickupLocations();

    const addresses = addressesData?.data ?? [];
    const pickupLocations = pickupLocationsData ?? [];

    const subtotal = useMemo(() => {
        return (
            cart?.items.reduce(
                (sum, item) =>
                    sum + item.qty * (item.variant?.priceAmount || 0),
                0,
            ) ?? 0
        );
    }, [cart]);

    if (isCartLoading) {
        return (
            <p className="text-sm text-muted-foreground">Loading checkout...</p>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="space-y-4">
                <Alert>
                    <AlertDescription>
                        Your cart is empty. Add products before going to
                        checkout.
                    </AlertDescription>
                </Alert>
                <Button asChild>
                    <Link href="/cart">Back to cart</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Checkout
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Confirm fulfillment details and place your order.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/cart">Back to cart</Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.75fr)]">
                <CheckoutForm
                    cart={cart}
                    addresses={addresses}
                    pickupLocations={pickupLocations.map((location) => ({
                        id: location.id,
                        name: location.name,
                        addressLine: location.addressLine,
                        city: location.city,
                        district: location.district,
                        postalCode: location.postalCode,
                    }))}
                    hasAddresses={addresses.length > 0}
                    hasPickupLocations={pickupLocations.length > 0}
                />

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Order summary</CardTitle>
                        <CardDescription>
                            Review the items that will be submitted with your
                            order.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-3 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {item.variant?.product?.title ||
                                                "Product"}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {item.variant?.sku ||
                                                item.variantId}{" "}
                                            · Qty {item.qty}
                                        </p>
                                    </div>
                                    <p>
                                        ৳
                                        {item.qty *
                                            (item.variant?.priceAmount || 0)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Items
                                </span>
                                <span>{cart.items.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>৳{subtotal}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold">
                                <span>Total</span>
                                <span>৳{subtotal}</span>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Pickup orders should use an active pickup location.
                            Delivery orders require a saved address.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {isAddressesLoading || isPickupLocationsLoading ? (
                <p className="text-sm text-muted-foreground">
                    Loading checkout options...
                </p>
            ) : null}
        </div>
    );
}
