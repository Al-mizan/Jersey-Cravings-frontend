"use client";

import DateCell from "@/components/shared/cell/DateCell";
import DataTable from "@/components/shared/table/DataTable";
import type {
    DataTableFilterConfig,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { adminPaymentKeys } from "@/hooks/queries/adminQueryKeys";
import { cn } from "@/lib/utils";
import {
    getAllPaymentsForAdmin,
    collectCod,
    refundPayment,
} from "@/services/order.service";
import type {
    IPayment,
    PaymentStatus,
    PaymentMethod,
} from "@/types/order.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, MoreHorizontal, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";

const DEFAULT_LIMIT = 10;

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

const PAYMENT_METHOD_BADGE: Record<PaymentMethod, string> = {
    BKASH: "border-pink-500/20 bg-pink-500/10 text-pink-600",
    NAGAD: "border-orange-500/20 bg-orange-500/10 text-orange-600",
    COD: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600",
};

// ─── Payment Actions Cell ─────────────────────────────────────────────────
function PaymentActionsCell({ payment }: { payment: IPayment }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const collectCodMutation = useMutation({
        mutationFn: () =>
            collectCod(payment.id, { collectedAt: new Date().toISOString() }),
        onSuccess: () => {
            toast.success("COD collected successfully");
            queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
            setOpen(false);
        },
        onError: () => toast.error("Failed to collect COD"),
    });

    const refundMutation = useMutation({
        mutationFn: () =>
            refundPayment(payment.id, { amount: 0, reason: "Admin refund" }),
        onSuccess: () => {
            toast.success("Payment refunded successfully");
            queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
            setOpen(false);
        },
        onError: () => toast.error("Failed to refund payment"),
    });

    const handleCollectCod = () => {
        toast.custom(
            (t) => (
                <div className="w-90 rounded-xl border bg-card p-4 shadow-lg">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold">
                            Collect COD payment?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Mark this COD payment as collected.
                        </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toast.dismiss(t)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                                toast.dismiss(t);
                                await collectCodMutation.mutateAsync();
                            }}
                            disabled={collectCodMutation.isPending}
                        >
                            {collectCodMutation.isPending
                                ? "Collecting..."
                                : "Confirm"}
                        </Button>
                    </div>
                </div>
            ),
            {
                position: "top-center",
                duration: Infinity,
            },
        );
    };

    const handleRefund = () => {
        toast.custom(
            (t) => (
                <div className="w-90 rounded-xl border bg-card p-4 shadow-lg">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold">
                            Refund this payment?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            This will mark the payment as refunded.
                        </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toast.dismiss(t)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                                toast.dismiss(t);
                                await refundMutation.mutateAsync();
                            }}
                            disabled={refundMutation.isPending}
                        >
                            {refundMutation.isPending
                                ? "Refunding..."
                                : "Confirm Refund"}
                        </Button>
                    </div>
                </div>
            ),
            {
                position: "top-center",
                duration: Infinity,
            },
        );
    };

    const canCollectCod =
        payment.method === "COD" && payment.status === "UNPAID";
    const canRefund = payment.status === "SUCCEEDED";

    if (!canCollectCod && !canRefund) {
        return null;
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-8 w-8 p-0 rounded-md transition-colors",
                        "text-muted-foreground hover:text-foreground",
                        "hover:bg-accent data-[state=open]:bg-accent data-[state=open]:text-foreground",
                    )}
                >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="w-44 rounded-xl border border-border/60 shadow-lg p-1"
            >
                {canCollectCod && (
                    <DropdownMenuItem
                        className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                            "cursor-pointer transition-colors",
                            "focus:bg-accent focus:text-accent-foreground",
                        )}
                        onClick={handleCollectCod}
                        disabled={collectCodMutation.isPending}
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                            <DollarSign className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="font-medium">Collect COD</span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                                Mark as collected
                            </span>
                        </div>
                    </DropdownMenuItem>
                )}

                {canCollectCod && canRefund && (
                    <DropdownMenuSeparator className="my-1" />
                )}

                {canRefund && (
                    <DropdownMenuItem
                        className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                            "cursor-pointer transition-colors",
                            "text-destructive focus:bg-destructive/10 focus:text-destructive",
                        )}
                        onClick={handleRefund}
                        disabled={refundMutation.isPending}
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                            <RotateCcw className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="font-medium">Refund</span>
                            <span className="text-[11px] text-destructive/70 mt-0.5">
                                Process refund
                            </span>
                        </div>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function AdminPaymentsPageClient() {
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_LIMIT,
    });
    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "collectedAt", desc: true },
    ]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<DataTableFilterValues>({});

    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;
    const sortBy = sortingState[0]?.id || "collectedAt";
    const sortOrder = sortingState[0]?.desc ? "desc" : "asc";
    const method =
        typeof filters.method === "string" && filters.method.length > 0
            ? filters.method
            : undefined;
    const status =
        typeof filters.status === "string" && filters.status.length > 0
            ? filters.status
            : undefined;

    const paymentsQuery = useQuery({
        queryKey: adminPaymentKeys.list({
            searchTerm,
            method,
            status,
            page,
            limit,
            sortBy,
            sortOrder,
        }),
        queryFn: () =>
            getAllPaymentsForAdmin(
                searchTerm || undefined,
                method,
                status,
                page,
                limit,
                sortBy,
                sortOrder,
            ),
    });

    const filterConfigs = useMemo<DataTableFilterConfig[]>(
        () => [
            {
                id: "method",
                label: "Payment Method",
                type: "single-select",
                options: [
                    { label: "Bkash", value: "BKASH" },
                    { label: "Nagad", value: "NAGAD" },
                    { label: "COD", value: "COD" },
                ],
            },
            {
                id: "status",
                label: "Payment Status",
                type: "single-select",
                options: [
                    { label: "Unpaid", value: "UNPAID" },
                    { label: "Paid", value: "SUCCEEDED" },
                    { label: "Refunded", value: "REFUNDED" },
                ],
            },
        ],
        [],
    );

    const columns = useMemo<ColumnDef<IPayment>[]>(
        () => [
            {
                id: "sl",
                header: "SL",
                enableSorting: false,
                cell: ({ row, table }) => {
                    const { pageIndex, pageSize } = table.getState().pagination;
                    return (
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {pageIndex * pageSize + row.index + 1}
                        </span>
                    );
                },
            },
            {
                accessorKey: "orderId",
                header: "Order Number",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm font-mono">
                        {row.original.orderId}
                    </span>
                ),
            },
            {
                id: "customer",
                header: "Customer",
                enableSorting: false,
                cell: ({ row }) => <span className="text-sm">—</span>,
            },
            {
                accessorKey: "amount",
                header: "Amount",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm font-semibold tabular-nums">
                        ৳{row.original.amount.toLocaleString("en-US")}
                    </span>
                ),
            },
            {
                accessorKey: "method",
                header: "Method",
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "rounded-md border px-2 py-1 text-xs font-medium",
                            PAYMENT_METHOD_BADGE[row.original.method] ??
                                "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        {row.original.method}
                    </span>
                ),
            },
            {
                accessorKey: "transactionId",
                header: "TrxID",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm font-mono">
                        {row.original.transactionId ?? "—"}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                            PAYMENT_STATUS_CLASS[row.original.status] ??
                                "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        {row.original.status}
                    </span>
                ),
            },
            {
                accessorKey: "collectedAt",
                header: "Collected At",
                enableSorting: true,
                cell: ({ row }) =>
                    row.original.collectedAt ? (
                        <DateCell date={row.original.collectedAt} />
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    ),
            },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                cell: ({ row }) => (
                    <PaymentActionsCell payment={row.original} />
                ),
            },
        ],
        [],
    );

    const SERVER_SORT_COLUMNS = ["collectedAt"];

    const isServerSort = SERVER_SORT_COLUMNS.includes(sortBy);

    const sortedData = useMemo(() => {
        const raw = paymentsQuery.data?.data ?? [];
        if (isServerSort || !sortingState[0]) return raw;
        return raw;
    }, [paymentsQuery.data?.data, sortingState, isServerSort]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Payments
                </h1>
                <p className="text-sm text-muted-foreground">
                    Track payment transactions, collect COD, and process
                    refunds.
                </p>
            </div>

            <DataTable<IPayment>
                data={sortedData}
                columns={columns}
                isLoading={paymentsQuery.isLoading}
                emptyMessage="No payments found."
                meta={
                    paymentsQuery.data
                        ? {
                              page: paymentsQuery.data.page,
                              limit: paymentsQuery.data.limit,
                              total: paymentsQuery.data.total,
                              totalPages: paymentsQuery.data.totalPages,
                          }
                        : undefined
                }
                search={{
                    initialValue: searchTerm,
                    placeholder: "Search by transaction ID or order ID…",
                    debounceMs: 500,
                    onDebouncedChange: (value) => {
                        setSearchTerm(value);
                        setPaginationState((prev) => ({
                            ...prev,
                            pageIndex: 0,
                        }));
                    },
                }}
                filters={{
                    configs: filterConfigs,
                    values: filters,
                    onFilterChange: (filterId, value) => {
                        setFilters((prev) => ({ ...prev, [filterId]: value }));
                        setPaginationState((prev) => ({
                            ...prev,
                            pageIndex: 0,
                        }));
                    },
                    onClearAll: () => {
                        setFilters({});
                        setPaginationState((prev) => ({
                            ...prev,
                            pageIndex: 0,
                        }));
                    },
                }}
                sorting={{
                    state: sortingState,
                    onSortingChange: setSortingState,
                }}
                pagination={{
                    state: paginationState,
                    onPaginationChange: setPaginationState,
                }}
            />
        </div>
    );
}
