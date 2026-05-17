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
import { adminPaymentKeys, adminSmsLogKeys } from "@/hooks/queries/adminQueryKeys";
import { cn } from "@/lib/utils";
import {
    getAllPaymentsForAdmin,
    updatePaymentStatus,
} from "@/services/order.service";
import { getAllSmsLogsForAdmin } from "@/services/admin.service";
import type {
    IPayment,
    PaymentStatus,
    PaymentMethod,
} from "@/types/order.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    DollarSign,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";

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

// ─── Payment Status Cell ──────────────────────────────────────────────────
function PaymentStatusCell({ payment }: { payment: IPayment }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: PaymentStatus) =>
            updatePaymentStatus(payment.id, { status: newStatus }),
        onSuccess: () => {
            toast.success("Payment status updated successfully");
            queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
            setOpen(false);
        },
        onError: () => toast.error("Failed to update status"),
    });

    const isEditable = payment.status === "UNPAID";

    const badge = (
        <span
            className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                PAYMENT_STATUS_CLASS[payment.status] ??
                "border-border bg-muted text-muted-foreground",
                isEditable && "cursor-pointer hover:opacity-80 transition-opacity"
            )}
        >
            {payment.status}
        </span>
    );

    if (!isEditable) {
        return badge;
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                {badge}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                sideOffset={4}
                className="w-40 rounded-xl border border-border/60 shadow-lg p-1"
            >
                <DropdownMenuItem
                    className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                        "cursor-pointer transition-colors focus:bg-emerald-500/10 focus:text-emerald-600",
                    )}
                    onClick={() => updateStatusMutation.mutate("SUCCEEDED")}
                    disabled={updateStatusMutation.isPending}
                >
                    <span className="font-medium">Mark as SUCCEEDED</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-1" />
                
                <DropdownMenuItem
                    className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                        "cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive",
                    )}
                    onClick={() => updateStatusMutation.mutate("CANCELED")}
                    disabled={updateStatusMutation.isPending}
                >
                    <span className="font-medium">Mark as CANCELED</span>
                </DropdownMenuItem>
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
                        <span className="text-sm font-medium text-muted-foreground/70 tabular-nums">
                            {pageIndex * pageSize + row.index + 1}
                        </span>
                    );
                },
            },
            {
                accessorKey: "order.orderNumber",
                header: "Order No.",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold font-mono tracking-tighter">
                            #{row.original.order?.orderNumber || row.original.orderId.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums opacity-60">
                            {row.original.orderId}
                        </span>
                    </div>
                ),
            },
            {
                id: "customer",
                header: "Customer",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium line-clamp-1">
                            {row.original.order?.user?.identifier || "Guest"}
                        </span>
                        <span className="text-[10px] text-muted-foreground opacity-60">
                            {row.original.order?.userId.slice(0, 8)}...
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "amount",
                header: "Amount",
                enableSorting: true,
                cell: ({ row }) => (
                    <span className="text-sm font-black text-pink-600 dark:text-pink-400 tabular-nums">
                        ৳{row.original.amount.toLocaleString("en-US")}
                    </span>
                ),
            },
            {
                accessorKey: "method",
                header: "Method",
                enableSorting: true,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
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
                    <div className="flex items-center gap-1.5">
                        <code className="text-sm font-mono font-bold tracking-wide bg-muted/50 px-2 py-0.5 rounded border border-border/40">
                            {row.original.transactionId ?? "—"}
                        </code>
                    </div>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: true,
                cell: ({ row }) => <PaymentStatusCell payment={row.original} />,
            },
            {
                accessorKey: "collectedAt",
                header: "Collected",
                enableSorting: true,
                cell: ({ row }) =>
                    row.original.collectedAt ? (
                        <DateCell date={row.original.collectedAt} />
                    ) : (
                        <span className="text-[11px] text-muted-foreground/60 italic">Not collected</span>
                    ),
            },
        ],
        [],
    );

    const SERVER_SORT_COLUMNS = ["collectedAt", "amount", "method", "status"];

    const isServerSort = SERVER_SORT_COLUMNS.includes(sortBy);

    const sortedData = useMemo(() => {
        return paymentsQuery.data?.data ?? [];
    }, [paymentsQuery.data?.data]);

    return (
        <div className="space-y-8 p-1">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Payments
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Financial command center. Monitor transaction flow, verify COD collections, and manage administrative refunds with precision.
                </p>
            </div>

            {/* Stats Summary Bar */}
            {paymentsQuery.data && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <TrendingUp className="size-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Collected</p>
                            <p className="text-2xl font-black tabular-nums">
                                ৳{sortedData
                                    .filter(p => p.status === "SUCCEEDED")
                                    .reduce((s, p) => s + p.amount, 0)
                                    .toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <DollarSign className="size-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                            <p className="text-2xl font-black tabular-nums">
                                {sortedData.filter(p => p.status === "UNPAID" || p.status === "PROCESSING").length}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3 col-span-2 md:col-span-1">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
                            <AlertTriangle className="size-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Failed</p>
                            <p className="text-2xl font-black tabular-nums">
                                {sortedData.filter(p => p.status === "FAILED" || p.status === "CANCELED").length}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
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
            
            <div className="mt-12 space-y-6">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">SMS Webhook Logs</h2>
                    <p className="text-sm text-muted-foreground">Monitor automated SMS matching for manual payments</p>
                </div>
                <SmsLogsTable />
            </div>
        </div>
    );
}

function SmsLogsTable() {
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    });
    
    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;

    const logsQuery = useQuery({
        queryKey: adminSmsLogKeys.list({ page, limit }),
        queryFn: () => getAllSmsLogsForAdmin(undefined, page, limit, "receivedAt", "desc"),
    });

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                id: "sl",
                header: "SL",
                enableSorting: false,
                cell: ({ row, table }) => (
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1}
                    </span>
                ),
            },
            {
                accessorKey: "senderNumber",
                header: "senderNumber",
                enableSorting: false,
                cell: ({ row }) => <span className="font-medium font-mono">{row.original.senderNumber || "—"}</span>,
            },
            {
                accessorKey: "from",
                header: "from",
                enableSorting: false,
                cell: ({ row }) => <span className="text-sm">{row.original.from}</span>,
            },
            {
                accessorKey: "parsedTrxId",
                header: "parsedTrxId",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="font-mono text-sm tracking-tighter bg-muted px-1.5 py-0.5 rounded border">
                        {row.original.parsedTrxId}
                    </span>
                ),
            },
            {
                accessorKey: "parsedAmount",
                header: "parsedAmount",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="tabular-nums font-medium text-emerald-600">
                        {row.original.parsedAmount ? `৳${row.original.parsedAmount.toLocaleString("en-US")}` : "—"}
                    </span>
                ),
            },
            {
                accessorKey: "matchedOrderId",
                header: "matchedOrderId",
                enableSorting: false,
                cell: ({ row }) => {
                    const id = row.original.matchedOrderId;
                    if (!id) return <span className="text-muted-foreground text-sm">—</span>;
                    return (
                        <Link href={`/admin/orders/${id}`} className="text-primary hover:underline font-mono text-sm">
                            {id.slice(-6).toUpperCase()}
                        </Link>
                    );
                },
            },
            {
                accessorKey: "receivedAt",
                header: "receivedAt",
                enableSorting: false,
                cell: ({ row }) => (
                    <DateCell date={row.original.receivedAt} />
                ),
            },
        ],
        [],
    );

    return (
        <div className="rounded-2xl border bg-card/50 shadow-sm backdrop-blur-xl">
            <DataTable
                columns={columns}
                data={logsQuery.data?.data || []}
                isLoading={logsQuery.isLoading}
                pagination={{
                    state: paginationState,
                    onPaginationChange: setPaginationState,
                }}
                meta={
                    logsQuery.data
                        ? {
                            page: logsQuery.data.page,
                            limit: logsQuery.data.limit,
                            total: logsQuery.data.total,
                            totalPages: logsQuery.data.totalPages,
                        }
                        : undefined
                }
            />
        </div>
    );
}
