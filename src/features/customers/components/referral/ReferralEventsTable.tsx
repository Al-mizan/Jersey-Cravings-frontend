"use client";

import DataTable from "@/components/shared/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { PaginationMeta } from "@/types/api.types";
import { IReferralEvent } from "@/types/customer.types";
import { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";

interface ReferralEventsTableProps {
    events: IReferralEvent[];
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

const statusColorClassMap: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    REWARDED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
};

const columns: ColumnDef<IReferralEvent>[] = [
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;

            return (
                <Badge
                    variant="outline"
                    className={statusColorClassMap[status] ?? undefined}
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "orderAmount",
        header: "Order Amount",
    },
    {
        accessorKey: "rewardPoints",
        header: "Reward Points",
    },
    {
        accessorKey: "referredOrder",
        header: "Order",
        enableSorting: false,
        cell: ({ row }) => row.original.referredOrder?.orderNumber ?? "-",
    },
    {
        accessorKey: "referredCustomer",
        header: "Referred Customer",
        enableSorting: false,
        cell: ({ row }) => row.original.referredCustomer?.name ?? "-",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
];

export const ReferralEventsTable = ({
    events,
    meta,
    isLoading,
    paginationState,
    sortingState,
    onPaginationChange,
    onSortingChange,
}: ReferralEventsTableProps) => {
    return (
        <DataTable
            data={events}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No referral events found."
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
