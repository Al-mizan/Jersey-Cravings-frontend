"use client";

import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import OrdersTable from "@/components/modules/Orders/OrdersTable";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "@/services/order.services";

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [paymentStatus, setPaymentStatus] = useState<string | undefined>(
        undefined,
    );
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-orders", searchTerm, status, paymentStatus, page],
        queryFn: () =>
            getAllOrders(
                searchTerm || undefined,
                status,
                paymentStatus,
                undefined,
                page,
                10,
            ),
        staleTime: 30000,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <p className="text-muted-foreground mt-1">
                    Track and manage customer orders.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                />
                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value === "ALL" ? undefined : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full md:w-56">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="PENDING_PAYMENT">
                            Pending Payment
                        </SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={paymentStatus}
                    onValueChange={(value) => {
                        setPaymentStatus(value === "ALL" ? undefined : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full md:w-56">
                        <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SUCCEEDED">Succeeded</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <OrdersTable
                orders={data?.data || null}
                isLoading={isLoading}
                baseRoute="/admin/orders"
            />

            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {data.totalPages}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setPage((p) => Math.min(data.totalPages, p + 1))
                        }
                        disabled={page === data.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
