"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { IPickupLocation } from "@/types/commerce.types";

interface PickupLocationsTableProps {
    locations: IPickupLocation[] | null;
    isLoading?: boolean;
}

const PickupLocationsTable = ({
    locations,
    isLoading,
}: PickupLocationsTableProps) => {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Default</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-10" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (!locations || locations.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No pickup locations found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Default</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {locations.map((location) => (
                        <TableRow key={location.id}>
                            <TableCell className="font-medium">
                                {location.name}
                            </TableCell>
                            <TableCell>{location.city}</TableCell>
                            <TableCell>{location.district}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        location.status === "ACTIVE"
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {location.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {location.isDefault ? "Yes" : "No"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default PickupLocationsTable;
