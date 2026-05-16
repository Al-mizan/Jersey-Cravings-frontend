"use client";

import React from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { motion } from "motion/react";
import { ArrowLeft, Hash, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import OrderStatusStepper from "@/components/modules/Checkout/OrderStatusStepper";
import OrderDetailCard from "@/components/modules/Checkout/OrderDetailCard";
import BkashPaymentDialog from "@/components/modules/Checkout/BkashPaymentDialog";
import { useMyOrderById } from "@/hooks/useCheckout";

const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

type OrderStatus =
    | "PENDING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED";

export default function OrderTrackingPage() {
    const params = useParams<{ orderId: string }>();
    const orderId = params.orderId;

    const { data: order, isLoading, error } = useMyOrderById(orderId);
    const [bkashDialogOpen, setBkashDialogOpen] = React.useState(false);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-2xl text-center space-y-4">
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

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-2xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Button variant="ghost" size="sm" className="mb-4" asChild>
                    <Link href="/my-section/orders">
                        <ArrowLeft className="size-4 mr-1" />
                        All Orders
                    </Link>
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-heading flex items-center gap-2">
                            <Hash className="size-4 sm:size-5 text-pink-500" />
                            Order {order.orderNumber}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted-foreground mt-1.5">
                            <span className="flex items-center gap-1">
                                <Calendar className="size-3.5" />
                                {format(
                                    new Date(order.placedAt || order.createdAt),
                                    "MMM dd, yyyy",
                                )}
                            </span>
                            <span className="flex items-center gap-1">
                                <CreditCard className="size-3.5" />
                                {order.paymentMethod === "COD"
                                    ? "Cash on Delivery"
                                    : "Bkash/Nagad"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</span>
                        <span className="font-bold text-xl sm:text-2xl text-pink-600 tabular-nums">
                            {formatCurrency(order.totalAmount)}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Stepper */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="shadow-sm mb-6">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base font-bold">
                            Order Status
                        </CardTitle>
                        {order.status === "PENDING_PAYMENT" &&
                            order.paymentMethod !== "COD" && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-pink-200 text-pink-600 hover:bg-pink-50 h-8 text-xs font-bold px-3"
                                        onClick={() => setBkashDialogOpen(true)}
                                    >
                                        <Hash className="size-3.5 mr-1.5" />
                                        Manual Verify
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-pink-600 hover:bg-pink-700 text-white h-8 text-xs font-bold px-4"
                                        asChild
                                    >
                                        <Link href={`/make-payment/${order.id}`}>
                                            <CreditCard className="size-3.5 mr-1.5" />
                                            Pay Now
                                        </Link>
                                    </Button>
                                </div>
                            )}
                    </CardHeader>
                    <CardContent className="px-6 pb-4">
                        <OrderStatusStepper
                            status={order.status as OrderStatus}
                        />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Order Detail Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <OrderDetailCard order={order} />
            </motion.div>

            {/* Bkash Dialog */}
            <BkashPaymentDialog
                open={bkashDialogOpen}
                onOpenChange={setBkashDialogOpen}
                orderId={order.id}
                totalAmount={order.totalAmount}
            />
        </div>
    );
}
