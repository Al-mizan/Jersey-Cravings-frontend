"use client";

import DataTable from "@/components/shared/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { PaginationMeta } from "@/types/api.types";
import { IPointTransaction } from "@/types/customer.types";
import { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";

interface PointTransactionsTableProps {
    transactions: IPointTransaction[];
    meta?: PaginationMeta;
    isLoading?: boolean;
    paginationState: PaginationState;
    sortingState: SortingState;
    onPaginationChange: (state: PaginationState) => void;
    onSortingChange: (state: SortingState) => void;
}

const formatDateTime = (value: string): string => {
    return new Date(value).toLocaleString();
};

const columns: ColumnDef<IPointTransaction>[] = [
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline">{row.original.type.replace(/_/g, " ")}</Badge>
        ),
    },
    {
        accessorKey: "points",
        header: "Points",
        cell: ({ row }) => <span className="font-medium">{row.original.points}</span>,
    },
    {
        accessorKey: "balanceAfter",
        header: "Balance After",
    },
    {
        accessorKey: "note",
        header: "Note",
        cell: ({ row }) => row.original.note ?? "-",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
];

export const PointTransactionsTable = ({
    transactions,
    meta,
    isLoading,
    paginationState,
    sortingState,
    onPaginationChange,
    onSortingChange,
}: PointTransactionsTableProps) => {
    return (
        <DataTable
            data={transactions}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No loyalty transactions found."
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
