// per order gets the 10 points when order is completed and when order is not discounted (via coupon)
// when a user order using the referral code, the referrer gets 20 points
// total points = sum of referral points and also add sum of order points when minimum 3 items are purchased and before 3 items purchased no points of order points will be added
// when paying via points, 1 point = 1 taka discount (maximum 50% of the order amount can be paid via points)
// if the points are not used, they will not expired

// will have a link that Redeem your points and when customer click that link then input field and a button to redeem the points will show up.
// after successful redeem the point then the points will be deducted from the total points.
// and also the redeemed point will be added to the order page as a discount.

"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    useMyLoyaltySummary,
    useMyPointTransactions,
} from "@/hooks/useCheckout";
import type { PointTransactionType } from "@/types/customer.types";

const typeLabels: Record<PointTransactionType, string> = {
    ORDER_EARNED: "Order Earned",
    REFERRAL_EARNED: "Referral Earned",
    REDEEMED: "Redeemed",
    ADJUSTED: "Adjusted",
};

const typeClasses: Record<PointTransactionType, string> = {
    ORDER_EARNED: "bg-emerald-100 text-emerald-700",
    REFERRAL_EARNED: "bg-blue-100 text-blue-700",
    REDEEMED: "bg-rose-100 text-rose-700",
    ADJUSTED: "bg-slate-100 text-slate-700",
};

export default function MyPointsPage() {
    const { data: loyaltySummary } = useMyLoyaltySummary();
    const { data: transactions } = useMyPointTransactions({
        page: 1,
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    const rows = transactions?.data ?? [];

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Points</h1>
                <p className="text-sm text-muted-foreground">
                    Track your available balance and history
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-emerald-600 tabular-nums">
                        {loyaltySummary?.pointsBalance ?? 0} pts
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Redeem up to 50% of your order total using points.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {rows.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            No transactions yet. Place an order to start earning
                            points.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Balance After</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <Badge
                                                className={typeClasses[tx.type]}
                                                variant="secondary"
                                            >
                                                {typeLabels[tx.type]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell
                                            className={
                                                tx.points > 0
                                                    ? "text-emerald-600"
                                                    : "text-rose-600"
                                            }
                                        >
                                            {tx.points > 0 ? "+" : ""}
                                            {tx.points}
                                        </TableCell>
                                        <TableCell className="tabular-nums">
                                            {tx.balanceAfter}
                                        </TableCell>
                                        <TableCell>
                                            {tx.orderId ? (
                                                <span className="text-xs text-muted-foreground">
                                                    {tx.orderId}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {tx.createdAt
                                                ? format(
                                                      new Date(tx.createdAt),
                                                      "MMM d, yyyy",
                                                  )
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
