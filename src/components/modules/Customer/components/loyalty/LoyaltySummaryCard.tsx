"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IMyLoyaltySummary } from "@/types/customer.types";

interface LoyaltySummaryCardProps {
    summary?: IMyLoyaltySummary;
    isLoading?: boolean;
}

export const LoyaltySummaryCard = ({
    summary,
    isLoading,
}: LoyaltySummaryCardProps) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
            </Card>
        );
    }

    if (!summary) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Loyalty Summary</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <p className="text-xs text-muted-foreground">Available Points</p>
                    <p className="text-2xl font-semibold">{summary.points}</p>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Lifetime Earned</p>
                    <p className="text-2xl font-semibold">
                        {summary.lifetimePointsEarned}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Lifetime Redeemed</p>
                    <p className="text-2xl font-semibold">
                        {summary.lifetimePointsRedeemed}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Total Purchased Qty</p>
                    <p className="text-2xl font-semibold">{summary.totalPurchasedQty}</p>
                </div>

                {summary.activeSetting && (
                    <div className="sm:col-span-2 lg:col-span-4 rounded-md border p-3 text-sm text-muted-foreground">
                        <p>
                            Active Loyalty Rule: Earn {summary.activeSetting.earnRateBps / 100}% points
                            per purchase.
                        </p>
                        <p>
                            Minimum purchased quantity to redeem: {" "}
                            {summary.activeSetting.minPurchasedQtyToRedeem}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
