"use client";

import DateCell from "@/components/shared/cell/DateCell";
import DataTable from "@/components/shared/table/DataTable";
import type {
    DataTableFilterConfig,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    getAllOrdersForAdmin,
    updateOrderStatus,
} from "@/services/order.service";
import type {
    IAdminOrder,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
} from "@/types/order.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, PencilLine, Package, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import axios from "axios";

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

const PAYMENT_METHOD_BADGE: Record<PaymentMethod, string> = {
    BKASH: "border-pink-500/20 bg-pink-500/10 text-pink-600",
    NAGAD: "border-orange-500/20 bg-orange-500/10 text-orange-600",
    COD: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600",
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
    "PENDING_PAYMENT",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

// ─── Status Update Dialog ─────────────────────────────────────────────────
function StatusUpdateDialog({
    orderId,
    currentStatus,
}: {
    orderId: string;
    currentStatus: OrderStatus;
}) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] =
        useState<OrderStatus>(currentStatus);

    useEffect(() => {
        setSelectedStatus(currentStatus);
    }, [currentStatus]);

    const statusMutation = useMutation({
        mutationFn: async (status: OrderStatus) => {
            const res = await axios.patch(`/api/proxy/orders/${orderId}/status`, { status });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Order status updated");
            queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
            setOpen(false);
        },
        onError: () => toast.error("Failed to update order status"),
    });

    const handleSave = () => {
        if (selectedStatus === currentStatus) {
            setOpen(false);
            return;
        }
        statusMutation.mutate(selectedStatus);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-md"
                >
                    <PencilLine className="h-4 w-4" />
                    <span className="sr-only">Update status</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-100">
                <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium">
                            New Status
                        </label>
                        <Select
                            value={selectedStatus}
                            onValueChange={(value) =>
                                setSelectedStatus(value as OrderStatus)
                            }
                        >
                            <SelectTrigger className="mt-2">
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
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={statusMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={
                                statusMutation.isPending ||
                                selectedStatus === currentStatus
                            }
                        >
                            {statusMutation.isPending ? "Updating..." : "Save"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function AdminOrdersPageClient() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_LIMIT,
    });
    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "placedAt", desc: true },
    ]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<DataTableFilterValues>({});

    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;
    const sortBy = sortingState[0]?.id || "placedAt";
    const sortOrder = sortingState[0]?.desc ? "desc" : "asc";
    const status =
        typeof filters.status === "string" && filters.status.length > 0
            ? filters.status
            : undefined;
    const paymentMethod =
        typeof filters.paymentMethod === "string" &&
            filters.paymentMethod.length > 0
            ? filters.paymentMethod
            : undefined;
    const paymentStatus =
        typeof filters.paymentStatus === "string" &&
            filters.paymentStatus.length > 0
            ? filters.paymentStatus
            : undefined;

    const ordersQuery = useQuery({
        queryKey: adminOrderKeys.list({
            searchTerm,
            status,
            paymentMethod,
            paymentStatus,
            page,
            limit,
            sortBy,
            sortOrder,
        }),
        queryFn: () =>
            getAllOrdersForAdmin(
                searchTerm || undefined,
                status,
                paymentStatus,
                undefined,
                undefined,
                page,
                limit,
                sortBy,
                sortOrder,
            ),
    });

    const filterConfigs = useMemo<DataTableFilterConfig[]>(
        () => [
            {
                id: "status",
                label: "Order Status",
                type: "single-select",
                options: [
                    { label: "Pending Payment", value: "PENDING_PAYMENT" },
                    { label: "Processing", value: "PROCESSING" },
                    { label: "Shipped", value: "SHIPPED" },
                    { label: "Delivered", value: "DELIVERED" },
                    { label: "Cancelled", value: "CANCELLED" },
                ],
            },
            {
                id: "paymentMethod",
                label: "Payment Method",
                type: "single-select",
                options: [
                    { label: "Bkash", value: "BKASH" },
                    { label: "Nagad", value: "NAGAD" },
                    { label: "COD", value: "COD" },
                ],
            },
            {
                id: "paymentStatus",
                label: "Payment Status",
                type: "single-select",
                options: [
                    { label: "Unpaid", value: "UNPAID" },
                    { label: "Paid", value: "PAID" },
                    { label: "Refunded", value: "REFUNDED" },
                ],
            },
        ],
        [],
    );

    const columns = useMemo<ColumnDef<IAdminOrder>[]>(
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
                accessorKey: "orderNumber",
                header: "Order No.",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono tracking-tighter">
                                #{row.original.orderNumber}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        row.original.orderNumber,
                                    );
                                    toast.success("Order number copied");
                                }}
                            >
                                <Copy className="h-3 w-3" />
                                <span className="sr-only">Copy order number</span>
                            </Button>
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums opacity-60">
                            {row.original.id}
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
                            {row.original.user?.identifier ?? "Guest User"}
                        </span>
                        <span className="text-[10px] text-muted-foreground opacity-60">
                            {row.original.userId.slice(0, 8)}...
                        </span>
                    </div>
                ),
            },
            {
                id: "items",
                header: "Summary",
                enableSorting: false,
                cell: ({ row }) => {
                    const items = row.original.items ?? [];
                    const itemCount = items.length;
                    const itemLines = items.map(
                        (item) => `${item.qty}x ${item.productTitleSnapshot}`
                    );
                    return (
                        <div className="group relative">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                                </span>
                                <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[150px]">
                                    {itemLines.join(", ")}
                                </span>
                            </div>
                            {itemCount > 0 && (
                                <div className="absolute left-0 bottom-full mb-2 hidden w-64 rounded-xl border border-border/60 bg-popover/90 backdrop-blur-md p-3 text-xs shadow-2xl group-hover:block z-20">
                                    <p className="font-bold mb-1 border-b pb-1">Ordered Items</p>
                                    <ul className="space-y-0.5 text-muted-foreground">
                                        {itemLines.map((line, i) => (
                                            <li key={i} className="leading-relaxed">{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "totalAmount",
                header: "Amount",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm font-black text-foreground tabular-nums">
                        ৳{row.original.totalAmount.toLocaleString("en-US")}
                    </span>
                ),
            },
            {
                accessorKey: "paymentMethod",
                header: "Method",
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            PAYMENT_METHOD_BADGE[row.original.paymentMethod] ??
                            "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        {row.original.paymentMethod}
                    </span>
                ),
            },
            {
                accessorKey: "paymentStatus",
                header: "Payment",
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            PAYMENT_STATUS_CLASS[row.original.paymentStatus] ??
                            "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        {row.original.paymentStatus}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Order Status",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <span
                            className={cn(
                                "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                                ORDER_STATUS_CLASS[row.original.status] ??
                                "border-border bg-muted text-muted-foreground",
                            )}
                        >
                            {row.original.status.replace(/_/g, " ")}
                        </span>
                        <StatusUpdateDialog
                            orderId={row.original.id}
                            currentStatus={row.original.status}
                        />
                    </div>
                ),
            },
            {
                accessorKey: "placedAt",
                header: "Placed At",
                enableSorting: true,
                cell: ({ row }) => <DateCell date={row.original.placedAt} />,
            },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                meta: { align: "right" },
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                            asChild
                        >
                            <Link href={`/admin/orders/${row.original.id}`}>
                                <Eye className="mr-1.5 size-3" />
                                Details
                            </Link>
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    const tableActions = useMemo(
        () => ({
            onViewEdit: (order: IAdminOrder) =>
                router.push(`/admin/orders/${order.id}`),
        }),
        [router],
    );

    const SERVER_SORT_COLUMNS = ["placedAt"];

    const isServerSort = SERVER_SORT_COLUMNS.includes(sortBy);

    const sortedData = useMemo(() => {
        return ordersQuery.data?.data ?? [];
    }, [ordersQuery.data?.data]);

    return (
        <div className="space-y-8 p-1">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Orders
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Unified order management system. Oversee lifecycle stages from initial placement to final delivery with real-time status monitoring.
                </p>
            </div>

            {/* Stats Summary Bar */}
            {ordersQuery.data && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <Package className="size-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                            <p className="text-2xl font-black tabular-nums">{ordersQuery.data.total}</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <TrendingUp className="size-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                            <p className="text-2xl font-black tabular-nums">৳{sortedData.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3 col-span-2 md:col-span-1">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Clock className="size-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                            <p className="text-2xl font-black tabular-nums">{sortedData.filter(o => o.status === "PENDING_PAYMENT").length}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
                <DataTable<IAdminOrder>
                    data={sortedData}
                    columns={columns}
                    isLoading={ordersQuery.isLoading}
                    emptyMessage="No orders found."
                    meta={
                        ordersQuery.data
                            ? {
                                page: ordersQuery.data.page,
                                limit: ordersQuery.data.limit,
                                total: ordersQuery.data.total,
                                totalPages: ordersQuery.data.totalPages,
                            }
                            : undefined
                    }
                    search={{
                        initialValue: searchTerm,
                        placeholder: "Search by order number or customer identifier…",
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
                    actions={tableActions}
                />
            </div>
        </div>
    );
}
