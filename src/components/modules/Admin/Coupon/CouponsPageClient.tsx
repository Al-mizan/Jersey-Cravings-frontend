"use client";

import { Button } from "@/components/ui/button";
import { useState, useMemo, useCallback } from "react";
import { useUrlPaginationState } from "@/hooks/useUrlPaginationState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    ColumnDef,
    PaginationState,
    SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, RotateCcw } from "lucide-react";

import DataTable from "@/components/shared/table/DataTable";
import type {
    DataTableFilterConfig,
    DataTableFilterValue,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import DateCell from "@/components/shared/cell/DateCell";

import {
    getAllCoupons,
    deleteCoupon,
    restoreCoupon,
} from "@/services/coupon.service";
import type { ICoupon } from "@/types/commerce.types";
import { adminQueryKeys } from "@/hooks/queries/adminQueryKeys";
import CouponCreateDialog from "./CouponCreateDialog";

const DEFAULT_LIMIT = 10;

const TYPE_CLASS: Record<string, string> = {
    PERCENT: "border-purple-500/20 bg-purple-500/10 text-purple-600",
    FLAT: "border-blue-500/20 bg-blue-500/10 text-blue-600",
};

const STATUS_CLASS: Record<string, string> = {
    true: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    false: "border-red-500/20 bg-red-500/10 text-red-600",
};

export default function CouponsPageClient() {
    const queryClient = useQueryClient();

    const { paginationState, setPaginationState, page, limit } = useUrlPaginationState(DEFAULT_LIMIT);

    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<DataTableFilterValues>({});
    const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Query for coupons
    const couponsQuery = useQuery({
        queryKey: adminQueryKeys.coupons({ page, limit, searchTerm, ...filters }),
        queryFn: () =>
            getAllCoupons(
                searchTerm || undefined,
                filters.isActive === "true" ? true : filters.isActive === "false" ? false : undefined,
                filters.isDeleted === "true",
                page,
                limit
            ),
        placeholderData: (previousData) => previousData,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (couponId: string) => deleteCoupon(couponId),
        onSuccess: () => {
            toast.success("Coupon deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete coupon");
        },
    });

    // Restore mutation
    const restoreMutation = useMutation({
        mutationFn: (couponId: string) => restoreCoupon(couponId),
        onSuccess: () => {
            toast.success("Coupon restored successfully");
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to restore coupon");
        },
    });

    const filterConfigs = useMemo<DataTableFilterConfig[]>(
        () => [
            {
                id: "isActive",
                label: "Status",
                type: "single-select",
                options: [
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" },
                ],
            },
            {
                id: "isDeleted",
                label: "Trashed",
                type: "single-select",
                options: [
                    { label: "Deleted", value: "true" },
                    { label: "Normal", value: "false" },
                ],
            },
        ],
        [],
    );

    const handleFilterChange = useCallback(
        (filterId: string, value: DataTableFilterValue | undefined) => {
            setFilters((prev) => {
                const next = { ...prev };
                if (value === undefined || value === "") {
                    delete next[filterId];
                } else {
                    next[filterId] = value;
                }
                return next;
            });
            setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
        },
        [],
    );

    const handleClearFilters = useCallback(() => {
        setFilters({});
        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
    }, []);

    const columns = useMemo<ColumnDef<ICoupon>[]>(
        () => [
            {
                accessorKey: "code",
                header: "Code",
                cell: ({ row }) => (
                    <span className="font-mono font-bold text-primary uppercase">
                        {row.original.code}
                    </span>
                ),
            },
            {
                accessorKey: "discountType",
                header: "Type",
                cell: ({ row }) => (
                    <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            TYPE_CLASS[row.original.discountType]
                        }`}
                    >
                        {row.original.discountType}
                    </div>
                ),
            },
            {
                accessorKey: "value",
                header: "Value",
                cell: ({ row }) => (
                    <span className="font-medium">
                        {row.original.discountType === "PERCENT"
                            ? `${row.original.value}%`
                            : `৳${row.original.value}`}
                    </span>
                ),
            },
            {
                accessorKey: "usageLimit",
                header: "Usage",
                cell: ({ row }) => (
                    <div className="text-sm">
                        <span className="text-emerald-600 font-medium">{row.original.usedCount}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span>{row.original.usageLimit || "∞"}</span>
                    </div>
                ),
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => (
                    <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            STATUS_CLASS[String(row.original.isActive)]
                        }`}
                    >
                        {row.original.isActive ? "Active" : "Inactive"}
                    </div>
                ),
            },
            {
                accessorKey: "endsAt",
                header: "Expiry",
                cell: ({ row }) => (row.original.endsAt ? <DateCell date={row.original.endsAt} /> : "No Expiry"),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        {row.original.isDeleted ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => restoreMutation.mutate(row.original.id)}
                                disabled={restoreMutation.isPending}
                            >
                                <RotateCcw className="h-4 w-4 text-emerald-600" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedCoupon(row.original);
                                        setShowCreateDialog(true);
                                    }}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this coupon?")) {
                                            deleteMutation.mutate(row.original.id);
                                        }
                                    }}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </>
                        )}
                    </div>
                ),
            },
        ],
        [deleteMutation, restoreMutation],
    );

    const handleCreateSuccess = useCallback(() => {
        setShowCreateDialog(false);
        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
        queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    }, [queryClient, setPaginationState]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Coupon Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage discount coupons for your customers
                    </p>
                </div>
                <Button onClick={() => {
                    setSelectedCoupon(null);
                    setShowCreateDialog(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Coupon
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={couponsQuery.data?.data ?? []}
                pagination={{
                    state: paginationState,
                    onPaginationChange: setPaginationState,
                }}
                sorting={{
                    state: sortingState,
                    onSortingChange: setSortingState,
                }}
                search={{
                    initialValue: searchTerm,
                    onDebouncedChange: setSearchTerm,
                    placeholder: "Search coupons...",
                }}
                filters={{
                    configs: filterConfigs,
                    values: filters,
                    onFilterChange: handleFilterChange,
                    onClearAll: handleClearFilters,
                }}
                isLoading={couponsQuery.isLoading}
                meta={{
                    page: couponsQuery.data?.page ?? 1,
                    limit: couponsQuery.data?.limit ?? DEFAULT_LIMIT,
                    total: couponsQuery.data?.total ?? 0,
                    totalPages: couponsQuery.data?.totalPages ?? 0,
                }}
            />

            {showCreateDialog && (
                <CouponCreateDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    coupon={selectedCoupon}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
}
