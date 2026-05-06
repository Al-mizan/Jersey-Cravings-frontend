"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import { getActivityTimeline } from "@/services/admin.services";
import type { IActivityFeedItem } from "@/types/admin.types";
import { adminDashboardKeys } from "@/hooks/queries/adminQueryKeys";

const getActionBadgeColor = (
    action: string,
): "default" | "secondary" | "destructive" | "outline" => {
    if (action.includes("CREATE") || action.includes("ADD")) return "default";
    if (action.includes("DELETE") || action.includes("REMOVE"))
        return "destructive";
    if (action.includes("UPDATE") || action.includes("EDIT"))
        return "secondary";
    return "outline";
};

const columns: ColumnDef<IActivityFeedItem>[] = [
    {
        accessorKey: "adminName",
        header: "Admin",
        cell: ({ row }) => (
            <div>
                <p className="font-medium">{row.original.adminName}</p>
                <p className="text-xs text-muted-foreground">
                    {row.original.adminEmail}
                </p>
            </div>
        ),
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <Badge variant={getActionBadgeColor(row.original.action)}>
                {row.original.action}
            </Badge>
        ),
    },
    {
        accessorKey: "entityType",
        header: "Entity Type",
    },
    {
        accessorKey: "entityId",
        header: "Entity ID",
        cell: ({ row }) => (
            <span className="truncate text-sm text-muted-foreground">
                {row.original.entityId}
            </span>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <span className="truncate text-sm">{row.original.description}</span>
        ),
    },
    {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
    },
];

export default function ActivityPage() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading } = useQuery({
        queryKey: adminDashboardKeys.activityTimeline({
            searchTerm: "",
            page,
            limit,
        }),
        queryFn: () => getActivityTimeline(page, limit),
        staleTime: 30000,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Activity Log
                </h1>
                <p className="text-muted-foreground mt-1">
                    View all admin activities and system events.
                </p>
            </div>

            {/* Activity Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    {!data || data.data.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No activity found.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <DataTable
                                data={data.data}
                                columns={columns}
                                isLoading={isLoading}
                                emptyMessage="No activity found."
                            />

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Page {page} of {data.totalPages}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(
                                                    data.totalPages,
                                                    p + 1,
                                                ),
                                            )
                                        }
                                        disabled={page === data.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
