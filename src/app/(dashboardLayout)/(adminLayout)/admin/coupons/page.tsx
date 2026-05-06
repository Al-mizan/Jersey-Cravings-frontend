"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import CouponsTable from "@/components/modules/Commerce/CouponsTable";
import CouponForm from "@/components/modules/Commerce/CouponForm";
import { getAllCoupons } from "@/services/commerce.services";
import { commerceQueryKeys } from "@/components/modules/Commerce/constants/query-keys";
import { Plus } from "lucide-react";

export default function AdminCouponsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [page, setPage] = useState(1);

    const { data, isLoading, refetch } = useQuery({
        queryKey: commerceQueryKeys.coupons.list({
            page,
            limit: 10,
            isDeleted: false,
        }),
        queryFn: () => getAllCoupons(undefined, undefined, false, page, 10),
        staleTime: 30000,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Coupons
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage promotional coupons.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Coupon
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Coupon</DialogTitle>
                        </DialogHeader>
                        <CouponForm
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                refetch();
                            }}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <CouponsTable coupons={data?.data || null} isLoading={isLoading} />

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
