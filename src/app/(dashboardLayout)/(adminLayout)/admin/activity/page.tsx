"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getActivityTimeline } from "@/services/admin.services";
import type { IActivityFeedItem } from "@/types/admin.types";

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

export default function ActivityPage() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading } = useQuery({
        queryKey: ["activity-timeline", page],
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
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <Skeleton key={i} className="h-12" />
                            ))}
                        </div>
                    ) : !data || data.data.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No activity found.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Admin</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Entity Type</TableHead>
                                            <TableHead>Entity ID</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Timestamp</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.data.map(
                                            (activity: IActivityFeedItem) => (
                                                <TableRow key={activity.id}>
                                                    <TableCell className="font-medium">
                                                        <div>
                                                            <p>
                                                                {
                                                                    activity.adminName
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    activity.adminEmail
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getActionBadgeColor(
                                                                activity.action,
                                                            )}
                                                        >
                                                            {activity.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {activity.entityType}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                                                        {activity.entityId}
                                                    </TableCell>
                                                    <TableCell className="text-sm truncate max-w-xs">
                                                        {activity.description}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                        {new Date(
                                                            activity.timestamp,
                                                        ).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

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
