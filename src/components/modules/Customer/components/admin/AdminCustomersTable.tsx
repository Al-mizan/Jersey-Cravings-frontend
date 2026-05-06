"use client";

import DataTable from "@/components/shared/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/types/api.types";
import { ICustomerProfile } from "@/types/customer.types";
import { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { Eye, RotateCcw, ShieldAlert } from "lucide-react";
import { useMemo } from "react";

interface AdminCustomersTableProps {
    customers: ICustomerProfile[];
    meta?: PaginationMeta;
    isLoading?: boolean;
    paginationState: PaginationState;
    sortingState: SortingState;
    onPaginationChange: (state: PaginationState) => void;
    onSortingChange: (state: SortingState) => void;
    onViewCustomer: (customer: ICustomerProfile) => void;
    onChangeStatus: (customer: ICustomerProfile) => void;
    onRestoreCustomer: (customer: ICustomerProfile) => void;
}

const formatDate = (value: string): string => {
    return new Date(value).toLocaleDateString();
};

const statusVariant = (status: string): "default" | "destructive" | "secondary" => {
    if (status === "ACTIVE") {
        return "default";
    }

    if (status === "BLOCKED") {
        return "destructive";
    }

    return "secondary";
};

export const AdminCustomersTable = ({
    customers,
    meta,
    isLoading,
    paginationState,
    sortingState,
    onPaginationChange,
    onSortingChange,
    onViewCustomer,
    onChangeStatus,
    onRestoreCustomer,
}: AdminCustomersTableProps) => {
    const columns = useMemo<ColumnDef<ICustomerProfile>[]>(() => {
        return [
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }) => (
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.contactNumber ?? "No contact"}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
            },
            {
                accessorKey: "user.status",
                header: "Status",
                cell: ({ row }) => (
                    <Badge variant={statusVariant(row.original.user.status)}>
                        {row.original.user.status}
                    </Badge>
                ),
            },
            {
                accessorKey: "isDeleted",
                header: "Deleted",
                cell: ({ row }) => (
                    <Badge variant={row.original.isDeleted ? "destructive" : "secondary"}>
                        {row.original.isDeleted ? "Yes" : "No"}
                    </Badge>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => formatDate(row.original.createdAt),
            },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onViewCustomer(row.original)}
                        >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onChangeStatus(row.original)}
                        >
                            <ShieldAlert className="mr-1 h-4 w-4" />
                            Status
                        </Button>

                        {row.original.isDeleted && (
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => onRestoreCustomer(row.original)}
                            >
                                <RotateCcw className="mr-1 h-4 w-4" />
                                Restore
                            </Button>
                        )}
                    </div>
                ),
            },
        ];
    }, [onChangeStatus, onRestoreCustomer, onViewCustomer]);

    return (
        <DataTable
            data={customers}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No customers found."
            meta={meta}
            pagination={{
                state: paginationState,
                onPaginationChange,
            }}
            sorting={{
                state: sortingState,
                onSortingChange,
            }}
        />
    );
};
