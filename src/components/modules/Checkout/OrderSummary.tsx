"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Tag, Truck, Building2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isDhakaDistrict } from "@/lib/bd-locations";
import { useValidateCoupon, useCreateOrder } from "@/hooks/useCheckout";
import type { ICart } from "@/types/commerce.types";
import type { CouponValidateResponse } from "@/services/checkout.api";

// ── Shipping Options ──────────────────────────────────
const SHIPPING_OPTIONS = [
    {
        id: "ju",
        label: "Jahangirnagar University",
        emoji: "🏫",
        sublabel: "Free — our HQ",
        price: 0,
    },
    {
        id: "dhaka",
        label: "Delivery Inside Dhaka",
        emoji: "🏙️",
        sublabel: "",
        price: 79,
    },
    {
        id: "outside",
        label: "Delivery Outside Dhaka",
        emoji: "🗺️",
        sublabel: "",
        price: 119,
    },
] as const;

type ShippingId = (typeof SHIPPING_OPTIONS)[number]["id"];

// ── Payment Methods ───────────────────────────────────
const PAYMENT_OPTIONS = [
    { id: "COD", label: "Cash on Delivery" },
    { id: "STRIPE", label: "Bkash" },
] as const;

type PaymentId = (typeof PAYMENT_OPTIONS)[number]["id"];

// ── Helpers ───────────────────────────────────────────
const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

// ── Component Props ───────────────────────────────────
interface OrderSummaryProps {
    cart: ICart;
    billingCity: string;
    billingValues: Record<string, unknown>;
    isFormValid: boolean;
    onValidateForm: () => Promise<boolean>;
}

export default function OrderSummary({
    cart,
    billingCity,
    billingValues,
    isFormValid,
    onValidateForm,
}: OrderSummaryProps) {
    const billingArea =
        typeof billingValues.area === "string" ? billingValues.area : "";
    // ── Coupon State ──────────────────────────────────
    const [showCoupon, setShowCoupon] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<CouponValidateResponse | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    const validateCouponMutation = useValidateCoupon();
    const createOrderMutation = useCreateOrder();

    // ── Shipping State ────────────────────────────────
    const autoShipping = useMemo<ShippingId>(() => {
        if (billingArea === "Jahangirnagar University") return "ju";
        if (billingCity && isDhakaDistrict(billingCity)) return "dhaka";
        return "outside";
    }, [billingArea, billingCity]);

    const [shippingMethod, setShippingMethod] = useState<ShippingId>(autoShipping);

    // Sync auto-detected shipping when city changes
    React.useEffect(() => {
        setShippingMethod(autoShipping);
    }, [autoShipping]);

    const shippingPrice = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.price ?? 0;

    // ── Payment State ─────────────────────────────────
    const [paymentMethod, setPaymentMethod] = useState<PaymentId>("COD");

    // ── Calculations ──────────────────────────────────
    const subtotal = useMemo(
        () =>
            cart.items.reduce(
                (sum, item) => sum + item.qty * (item.variant?.priceAmount ?? 0),
                0,
            ),
        [cart.items],
    );

    const discountAmount = appliedCoupon?.discountAmount ?? 0;
    const total = Math.max(0, subtotal + shippingPrice - discountAmount);

    // ── Coupon Handlers ───────────────────────────────
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
                const axiosErr = err as { response?: { data?: { message?: string } } };
                setCouponError(axiosErr.response?.data?.message ?? "Invalid coupon");
            } else {
                setCouponError("Invalid coupon");
            }
        }
    };

    // ── Place Order Handler ───────────────────────────
    const handlePlaceOrder = async () => {
        const formValid = await onValidateForm();
        if (!formValid) return;

        const fulfillmentMethod = shippingMethod === "ju" ? "PICKUP" as const : "DELIVERY" as const;

        createOrderMutation.mutate({
            fulfillmentMethod,
            paymentMethod: paymentMethod,
            billingAddressSnapshot: {
                recipientName: billingValues.name,
                phone: billingValues.phone,
                address: billingValues.address,
                district: billingValues.city,
                area: billingValues.area,
                email: billingValues.email || undefined,
            },
            notes: (billingValues.orderNote as string) || undefined,
            couponCode: appliedCoupon?.code || undefined,
        });
    };

    return (
        <div className="space-y-6">
            {/* ── Coupon Section ─────────────────────── */}
            <div>
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
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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
                                        disabled={validateCouponMutation.isPending || !couponCode.trim()}
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
                                <p className="text-sm text-destructive">{couponError}</p>
                            )}
                            {appliedCoupon && (
                                <p className="text-sm text-emerald-600 font-medium">
                                    ✓ Coupon applied — {formatCurrency(appliedCoupon.discountAmount)} off
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <Separator />

            {/* ── Shipping Method ────────────────────── */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Choose Shipping Method
                </h3>
                <RadioGroup
                    value={shippingMethod}
                    onValueChange={(v) => setShippingMethod(v as ShippingId)}
                    className="space-y-2"
                >
                    {SHIPPING_OPTIONS.map((opt) => (
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
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{opt.emoji}</span>
                                    <span className="text-sm font-medium">{opt.label}</span>
                                    {opt.sublabel && (
                                        <span className="text-xs text-muted-foreground">
                                            — {opt.sublabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                                {opt.price === 0 ? "Free" : formatCurrency(opt.price)}
                            </span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>

            <Separator />

            {/* ── Cart Items ────────────────────────── */}
            <div className="space-y-3">
                {cart.items.map((item) => {
                    const product = item.variant?.product;
                    const thumb = product?.thumbNail ?? "/jersey_cravings.png";
                    const title = product?.title ?? "Product";
                    const size = item.variant?.size ?? "";
                    const unitPrice = item.variant?.priceAmount ?? 0;
                    return (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 text-sm"
                        >
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted border">
                                <Image
                                    src={thumb}
                                    alt={title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium line-clamp-1">{title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {size && `Size: ${size} · `}Qty: {item.qty}
                                </p>
                            </div>
                            <span className="font-semibold tabular-nums shrink-0">
                                {formatCurrency(unitPrice * item.qty)}
                            </span>
                        </div>
                    );
                })}
            </div>

            <Separator />

            {/* ── Breakdown ─────────────────────────── */}
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Truck className="size-3.5" />
                        Shipping
                    </span>
                    <span className="tabular-nums">
                        {shippingPrice === 0 ? "Free" : formatCurrency(shippingPrice)}
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
                <Separator />
                <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-base">Total Amount</span>
                    <span className="font-bold text-lg text-pink-600 tabular-nums">
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>

            <Separator />

            {/* ── Payment Method ────────────────────── */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Choose Payment Method
                </h3>
                <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentId)}
                    className="space-y-2"
                >
                    {PAYMENT_OPTIONS.map((opt) => (
                        <Label
                            key={opt.id}
                            htmlFor={`payment-${opt.id}`}
                            className={cn(
                                "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                                paymentMethod === opt.id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    : "border-border hover:border-muted-foreground/30",
                            )}
                        >
                            <RadioGroupItem
                                value={opt.id}
                                id={`payment-${opt.id}`}
                            />
                            <span className="text-sm font-medium">{opt.label}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>

            {/* ── Place Order Button ─────────────────── */}
            <Button
                onClick={handlePlaceOrder}
                disabled={createOrderMutation.isPending || cart.items.length === 0}
                className="w-full h-12 text-base font-bold bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
            >
                {createOrderMutation.isPending ? (
                    <>
                        <Loader2 className="size-5 animate-spin mr-2" />
                        Placing Order...
                    </>
                ) : (
                    "PLACE ORDER"
                )}
            </Button>
        </div>
    );
}
