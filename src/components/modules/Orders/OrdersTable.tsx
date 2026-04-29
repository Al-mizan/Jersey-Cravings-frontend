"use client";

import React from "react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye } from "lucide-react";
import type { IOrder } from "@/types/order.types";

interface OrdersTableProps {
    orders: IOrder[] | null;
    isLoading?: boolean;
    baseRoute: string;
}

const getStatusVariant = (
    status: string,
): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "DELIVERED") return "default";
    if (status === "CANCELLED" || status === "REFUNDED") return "destructive";
    if (status === "SHIPPED" || status === "PROCESSING") return "secondary";
    return "outline";
};

const OrdersTable = ({ orders, isLoading, baseRoute }: OrdersTableProps) => {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Placed</TableHead>
                            <TableHead className="w-20">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-10" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No orders found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Placed</TableHead>
                        <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-medium">
                                        {order.orderNumber}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.paymentMethod}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(order.status)}>
                                    {order.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{order.paymentStatus}</TableCell>
                            <TableCell>৳{order.totalAmount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(order.placedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={`${baseRoute}/${order.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default OrdersTable;
