"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { IOrder } from "@/types/order.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { PaginationMeta } from "@/types/api.types";

interface AdminOrdersTableProps {
    orders: IOrder[];
    meta?: PaginationMeta;
    isLoading?: boolean;
    baseRoute: string;
    paginationState: PaginationState;
    sortingState: SortingState;
    onPaginationChange: (state: PaginationState) => void;
    onSortingChange: (state: SortingState) => void;
    onView?: (order: IOrder) => void;
}

const getStatusVariant = (
    status: string,
): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "DELIVERED") return "default";
    if (status === "CANCELLED" || status === "REFUNDED") return "destructive";
    if (status === "SHIPPED" || status === "PROCESSING") return "secondary";
    return "outline";
};

export default function OrdersTable({
    orders,
    meta,
    isLoading,
    baseRoute,
    paginationState,
    sortingState,
    onPaginationChange,
    onSortingChange,
    onView,
}: AdminOrdersTableProps) {
    const columns = useMemo<ColumnDef<IOrder>[]>(() => {
        return [
            {
                accessorKey: "orderNumber",
                header: "Order",
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <p className="font-medium">
                            {row.original.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.paymentMethod}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <Badge variant={getStatusVariant(row.original.status)}>
                        {row.original.status}
                    </Badge>
                ),
            },
            {
                accessorKey: "paymentStatus",
                header: "Payment",
                cell: ({ row }) => row.original.paymentStatus,
            },
            {
                accessorKey: "totalAmount",
                header: "Total",
                cell: ({ row }) => `৳${row.original.totalAmount}`,
            },
            {
                accessorKey: "placedAt",
                header: "Placed",
                cell: ({ row }) =>
                    new Date(row.original.placedAt).toLocaleDateString(),
            },
            {
                id: "actions",
                header: "Action",
                enableSorting: false,
                cell: ({ row }) => (
                    <Button asChild variant="ghost" size="sm">
                        <Link
                            href={`${baseRoute}/${row.original.id}`}
                            onClick={() => onView?.(row.original)}
                        >
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                ),
            },
        ];
    }, [baseRoute, onView]);

    return (
        <DataTable
            data={orders}
            columns={columns}
            isLoading={isLoading}
            meta={meta}
            pagination={{ state: paginationState, onPaginationChange }}
            sorting={{ state: sortingState, onSortingChange }}
            emptyMessage="No orders found."
        />
    );
}
