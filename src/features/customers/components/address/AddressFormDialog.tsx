"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    useCreateAddress,
    useUpdateAddress,
} from "@/features/customers/hooks/useCustomerAddresses";
import { IAddress } from "@/types/customer.types";
import { createAddressZodSchema } from "@/zod/customer.validation";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AddressFormDialogProps {
    isOpen: boolean;
    onOpenChange: (nextOpen: boolean) => void;
    initialAddress?: IAddress;
}

const emptyValues = {
    recipientName: "",
    phone: "",
    address: "",
    area: "",
    district: "",
    division: "",
    isDefault: false,
};

export const AddressFormDialog = ({
    isOpen,
    onOpenChange,
    initialAddress,
}: AddressFormDialogProps) => {
    const [serverError, setServerError] = useState<string | null>(null);

    const { mutateAsync: createAddress, isPending: isCreatingAddress } =
        useCreateAddress();
    const { mutateAsync: updateAddress, isPending: isUpdatingAddress } =
        useUpdateAddress();

    const isEditMode = Boolean(initialAddress);
    const isPending = isCreatingAddress || isUpdatingAddress;

    const form = useForm({
        defaultValues: initialAddress
            ? {
                  recipientName: initialAddress.recipientName,
                  phone: initialAddress.phone,
                  address: initialAddress.address,
                  area: initialAddress.area,
                  district: initialAddress.district,
                  division: initialAddress.division,
                  isDefault: initialAddress.isDefault,
              }
            : emptyValues,
        onSubmit: async ({ value }) => {
            setServerError(null);

            const parsedPayload = createAddressZodSchema.safeParse(value);

            if (!parsedPayload.success) {
                setServerError(
                    parsedPayload.error.issues[0]?.message ?? "Validation failed",
                );
                return;
            }

            try {
                if (initialAddress) {
                    await updateAddress({
                        addressId: initialAddress.id,
                        payload: parsedPayload.data,
                    });
                    toast.success("Address updated successfully");
                } else {
                    await createAddress(parsedPayload.data);
                    toast.success("Address created successfully");
                }

                onOpenChange(false);
            } catch (error) {
                setServerError(
                    error instanceof Error ? error.message : "Unable to save address",
                );
            }
        },
    });

    useEffect(() => {
        if (!isOpen) {
            setServerError(null);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Update Address" : "Add New Address"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEditMode
                            ? "Edit this address for future deliveries."
                            : "Save a new delivery address for faster checkout."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <form.Field
                        name="recipientName"
                        validators={{ onChange: createAddressZodSchema.shape.recipientName }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Recipient Name"
                                placeholder="Full name"
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="phone"
                        validators={{ onChange: createAddressZodSchema.shape.phone }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Phone"
                                placeholder="01XXXXXXXXX"
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="address"
                        validators={{ onChange: createAddressZodSchema.shape.address }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Address"
                                placeholder="Building, street, house"
                            />
                        )}
                    </form.Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <form.Field
                            name="area"
                            validators={{ onChange: createAddressZodSchema.shape.area }}
                        >
                            {(field) => (
                                <AppField field={field} label="Area" placeholder="Area" />
                            )}
                        </form.Field>

                        <form.Field
                            name="district"
                            validators={{ onChange: createAddressZodSchema.shape.district }}
                        >
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="District"
                                    placeholder="District"
                                />
                            )}
                        </form.Field>

                        <form.Field
                            name="division"
                            validators={{ onChange: createAddressZodSchema.shape.division }}
                        >
                            {(field) => (
                                <AppField
                                    field={field}
                                    label="Division"
                                    placeholder="Division"
                                />
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="isDefault">
                        {(field) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isDefault"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) =>
                                        field.handleChange(checked === true)
                                    }
                                />
                                <Label htmlFor="isDefault">Set as default address</Label>
                            </div>
                        )}
                    </form.Field>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <AppSubmitButton
                                    isPending={isSubmitting || isPending}
                                    pendingLabel={isEditMode ? "Updating..." : "Saving..."}
                                    disabled={!canSubmit}
                                >
                                    {isEditMode ? "Update Address" : "Save Address"}
                                </AppSubmitButton>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
