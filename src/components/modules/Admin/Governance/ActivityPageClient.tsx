"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
    ColumnDef,
    PaginationState,
    SortingState,
} from "@tanstack/react-table";

import DataTable from "@/components/shared/table/DataTable";
import type {
    DataTableFilterConfig,
    DataTableFilterValue,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import DateCell from "@/components/shared/cell/DateCell";

import { getActivityTimeline } from "@/services/admin.service";
import type { IActivityFeedItem } from "@/types/admin.types";
import { adminQueryKeys } from "@/hooks/queries/adminQueryKeys";

const DEFAULT_LIMIT = 10;

const ACTION_BADGES: Record<string, { label: string; color: string }> = {
    CREATE: {
        label: "Created",
        color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    },
    UPDATE: {
        label: "Updated",
        color: "border-blue-500/20 bg-blue-500/10 text-blue-600",
    },
    DELETE: {
        label: "Deleted",
        color: "border-red-500/20 bg-red-500/10 text-red-600",
    },
    RESTORE: {
        label: "Restored",
        color: "border-purple-500/20 bg-purple-500/10 text-purple-600",
    },
    PUBLISH: {
        label: "Published",
        color: "border-green-500/20 bg-green-500/10 text-green-600",
    },
    ARCHIVE: {
        label: "Archived",
        color: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    },
};

export default function ActivityPageClient() {
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_LIMIT,
    });

    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "timestamp", desc: true },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<DataTableFilterValues>({});

    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;
    const sortBy = sortingState[0]?.id || "timestamp";
    const sortOrder = sortingState[0]?.desc ? "desc" : "asc";

    // Query for activity timeline
    const activityQuery = useQuery({
        queryKey: adminQueryKeys.activity({
            page,
            limit,
            sortBy,
            sortOrder,
            searchTerm,
            ...filters,
        }),
        queryFn: () => getActivityTimeline(page, limit),
        placeholderData: (previousData) => previousData,
    });

    const filterConfigs = useMemo<DataTableFilterConfig[]>(
        () => [
            {
                id: "action",
                label: "Action",
                type: "single-select",
                options: [
                    { label: "Created", value: "CREATE" },
                    { label: "Updated", value: "UPDATE" },
                    { label: "Deleted", value: "DELETE" },
                    { label: "Restored", value: "RESTORE" },
                    { label: "Published", value: "PUBLISH" },
                    { label: "Archived", value: "ARCHIVE" },
                ],
            },
            {
                id: "entityType",
                label: "Entity Type",
                type: "single-select",
                options: [
                    { label: "Product", value: "PRODUCT" },
                    { label: "Order", value: "ORDER" },
                    { label: "Coupon", value: "COUPON" },
                    { label: "Admin", value: "ADMIN" },
                    { label: "Customer", value: "CUSTOMER" },
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

    const columns = useMemo<ColumnDef<IActivityFeedItem>[]>(
        () => [
            {
                accessorKey: "adminName",
                header: "Admin",
                cell: ({ row }) => (
                    <div>
                        <p className="font-medium">{row.original.adminName}</p>
                        <p className="text-xs text-muted-foreground">
                            @{row.original.adminIdentifier}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }) => {
                    const badge = ACTION_BADGES[row.original.action] || {
                        label: row.original.action,
                        color: "border-zinc-500/20 bg-zinc-500/10 text-zinc-600",
                    };
                    return (
                        <div
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${badge.color}`}
                        >
                            {badge.label}
                        </div>
                    );
                },
            },
            {
                accessorKey: "entityType",
                header: "Entity Type",
                cell: ({ row }) => (
                    <div className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                        {row.original.entityType}
                    </div>
                ),
            },
            {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }) => (
                    <p className="max-w-xs truncate text-sm text-muted-foreground">
                        {row.original.description}
                    </p>
                ),
            },
            {
                accessorKey: "timestamp",
                header: "Time",
                cell: ({ row }) => (
                    <DateCell date={row.original.timestamp} />
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Activity Timeline</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View all recent activities across the system
                    </p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={activityQuery.data?.data ?? []}
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
                    placeholder: "Search activities...",
                }}
                filters={{
                    configs: filterConfigs,
                    values: filters,
                    onFilterChange: handleFilterChange,
                    onClearAll: handleClearFilters,
                }}
                isLoading={activityQuery.isLoading}
                meta={{
                    page: activityQuery.data?.page ?? 1,
                    limit: activityQuery.data?.limit ?? DEFAULT_LIMIT,
                    total: activityQuery.data?.total ?? 0,
                    totalPages: activityQuery.data?.totalPages ?? 0,
                }}
            />
        </div>
    );
}
