"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    useCustomerAddressesForAdmin,
} from "@/features/customers/hooks/useCustomerAddresses";
import { useCustomerLoyaltyByAdmin } from "@/features/customers/hooks/useCustomerLoyalty";
import {
    useCustomerById,
    useRestoreCustomer,
} from "@/features/customers/hooks/useCustomerProfile";
import { useState } from "react";
import { toast } from "sonner";
import { CustomerStatusDialog } from "./CustomerStatusDialog";

interface AdminCustomerDetailsWorkspaceProps {
    customerId: string;
}

const formatDateTime = (value: string): string => {
    return new Date(value).toLocaleString();
};

export const AdminCustomerDetailsWorkspace = ({
    customerId,
}: AdminCustomerDetailsWorkspaceProps) => {
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);

    const { data: customer, isLoading: isCustomerLoading, error } =
        useCustomerById(customerId);

    const { data: addresses, isLoading: isAddressLoading } =
        useCustomerAddressesForAdmin(customerId);

    const { data: loyaltyDetails, isLoading: isLoyaltyLoading } =
        useCustomerLoyaltyByAdmin(customerId);

    const { mutateAsync: restoreCustomer, isPending: isRestoring } =
        useRestoreCustomer();

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    {error instanceof Error ? error.message : "Failed to load customer"}
                </AlertDescription>
            </Alert>
        );
    }

    if (isCustomerLoading || !customer) {
        return (
            <Alert>
                <AlertDescription>Loading customer details...</AlertDescription>
            </Alert>
        );
    }

    const onRestore = async () => {
        const confirmRestore = window.confirm(
            `Restore ${customer.name}'s account?`,
        );

        if (!confirmRestore) {
            return;
        }

        try {
            await restoreCustomer(customer.id);
            toast.success("Customer restored successfully");
        } catch (restoreError) {
            toast.error(
                restoreError instanceof Error
                    ? restoreError.message
                    : "Restore failed",
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                    <p className="text-muted-foreground">{customer.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(true)}>
                        Change Status
                    </Button>

                    {customer.isDeleted && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onRestore}
                            disabled={isRestoring}
                        >
                            {isRestoring ? "Restoring..." : "Restore Account"}
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Account Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge>{customer.user.status}</Badge>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <Badge variant="outline">{customer.user.role}</Badge>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDateTime(customer.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Deleted</p>
                        <p className="font-medium">{customer.isDeleted ? "Yes" : "No"}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                    {isAddressLoading ? (
                        <p className="text-muted-foreground">Loading addresses...</p>
                    ) : !addresses || addresses.length === 0 ? (
                        <p className="text-muted-foreground">No addresses found.</p>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="rounded-md border p-3 text-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">{address.recipientName}</p>
                                        {address.isDefault && <Badge>Default</Badge>}
                                    </div>
                                    <p>{address.phone}</p>
                                    <p>{address.address}</p>
                                    <p>
                                        {address.area}, {address.district}, {address.division}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Loyalty Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoyaltyLoading ? (
                        <p className="text-muted-foreground">Loading loyalty data...</p>
                    ) : !loyaltyDetails ? (
                        <p className="text-muted-foreground">No loyalty data available.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Points</p>
                                <p className="text-xl font-semibold">{loyaltyDetails.points}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Lifetime Earned</p>
                                <p className="text-xl font-semibold">
                                    {loyaltyDetails.lifetimePointsEarned}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Lifetime Redeemed</p>
                                <p className="text-xl font-semibold">
                                    {loyaltyDetails.lifetimePointsRedeemed}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Total Purchased Qty</p>
                                <p className="text-xl font-semibold">
                                    {loyaltyDetails.totalPurchasedQty}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CustomerStatusDialog
                key={customer.id}
                customerId={customer.id}
                currentStatus={customer.user.status}
                isOpen={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
            />
        </div>
    );
};
