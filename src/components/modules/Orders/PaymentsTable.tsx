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
import type { IPayment } from "@/types/order.types";

interface PaymentsTableProps {
    payments: IPayment[] | null;
    isLoading?: boolean;
}

const PaymentsTable = ({ payments, isLoading }: PaymentsTableProps) => {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-28" />
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
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (!payments || payments.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No payments found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                                {payment.transactionId}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">
                                    {payment.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell>৳{payment.amount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(
                                    payment.createdAt,
                                ).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default PaymentsTable;
