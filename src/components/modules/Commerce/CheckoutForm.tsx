"use client";

import React, { useState } from "react";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMyOrder } from "@/components/modules/Orders/hooks/useCreateMyOrder";
import { parseAxiosError } from "@/lib/axios/parseAxiosError";
import type { ICart } from "@/types/commerce.types";
import type { IAddress } from "@/types/customer.types";
import type { ICreateOrderPayload } from "@/types/order.types";
import { createOrderZodSchema } from "@/zod/order.validation";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";

type CheckoutFormProps = {
    cart: ICart;
    addresses: IAddress[];
    pickupLocations: Array<{
        id: string;
        name: string;
        addressLine: string;
        city: string;
        district: string;
        postalCode?: string | null;
    }>;
    hasAddresses: boolean;
    hasPickupLocations: boolean;
};

const formatAddressLabel = (address: IAddress) => {
    return [
        address.recipientName,
        address.address,
        address.area,
        address.district,
    ]
        .filter(Boolean)
        .join(" · ");
};

const formatPickupLabel = (
    location: CheckoutFormProps["pickupLocations"][number],
) => {
    return [
        location.name,
        location.addressLine,
        location.city,
        location.district,
    ]
        .filter(Boolean)
        .join(" · ");
};

const CheckoutForm = ({
    cart,
    addresses,
    pickupLocations,
    hasAddresses,
    hasPickupLocations,
}: CheckoutFormProps) => {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const createOrderMutation = useCreateMyOrder();

    const form = useForm({
        defaultValues: {
            fulfillmentMethod: hasPickupLocations
                ? ("PICKUP" as const)
                : ("DELIVERY" as const),
            addressId: "",
            pickupLocationId: "",
            couponCode: "",
            notes: "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null);

            if (!cart.items.length) {
                setServerError("Your cart is empty.");
                return;
            }

            const payload: ICreateOrderPayload = {
                ...(value.fulfillmentMethod === "DELIVERY"
                    ? { addressId: value.addressId || undefined }
                    : {
                          pickupLocationId: value.pickupLocationId || undefined,
                      }),
                ...(value.couponCode.trim()
                    ? { couponCode: value.couponCode.trim() }
                    : {}),
                ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
            };

            const parsedPayload = createOrderZodSchema.safeParse(payload);
            if (!parsedPayload.success) {
                setServerError(
                    parsedPayload.error.issues[0]?.message ||
                        "Please review the checkout details.",
                );
                return;
            }

            if (value.fulfillmentMethod === "DELIVERY" && !hasAddresses) {
                setServerError(
                    "Add a delivery address before placing a delivery order.",
                );
                return;
            }

            if (value.fulfillmentMethod === "PICKUP" && !hasPickupLocations) {
                setServerError(
                    "No active pickup locations are available right now.",
                );
                return;
            }

            if (value.fulfillmentMethod === "DELIVERY" && !value.addressId) {
                setServerError("Please choose a delivery address.");
                return;
            }

            if (
                value.fulfillmentMethod === "PICKUP" &&
                !value.pickupLocationId
            ) {
                setServerError("Please choose a pickup location.");
                return;
            }

            try {
                const order = await createOrderMutation.mutateAsync(
                    parsedPayload.data,
                );
                router.replace(`/orders/${order.id}`);
                router.refresh();
            } catch (error) {
                setServerError(parseAxiosError(error));
            }
        },
    });

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>Checkout</CardTitle>
                    <Badge variant="outline">Cart-ready</Badge>
                </div>
                <CardDescription>
                    Choose how you want to receive the order and confirm the
                    details before placing it.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-5"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <form.Field name="fulfillmentMethod">
                        {(field) => (
                            <div className="space-y-2">
                                <Label htmlFor={field.name}>
                                    Fulfillment method
                                </Label>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) =>
                                        field.handleChange(
                                            value as "DELIVERY" | "PICKUP",
                                        )
                                    }
                                >
                                    <SelectTrigger id={field.name}>
                                        <SelectValue placeholder="Choose fulfillment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PICKUP">
                                            Pickup
                                        </SelectItem>
                                        <SelectItem value="DELIVERY">
                                            Delivery
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    <form.Subscribe
                        selector={(state) => state.values.fulfillmentMethod}
                    >
                        {(fulfillmentMethod) =>
                            fulfillmentMethod === "PICKUP" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="pickupLocationId">
                                        Pickup location
                                    </Label>
                                    <Select
                                        value={
                                            form.state.values.pickupLocationId
                                        }
                                        onValueChange={(value) =>
                                            form.setFieldValue(
                                                "pickupLocationId",
                                                value,
                                            )
                                        }
                                        disabled={!hasPickupLocations}
                                    >
                                        <SelectTrigger id="pickupLocationId">
                                            <SelectValue
                                                placeholder={
                                                    hasPickupLocations
                                                        ? "Choose a pickup location"
                                                        : "No pickup locations available"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pickupLocations.map((location) => (
                                                <SelectItem
                                                    key={location.id}
                                                    value={location.id}
                                                >
                                                    {formatPickupLabel(
                                                        location,
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Pickup orders are the safest path for
                                        cash-on-delivery style handling.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="addressId">
                                        Delivery address
                                    </Label>
                                    <Select
                                        value={form.state.values.addressId}
                                        onValueChange={(value) =>
                                            form.setFieldValue(
                                                "addressId",
                                                value,
                                            )
                                        }
                                        disabled={!hasAddresses}
                                    >
                                        <SelectTrigger id="addressId">
                                            <SelectValue
                                                placeholder={
                                                    hasAddresses
                                                        ? "Choose a delivery address"
                                                        : "No delivery addresses available"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {addresses.map((address) => (
                                                <SelectItem
                                                    key={address.id}
                                                    value={address.id}
                                                >
                                                    {formatAddressLabel(
                                                        address,
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Delivery requires a saved customer
                                        address.
                                    </p>
                                </div>
                            )
                        }
                    </form.Subscribe>

                    <form.Field name="couponCode">
                        {(field) => (
                            <AppField
                                field={field}
                                label="Coupon code"
                                placeholder="Optional coupon code"
                            />
                        )}
                    </form.Field>

                    <form.Field name="notes">
                        {(field) => {
                            const firstError =
                                field.state.meta.isTouched &&
                                field.state.meta.errors.length > 0
                                    ? String(field.state.meta.errors[0])
                                    : null;

                            return (
                                <div className="space-y-1.5">
                                    <Label htmlFor={field.name}>Notes</Label>
                                    <Textarea
                                        id={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(event) =>
                                            field.handleChange(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Optional delivery or pickup instructions"
                                        rows={4}
                                    />
                                    {firstError && (
                                        <p className="text-sm text-destructive">
                                            {firstError}
                                        </p>
                                    )}
                                </div>
                            );
                        }}
                    </form.Field>

                    <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground space-y-1">
                        <p>Cart items: {cart.items.length}</p>
                        <p>
                            Subtotal: ৳
                            {cart.items.reduce(
                                (sum, item) =>
                                    sum +
                                    item.qty * (item.variant?.priceAmount || 0),
                                0,
                            )}
                        </p>
                    </div>

                    <form.Subscribe
                        selector={(state) =>
                            [state.canSubmit, state.isSubmitting] as const
                        }
                    >
                        {([canSubmit, isSubmitting]) => (
                            <AppSubmitButton
                                isPending={
                                    isSubmitting ||
                                    createOrderMutation.isPending
                                }
                                pendingLabel="Placing order..."
                                disabled={!canSubmit || !cart.items.length}
                            >
                                Place Order
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>
        </Card>
    );
};

export default CheckoutForm;
