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
import type { ICoupon } from "@/types/commerce.types";

interface CouponsTableProps {
    coupons: ICoupon[] | null;
    isLoading?: boolean;
}

const CouponsTable = ({ coupons, isLoading }: CouponsTableProps) => {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Starts</TableHead>
                            <TableHead>Ends</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-12" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-12" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-10" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (!coupons || coupons.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No coupons found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Starts</TableHead>
                        <TableHead>Ends</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                            <TableCell className="font-medium">
                                {coupon.code}
                            </TableCell>
                            <TableCell>{coupon.discountType}</TableCell>
                            <TableCell>
                                {coupon.discountType === "PERCENT"
                                    ? `${coupon.value}%`
                                    : `৳${coupon.value}`}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        coupon.isActive
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {coupon.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {coupon.startsAt
                                    ? new Date(
                                          coupon.startsAt,
                                      ).toLocaleDateString()
                                    : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {coupon.endsAt
                                    ? new Date(
                                          coupon.endsAt,
                                      ).toLocaleDateString()
                                    : "—"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default CouponsTable;
