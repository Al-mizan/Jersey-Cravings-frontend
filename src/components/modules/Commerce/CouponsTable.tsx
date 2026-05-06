"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import type { ICoupon } from "@/types/commerce.types";

interface CouponsTableProps {
    coupons: ICoupon[] | null;
    isLoading?: boolean;
}

const columns: ColumnDef<ICoupon>[] = [
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.code}</span>
        ),
    },
    {
        accessorKey: "discountType",
        header: "Type",
    },
    {
        id: "value",
        header: "Value",
        cell: ({ row }) =>
            row.original.discountType === "PERCENT"
                ? `${row.original.value}%`
                : `৳${row.original.value}`,
    },
    {
        id: "active",
        header: "Active",
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
                {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        id: "startsAt",
        header: "Starts",
        cell: ({ row }) =>
            row.original.startsAt
                ? new Date(row.original.startsAt).toLocaleDateString()
                : "—",
    },
    {
        id: "endsAt",
        header: "Ends",
        cell: ({ row }) =>
            row.original.endsAt
                ? new Date(row.original.endsAt).toLocaleDateString()
                : "—",
    },
];

const CouponsTable = ({ coupons, isLoading }: CouponsTableProps) => {
    if (!coupons || coupons.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No coupons found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <DataTable
            data={coupons}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No coupons found."
        />
    );
};

export default CouponsTable;
