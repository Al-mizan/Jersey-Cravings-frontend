"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import type { IAdmin } from "@/types/admin.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { PaginationMeta } from "@/types/api.types";

interface AdminsTableProps {
    admins: IAdmin[];
    meta?: PaginationMeta;
    isLoading?: boolean;
    paginationState: PaginationState;
    sortingState: SortingState;
    onPaginationChange: (state: PaginationState) => void;
    onSortingChange: (state: SortingState) => void;
    onEdit?: (admin: IAdmin) => void;
    onDelete?: (admin: IAdmin) => void;
}

export default function AdminsTable({
    admins,
    meta,
    isLoading,
    paginationState,
    sortingState,
    onPaginationChange,
    onSortingChange,
    onEdit,
    onDelete,
}: AdminsTableProps) {
    const columns = useMemo<ColumnDef<IAdmin>[]>(() => {
        return [
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }) => row.original.name,
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => row.original.email,
            },
            {
                accessorKey: "user.role",
                header: "Role",
                cell: ({ row }) => (
                    <Badge variant="outline">
                        {row.original.user?.role || "ADMIN"}
                    </Badge>
                ),
            },
            {
                accessorKey: "contactNumber",
                header: "Contact",
                cell: ({ row }) => row.original.contactNumber || "—",
            },
            {
                accessorKey: "user.status",
                header: "Status",
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.original.user?.status === "ACTIVE"
                                ? "default"
                                : "destructive"
                        }
                    >
                        {row.original.user?.status || "ACTIVE"}
                    </Badge>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(row.original)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete?.(row.original)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ];
    }, [onDelete, onEdit]);

    return (
        <DataTable
            data={admins}
            columns={columns}
            isLoading={isLoading}
            meta={meta}
            pagination={{ state: paginationState, onPaginationChange }}
            sorting={{ state: sortingState, onSortingChange }}
            emptyMessage={"No admins found. Create your first admin."}
        />
    );
}
