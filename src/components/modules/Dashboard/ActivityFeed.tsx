"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { IActivityFeedItem } from "@/types/admin.types";

interface ActivityFeedProps {
  activities: IActivityFeedItem[] | null;
  isLoading?: boolean;
  maxItems?: number;
}

const getActionBadgeColor = (
  action: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (action.includes("CREATE") || action.includes("ADD"))
    return "default";
  if (action.includes("DELETE") || action.includes("REMOVE"))
    return "destructive";
  if (action.includes("UPDATE") || action.includes("EDIT"))
    return "secondary";
  return "outline";
};

const ActivityFeed = ({
  activities,
  isLoading,
  maxItems = 10,
}: ActivityFeedProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No activity found.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, maxItems).map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 py-3 border-b last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {activity.adminName}
                    </span>
                    <Badge
                      variant={getActionBadgeColor(activity.action)}
                      className="text-xs"
                    >
                      {activity.action}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{activity.entityType}</span>
                  {activity.entityId && (
                    <>
                      <span>•</span>
                      <span className="truncate">{activity.entityId}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
