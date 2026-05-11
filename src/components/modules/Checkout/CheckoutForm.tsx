"use client";

import React, { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { checkoutBillingFormSchema } from "@/zod/order.validation";
import { BD_DISTRICTS, getAreasForDistrict } from "@/lib/bd-locations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CheckoutFormValues = {
    name: string;
    phone: string;
    address: string;
    email: string;
    orderNote: string;
    city: string;
    area: string;
};

interface CheckoutFormProps {
    onValuesChange: (values: CheckoutFormValues, isValid: boolean) => void;
    formRef: React.RefObject<{ validate: () => Promise<boolean>; getValues: () => CheckoutFormValues } | null>;
}

function FieldError({ error }: { error: string | null }) {
    if (!error) return null;
    return (
        <p role="alert" className="text-sm text-destructive mt-1">
            {error}
        </p>
    );
}

function getError(field: { state: { meta: { isTouched: boolean; errors: unknown[] } } }): string | null {
    if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) return null;
    const err = field.state.meta.errors[0];
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && "message" in err) return (err as { message: string }).message;
    return String(err);
}

export default function CheckoutForm({ onValuesChange, formRef }: CheckoutFormProps) {
    const form = useForm({
        defaultValues: {
            name: "",
            phone: "",
            address: "",
            email: "",
            orderNote: "",
            city: "",
            area: "",
        } as CheckoutFormValues,
        validatorAdapter: zodValidator(),
        validators: {
            onChange: checkoutBillingFormSchema,
        },
        onSubmit: () => {
            // submission is handled externally via formRef
        },
    });

    // Expose validate + getValues to the parent
    React.useImperativeHandle(formRef, () => ({
        validate: async () => {
            // Touch all fields to trigger validation display
            form.validateAllFields("change");
            const errors = form.state.fieldMeta;
            const hasErrors = Object.values(errors).some(
                (meta) => meta.errors && meta.errors.length > 0,
            );
            return !hasErrors;
        },
        getValues: () => form.state.values,
    }));

    // Notify parent on value change
    React.useEffect(() => {
        const values = form.state.values;
        const hasErrors = Object.values(form.state.fieldMeta).some(
            (meta) => meta.errors && meta.errors.length > 0,
        );
        onValuesChange(values, !hasErrors);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.state.values, form.state.fieldMeta]);

    const selectedCity = form.useStore((s) => s.values.city);
    const orderNoteValue = form.useStore((s) => s.values.orderNote);

    const availableAreas = useMemo(
        () => getAreasForDistrict(selectedCity),
        [selectedCity],
    );

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold tracking-tight font-heading uppercase text-foreground">
                    Billing & Shipping
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Enter your delivery details below
                </p>
            </div>

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field name="name">
                    {(field) => (
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="checkout-name"
                                className={cn(getError(field) && "text-destructive")}
                            >
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="checkout-name"
                                placeholder="Your full name"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className={cn(
                                    getError(field) &&
                                        "border-destructive focus-visible:ring-destructive/20",
                                )}
                            />
                            <FieldError error={getError(field)} />
                        </div>
                    )}
                </form.Field>

                <form.Field name="phone">
                    {(field) => (
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="checkout-phone"
                                className={cn(getError(field) && "text-destructive")}
                            >
                                Phone <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="checkout-phone"
                                placeholder="01XXXXXXXXX"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                inputMode="tel"
                                className={cn(
                                    getError(field) &&
                                        "border-destructive focus-visible:ring-destructive/20",
                                )}
                            />
                            <FieldError error={getError(field)} />
                        </div>
                    )}
                </form.Field>
            </div>

            {/* City + Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field name="city">
                    {(field) => (
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="checkout-city"
                                className={cn(getError(field) && "text-destructive")}
                            >
                                City <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={field.state.value}
                                onValueChange={(value) => {
                                    field.handleChange(value);
                                    // Reset area when city changes
                                    form.setFieldValue("area", "");
                                }}
                            >
                                <SelectTrigger
                                    id="checkout-city"
                                    className={cn(
                                        getError(field) &&
                                            "border-destructive focus-visible:ring-destructive/20",
                                    )}
                                >
                                    <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BD_DISTRICTS.map((d) => (
                                        <SelectItem key={d.value} value={d.value}>
                                            {d.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError error={getError(field)} />
                        </div>
                    )}
                </form.Field>

                <form.Field name="area">
                    {(field) => (
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="checkout-area"
                                className={cn(getError(field) && "text-destructive")}
                            >
                                Area <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={field.state.value}
                                onValueChange={(value) => field.handleChange(value)}
                                disabled={!selectedCity}
                            >
                                <SelectTrigger
                                    id="checkout-area"
                                    className={cn(
                                        getError(field) &&
                                            "border-destructive focus-visible:ring-destructive/20",
                                    )}
                                >
                                    <SelectValue
                                        placeholder={
                                            selectedCity
                                                ? "Select Area"
                                                : "Select city first"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableAreas.map((a) => (
                                        <SelectItem key={a.value} value={a.value}>
                                            {a.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError error={getError(field)} />
                        </div>
                    )}
                </form.Field>
            </div>

            {/* Address */}
            <form.Field name="address">
                {(field) => (
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="checkout-address"
                            className={cn(getError(field) && "text-destructive")}
                        >
                            Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="checkout-address"
                            placeholder="House, Road, Village"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={cn(
                                getError(field) &&
                                    "border-destructive focus-visible:ring-destructive/20",
                            )}
                        />
                        <FieldError error={getError(field)} />
                    </div>
                )}
            </form.Field>

            {/* Email */}
            <form.Field name="email">
                {(field) => (
                    <div className="space-y-1.5">
                        <Label htmlFor="checkout-email">
                            Email{" "}
                            <span className="text-muted-foreground text-xs font-normal">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="checkout-email"
                            type="email"
                            placeholder="email@example.com"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={cn(
                                getError(field) &&
                                    "border-destructive focus-visible:ring-destructive/20",
                            )}
                        />
                        <FieldError error={getError(field)} />
                    </div>
                )}
            </form.Field>

            {/* Order Note */}
            <form.Field name="orderNote">
                {(field) => (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="checkout-note">
                                Order Note{" "}
                                <span className="text-muted-foreground text-xs font-normal">
                                    (optional)
                                </span>
                            </Label>
                            <span
                                className={cn(
                                    "text-xs tabular-nums",
                                    (orderNoteValue?.length ?? 0) > 450
                                        ? "text-destructive"
                                        : "text-muted-foreground",
                                )}
                            >
                                {orderNoteValue?.length ?? 0}/500
                            </span>
                        </div>
                        <Textarea
                            id="checkout-note"
                            placeholder="Any special instructions for your order..."
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            rows={3}
                            className={cn(
                                "resize-none",
                                getError(field) &&
                                    "border-destructive focus-visible:ring-destructive/20",
                            )}
                        />
                        <FieldError error={getError(field)} />
                    </div>
                )}
            </form.Field>
        </div>
    );
}
