"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PaymentsTable from "@/components/modules/Orders/PaymentsTable";
import { getAllPayments } from "@/services/order.services";
import { orderQueryKeys } from "@/hooks/queries/orderQueryKeys";

export default function AdminPaymentsPage() {
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: orderQueryKeys.payments.adminList({
            status,
            page,
            limit: 10,
        }),
        queryFn: () => getAllPayments(status, page, 10),
        staleTime: 30000,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <p className="text-muted-foreground mt-1">
                    Track payment transactions and statuses.
                </p>
            </div>

            <div className="flex gap-3">
                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value === "ALL" ? undefined : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full md:w-56">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SUCCEEDED">Succeeded</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <PaymentsTable
                payments={data?.data || null}
                isLoading={isLoading}
            />

            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                            setPage((p) => Math.min(data.totalPages, p + 1))
                        }
                        disabled={page === data.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
