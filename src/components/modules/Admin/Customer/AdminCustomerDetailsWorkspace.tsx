"use client";

import DateCell from "@/components/shared/cell/DateCell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { adminCustomerKeys, adminOrderKeys } from "@/hooks/queries/adminQueryKeys";
import { cn } from "@/lib/utils";
import { getCustomerById } from "@/services/customer.service";
import { getAllOrdersForAdmin } from "@/services/order.service";
import type { ICustomerProfile } from "@/types/customer.types";
import type { IAdminOrder } from "@/types/order.types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import { useMemo, useState } from "react";

interface AdminCustomerDetailsWorkspaceProps {
    customerId: string;
}

const PAYMENT_BADGE: Record<string, string> = {
    SUCCEEDED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    UNPAID: "border-muted-foreground/25 bg-muted text-muted-foreground",
    FAILED: "border-destructive/25 bg-destructive/10 text-destructive",
    PROCESSING: "border-amber-500/20 bg-amber-500/10 text-amber-700",
};

const DEFAULT_ORDER_PAGE_SIZE = 10;

export function AdminCustomerDetailsWorkspace({
    customerId,
}: AdminCustomerDetailsWorkspaceProps) {
    const [orderPagination, setOrderPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_ORDER_PAGE_SIZE,
    });

    const customerQuery = useQuery({
        queryKey: adminCustomerKeys.detail(customerId),
        queryFn: () => getCustomerById(customerId),
    });

    const customerUserId = customerQuery.data?.userId;

    const ordersQuery = useQuery({
        queryKey: adminOrderKeys.list({
            searchTerm: undefined,
            userId: customerUserId,
            page: orderPagination.pageIndex + 1,
            limit: orderPagination.pageSize,
            sortBy: "placedAt",
            sortOrder: "desc",
        }),
        queryFn: () =>
            getAllOrdersForAdmin(
                undefined,
                undefined,
                undefined,
                undefined,
                customerUserId as string,
                orderPagination.pageIndex + 1,
                orderPagination.pageSize,
                "placedAt",
                "desc",
            ),
        enabled: Boolean(customerUserId),
    });

    const orderColumns = useMemo(
        () => orderColumnsDefinition(customerQuery.data?.identifier),
        [customerQuery.data?.identifier],
    );

    const orderTotalPages =
        ordersQuery.data && ordersQuery.data.totalPages > 0
            ? ordersQuery.data.totalPages
            : 1;

    const orderTable = useReactTable({
        data: ordersQuery.data?.data ?? [],
        columns: orderColumns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: orderTotalPages,
        state: {
            pagination: orderPagination,
        },
        onPaginationChange: setOrderPagination,
    });

    if (customerQuery.isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-40 animate-pulse rounded-xl border bg-muted/40" />
                <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />
            </div>
        );
    }

    if (!customerQuery.data) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Customer not found or unavailable.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <CustomerSummaryCard customer={customerQuery.data} />

            <Card className="rounded-xl border">
                <CardHeader className="border-b py-4">
                    <CardTitle className="text-lg">Orders &amp; payments</CardTitle>
                    <CardDescription>
                        Completed and in-progress checkout activity for{" "}
                        <span className="font-medium text-foreground">{customerQuery.data.identifier}</span>
                        .
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {orderTable.getHeaderGroups().map((hg) => (
                                    <TableRow key={hg.id} className="hover:bg-transparent">
                                        {hg.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {ordersQuery.isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={orderColumns.length}
                                            className="h-32 text-center text-sm text-muted-foreground"
                                        >
                                            Loading orders…
                                        </TableCell>
                                    </TableRow>
                                ) : orderTable.getRowModel().rows.length ? (
                                    orderTable.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={orderColumns.length}
                                            className="h-32 text-center text-sm text-muted-foreground"
                                        >
                                            No orders for this customer yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {ordersQuery.data &&
                        !ordersQuery.isLoading &&
                        ordersQuery.data.total > 0 && (
                        <div className="border-t p-2">
                            <DataTablePagination
                                table={orderTable}
                                totalPages={Math.max(ordersQuery.data.totalPages, 1)}
                                totalRows={ordersQuery.data.total}
                                isLoading={ordersQuery.isLoading}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function orderColumnsDefinition(fallbackIdentifier: string | undefined): ColumnDef<IAdminOrder>[] {
    const columns: ColumnDef<IAdminOrder>[] = [
        {
            id: "orderNumber",
            header: "Order",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm font-semibold">
                        {row.original.orderNumber}
                    </span>
                    <Button variant="link" className="h-auto p-0 text-xs" asChild>
                        <Link href={`/admin/orders/${row.original.id}`}>Admin detail</Link>
                    </Button>
                </div>
            ),
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className="rounded-md border border-border px-2 py-0.5 text-xs font-medium">
                    {row.original.status}
                </span>
            ),
        },
        {
            id: "payment",
            header: "Payment",
            cell: ({ row }) => {
                const pay = row.original.payment;
                if (!pay) {
                    return <span className="text-sm text-muted-foreground">—</span>;
                }
                return (
                    <div className="flex flex-col gap-1 text-sm">
                        <span className={cn(
                            "inline-flex w-fit rounded-full border px-2 py-0.5 text-xs font-semibold",
                            PAYMENT_BADGE[pay.status] ??
                            "border-border bg-muted text-muted-foreground",
                        )}
                        >
                            {pay.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {pay.method} · {pay.transactionId}
                        </span>
                        <span className="font-medium tabular-nums">
                            {row.original.currency}{" "}
                            {pay.amount.toFixed(2)}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "total",
            header: "Order total",
            cell: ({ row }) => (
                <span className="text-sm font-semibold tabular-nums">
                    {row.original.currency} {row.original.totalAmount.toFixed(2)}
                </span>
            ),
        },
        {
            id: "placedAt",
            header: "Placed",
            cell: ({ row }) => (
                <DateCell date={row.original.placedAt} formatString="MMM d, yyyy HH:mm" />
            ),
        },
        {
            id: "identifier",
            header: "Account",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.user?.identifier ?? fallbackIdentifier ?? "—"}
                </span>
            ),
        },
    ];
    return columns;
}

function CustomerSummaryCard({ customer }: { customer: ICustomerProfile }) {
    return (
        <Card className="rounded-xl border">
            <CardHeader className="border-b py-4">
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
                    <span>{customer.identifier}</span>
                    {customer.contactNumber && <span>· {customer.contactNumber}</span>}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryItem label="Address" value={customer.address ?? "—"} />
                <SummaryItem
                    label="Lifetime points"
                    value={`${customer.pointsBalance} pts (earned ${customer.lifetimePointsEarned}, redeemed ${customer.lifetimePointsRedeemed})`}
                />
                <SummaryItem
                    label="Purchased quantity"
                    value={String(customer.totalPurchasedQty)}
                />
                <SummaryItem
                    label="Record"
                    value={customer.isDeleted ? "Soft-deleted" : "Active"}
                />
            </CardContent>
        </Card>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 text-sm text-foreground">{value}</p>
        </div>
    );
}
