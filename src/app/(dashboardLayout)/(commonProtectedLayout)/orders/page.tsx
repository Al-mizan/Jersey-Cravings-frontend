"use client";

import React, { useState } from "react";
import OrdersTable from "@/components/modules/Orders/OrdersTable";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/services/order.services";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { orderQueryKeys } from "@/hooks/queries/orderQueryKeys";

export default function MyOrdersPage() {
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sortingState, setSortingState] = useState<SortingState>([]);

    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;

    const { data, isLoading } = useQuery({
        queryKey: orderQueryKeys.myOrders.list({
            status,
            page,
            limit,
        }),
        queryFn: () => getMyOrders(status, page, limit),
        placeholderData: (previousData) => previousData,
        staleTime: 30000,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                <p className="text-muted-foreground mt-1">
                    Track your recent purchases and order statuses.
                </p>
            </div>

            <div className="flex gap-3">
                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value === "ALL" ? undefined : value);
                        setPaginationState((state) => ({
                            ...state,
                            pageIndex: 0,
                        }));
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
            </div>

            <OrdersTable
                orders={data?.data || []}
                meta={data ?? undefined}
                isLoading={isLoading}
                baseRoute="/orders"
                paginationState={paginationState}
                sortingState={sortingState}
                onPaginationChange={setPaginationState}
                onSortingChange={setSortingState}
            />
        </div>
    );
}
