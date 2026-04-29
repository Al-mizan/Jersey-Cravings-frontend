"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ICustomerProfile } from "@/types/customer.types";

interface ProfileSummaryCardProps {
    profile: ICustomerProfile;
}

const formatDate = (value: string): string => {
    return new Date(value).toLocaleDateString();
};

export const ProfileSummaryCard = ({ profile }: ProfileSummaryCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{profile.name}</p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{profile.email}</p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        <p className="font-medium">{profile.contactNumber ?? "Not added"}</p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">Member Since</p>
                        <p className="font-medium">{formatDate(profile.createdAt)}</p>
                    </div>
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Points</p>
                        <p className="text-lg font-semibold">{profile.points}</p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">Lifetime Earned</p>
                        <p className="text-lg font-semibold">{profile.lifetimePointsEarned}</p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">Purchased Quantity</p>
                        <p className="text-lg font-semibold">{profile.totalPurchasedQty}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
