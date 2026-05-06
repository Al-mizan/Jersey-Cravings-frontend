"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import type { IPayment } from "@/types/order.types";

interface PaymentsTableProps {
    payments: IPayment[] | null;
    isLoading?: boolean;
}

const columns: ColumnDef<IPayment>[] = [
    {
        accessorKey: "transactionId",
        header: "Transaction",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.transactionId}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="outline">{row.original.status}</Badge>
        ),
    },
    {
        accessorKey: "method",
        header: "Method",
    },
    {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => `৳${row.original.amount}`,
    },
    {
        id: "createdAt",
        header: "Created",
        cell: ({ row }) =>
            new Date(row.original.createdAt).toLocaleDateString(),
    },
];

const PaymentsTable = ({ payments, isLoading }: PaymentsTableProps) => {
    if (!payments || payments.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No payments found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <DataTable
            data={payments}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No payments found."
        />
    );
};

export default PaymentsTable;
