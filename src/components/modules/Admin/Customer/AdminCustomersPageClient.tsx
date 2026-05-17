"use client";

import DateCell from "@/components/shared/cell/DateCell";
import DataTable from "@/components/shared/table/DataTable";
import type {
    DataTableFilterConfig,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminCustomerKeys } from "@/hooks/queries/adminQueryKeys";
import { cn } from "@/lib/utils";
import { changeCustomerStatus, getAllCustomers } from "@/services/customer.service";
import type { ICustomerProfile } from "@/types/customer.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { ChevronDown, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import React, { useMemo, useState } from "react";
import { useUrlPaginationState } from "@/hooks/useUrlPaginationState";

const DEFAULT_LIMIT = 10;

type CustomerStatus = "ACTIVE" | "BLOCKED" | "DELETED";

const STATUS_META: Record<
    CustomerStatus,
    { label: string; className: string }
> = {
    ACTIVE: {
        label: "Active",
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    },
    BLOCKED: {
        label: "Blocked",
        className: "border-rose-500/20 bg-rose-500/10 text-rose-600",
    },
    DELETED: {
        label: "Deleted",
        className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
    },
};

const STATUS_OPTIONS: CustomerStatus[] = ["ACTIVE", "BLOCKED", "DELETED"];

// ─── Status dropdown cell ─────────────────────────────────────────────────
function CustomerStatusCell({
    customerId,
    currentStatus,
}: {
    customerId: string;
    currentStatus: CustomerStatus;
}) {
    const queryClient = useQueryClient();

    const statusMutation = useMutation({
        mutationFn: (status: CustomerStatus) =>
            changeCustomerStatus({ customerId, status }),
        onSuccess: () => {
            toast.success("Customer status updated");
            queryClient.invalidateQueries({ queryKey: adminCustomerKeys.all });
        },
        onError: () => toast.error("Failed to update customer status"),
    });

    const confirmChange = (newStatus: CustomerStatus) => {
        if (newStatus === currentStatus) return;

        const messages: Record<CustomerStatus, string> = {
            ACTIVE: "activate this customer?",
            BLOCKED: "block this customer?",
            DELETED: "permanently delete this customer?",
        };

        toast.custom(
            (t) => (
                <div className="w-[360px] rounded-xl border bg-card p-4 shadow-lg">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold">
                            Change status to{" "}
                            <span
                                className={cn(
                                    "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                                    STATUS_META[newStatus].className,
                                )}
                            >
                                {STATUS_META[newStatus].label}
                            </span>
                            ?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Are you sure you want to {messages[newStatus]}
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
                            variant={newStatus === "DELETED" ? "destructive" : "default"}
                            onClick={() => {
                                toast.dismiss(t);
                                statusMutation.mutate(newStatus);
                            }}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            ),
            { position: "top-center", duration: Infinity },
        );
    };

    const meta = STATUS_META[currentStatus];

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    disabled={statusMutation.isPending}
                    className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                        "text-xs font-semibold transition-opacity",
                        "hover:opacity-80 focus:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        meta.className,
                    )}
                >
                    {statusMutation.isPending ? "Updating…" : meta.label}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-36 rounded-xl p-1">
                {STATUS_OPTIONS.map((s, i) => (
                    <React.Fragment key={s}>
                        {i === 2 && <DropdownMenuSeparator className="my-1" />}
                        <DropdownMenuItem
                            disabled={s === currentStatus}
                            className={cn(
                                "rounded-lg px-3 py-2 text-xs font-medium cursor-pointer",
                                s === currentStatus && "opacity-50 cursor-default",
                                s === "DELETED" && "text-destructive focus:text-destructive focus:bg-destructive/10",
                            )}
                            onClick={() => confirmChange(s)}
                        >
                            <span
                                className={cn(
                                    "mr-2 h-2 w-2 rounded-full border",
                                    s === "ACTIVE" && "bg-emerald-500 border-emerald-600",
                                    s === "BLOCKED" && "bg-rose-500 border-rose-600",
                                    s === "DELETED" && "bg-zinc-400 border-zinc-500",
                                )}
                            />
                            {STATUS_META[s].label}
                            {s === currentStatus && (
                                <span className="ml-auto text-[10px] text-muted-foreground">current</span>
                            )}
                        </DropdownMenuItem>
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function AdminCustomersPageClient() {
    const { paginationState, setPaginationState, page, limit } = useUrlPaginationState(DEFAULT_LIMIT);
    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<DataTableFilterValues>({
        userStatus: "active",
    });
    const sortBy = sortingState[0]?.id || "createdAt";
    const sortOrder = sortingState[0]?.desc ? "desc" : "asc";
    const listSearchTerm = searchTerm.trim() || undefined;

    const userStatus = filters.userStatus;
    const isDeletedFilter =
        userStatus === "active" ? false
            : userStatus === "deleted" ? true
                : undefined;

    const customersQuery = useQuery({
        queryKey: adminCustomerKeys.list({
            searchTerm: listSearchTerm,
            page, limit,
            ...(typeof isDeletedFilter === "boolean" ? { isDeleted: isDeletedFilter } : {}),
            sortBy, sortOrder,
        }),
        queryFn: () =>
            getAllCustomers(listSearchTerm, page, limit, isDeletedFilter, sortBy, sortOrder),
    });

    const filterConfigs = useMemo<DataTableFilterConfig[]>(
        () => [
            {
                id: "userStatus",
                label: "User Status",
                type: "single-select",
                options: [
                    { label: "Active users", value: "active" },
                    { label: "Deleted users", value: "deleted" },
                    { label: "All users", value: "all" },
                ],
            },
        ],
        [],
    );

    const columns = useMemo<ColumnDef<ICustomerProfile>[]>(
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
                accessorKey: "name",
                header: "Name",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm font-medium">{row.original.name}</span>
                ),
            },
            {
                accessorKey: "identifier",
                header: "Identifier",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.identifier}</span>
                ),
            },
            {
                accessorKey: "contactNumber",
                header: "Contact",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.contactNumber ?? "—"}</span>
                ),
            },
            {
                accessorKey: "address",
                header: "Address",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="line-clamp-2 max-w-[220px] text-sm text-muted-foreground">
                        {row.original.address ?? "—"}
                    </span>
                ),
            },
            {
                accessorKey: "totalPurchasedQty",
                header: "Total qty",
                enableSorting: true,
                cell: ({ row }) => (
                    <span className="tabular-nums text-sm font-medium">
                        {row.original.totalPurchasedQty}
                    </span>
                ),
            },
            // ── Interactive status cell ──────────────────────────────────
            {
                id: "user.status",
                accessorFn: (row) => row.user.status,
                header: "User status",
                enableSorting: false,
                cell: ({ row }) => (
                    <CustomerStatusCell
                        customerId={row.original.id}
                        currentStatus={row.original.user.status as CustomerStatus}
                    />
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Joined",
                enableSorting: true,
                cell: ({ row }) => <DateCell date={row.original.createdAt} />,
            },
            {
                id: "orders",
                header: "Orders",
                enableSorting: false,
                cell: ({ row }) => (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md" asChild>
                        <Link href={`/admin/customers/${row.original.id}`} title="View orders">
                            <ShoppingBag className="h-4 w-4" />
                            <span className="sr-only">View orders and payments</span>
                        </Link>
                    </Button>
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
                <p className="text-sm text-muted-foreground">
                    Browse shopper profiles, totals, account status, and order history per customer.
                </p>
            </div>

            <DataTable<ICustomerProfile>
                data={customersQuery.data?.data ?? []}
                columns={columns}
                actions={undefined}
                isLoading={customersQuery.isLoading}
                emptyMessage="No customers found."
                meta={
                    customersQuery.data
                        ? {
                            page: customersQuery.data.page,
                            limit: customersQuery.data.limit,
                            total: customersQuery.data.total,
                            totalPages: customersQuery.data.totalPages,
                        }
                        : undefined
                }
                search={{
                    initialValue: searchTerm,
                    placeholder: "Search by name, identifier, or phone…",
                    debounceMs: 500,
                    onDebouncedChange: (value) => {
                        setSearchTerm(value);
                        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                    },
                }}
                filters={{
                    configs: filterConfigs,
                    values: filters,
                    onFilterChange: (filterId, value) => {
                        setFilters((prev) => ({ ...prev, [filterId]: value }));
                        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                    },
                    onClearAll: () => {
                        setFilters({ userStatus: "active" });
                        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                    },
                }}
                sorting={{ state: sortingState, onSortingChange: setSortingState }}
                pagination={{ state: paginationState, onPaginationChange: setPaginationState }}
            />
        </div>
    );
}