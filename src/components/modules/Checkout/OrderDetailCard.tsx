"use client";

import React from "react";
import Image from "next/image";
import { MapPin, CreditCard, Tag, Truck } from "lucide-react";
import { getMediaUrl } from "@/lib/media";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { IOrder } from "@/types/order.types";

const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

interface OrderDetailCardProps {
    order: IOrder;
}

export default function OrderDetailCard({ order }: OrderDetailCardProps) {
    const billingSnapshot = (order.billingAddressSnapshot ?? {}) as Record<
        string,
        string
    >;
    const shippingSnapshot = (order.shippingAddressSnapshot ??
        billingSnapshot) as Record<string, string>;

    const orderItems = order.items ?? [];

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-base">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
                {/* ── Line Items ─────────────────────── */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Items
                    </h4>
                    {orderItems.map((item) => {
                        const variantSnapshot =
                            (item.variantSnapshot as {
                                size?: string;
                            } | null) ?? null;
                        const thumb =
                            getMediaUrl(item.product?.media) ||
                            item.product?.thumbNail ||
                            "/jersey_cravings.png";
                        const title =
                            item.product?.title ??
                            item.productTitleSnapshot ??
                            "Product";
                        const size =
                            item.variant?.size ?? variantSnapshot?.size ?? "";
                        const unitPrice = item.unitPriceAmount ?? 0;
                        const qty = item.qty ?? 1;
                        const lineTotal =
                            item.lineTotalAmount ?? unitPrice * qty;

                        return (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 text-sm"
                            >
                                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted border">
                                    <Image
                                        src={thumb}
                                        alt={title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium line-clamp-1">
                                        {title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {size && `Size: ${size} · `}Qty: {qty}
                                    </p>
                                </div>
                                <span className="font-semibold tabular-nums shrink-0">
                                    {formatCurrency(lineTotal)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <Separator />

                {/* ── Shipping Address ───────────────── */}
                {Object.keys(shippingSnapshot).length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            Shipping Address
                        </h4>
                        <div className="text-sm space-y-0.5 pl-5">
                            {shippingSnapshot.recipientName && (
                                <p className="font-medium">
                                    {shippingSnapshot.recipientName}
                                </p>
                            )}
                            {shippingSnapshot.phone && (
                                <p className="text-muted-foreground">
                                    {shippingSnapshot.phone}
                                </p>
                            )}
                            {shippingSnapshot.address && (
                                <p className="text-muted-foreground">
                                    {shippingSnapshot.address}
                                </p>
                            )}
                            {(shippingSnapshot.area ||
                                shippingSnapshot.district) && (
                                <p className="text-muted-foreground">
                                    {[
                                        shippingSnapshot.area,
                                        shippingSnapshot.district,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <Separator />

                {/* ── Payment Info ────────────────────── */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <CreditCard className="size-3.5" />
                        Payment
                    </h4>
                    <div className="text-sm space-y-1 pl-5">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Method
                            </span>
                            <span className="font-medium">
                                {order.paymentMethod === "COD"
                                    ? "Cash on Delivery"
                                    : "Bkash/Nagad"}
                            </span>
                        </div>
                        {order.payment?.transactionId && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    TrxID
                                </span>
                                <span className="font-mono font-medium text-xs">
                                    {order.payment.transactionId}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* ── Breakdown ───────────────────────── */}
                <div className="space-y-2 text-sm">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <Tag className="size-3.5" />
                        Summary
                    </h4>
                    <div className="space-y-1.5 pl-5">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span className="tabular-nums">
                                {formatCurrency(order.subtotalAmount ?? 0)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Truck className="size-3" />
                                Shipping
                            </span>
                            <span className="tabular-nums">
                                {order.shippingAmount
                                    ? formatCurrency(order.shippingAmount)
                                    : "Free"}
                            </span>
                        </div>
                        {(order.discountAmount ?? 0) > 0 && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Discount</span>
                                <span className="tabular-nums">
                                    −{formatCurrency(order.discountAmount ?? 0)}
                                </span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between pt-1">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-pink-600 text-base tabular-nums">
                                {formatCurrency(order.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Order Notes ─────────────────────── */}
                {order.notes && (
                    <>
                        <Separator />
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                Notes
                            </h4>
                            <p className="text-sm text-muted-foreground pl-0.5">
                                {order.notes}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
