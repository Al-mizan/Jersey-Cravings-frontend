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
import { Copy, Eye, PencilLine } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";

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

    const statusMutation = useMutation({
        mutationFn: (status: OrderStatus) =>
            updateOrderStatus(orderId, { status }),
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
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {pageIndex * pageSize + row.index + 1}
                        </span>
                    );
                },
            },
            {
                accessorKey: "orderNumber",
                header: "Order Number",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                            {row.original.orderNumber}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
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
                ),
            },
            {
                id: "customer",
                header: "Customer",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.user?.email ?? "—"}
                    </span>
                ),
            },
            {
                id: "items",
                header: "Items",
                enableSorting: false,
                cell: ({ row }) => {
                    const items = row.original.items ?? [];
                    const itemCount = items.length;
                    const productNames = items
                        .map((item) => item.productTitleSnapshot)
                        .join(", ");
                    return (
                        <div className="group relative">
                            <span className="text-sm">
                                {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </span>
                            {itemCount > 0 && (
                                <div className="absolute left-0 top-full mt-1 hidden w-64 rounded-md border bg-popover p-2 text-xs text-muted-foreground group-hover:block z-10">
                                    {productNames}
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "totalAmount",
                header: "Total",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm font-semibold tabular-nums">
                        ৳{row.original.totalAmount.toLocaleString("en-US")}
                    </span>
                ),
            },
            {
                accessorKey: "paymentMethod",
                header: "Payment Method",
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "rounded-md border px-2 py-1 text-xs font-medium",
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
                header: "Payment Status",
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
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
                    <span
                        className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                            ORDER_STATUS_CLASS[row.original.status] ??
                                "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        {row.original.status}
                    </span>
                ),
            },
            {
                accessorKey: "placedAt",
                header: "Placed At",
                enableSorting: true,
                cell: ({ row }) => <DateCell date={row.original.placedAt} />,
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
        const raw = ordersQuery.data?.data ?? [];
        if (isServerSort || !sortingState[0]) return raw;
        return raw;
    }, [ordersQuery.data?.data, sortingState, isServerSort]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Orders
                </h1>
                <p className="text-sm text-muted-foreground">
                    Manage customer orders, track payments, and update
                    fulfillment status.
                </p>
            </div>

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
                    placeholder: "Search by order number or customer email…",
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
    );
}
