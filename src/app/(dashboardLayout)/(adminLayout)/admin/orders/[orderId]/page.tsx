"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    ArrowLeft, 
    Package, 
    User, 
    CreditCard, 
    MapPin, 
    Truck, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Hash, 
    Calendar,
    BadgeCheck,
    AlertCircle,
    Copy,
    ExternalLink
} from "lucide-react";
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
import { getMediaUrl } from "@/lib/media";
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
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    PENDING_PAYMENT: { label: "Pending Payment", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
    PAID: { label: "Paid", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: BadgeCheck },
    PROCESSING: { label: "Processing", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Package },
    SHIPPED: { label: "Shipped", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: Truck },
    DELIVERED: { label: "Delivered", color: "bg-emerald-600 text-white border-emerald-700", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
    REFUNDED: { label: "Refunded", color: "bg-slate-500/10 text-slate-500 border-slate-500/20", icon: AlertCircle },
    EXPIRED: { label: "Expired", color: "bg-slate-500/10 text-slate-500 border-slate-500/20", icon: Clock },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
    UNPAID: { label: "Unpaid", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    SUCCEEDED: { label: "Success", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    PROCESSING: { label: "Processing", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    FAILED: { label: "Failed", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    REFUNDED: { label: "Refunded", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
    CANCELED: { label: "Canceled", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
    REQUIRES_ACTION: { label: "Action Required", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    REQUIRES_PAYMENT_METHOD: { label: "No Method", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
};

const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

export default function OrderDetailsPage() {
    const params = useParams<{ orderId: string }>();
    const orderId = params?.orderId;
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING_PAYMENT");

    const orderQuery = useQuery({
        queryKey: adminOrderKeys.detail(orderId!),
        queryFn: () => getOrderByIdForAdmin(orderId!),
        enabled: Boolean(orderId),
    });

    const order = orderQuery.data;

    useEffect(() => {
        if (order?.status) {
            setSelectedStatus(order.status as OrderStatus);
        }
    }, [order?.status]);

    const statusMutation = useMutation({
        mutationFn: (status: OrderStatus) =>
            updateOrderStatus(orderId!, { status }),
        onSuccess: () => {
            toast.success("Order status updated");
            queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(orderId!) });
            queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
        },
        onError: () => toast.error("Failed to update order status"),
    });

    if (orderQuery.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h1 className="text-2xl font-bold">Order Not Found</h1>
                <Button asChild variant="outline">
                    <Link href="/admin/orders">Back to Orders</Link>
                </Button>
            </div>
        );
    }

    const billingSnapshot = (order.billingAddressSnapshot ?? {}) as Record<string, string>;
    const shippingSnapshot = (order.shippingAddressSnapshot ?? billingSnapshot) as Record<string, string>;
    const orderItems = order.items ?? [];

    const handleStatusUpdate = () => {
        if (selectedStatus === order.status) return;
        statusMutation.mutate(selectedStatus);
    };

    const StatusIcon = statusConfig[order.status as OrderStatus]?.icon || Clock;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 mt-1" asChild>
                        <Link href="/admin/orders">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => {
                                    navigator.clipboard.writeText(order.orderNumber);
                                    toast.success("Order number copied");
                                }}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(order.placedAt || order.createdAt), "PPP p")}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-2xl border shadow-sm">
                    <div className="flex flex-col mr-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Management</span>
                        <Select
                            value={selectedStatus}
                            onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
                        >
                            <SelectTrigger className="w-44 border-none shadow-none font-medium text-sm h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(statusConfig).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {statusConfig[status as OrderStatus].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleStatusUpdate}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 h-10 font-bold"
                        disabled={statusMutation.isPending || selectedStatus === order.status}
                    >
                        {statusMutation.isPending ? "Updating..." : "Update Status"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Order Items & Summary */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items Card */}
                    <Card className="border-none shadow-lg overflow-hidden bg-white/60 backdrop-blur-md">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5 text-red-500" />
                                    Order Items
                                </CardTitle>
                                <Badge variant="secondary" className="font-mono">
                                    {orderItems.length} {orderItems.length === 1 ? 'ITEM' : 'ITEMS'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {orderItems.map((item) => {
                                    const thumb = getMediaUrl(item.product?.media) || item.product?.thumbNail || "/jersey_cravings.png";
                                    const variantSnapshot = (item.variantSnapshot as any) || {};
                                    return (
                                        <div key={item.id} className="p-6 flex items-center gap-6 group hover:bg-muted/20 transition-colors">
                                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted border group-hover:scale-105 transition-transform">
                                                <Image src={thumb} alt={item.productTitleSnapshot} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-base line-clamp-1">{item.productTitleSnapshot}</h4>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {variantSnapshot.size && <Badge variant="outline" className="text-[10px]">{variantSnapshot.size}</Badge>}
                                                    {variantSnapshot.fit && <Badge variant="outline" className="text-[10px]">{variantSnapshot.fit}</Badge>}
                                                    {variantSnapshot.sleeveType && <Badge variant="outline" className="text-[10px]">{variantSnapshot.sleeveType}</Badge>}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Unit Price: {formatCurrency(item.unitPriceAmount)} · Qty: {item.qty}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">{formatCurrency(item.lineTotalAmount)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Totals Section */}
                    <Card className="border-none shadow-md bg-white">
                        <CardContent className="p-8">
                            <div className="space-y-4 max-w-sm ml-auto">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.subtotalAmount)}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(order.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Shipping</span>
                                    <span>{order.shippingAmount > 0 ? formatCurrency(order.shippingAmount) : "Free"}</span>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold">Total Amount</span>
                                    <span className="text-2xl font-black text-red-600">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Status, Customer, Payment info */}
                <div className="space-y-8">
                    {/* Delivery Status */}
                    <Card className="border-none shadow-lg overflow-hidden bg-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base uppercase tracking-widest text-muted-foreground font-bold">Fulfillment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border">
                                <div className={cn("p-3 rounded-xl", statusConfig[order.status as OrderStatus]?.color || "")}>
                                    <StatusIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Current State</p>
                                    <p className="font-bold text-lg">{statusConfig[order.status as OrderStatus]?.label || order.status}</p>
                                </div>
                            </div>

                            <div className="space-y-4 px-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Method:</span>
                                    <span className="capitalize">{order.fulfillmentMethod.toLowerCase()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Area:</span>
                                    <span>{"Standard"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base uppercase tracking-widest text-muted-foreground font-bold">Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                                    {billingSnapshot.recipientName?.[0] || <User className="h-6 w-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold truncate">{billingSnapshot.recipientName || "Guest Customer"}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{order.user?.identifier}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Shipping Address</p>
                                    <div className="text-sm bg-muted/20 p-3 rounded-xl border border-dashed text-muted-foreground leading-relaxed">
                                        <p className="font-bold text-foreground mb-1">{shippingSnapshot.recipientName}</p>
                                        <p>{shippingSnapshot.phone}</p>
                                        <p>{shippingSnapshot.address}</p>
                                        <p>{shippingSnapshot.area}, {shippingSnapshot.district}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base uppercase tracking-widest text-muted-foreground font-bold">Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/30 border">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Method</p>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <CreditCard className="h-4 w-4 text-blue-500" />
                                        {order.paymentMethod}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 border">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</p>
                                    <Badge variant="outline" className={cn("font-bold text-[10px]", paymentStatusConfig[order.paymentStatus as PaymentStatus]?.color)}>
                                        {paymentStatusConfig[order.paymentStatus as PaymentStatus]?.label}
                                    </Badge>
                                </div>
                            </div>

                            {order.payment?.transactionId && (
                                <div className="p-4 rounded-2xl bg-slate-900 text-white">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Transaction ID</p>
                                    <div className="flex items-center justify-between font-mono text-xs">
                                        <span className="truncate mr-2">{order.payment.transactionId}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 hover:bg-white/10" 
                                            onClick={() => {
                                                navigator.clipboard.writeText(order.payment!.transactionId!);
                                                toast.success("Copied");
                                            }}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
