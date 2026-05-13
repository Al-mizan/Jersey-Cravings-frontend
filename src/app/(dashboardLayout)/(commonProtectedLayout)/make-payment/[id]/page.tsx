"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "motion/react";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    Hash,
    Loader2,
    PackageCheck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import BkashPaymentDialog from "@/components/modules/Checkout/BkashPaymentDialog";
import { useMyOrderById, useCancelOrder } from "@/hooks/useCheckout";

const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

function getStatusBadge(status: string) {
    const map: Record<
        string,
        {
            variant: "default" | "secondary" | "destructive" | "outline";
            className: string;
        }
    > = {
        PENDING_PAYMENT: {
            variant: "outline",
            className: "border-amber-300 bg-amber-50 text-amber-700",
        },
        PAID: {
            variant: "outline",
            className: "border-teal-300 bg-teal-50 text-teal-700",
        },
        PROCESSING: {
            variant: "outline",
            className: "border-amber-300 bg-amber-50 text-amber-700",
        },
        SHIPPED: {
            variant: "outline",
            className: "border-blue-300 bg-blue-50 text-blue-700",
        },
        DELIVERED: {
            variant: "outline",
            className: "border-emerald-300 bg-emerald-50 text-emerald-700",
        },
        CANCELLED: { variant: "destructive", className: "" },
        REFUNDED: {
            variant: "outline",
            className: "border-zinc-300 bg-zinc-50 text-zinc-700",
        },
        EXPIRED: {
            variant: "outline",
            className: "border-zinc-300 bg-zinc-50 text-zinc-600",
        },
    };
    const config = map[status] ?? {
        variant: "secondary" as const,
        className: "",
    };
    return (
        <Badge variant={config.variant} className={config.className}>
            {status.replace(/_/g, " ")}
        </Badge>
    );
}

export default function MakePaymentPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const orderId = params.id;

    const { data: order, isLoading, error } = useMyOrderById(orderId);
    const cancelOrderMutation = useCancelOrder();

    const [bkashDialogOpen, setBkashDialogOpen] = useState(false);

    const handleCancelOrder = async () => {
        await cancelOrderMutation.mutateAsync(orderId);
        router.push("/my-section/orders");
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-lg">
                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-4">
                <p className="text-muted-foreground">
                    Order not found or could not be loaded.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/my-section/orders">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to Orders
                    </Link>
                </Button>
            </div>
        );
    }

    const isBkash =
        order.paymentMethod === "BKASH" || order.paymentMethod === "NAGAD";
    const isCod = order.paymentMethod === "COD";
    const isPendingPayment = order.status === "PENDING_PAYMENT";

    return (
        <div className="container mx-auto px-4 py-10 lg:py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-lg"
            >
                <Button variant="ghost" size="sm" className="mb-6" asChild>
                    <Link href="/my-section/orders">
                        <ArrowLeft className="size-4 mr-1" />
                        My Orders
                    </Link>
                </Button>

                <Card className="shadow-md border-border/60">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <PackageCheck className="size-7 text-primary" />
                        </div>
                        <CardTitle className="text-xl">
                            Order Confirmation
                        </CardTitle>
                        <CardDescription>
                            Thank you for your order! Here are your details.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5 px-6 pb-6">
                        {/* Order Details List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Hash className="size-4" />
                                    Order number
                                </span>
                                <span className="font-bold">
                                    {order.orderNumber}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="size-4" />
                                    Date
                                </span>
                                <span className="font-semibold">
                                    {format(
                                        new Date(
                                            order.placedAt || order.createdAt,
                                        ),
                                        "MMMM dd, yyyy",
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <CreditCard className="size-4" />
                                    Total
                                </span>
                                <span className="font-bold text-pink-600 text-base">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Payment method
                                </span>
                                <span className="font-semibold">
                                    {isBkash
                                        ? "Bkash/Nagad"
                                        : "Cash on Delivery"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Order Status
                                </span>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        {isBkash && isPendingPayment && (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground text-center">
                                    Thank you for your order, please click the
                                    button below to pay.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setBkashDialogOpen(true)}
                                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
                                    >
                                        PAY VIA BKASH
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelOrder}
                                        disabled={cancelOrderMutation.isPending}
                                        className="flex-1"
                                    >
                                        {cancelOrderMutation.isPending ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            "CANCEL ORDER"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isCod && (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground text-center">
                                    Your order has been placed. Pay with cash
                                    when the order is delivered.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/my-section/orders/${orderId}`,
                                        )
                                    }
                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
                                >
                                    CONFIRM ORDER
                                </Button>
                            </div>
                        )}

                        {!isPendingPayment && !isCod && (
                            <div className="text-center">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.push(
                                            `/my-section/orders/${orderId}`,
                                        )
                                    }
                                    className="w-full"
                                >
                                    View Order Details
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bkash Dialog */}
            <BkashPaymentDialog
                open={bkashDialogOpen}
                onOpenChange={setBkashDialogOpen}
                orderId={orderId}
                totalAmount={order.totalAmount}
            />
        </div>
    );
}
