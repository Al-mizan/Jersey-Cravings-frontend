"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PaginationMeta } from "@/types/api.types";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DataTableFilters, {
    DataTableFilterConfig,
    DataTableFilterValue,
    DataTableFilterValues,
} from "./DataTableFilters";
import DataTablePagination from "./DataTablePagination";
import DataTableSearch from "./DataTableSearch";

interface DataTableActions<TData> {
    /** Navigates to the view/edit detail page */
    onViewEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
}

interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    actions?: DataTableActions<TData>;
    toolbarAction?: React.ReactNode;
    emptyMessage?: string;
    isLoading?: boolean;
    sorting?: {
        state: SortingState;
        onSortingChange: (state: SortingState) => void;
    };
    pagination?: {
        state: PaginationState;
        onPaginationChange: (state: PaginationState) => void;
    };
    search?: {
        initialValue?: string;
        placeholder?: string;
        debounceMs?: number;
        onDebouncedChange: (value: string) => void;
    };
    filters?: {
        configs: DataTableFilterConfig[];
        values: DataTableFilterValues;
        onFilterChange: (
            filterId: string,
            value: DataTableFilterValue | undefined,
        ) => void;
        onClearAll?: () => void;
    };
    meta?: PaginationMeta;
}

// ─── Shimmer skeleton row ──────────────────────────────────────────────────
function SkeletonRow({ colCount }: { colCount: number }) {
    return (
        <TableRow className="pointer-events-none">
            {Array.from({ length: colCount }).map((_, i) => (
                <TableCell key={i}>
                    <div
                        className="h-4 rounded-sm bg-muted animate-pulse"
                        style={{ width: `${55 + ((i * 37) % 35)}%`, opacity: 0.6 }}
                    />
                </TableCell>
            ))}
        </TableRow>
    );
}

const SKELETON_ROWS = 6;

// ─── Row Actions Cell ──────────────────────────────────────────────────────
function RowActionsCell<TData>({
    rowData,
    actions,
}: {
    rowData: TData;
    actions: DataTableActions<TData>;
}) {
    const [open, setOpen] = useState(false);

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
                {/* View / Edit */}
                {actions.onViewEdit && (
                    <DropdownMenuItem
                        className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                            "cursor-pointer transition-colors",
                            "focus:bg-accent focus:text-accent-foreground",
                        )}
                        onClick={() => {
                            setOpen(false);
                            actions.onViewEdit?.(rowData);
                        }}
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <PencilLine className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="font-medium">View / Edit</span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                                Open detail page
                            </span>
                        </div>
                    </DropdownMenuItem>
                )}

                {/* Separator */}
                {actions.onViewEdit && actions.onDelete && (
                    <DropdownMenuSeparator className="my-1" />
                )}

                {/* Delete */}
                {actions.onDelete && (
                    <DropdownMenuItem
                        className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                            "cursor-pointer transition-colors",
                            "text-destructive focus:bg-destructive/10 focus:text-destructive",
                        )}
                        onClick={() => {
                            setOpen(false);
                            actions.onDelete?.(rowData);
                        }}
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="font-medium">Delete</span>
                            <span className="text-[11px] text-destructive/70 mt-0.5">
                                Remove permanently
                            </span>
                        </div>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Main DataTable ────────────────────────────────────────────────────────
const DataTable = <TData,>({
    data = [] as TData[],
    columns,
    actions,
    toolbarAction,
    emptyMessage,
    isLoading,
    sorting,
    pagination,
    search,
    filters,
    meta,
}: DataTableProps<TData>) => {
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    const hydratedIsLoading = hasHydrated ? Boolean(isLoading) : false;

    const tableColumns: ColumnDef<TData>[] = useMemo(
        () =>
            actions
                ? [
                    ...columns,
                    {
                        id: "actions",
                        header: "Actions",
                        enableSorting: false,
                        meta: { align: "right" },
                        cell: ({ row }) => (
                            <RowActionsCell rowData={row.original} actions={actions} />
                        ),
                    },
                ]
                : columns,
        [actions, columns],
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualSorting: !!sorting,
        manualPagination: !!pagination,
        pageCount: pagination ? Math.max(meta?.totalPages ?? 0, 0) : undefined,
        state: {
            ...(sorting ? { sorting: sorting.state } : {}),
            ...(pagination ? { pagination: pagination.state } : {}),
        },
        onSortingChange: sorting
            ? (updater) => {
                const next =
                    typeof updater === "function"
                        ? updater(sorting.state)
                        : updater;
                sorting.onSortingChange(next);
            }
            : undefined,
        onPaginationChange: pagination
            ? (updater) => {
                const next =
                    typeof updater === "function"
                        ? updater(pagination.state)
                        : updater;
                pagination.onPaginationChange(next);
            }
            : undefined,
    });

    const colCount = tableColumns.length;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {(search || filters || toolbarAction) && (
                <div className="flex flex-wrap items-center gap-2">
                    {search && (
                        <DataTableSearch
                            key={search.initialValue ?? ""}
                            initialValue={search.initialValue}
                            placeholder={search.placeholder}
                            debounceMs={search.debounceMs}
                            onDebouncedChange={search.onDebouncedChange}
                            isLoading={hydratedIsLoading}
                        />
                    )}
                    {filters && (
                        <DataTableFilters
                            filters={filters.configs}
                            values={filters.values}
                            onFilterChange={filters.onFilterChange}
                            onClearAll={filters.onClearAll}
                            isLoading={hydratedIsLoading}
                        />
                    )}
                    {toolbarAction && (
                        <div className="ml-auto shrink-0">{toolbarAction}</div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="border-b hover:bg-transparent">
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80 h-11"
                                    >
                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                            <Button
                                                variant="ghost"
                                                className="h-auto cursor-pointer p-0 font-semibold uppercase tracking-wide text-xs text-muted-foreground/80 hover:bg-transparent hover:text-foreground focus-visible:ring-0"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getIsSorted() === "asc" ? (
                                                    <ArrowUp className="ml-1 h-3 w-3" />
                                                ) : header.column.getIsSorted() === "desc" ? (
                                                    <ArrowDown className="ml-1 h-3 w-3" />
                                                ) : (
                                                    <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
                                                )}
                                            </Button>
                                        ) : (
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {hydratedIsLoading ? (
                            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                                <SkeletonRow key={i} colCount={colCount} />
                            ))
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-border/50 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
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
                                    colSpan={colCount}
                                    className="h-32 text-center text-sm text-muted-foreground"
                                >
                                    {emptyMessage ?? "No data available."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {pagination && !hydratedIsLoading && (
                    <DataTablePagination
                        table={table}
                        totalPages={meta?.totalPages}
                        totalRows={meta?.total}
                        isLoading={hydratedIsLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default DataTable;