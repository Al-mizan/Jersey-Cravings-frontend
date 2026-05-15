"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Tag, Truck, Trash2, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { cartQueryKey } from "@/hooks/useCart";
import {
    useCreateOrder,
    useMyLoyaltySummary,
    useRedeemPoints,
    useValidateCoupon,
} from "@/hooks/useCheckout";
import {
    verifyReferralCode,
    type CouponValidateResponse,
    type ReferralValidateResponse,
} from "@/services/checkout.service";
import type { ICart, ICartItem } from "@/types/commerce.types";

type ShippingId = "" | "ju" | "dhaka" | "outside";
type PaymentId = "" | "COD" | "BKASH";

const SHIPPING_OPTIONS = [
    {
        id: "ju",
        label: "Delivery Inside Jahangirnagar University",
        emoji: "🏫",
        sublabel: "Free — pickup only",
        price: 0,
    },
    {
        id: "dhaka",
        label: "Delivery Inside Dhaka",
        emoji: "🏙️",
        sublabel: "District must be Dhaka",
        price: 79,
    },
    {
        id: "outside",
        label: "Delivery Outside Dhaka",
        emoji: "🗺️",
        sublabel: "Any district outside Dhaka",
        price: 119,
    },
] as const;

const PAYMENT_OPTIONS = [
    { id: "COD", label: "Cash on Delivery" },
    { id: "BKASH", label: "Bkash/Nagad" },
] as const;

const maxCartQty = 10;

const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

const updateCartItemQty = (
    cart: ICart | null | undefined,
    itemId: string,
    qty: number,
): ICart | null | undefined => {
    if (!cart) return cart;
    return {
        ...cart,
        items: cart.items.map((item: ICartItem) =>
            item.id === itemId ? { ...item, qty } : item,
        ),
    };
};

const removeCartItem = (
    cart: ICart | null | undefined,
    itemId: string,
): ICart | null | undefined => {
    if (!cart) return cart;
    return {
        ...cart,
        items: cart.items.filter((item: ICartItem) => item.id !== itemId),
    };
};

interface OrderSummaryProps {
    cart: ICart;
    billingDistrict: string;
    billingValues: Record<string, unknown>;
    shippingMethod: ShippingId;
    onShippingMethodChange: (method: ShippingId) => void;
    isFormValid: boolean;
    onValidateForm: () => Promise<boolean>;
    mobileFormSlot?: ReactNode | null;
}

export default function OrderSummary({
    cart,
    billingDistrict,
    billingValues,
    shippingMethod,
    onShippingMethodChange,
    isFormValid,
    onValidateForm,
    mobileFormSlot,
}: OrderSummaryProps) {
    const queryClient = useQueryClient();

    const billingArea =
        typeof billingValues.area === "string" ? billingValues.area : "";
    const billingDivision =
        typeof billingValues.division === "string"
            ? billingValues.division
            : "";
    const billingShippingMethod =
        typeof billingValues.shippingMethod === "string"
            ? billingValues.shippingMethod
            : "";

    const [showCoupon, setShowCoupon] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] =
        useState<CouponValidateResponse | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    const [showReferral, setShowReferral] = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const [appliedReferral, setAppliedReferral] =
        useState<ReferralValidateResponse | null>(null);
    const [referralError, setReferralError] = useState<string | null>(null);

    const [showRedeemPoints, setShowRedeemPoints] = useState(false);
    const [redeemInput, setRedeemInput] = useState("");
    const [redeemedPoints, setRedeemedPoints] = useState(0);
    const [redeemError, setRedeemError] = useState<string | null>(null);
    const [pointsBalanceOverride, setPointsBalanceOverride] = useState<
        number | null
    >(null);

    const [shippingError, setShippingError] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const [paymentMethod, setPaymentMethod] = useState<PaymentId>("");

    const validateCouponMutation = useValidateCoupon();
    const createOrderMutation = useCreateOrder();
    const redeemPointsMutation = useRedeemPoints();
    const { data: loyaltySummary } = useMyLoyaltySummary();
    // const { data: activePickupLocations } = useActivePickupLocations();

    const cartItems = cart.items;
    const subtotal = useMemo(
        () =>
            cartItems.reduce(
                (sum, item) =>
                    sum +
                    item.qty * (item.variant?.priceAmount ?? 0) +
                    item.customizationCharge * item.qty,
                0,
            ),
        [cartItems],
    );

    const shippingPrice = useMemo(() => {
        if (shippingMethod === "ju") return 0;
        if (shippingMethod === "dhaka") return 1; //todo: 79
        if (shippingMethod === "outside") return 119;
        return 0;
    }, [shippingMethod]);

    const discountAmount = appliedCoupon?.discountAmount ?? 0;
    const totalBeforePoints = Math.max(
        0,
        subtotal + shippingPrice - discountAmount,
    );
    const pointsBalance =
        pointsBalanceOverride ?? loyaltySummary?.pointsBalance ?? 0;
    const maxRedeemable = Math.min(
        pointsBalance,
        Math.floor(totalBeforePoints * 0.5),
    );
    const total = Math.max(0, totalBeforePoints - redeemedPoints);

    const isPickup = shippingMethod === "ju";
    const hasCustomizedItems = cartItems.some(
        (item) => item.customPlayerName && item.customJerseyNumber,
    );
    const isCodAllowed = isPickup && !hasCustomizedItems;

    useEffect(() => {
        setShippingError(null);
        if (!isCodAllowed && paymentMethod === "COD") {
            setPaymentMethod("");
        }
        if (shippingMethod === "ju") {
            setPaymentError(null);
        }
    }, [isCodAllowed, paymentMethod, shippingMethod]);

    useEffect(() => {
        if (billingShippingMethod && billingShippingMethod !== shippingMethod) {
            onShippingMethodChange(billingShippingMethod as ShippingId);
        }
    }, [billingShippingMethod, onShippingMethodChange, shippingMethod]);

    const updateCartItemMutation = useMutation({
        mutationFn: async (payload: { itemId: string; qty: number }) => {
            await axios.patch(`/api/proxy/carts/my/items/${payload.itemId}`, {
                qty: payload.qty,
            });
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: cartQueryKey });
            const previousCart = queryClient.getQueryData<ICart>(cartQueryKey);
            queryClient.setQueryData<ICart | null>(
                cartQueryKey,
                (current: any) =>
                    updateCartItemQty(
                        current,
                        variables.itemId,
                        variables.qty,
                    ) ?? null,
            );
            return { previousCart };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(cartQueryKey, context.previousCart);
            }
            toast.error("Failed to update cart item");
        },
    });

    const removeCartItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            await axios.delete(`/api/proxy/carts/my/items/${itemId}`);
        },
        onMutate: async (itemId) => {
            await queryClient.cancelQueries({ queryKey: cartQueryKey });
            const previousCart = queryClient.getQueryData<ICart>(cartQueryKey);
            queryClient.setQueryData<ICart | null>(
                cartQueryKey,
                (current: any) => removeCartItem(current, itemId) ?? null,
            );
            return { previousCart };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(cartQueryKey, context.previousCart);
            }
            toast.error("Failed to remove cart item");
        },
        onSuccess: () => {
            toast.success("Item removed from cart");
        },
    });

    const verifyReferralMutation = useMutation({
        mutationFn: async (code: string) => verifyReferralCode(code),
        onError: (error) => {
            const message =
                error instanceof Error
                    ? error.message
                    : "Invalid referral code";
            toast.error(message || "Invalid referral code");
        },
    });

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError(null);
        try {
            const result = await validateCouponMutation.mutateAsync({
                code: couponCode.trim(),
                orderAmount: subtotal,
            });
            setAppliedCoupon(result);
            setCouponError(null);
        } catch (err: unknown) {
            setAppliedCoupon(null);
            if (err && typeof err === "object" && "response" in err) {
                const axiosErr = err as {
                    response?: { data?: { message?: string } };
                };
                setCouponError(
                    axiosErr.response?.data?.message ?? "Invalid coupon",
                );
            } else {
                setCouponError("Invalid coupon");
            }
        }
    };

    const handleApplyReferral = async () => {
        if (!referralCode.trim()) return;
        setReferralError(null);
        try {
            const result = await verifyReferralMutation.mutateAsync(
                referralCode.trim(),
            );
            setAppliedReferral(result);
            setReferralError(null);
        } catch (error: unknown) {
            setAppliedReferral(null);
            if (error && typeof error === "object" && "response" in error) {
                const axiosErr = error as {
                    response?: { data?: { message?: string } };
                };
                setReferralError(
                    axiosErr.response?.data?.message ?? "Invalid referral code",
                );
            } else if (error instanceof Error) {
                setReferralError(error.message);
            } else {
                setReferralError("Invalid referral code");
            }
        }
    };

    const handleApplyRedeemPoints = async () => {
        if (redeemedPoints > 0) return;
        const raw = Number(redeemInput);

        if (!Number.isFinite(raw) || raw <= 0) {
            setRedeemError("Enter a valid points amount");
            return;
        }

        const pointsToRedeem = Math.floor(raw);
        if (pointsToRedeem > maxRedeemable) {
            setRedeemError(`You can redeem up to ${maxRedeemable} points`);
            return;
        }

        setRedeemError(null);
        try {
            const result = await redeemPointsMutation.mutateAsync({
                pointsToRedeem,
            });
            setRedeemedPoints(pointsToRedeem);
            setPointsBalanceOverride(result.pointsBalance);
            setRedeemInput(String(pointsToRedeem));
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Invalid points";
            setRedeemError(message);
        }
    };

    const handlePlaceOrder = async () => {
        setShippingError(null);
        setPaymentError(null);

        if (!shippingMethod) {
            setShippingError("Please select a shipping method");
            return;
        }

        if (!paymentMethod) {
            setPaymentError("Please select a payment method");
            return;
        }

        if (paymentMethod === "COD" && !isCodAllowed) {
            setPaymentError(
                "Cash on Delivery is only available for pickup orders",
            );
            return;
        }

        if (shippingMethod === "dhaka" && billingDistrict !== "dhaka") {
            setShippingError(
                "Delivery Inside Dhaka requires the Dhaka district",
            );
            return;
        }

        if (shippingMethod === "outside" && billingDistrict === "dhaka") {
            setShippingError(
                "Delivery Outside Dhaka requires a district outside Dhaka",
            );
            return;
        }

        if (redeemedPoints > 0 && redeemedPoints > maxRedeemable) {
            setRedeemError(
                `Redeemed points exceed the current max of ${maxRedeemable}`,
            );
            return;
        }

        const formValid = await onValidateForm();
        if (!formValid) {
            document
                .querySelector("[data-error]")
                ?.scrollIntoView({ behavior: "smooth" });
            return;
        }

        const fulfillmentMethod = isPickup
            ? ("PICKUP" as const)
            : ("DELIVERY" as const);

        // For PICKUP, only send name and phone. For DELIVERY, send full address.
        const billingAddressSnapshot =
            fulfillmentMethod === "PICKUP"
                ? {
                      recipientName: billingValues.name,
                      phone: billingValues.phone,
                  }
                : {
                      recipientName: billingValues.name,
                      phone: billingValues.phone,
                      address: billingValues.address,
                      division: billingDivision,
                      district: billingDistrict,
                      area: billingValues.area,
                      email: billingValues.email || undefined,
                  };

        createOrderMutation.mutate({
            fulfillmentMethod,
            paymentMethod,
            billingAddressSnapshot,
            notes: (billingValues.orderNote as string) || undefined,
            couponCode: appliedCoupon?.code || undefined,
            referralCode: appliedReferral?.code || undefined,
            redeemPoints: redeemedPoints || undefined,
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {!showCoupon ? (
                    <button
                        type="button"
                        onClick={() => setShowCoupon(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors"
                    >
                        <Tag className="size-4" />
                        Have a Coupon / Voucher?
                    </button>
                ) : (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <p className="text-sm font-medium text-primary">
                                Have Coupon / Voucher?
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) =>
                                        setCouponCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className="flex-1"
                                    disabled={!!appliedCoupon}
                                />
                                {appliedCoupon ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => {
                                            setAppliedCoupon(null);
                                            setCouponCode("");
                                            setCouponError(null);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleApplyCoupon}
                                        disabled={
                                            validateCouponMutation.isPending ||
                                            !couponCode.trim()
                                        }
                                        className="shrink-0 bg-pink-500 hover:bg-pink-600 text-white"
                                    >
                                        {validateCouponMutation.isPending ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            "Apply"
                                        )}
                                    </Button>
                                )}
                            </div>
                            {couponError && (
                                <p className="text-sm text-destructive">
                                    {couponError}
                                </p>
                            )}
                            {appliedCoupon && (
                                <p className="text-sm text-emerald-600 font-medium">
                                    ✓ Coupon applied —{" "}
                                    {formatCurrency(
                                        appliedCoupon.discountAmount,
                                    )}{" "}
                                    off
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <div className="space-y-3">
                {!showReferral ? (
                    <button
                        type="button"
                        onClick={() => setShowReferral(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors"
                    >
                        <Tag className="size-4" />
                        Have referral code?
                    </button>
                ) : (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <p className="text-sm font-medium text-primary">
                                Have referral code?
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Referral Code"
                                    value={referralCode}
                                    onChange={(e) =>
                                        setReferralCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className="flex-1"
                                    disabled={!!appliedReferral}
                                />
                                {appliedReferral ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => {
                                            setAppliedReferral(null);
                                            setReferralCode("");
                                            setReferralError(null);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleApplyReferral}
                                        disabled={
                                            verifyReferralMutation.isPending ||
                                            !referralCode.trim()
                                        }
                                        className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        {verifyReferralMutation.isPending ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            "Apply"
                                        )}
                                    </Button>
                                )}
                            </div>
                            {referralError && (
                                <p className="text-sm text-destructive">
                                    {referralError}
                                </p>
                            )}
                            {appliedReferral && (
                                <p className="text-sm text-emerald-600 font-medium">
                                    ✓ Referral code verified. Reward will be
                                    applied after delivery.
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-primary">
                        Have Redeem Points?
                    </p>
                    <span className="text-xs text-muted-foreground">
                        Available: {pointsBalance} pts
                    </span>
                </div>

                {!showRedeemPoints ? (
                    <button
                        type="button"
                        onClick={() => setShowRedeemPoints(true)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors"
                    >
                        Redeem your points
                    </button>
                ) : (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder={`Max ${maxRedeemable} pts`}
                                    value={redeemInput}
                                    onChange={(e) => {
                                        setRedeemInput(e.target.value);
                                        setRedeemError(null);
                                    }}
                                    className="flex-1"
                                    disabled={redeemedPoints > 0}
                                />
                                <Button
                                    onClick={handleApplyRedeemPoints}
                                    disabled={
                                        redeemPointsMutation.isPending ||
                                        !redeemInput.trim() ||
                                        redeemedPoints > 0
                                    }
                                    className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    {redeemPointsMutation.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Apply"
                                    )}
                                </Button>
                            </div>
                            {redeemError && (
                                <p className="text-sm text-destructive">
                                    {redeemError}
                                </p>
                            )}
                            {redeemedPoints > 0 && (
                                <p className="text-sm text-emerald-600 font-medium">
                                    ✓ Redeemed {redeemedPoints} points
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <Separator />

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                        Choose Shipping Method
                    </h3>
                    {shippingError && (
                        <span className="text-xs font-medium text-destructive">
                            {shippingError}
                        </span>
                    )}
                </div>
                <RadioGroup
                    value={shippingMethod}
                    onValueChange={(value) => {
                        onShippingMethodChange(value as ShippingId);
                        setShippingError(null);
                    }}
                    className="space-y-2"
                >
                    {SHIPPING_OPTIONS.map((opt) => (
                        // todo: hidden input for accessibility, currently just styling the label and using onClick on the label to select
                        <Label
                            key={opt.id}
                            htmlFor={`shipping-${opt.id}`}
                            className={cn(
                                "flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                                shippingMethod === opt.id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    : "border-border hover:border-muted-foreground/30",
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem
                                    value={opt.id}
                                    id={`shipping-${opt.id}`}
                                />
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-base">
                                        {opt.emoji}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {opt.label}
                                    </span>
                                    {opt.sublabel && (
                                        <span className="text-xs text-muted-foreground">
                                            — {opt.sublabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                                {opt.price === 0
                                    ? "Free"
                                    : formatCurrency(opt.price)}
                            </span>
                        </Label>
                    ))}
                </RadioGroup>
                {shippingMethod === "ju" && (
                    <div className="rounded-md border border-border/60 p-3 bg-primary/5">
                        <p className="text-sm font-medium">Pickup Location</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Jahangirnagar University, Savar, Dhaka
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Delivery charge: Free
                        </p>
                    </div>
                )}
            </div>

            {mobileFormSlot && <div className="pt-2">{mobileFormSlot}</div>}

            <Separator />

            <div className="space-y-3">
                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                    {cartItems.map((item) => {
                        const product = item.variant?.product;
                        const thumb =
                            item.variant?.product?.media?.[0]?.secureUrl ??
                            item.variant?.product?.thumbNail ??
                            "/jersey_cravings.png";
                        const title = product?.title ?? "Product";
                        const size = item.variant?.size ?? "";
                        const unitPrice = item.variant?.priceAmount ?? 0;

                        return (
                            <div
                                key={item.id}
                                className="flex gap-3 rounded-xl border border-border/60 p-3"
                            >
                                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted border">
                                    <Image
                                        src={thumb}
                                        alt={title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div>
                                        <p className="text-sm font-medium line-clamp-1">
                                            {title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {size && `Size: ${size}`}
                                            {item.customPlayerName &&
                                                ` · Name: ${item.customPlayerName}`}
                                            {item.customJerseyNumber &&
                                                ` · Number: ${item.customJerseyNumber}`}
                                            {` · Qty: ${item.qty}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center rounded-full border border-input">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() =>
                                                    updateCartItemMutation.mutate(
                                                        {
                                                            itemId: item.id,
                                                            qty: Math.max(
                                                                1,
                                                                item.qty - 1,
                                                            ),
                                                        },
                                                    )
                                                }
                                                disabled={item.qty <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="size-3" />
                                            </Button>
                                            <span className="w-8 text-center text-xs font-semibold">
                                                {item.qty}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() =>
                                                    updateCartItemMutation.mutate(
                                                        {
                                                            itemId: item.id,
                                                            qty: Math.min(
                                                                maxCartQty,
                                                                item.qty + 1,
                                                            ),
                                                        },
                                                    )
                                                }
                                                disabled={
                                                    item.qty >= maxCartQty
                                                }
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="size-3" />
                                            </Button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                                removeCartItemMutation.mutate(
                                                    item.id,
                                                )
                                            }
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 text-sm">
                                    <span className="text-muted-foreground">
                                        {item.qty > 1 && `${item.qty} ×`}{" "}
                                        {formatCurrency(unitPrice)}
                                    </span>
                                    <span className="text-muted-foreground tabular-nums">
                                        + {item.qty > 1 && `${item.qty} ×`}{" "}
                                        {formatCurrency(
                                            item.customizationCharge,
                                        )}
                                    </span>
                                    <hr className="w-full border-border" />
                                    <span className="font-black text-foreground tabular-nums">
                                        {formatCurrency(
                                            (unitPrice +
                                                item.customizationCharge) *
                                                item.qty,
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">
                        {formatCurrency(subtotal)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Truck className="size-3.5" />
                        Shipping
                    </span>
                    <span className="tabular-nums">
                        {shippingPrice === 0
                            ? "Free"
                            : formatCurrency(shippingPrice)}
                    </span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1.5">
                            <Tag className="size-3.5" />
                            Discount
                        </span>
                        <span className="tabular-nums">
                            −{formatCurrency(discountAmount)}
                        </span>
                    </div>
                )}
                {redeemedPoints > 0 && (
                    <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1.5">
                            Redeemed Points
                        </span>
                        <span className="tabular-nums">
                            −{formatCurrency(redeemedPoints)}
                        </span>
                    </div>
                )}
                <Separator />
                <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-base">Total Amount</span>
                    <span className="font-bold text-lg text-pink-600 tabular-nums">
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Choose Payment Method
                </h3>
                {paymentError && (
                    <p className="text-xs font-medium text-destructive">
                        {paymentError}
                    </p>
                )}
                <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => {
                        setPaymentMethod(value as PaymentId);
                        setPaymentError(null);
                    }}
                    className="space-y-2"
                >
                    {PAYMENT_OPTIONS.map((opt) => {
                        const isDisabled = opt.id === "COD" && !isCodAllowed;
                        return (
                            <div key={opt.id}>
                                <Label
                                    htmlFor={`payment-${opt.id}`}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                                        paymentMethod === opt.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                            : "border-border hover:border-muted-foreground/30",
                                        isDisabled &&
                                            "cursor-not-allowed opacity-60",
                                    )}
                                >
                                    <RadioGroupItem
                                        value={opt.id}
                                        id={`payment-${opt.id}`}
                                        disabled={isDisabled}
                                    />
                                    <span className="text-sm font-medium">
                                        {opt.label}
                                    </span>
                                    {isDisabled && (
                                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                                            <Lock className="size-3" />
                                            Unavailable
                                        </span>
                                    )}
                                </Label>
                                {isDisabled &&
                                    hasCustomizedItems &&
                                    opt.id === "COD" && (
                                        <p className="mt-1.5 ml-9 text-xs text-muted-foreground">
                                            Custom printed orders require
                                            advance payment via Bkash or Nagad.
                                        </p>
                                    )}
                            </div>
                        );
                    })}
                </RadioGroup>
            </div>

            <Button
                onClick={handlePlaceOrder}
                disabled={
                    createOrderMutation.isPending || cart.items.length === 0
                }
                className="w-full h-12 text-base font-bold bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
            >
                {createOrderMutation.isPending ? (
                    <>
                        <Loader2 className="size-5 animate-spin mr-2" />
                        Placing Order...
                    </>
                ) : (
                    "অর্ডার করুন"
                )}
            </Button>
        </div>
    );
}
