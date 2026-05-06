"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import type { IPickupLocation } from "@/types/commerce.types";

interface PickupLocationsTableProps {
    locations: IPickupLocation[] | null;
    isLoading?: boolean;
}

const columns: ColumnDef<IPickupLocation>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "district",
        header: "District",
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={
                    row.original.status === "ACTIVE" ? "default" : "secondary"
                }
            >
                {row.original.status}
            </Badge>
        ),
    },
    {
        id: "default",
        header: "Default",
        cell: ({ row }) => (row.original.isDefault ? "Yes" : "No"),
    },
];

const PickupLocationsTable = ({
    locations,
    isLoading,
}: PickupLocationsTableProps) => {
    if (!locations || locations.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No pickup locations found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <DataTable
            data={locations}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No pickup locations found."
        />
    );
};

export default PickupLocationsTable;
