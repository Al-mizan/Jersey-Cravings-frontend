"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IReferralCode } from "@/types/customer.types";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ReferralCodeCardProps {
    referralCode?: IReferralCode;
    isLoading?: boolean;
}

export const ReferralCodeCard = ({
    referralCode,
    isLoading,
}: ReferralCodeCardProps) => {
    const copyCode = async () => {
        if (!referralCode?.code) {
            return;
        }

        try {
            await navigator.clipboard.writeText(referralCode.code);
            toast.success("Referral code copied");
        } catch {
            toast.error("Unable to copy referral code");
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-52" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-8 w-44" />
                    <Skeleton className="h-9 w-32" />
                </CardContent>
            </Card>
        );
    }

    if (!referralCode) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Referral Code</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                <p className="text-3xl font-bold tracking-widest">{referralCode.code}</p>

                <Button type="button" variant="outline" onClick={copyCode}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                </Button>
            </CardContent>
        </Card>
    );
};
