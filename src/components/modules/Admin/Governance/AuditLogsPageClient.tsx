"use client";

import { useState, useMemo, useCallback } from "react";
import { useUrlPaginationState } from "@/hooks/useUrlPaginationState";
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

import { getAuditLogs } from "@/services/admin.service";
import type { IAuditLog } from "@/types/admin.types";
import { adminQueryKeys } from "@/hooks/queries/adminQueryKeys";

const DEFAULT_LIMIT = 10;

export default function AuditLogsPageClient() {
    const { paginationState, setPaginationState, page, limit } = useUrlPaginationState(DEFAULT_LIMIT);

    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<DataTableFilterValues>({});

    const sortBy = sortingState[0]?.id || "createdAt";
    const sortOrder = sortingState[0]?.desc ? "desc" : "asc";

    // Query for audit logs
    const auditLogsQuery = useQuery({
        queryKey: adminQueryKeys.auditLogs({
            page,
            limit,
            sortBy,
            sortOrder,
            searchTerm,
            ...filters,
        }),
        queryFn: () => getAuditLogs(searchTerm || undefined, page, limit),
        placeholderData: (previousData) => previousData,
    });

    const filterConfigs = useMemo<DataTableFilterConfig[]>(() => [], []);

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

    const columns = useMemo<ColumnDef<IAuditLog>[]>(
        () => [
            {
                accessorKey: "admin.name",
                header: "Actor",
                cell: ({ row }) => (
                    <div>
                        <p className="font-medium">
                            {row.original.admin?.name || "System"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            @{row.original.admin?.identifier || "system"}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }) => (
                    <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
                        {row.original.action}
                    </div>
                ),
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
                accessorKey: "entityId",
                header: "Entity ID",
                cell: ({ row }) => (
                    <code className="text-xs text-muted-foreground">
                        {row.original.entityId.substring(0, 8)}...
                    </code>
                ),
            },
            {
                accessorKey: "ipAddress",
                header: "IP Address",
                cell: ({ row }) => (
                    <span className="text-xs">
                        {row.original.ipAddress || "—"}
                    </span>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Timestamp",
                cell: ({ row }) => (
                    <DateCell date={row.original.createdAt} />
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track all admin activities and changes in the system
                    </p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={auditLogsQuery.data?.data ?? []}
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
                    placeholder: "Search logs...",
                }}
                filters={{
                    configs: filterConfigs,
                    values: filters,
                    onFilterChange: handleFilterChange,
                    onClearAll: handleClearFilters,
                }}
                isLoading={auditLogsQuery.isLoading}
                meta={{
                    page: auditLogsQuery.data?.page ?? 1,
                    limit: auditLogsQuery.data?.limit ?? DEFAULT_LIMIT,
                    total: auditLogsQuery.data?.total ?? 0,
                    totalPages: auditLogsQuery.data?.totalPages ?? 0,
                }}
            />
        </div>
    );
}
