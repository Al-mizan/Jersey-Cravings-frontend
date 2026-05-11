"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "motion/react";
import {
    ArrowLeft,
    Calendar,
    ChevronRight,
    CreditCard,
    Hash,
    Package,
    ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrders } from "@/hooks/useCheckout";

const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

const STATUS_COLORS: Record<string, string> = {
    PENDING_PAYMENT: "border-yellow-300 bg-yellow-50 text-yellow-700",
    PAID: "border-teal-300 bg-teal-50 text-teal-700",
    PROCESSING: "border-amber-300 bg-amber-50 text-amber-700",
    SHIPPED: "border-blue-300 bg-blue-50 text-blue-700",
    DELIVERED: "border-emerald-300 bg-emerald-50 text-emerald-700",
    CANCELLED: "border-red-300 bg-red-50 text-red-700",
    REFUNDED: "border-zinc-300 bg-zinc-50 text-zinc-700",
    EXPIRED: "border-zinc-300 bg-zinc-50 text-zinc-600",
};

export default function OrdersListPage() {
    const { data: orders, isLoading, error } = useMyOrders();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-2xl space-y-4">
                <Skeleton className="h-8 w-40" />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-muted-foreground">
                    Failed to load orders. Please try again.
                </p>
            </div>
        );
    }

    const orderList = orders ?? [];

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Button variant="ghost" size="sm" className="mb-4" asChild>
                    <Link href="/products">
                        <ArrowLeft className="size-4 mr-1" />
                        Continue Shopping
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight font-heading">
                    My Orders
                </h1>
                <p className="text-muted-foreground mt-1">
                    Track and manage all your orders
                </p>
            </motion.div>

            {orderList.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 space-y-4"
                >
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                        <ShoppingBag className="size-7 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-semibold">No orders yet</p>
                    <p className="text-sm text-muted-foreground">
                        Start shopping and your orders will appear here.
                    </p>
                    <Button asChild>
                        <Link href="/products">Browse Products</Link>
                    </Button>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {orderList.map((order, i) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link
                                href={`/my-section/orders/${order.id}`}
                                className="block group"
                            >
                                <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                {/* Icon */}
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                    <Package className="size-5 text-primary" />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-bold flex items-center gap-1">
                                                            <Hash className="size-3.5" />
                                                            {order.orderNumber}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                STATUS_COLORS[
                                                                    order.status
                                                                ] ?? ""
                                                            }
                                                        >
                                                            {order.status.replace(
                                                                /_/g,
                                                                " ",
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="size-3" />
                                                            {format(
                                                                new Date(
                                                                    order.placedAt ||
                                                                        order.createdAt,
                                                                ),
                                                                "MMM dd, yyyy",
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <CreditCard className="size-3" />
                                                            {order.paymentMethod ===
                                                            "STRIPE"
                                                                ? "Bkash"
                                                                : "COD"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price + Arrow */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-bold text-pink-600 tabular-nums">
                                                    {formatCurrency(
                                                        order.totalAmount,
                                                    )}
                                                </span>
                                                <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
