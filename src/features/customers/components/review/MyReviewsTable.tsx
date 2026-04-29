"use client";

import DataTable from "@/components/shared/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { PaginationMeta } from "@/types/api.types";
import { IReview } from "@/types/customer.types";
import { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";

interface MyReviewsTableProps {
    reviews: IReview[];
    meta?: PaginationMeta;
    isLoading?: boolean;
    paginationState: PaginationState;
    sortingState: SortingState;
    onPaginationChange: (state: PaginationState) => void;
    onSortingChange: (state: SortingState) => void;
    onEdit: (review: IReview) => void;
    onDelete: (review: IReview) => void;
}

const formatDateTime = (value: string): string => {
    return new Date(value).toLocaleString();
};

const columns: ColumnDef<IReview>[] = [
    {
        accessorKey: "product",
        header: "Product",
        enableSorting: false,
        cell: ({ row }) => row.original.product?.title ?? row.original.productId,
    },
    {
        accessorKey: "rating",
        header: "Rating",
    },
    {
        accessorKey: "isApproved",
        header: "Status",
        cell: ({ row }) => {
            const isApproved = row.original.isApproved;
            return (
                <Badge variant={isApproved ? "default" : "secondary"}>
                    {isApproved ? "Approved" : "Pending"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "comment",
        header: "Comment",
        enableSorting: false,
        cell: ({ row }) => row.original.comment ?? "-",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
];

export const MyReviewsTable = ({
    reviews,
    meta,
    isLoading,
    paginationState,
    sortingState,
    onPaginationChange,
    onSortingChange,
    onEdit,
    onDelete,
}: MyReviewsTableProps) => {
    return (
        <DataTable
            data={reviews}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No reviews found."
            meta={meta}
            actions={{
                onEdit,
                onDelete,
            }}
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
