"use client";

import { format } from "date-fns";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useMyReferralCode, useMyReferralEvents } from "@/hooks/useCheckout";
import type { ReferralRewardStatus } from "@/types/customer.types";

const formatCurrency = (val: number) => `৳${val.toLocaleString("en-US")}`;

const statusClasses: Record<ReferralRewardStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    REWARDED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
};

const maskName = (name?: string | null) => {
    if (!name) return "—";
    return name
        .split(" ")
        .map((part) =>
            part.length > 1 ? `${part[0]}${"*".repeat(part.length - 1)}` : part,
        )
        .join(" ");
};

export default function MyReferralCodePage() {
    const { data: referralCode } = useMyReferralCode();
    const { data: referralEvents } = useMyReferralEvents({
        page: 1,
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    const events = referralEvents?.data ?? [];
    const totalEarned = events
        .filter((event) => event.status === "REWARDED")
        .reduce((sum, event) => sum + event.rewardPoints, 0);

    const handleCopy = async () => {
        if (!referralCode?.code) return;
        await navigator.clipboard.writeText(referralCode.code);
        toast.success("Referral code copied");
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Referral Code
                </h1>
                <p className="text-sm text-muted-foreground">
                    Share your code and earn points when friends order.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="rounded-lg border bg-muted px-4 py-3 text-lg font-bold tracking-widest">
                            {referralCode?.code ?? "—"}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopy}
                            disabled={!referralCode?.code}
                        >
                            <Copy className="size-4 mr-2" />
                            Copy
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Status
                        </span>
                        <Badge
                            variant="secondary"
                            className={
                                referralCode?.isActive
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-700"
                            }
                        >
                            {referralCode?.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Total Referral Points
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">
                        {totalEarned} pts
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Referral Events</CardTitle>
                </CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            No referral events yet. Share your code to earn
                            points.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Order Amount</TableHead>
                                    <TableHead>Reward Points</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Rewarded At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            {maskName(
                                                event.referredCustomer?.name,
                                            )}
                                        </TableCell>
                                        <TableCell className="tabular-nums">
                                            {formatCurrency(event.orderAmount)}
                                        </TableCell>
                                        <TableCell className="tabular-nums">
                                            {event.rewardPoints}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    statusClasses[event.status]
                                                }
                                            >
                                                {event.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {event.rewardedAt
                                                ? format(
                                                      new Date(
                                                          event.rewardedAt,
                                                      ),
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
