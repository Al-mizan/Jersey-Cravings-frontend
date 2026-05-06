"use client";

import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import OrdersTable from "@/components/modules/Orders/OrdersTable";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "@/services/order.services";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { adminOrderKeys } from "@/hooks/queries/adminQueryKeys";

import {
    ADMIN_PAGINATION_DEFAULTS,
    ADMIN_STALE_TIMES,
    ADMIN_QUERY_DEFAULTS,
} from "@/config/adminPageDefaults";

export default function AdminOrdersPageClient() {
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [paymentStatus, setPaymentStatus] = useState<string | undefined>(
        undefined,
    );

    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: ADMIN_PAGINATION_DEFAULTS.limit,
    });
    const [sortingState, setSortingState] = useState<SortingState>([]);

    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;

    const { data, isLoading } = useQuery({
        queryKey: adminOrderKeys.list({
            searchTerm,
            status,
            paymentStatus,
            page,
            limit,
        }),
        queryFn: () =>
            getAllOrders(
                searchTerm || undefined,
                status,
                paymentStatus,
                undefined,
                page,
                limit,
            ),
        placeholderData: (previousData) => previousData,
        staleTime: ADMIN_STALE_TIMES.list,
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
                        setPaginationState((s) => ({ ...s, pageIndex: 0 }));
                    }}
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                />
                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value === "ALL" ? undefined : value);
                        setPaginationState((s) => ({ ...s, pageIndex: 0 }));
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
                        setPaginationState((s) => ({ ...s, pageIndex: 0 }));
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
                orders={data?.data || []}
                meta={data ?? undefined}
                isLoading={isLoading}
                baseRoute="/admin/orders"
                paginationState={paginationState}
                sortingState={sortingState}
                onPaginationChange={setPaginationState}
                onSortingChange={setSortingState}
            />
        </div>
    );
}
