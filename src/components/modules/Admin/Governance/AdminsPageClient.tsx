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
import { Plus, Trash2, Edit2 } from "lucide-react";

import DataTable from "@/components/shared/table/DataTable";
import type {
    DataTableFilterConfig,
    DataTableFilterValue,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import DateCell from "@/components/shared/cell/DateCell";

import {
    getAllAdmins,
    deleteAdmin,
    changeUserStatus,
} from "@/services/admin.service";
import type { IAdmin } from "@/types/admin.types";
import { adminQueryKeys } from "@/hooks/queries/adminQueryKeys";

import AdminCreateDialog from "./AdminCreateDialog";
import AdminViewDetailsDialog from "./AdminViewDetailsDialog";

const DEFAULT_LIMIT = 10;

const ROLE_CLASS: Record<string, string> = {
    SUPER_ADMIN: "border-purple-500/20 bg-purple-500/10 text-purple-600",
    ADMIN: "border-blue-500/20 bg-blue-500/10 text-blue-600",
};

const STATUS_CLASS: Record<string, string> = {
    ACTIVE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    BLOCKED: "border-red-500/20 bg-red-500/10 text-red-600",
    DELETED: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
};

export default function AdminsPageClient() {
    const queryClient = useQueryClient();

    const { paginationState, setPaginationState, page, limit } = useUrlPaginationState(DEFAULT_LIMIT);

    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<DataTableFilterValues>({});
    const [selectedAdmin, setSelectedAdmin] = useState<IAdmin | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    const sortBy = sortingState[0]?.id || "createdAt";
    const sortOrder = sortingState[0]?.desc ? "desc" : "asc";

    // Query for admins
    const adminsQuery = useQuery({
        queryKey: adminQueryKeys.admins({
            page,
            limit,
            sortBy,
            sortOrder,
            searchTerm,
            ...filters,
        }),
        queryFn: () =>
            getAllAdmins(searchTerm || undefined, page, limit, false),
        placeholderData: (previousData) => previousData,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (adminId: string) => deleteAdmin(adminId),
        onSuccess: () => {
            toast.success("Admin deleted successfully");
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to delete admin",
            );
        },
    });

    // Status change mutation
    const changeStatusMutation = useMutation({
        mutationFn: (payload: { userId: string; status: string }) =>
            changeUserStatus({
                userId: payload.userId,
                status: payload.status as "ACTIVE" | "BLOCKED" | "DELETED",
            }),
        onSuccess: () => {
            toast.success("Admin status updated successfully");
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
            setShowDetailsDialog(false);
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to update status",
            );
        },
    });

    const filterConfigs = useMemo<DataTableFilterConfig[]>(
        () => [
            {
                id: "role",
                label: "Role",
                type: "single-select",
                options: [
                    { label: "Super Admin", value: "SUPER_ADMIN" },
                    { label: "Admin", value: "ADMIN" },
                ],
            },
            {
                id: "status",
                label: "Status",
                type: "single-select",
                options: [
                    { label: "Active", value: "ACTIVE" },
                    { label: "Blocked", value: "BLOCKED" },
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

    const columns = useMemo<ColumnDef<IAdmin>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }) => (
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.identifier}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "user.role",
                header: "Role",
                cell: ({ row }) => (
                    <div
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                            ROLE_CLASS[row.original.user?.role || "ADMIN"] ||
                            "border-zinc-500/20 bg-zinc-500/10 text-zinc-600"
                        }`}
                    >
                        {row.original.user?.role}
                    </div>
                ),
            },
            {
                accessorKey: "user.status",
                header: "Status",
                cell: ({ row }) => (
                    <div
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                            STATUS_CLASS[
                                row.original.user?.status || "ACTIVE"
                            ] ||
                            "border-zinc-500/20 bg-zinc-500/10 text-zinc-600"
                        }`}
                    >
                        {row.original.user?.status}
                    </div>
                ),
            },
            {
                accessorKey: "contactNumber",
                header: "Contact",
                cell: ({ row }) => row.original.contactNumber || "—",
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => <DateCell date={row.original.createdAt} />,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSelectedAdmin(row.original);
                                setShowDetailsDialog(true);
                            }}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (
                                    confirm(
                                        "Are you sure you want to delete this admin?",
                                    )
                                ) {
                                    deleteMutation.mutate(row.original.id);
                                }
                            }}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ),
            },
        ],
        [deleteMutation],
    );

    const handleCreateSuccess = useCallback(() => {
        setShowCreateDialog(false);
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
        toast.success("Admin created successfully");
    }, [queryClient]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Admin Management</h1>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Admin
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={adminsQuery.data?.data ?? []}
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
                    placeholder: "Search admins...",
                }}
                filters={{
                    configs: filterConfigs,
                    values: filters,
                    onFilterChange: handleFilterChange,
                    onClearAll: handleClearFilters,
                }}
                isLoading={adminsQuery.isLoading}
                meta={{
                    page: adminsQuery.data?.page ?? 1,
                    limit: adminsQuery.data?.limit ?? DEFAULT_LIMIT,
                    total: adminsQuery.data?.total ?? 0,
                    totalPages: adminsQuery.data?.totalPages ?? 0,
                }}
            />

            {showCreateDialog && (
                <AdminCreateDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showDetailsDialog && selectedAdmin && (
                <AdminViewDetailsDialog
                    open={showDetailsDialog}
                    onOpenChange={setShowDetailsDialog}
                    admin={selectedAdmin}
                    onStatusChange={(status) => {
                        if (selectedAdmin.user?.id) {
                            changeStatusMutation.mutate({
                                userId: selectedAdmin.user.id,
                                status,
                            });
                        }
                    }}
                    isUpdating={changeStatusMutation.isPending}
                />
            )}
        </div>
    );
}
