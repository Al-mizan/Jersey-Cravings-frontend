"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IAddress } from "@/types/customer.types";
import { AlertCircle, MapPin, Pencil, Trash2 } from "lucide-react";

interface AddressListProps {
    addresses: IAddress[];
    isLoading?: boolean;
    onEdit: (address: IAddress) => void;
    onDelete: (address: IAddress) => void;
    deletingAddressId?: string;
}

export const AddressList = ({
    addresses,
    isLoading,
    onEdit,
    onDelete,
    deletingAddressId,
}: AddressListProps) => {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-9 w-28" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (addresses.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    No addresses found. Add one to speed up checkout.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => {
                const isDeleting = deletingAddressId === address.id;

                return (
                    <Card key={address.id}>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                            <CardTitle className="text-base">{address.recipientName}</CardTitle>

                            {address.isDefault && <Badge>Default</Badge>}
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                <div>
                                    <p>{address.address}</p>
                                    <p>
                                        {address.area}, {address.district}, {address.division}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm">Phone: {address.phone}</p>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onEdit(address)}
                                >
                                    <Pencil className="mr-1 h-4 w-4" />
                                    Edit
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => onDelete(address)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
