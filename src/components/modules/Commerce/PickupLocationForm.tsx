"use client";

import React from "react";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createPickupLocationZodSchema } from "@/zod/commerce.validation";
import { createPickupLocation } from "@/services/commerce.services";
import { useFormError } from "@/hooks/useFormError";
import type {
    IPickupLocation,
    ICreatePickupLocationPayload,
} from "@/types/commerce.types";

interface PickupLocationFormProps {
    onSuccess: (location: IPickupLocation) => void;
    onCancel?: () => void;
}

const PickupLocationForm = ({
    onSuccess,
    onCancel,
}: PickupLocationFormProps) => {
    const { serverError, clearError, handleError } = useFormError();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: ICreatePickupLocationPayload) => {
            return await createPickupLocation(payload);
        },
    });

    const form = useForm({
        defaultValues: {
            name: "",
            addressLine: "",
            city: "",
            district: "",
            postalCode: "",
            phone: "",
            openingHours: "",
            status: "ACTIVE" as const,
            isDefault: false,
        },
        onSubmit: async ({ value }) => {
            clearError();
            try {
                const payload: ICreatePickupLocationPayload = {
                    name: value.name,
                    addressLine: value.addressLine,
                    city: value.city,
                    district: value.district,
                    postalCode: value.postalCode || undefined,
                    phone: value.phone,
                    openingHours: value.openingHours || undefined,
                    status: value.status,
                    isDefault: value.isDefault,
                };
                const location = await mutateAsync(payload);
                onSuccess(location);
            } catch (error) {
                handleError(error);
            }
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-4"
            noValidate
        >
            {serverError && (
                <Alert variant="destructive">
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            )}

            <form.Field
                name="name"
                validators={{
                    onChange: createPickupLocationZodSchema.shape.name,
                }}
            >
                {(field) => <AppField field={field} label="Location Name" />}
            </form.Field>

            <form.Field
                name="addressLine"
                validators={{
                    onChange: createPickupLocationZodSchema.shape.addressLine,
                }}
            >
                {(field) => <AppField field={field} label="Address" />}
            </form.Field>

            <div className="grid grid-cols-2 gap-3">
                <form.Field
                    name="city"
                    validators={{
                        onChange: createPickupLocationZodSchema.shape.city,
                    }}
                >
                    {(field) => <AppField field={field} label="City" />}
                </form.Field>
                <form.Field
                    name="district"
                    validators={{
                        onChange: createPickupLocationZodSchema.shape.district,
                    }}
                >
                    {(field) => <AppField field={field} label="District" />}
                </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <form.Field name="postalCode">
                    {(field) => <AppField field={field} label="Postal Code" />}
                </form.Field>
                <form.Field
                    name="phone"
                    validators={{
                        onChange: createPickupLocationZodSchema.shape.phone,
                    }}
                >
                    {(field) => <AppField field={field} label="Phone" />}
                </form.Field>
            </div>

            <form.Field name="openingHours">
                {(field) => <AppField field={field} label="Opening Hours" />}
            </form.Field>

            <form.Field name="status">
                {(field) => (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </form.Field>

            <div className="flex gap-2 pt-2">
                <form.Subscribe
                    selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                >
                    {([canSubmit, isSubmitting]) => (
                        <AppSubmitButton
                            isPending={isSubmitting || isPending}
                            pendingLabel="Creating..."
                            disabled={!canSubmit}
                        >
                            Create Location
                        </AppSubmitButton>
                    )}
                </form.Subscribe>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default PickupLocationForm;
