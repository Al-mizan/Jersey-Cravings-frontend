"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, User, CreditCard, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { adminOrderKeys } from "@/hooks/queries/adminQueryKeys";
import { cn } from "@/lib/utils";
import {
    getOrderByIdForAdmin,
    updateOrderStatus,
} from "@/services/order.service";
import type {
    IAdminOrder,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
} from "@/types/order.types";
import DetailCard from "@/components/shared/detail/DetailCard";
import DetailRow from "@/components/shared/detail/DetailRow";
import { toast } from "sonner";
import { useState } from "react";

const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
    UNPAID: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    SUCCEEDED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    REFUNDED: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
    PROCESSING: "border-blue-500/20 bg-blue-500/10 text-blue-600",
    FAILED: "border-red-500/20 bg-red-500/10 text-red-600",
    REQUIRES_PAYMENT_METHOD:
        "border-amber-500/20 bg-amber-500/10 text-amber-600",
    REQUIRES_ACTION: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    CANCELED: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
};

const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
    PROCESSING: "border-blue-500/20 bg-blue-500/10 text-blue-600",
    SHIPPED: "border-indigo-500/20 bg-indigo-500/10 text-indigo-600",
    DELIVERED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    CANCELLED: "border-red-500/20 bg-red-500/10 text-red-600",
    REFUNDED: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
    EXPIRED: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
    PAID: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
    "PENDING_PAYMENT",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

export default function OrderDetailsPage() {
    const params = useParams<{ orderId: string }>();
    const orderId = params?.orderId;
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] =
        useState<OrderStatus>("PROCESSING");

    const orderQuery = useQuery({
        queryKey: adminOrderKeys.detail(orderId!),
        queryFn: () => getOrderByIdForAdmin(orderId!),
        enabled: Boolean(orderId),
    });

    const statusMutation = useMutation({
        mutationFn: (status: OrderStatus) =>
            updateOrderStatus(orderId!, { status }),
        onSuccess: () => {
            toast.success("Order status updated");
            queryClient.invalidateQueries({
                queryKey: adminOrderKeys.detail(orderId!),
            });
            queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
        },
        onError: () => toast.error("Failed to update order status"),
    });

    const order = orderQuery.data;

    if (!order) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold">Order not found</h1>
                <Button asChild variant="outline">
                    <Link href="/admin/orders">Back to orders</Link>
                </Button>
            </div>
        );
    }

    const billingSnapshot = (order.billingAddressSnapshot ?? {}) as Record<
        string,
        string
    >;
    const shippingSnapshot = (order.shippingAddressSnapshot ??
        billingSnapshot) as Record<string, string>;
    const orderItems = order.items ?? [];

    const handleStatusUpdate = () => {
        if (selectedStatus === order.status) return;
        statusMutation.mutate(selectedStatus);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/orders">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {order.orderNumber}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Order details and management
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={selectedStatus}
                        onValueChange={(value) =>
                            setSelectedStatus(value as OrderStatus)
                        }
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ORDER_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.replace(/_/g, " ")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleStatusUpdate}
                        disabled={
                            statusMutation.isPending ||
                            selectedStatus === order.status
                        }
                    >
                        {statusMutation.isPending ? "Updating..." : "Save"}
                    </Button>
                </div>
            </div>

            {/* Order Info Card */}
            <DetailCard title="Order Information">
                <DetailRow
                    label="Order Number"
                    value={
                        <span className="font-mono">{order.orderNumber}</span>
                    }
                />
                <DetailRow
                    label="Order Status"
                    value={
                        <span
                            className={cn(
                                "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                                ORDER_STATUS_CLASS[order.status] ??
                                    "border-border bg-muted text-muted-foreground",
                            )}
                        >
                            {order.status}
                        </span>
                    }
                />
                <DetailRow
                    label="Payment Status"
                    value={
                        <span
                            className={cn(
                                "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                                PAYMENT_STATUS_CLASS[order.paymentStatus] ??
                                    "border-border bg-muted text-muted-foreground",
                            )}
                        >
                            {order.paymentStatus}
                        </span>
                    }
                />
                <DetailRow label="Payment Method" value={order.paymentMethod} />
                {order.payment?.transactionId && (
                    <DetailRow
                        label="Transaction ID"
                        value={
                            <span className="font-mono">
                                {order.payment.transactionId}
                            </span>
                        }
                    />
                )}
                <DetailRow
                    label="Placed At"
                    value={new Date(order.placedAt).toLocaleString()}
                />
            </DetailCard>

            {/* Customer Card */}
            <DetailCard title="Customer Information">
                <DetailRow label="Identifier" value={order.user?.identifier ?? "—"} />
                {billingSnapshot.recipientName && (
                    <DetailRow
                        label="Name"
                        value={billingSnapshot.recipientName}
                    />
                )}
                {billingSnapshot.phone && (
                    <DetailRow label="Phone" value={billingSnapshot.phone} />
                )}
                {shippingSnapshot.address && (
                    <DetailRow
                        label="Shipping Address"
                        value={
                            <div className="text-right">
                                <p>{shippingSnapshot.recipientName}</p>
                                <p className="text-muted-foreground">
                                    {shippingSnapshot.phone}
                                </p>
                                <p className="text-muted-foreground">
                                    {shippingSnapshot.address}
                                </p>
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
                        }
                    />
                )}
            </DetailCard>

            {/* Items Card */}
            <DetailCard title="Order Items">
                <div className="space-y-3">
                    {orderItems.map((item) => {
                        const variantSnapshot =
                            (item.variantSnapshot as {
                                size?: string;
                                fit?: string;
                                sleeveType?: string;
                            } | null) ?? null;
                        const thumb =
                            item.product?.thumbNail ?? "/jersey_cravings.png";
                        const title =
                            item.product?.title ??
                            item.productTitleSnapshot ??
                            "Product";
                        const size =
                            item.variant?.size ?? variantSnapshot?.size ?? "";
                        const fit =
                            item.variant?.fit ?? variantSnapshot?.fit ?? "";
                        const sleeve =
                            item.variant?.sleeveType ??
                            variantSnapshot?.sleeveType ??
                            "";
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
                                        {[size, fit, sleeve]
                                            .filter(Boolean)
                                            .join(" / ")}{" "}
                                        · Qty: {qty}
                                    </p>
                                </div>
                                <span className="font-semibold tabular-nums shrink-0">
                                    {formatCurrency(lineTotal)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </DetailCard>

            {/* Payment Summary Card */}
            <DetailCard title="Payment Summary">
                <DetailRow
                    label="Subtotal"
                    value={formatCurrency(order.subtotalAmount ?? 0)}
                />
                {(order.discountAmount ?? 0) > 0 && (
                    <DetailRow
                        label="Discount"
                        value={
                            <span className="text-emerald-600">
                                -{formatCurrency(order.discountAmount ?? 0)}
                            </span>
                        }
                    />
                )}
                <DetailRow
                    label="Shipping"
                    value={
                        order.shippingAmount
                            ? formatCurrency(order.shippingAmount)
                            : "Free"
                    }
                />
                {(order.pointsRedeemed ?? 0) > 0 && (
                    <DetailRow
                        label="Points Redeemed"
                        value={`${order.pointsRedeemed} pts`}
                    />
                )}
                {(order.giftAddonAmount ?? 0) > 0 && (
                    <DetailRow
                        label="Gift Addon"
                        value={formatCurrency(order.giftAddonAmount)}
                    />
                )}
                <Separator />
                <DetailRow
                    label="Total"
                    value={
                        <span className="font-bold text-lg">
                            {formatCurrency(order.totalAmount)}
                        </span>
                    }
                />
            </DetailCard>
        </div>
    );
}
