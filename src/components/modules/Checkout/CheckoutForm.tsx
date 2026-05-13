"use client";

import React, { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import {
    checkoutBillingFormSchema,
    type CheckoutBillingFormValues,
} from "@/zod/order.validation";
import {
    BD_DIVISIONS,
    getAreasForDistrict,
    getDistrictsForDivision,
} from "@/lib/bd-locations";
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

type CheckoutFormValues = CheckoutBillingFormValues;

interface CheckoutFormProps {
    shippingMethod: string;
    onValuesChange: (values: CheckoutFormValues, isValid: boolean) => void;
    formRef: React.RefObject<{
        validate: () => Promise<boolean>;
        getValues: () => CheckoutFormValues;
    } | null>;
}

function FieldError({ error }: { error: string | null }) {
    if (!error) return null;
    return (
        <p role="alert" className="text-sm text-destructive mt-1">
            {error}
        </p>
    );
}

function getError(field: {
    state: { meta: { isTouched: boolean; errors: unknown[] } };
}): string | null {
    if (!field.state.meta.isTouched || field.state.meta.errors.length === 0)
        return null;
    const err = field.state.meta.errors[0];
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && "message" in err)
        return (err as { message: string }).message;
    return String(err);
}

export default function CheckoutForm({
    shippingMethod,
    onValuesChange,
    formRef,
}: CheckoutFormProps) {
    const form = useForm({
        defaultValues: {
            name: "",
            phone: "",
            address: "",
            email: "",
            orderNote: "",
            shippingMethod: shippingMethod || "ju",
            division: "",
            district: "",
            area: "",
        } as CheckoutFormValues,
        onSubmit: () => {
            // submission is handled externally via formRef
        },
    });

    // Expose validate + getValues to the parent
    React.useImperativeHandle(formRef, () => ({
        validate: async () => {
            // Validate using Zod schema
            const result = checkoutBillingFormSchema.safeParse(
                form.state.values,
            );
            if (!result.success) {
                // Set errors on form fields based on Zod validation
                result.error.issues.forEach((issue) => {
                    const fieldName = issue.path[0] as keyof CheckoutFormValues;
                    if (fieldName) {
                        form.setFieldValue(
                            fieldName,
                            form.state.values[fieldName],
                        );
                    }
                });
                return false;
            }
            return true;
        },
        getValues: () => form.state.values,
    }));

    // Notify parent on value change (excluding shippingMethod to prevent loop)
    const prevValuesRef = React.useRef(form.state.values);
    React.useEffect(() => {
        const values = form.state.values;
        // Only notify if values actually changed (excluding shippingMethod which is controlled by parent)
        const { shippingMethod: _, ...valuesWithoutShipping } = values;
        const { shippingMethod: __, ...prevWithoutShipping } =
            prevValuesRef.current;

        if (
            JSON.stringify(valuesWithoutShipping) !==
            JSON.stringify(prevWithoutShipping)
        ) {
            const result = checkoutBillingFormSchema.safeParse(values);
            const isValid = result.success;
            onValuesChange(values, isValid);
            prevValuesRef.current = values;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.state.values]);

    React.useEffect(() => {
        // Only update if the shippingMethod in the form is different from the prop
        if (form.state.values.shippingMethod !== shippingMethod) {
            form.setFieldValue("shippingMethod", shippingMethod);

            if (shippingMethod === "ju") {
                form.setFieldValue("division", "");
                form.setFieldValue("district", "");
                form.setFieldValue("area", "");
                form.setFieldValue("address", "");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shippingMethod]);

    const selectedDivision = useStore(form.store, (s) => s.values.division);
    const selectedDistrict = useStore(form.store, (s) => s.values.district);
    const orderNoteValue = useStore(form.store, (s) => s.values.orderNote);
    const isPickup = shippingMethod === "ju";

    const availableDistricts = useMemo(
        () => getDistrictsForDivision(selectedDivision),
        [selectedDivision],
    );

    const availableAreas = useMemo(
        () => getAreasForDistrict(selectedDistrict),
        [selectedDistrict],
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
                <form.Field
                    name="name"
                    validators={{
                        onChange: ({ value }) => {
                            const result =
                                checkoutBillingFormSchema.shape.name.safeParse(
                                    value,
                                );
                            if (!result.success) {
                                return result.error.issues[0].message;
                            }
                        },
                    }}
                >
                    {(field) => {
                        const error = getError(field);
                        return (
                            <div
                                className="space-y-1.5"
                                data-error={error ? true : undefined}
                            >
                                <Label
                                    htmlFor="checkout-name"
                                    className={cn(error && "text-destructive")}
                                >
                                    Name{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="checkout-name"
                                    placeholder="Your full name"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    className={cn(
                                        error &&
                                            "border-destructive focus-visible:ring-destructive/20",
                                    )}
                                />
                                <FieldError error={error} />
                            </div>
                        );
                    }}
                </form.Field>

                <form.Field
                    name="phone"
                    validators={{
                        onChange: ({ value }) => {
                            const result =
                                checkoutBillingFormSchema.shape.phone.safeParse(
                                    value,
                                );
                            if (!result.success) {
                                return result.error.issues[0].message;
                            }
                        },
                    }}
                >
                    {(field) => {
                        const error = getError(field);
                        return (
                            <div
                                className="space-y-1.5"
                                data-error={error ? true : undefined}
                            >
                                <Label
                                    htmlFor="checkout-phone"
                                    className={cn(error && "text-destructive")}
                                >
                                    Phone{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="checkout-phone"
                                    placeholder="01XXXXXXXXX"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    inputMode="tel"
                                    className={cn(
                                        error &&
                                            "border-destructive focus-visible:ring-destructive/20",
                                    )}
                                />
                                <FieldError error={error} />
                            </div>
                        );
                    }}
                </form.Field>
            </div>

            {/* Division + District + Area */}
            {shippingMethod !== "ju" && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <form.Field
                            name="division"
                            validators={{
                                onChange: ({ value }) => {
                                    const result =
                                        checkoutBillingFormSchema.shape.division.safeParse(
                                            value,
                                        );
                                    if (!result.success) {
                                        return result.error.issues[0].message;
                                    }
                                },
                            }}
                        >
                            {(field) => {
                                const error = getError(field);
                                return (
                                    <div
                                        className="space-y-1.5"
                                        data-error={error ? true : undefined}
                                    >
                                        <Label
                                            htmlFor="checkout-division"
                                            className={cn(
                                                error && "text-destructive",
                                            )}
                                        >
                                            Division{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={field.state.value}
                                            disabled={isPickup}
                                            onValueChange={(value) => {
                                                field.handleChange(value);
                                                form.setFieldValue(
                                                    "district",
                                                    "",
                                                );
                                                form.setFieldValue("area", "");
                                            }}
                                        >
                                            <SelectTrigger
                                                id="checkout-division"
                                                className={cn(
                                                    error &&
                                                        "border-destructive focus-visible:ring-destructive/20",
                                                )}
                                            >
                                                <SelectValue placeholder="Select Division" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BD_DIVISIONS.map(
                                                    (division) => (
                                                        <SelectItem
                                                            key={division.value}
                                                            value={
                                                                division.value
                                                            }
                                                        >
                                                            {division.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FieldError error={error} />
                                    </div>
                                );
                            }}
                        </form.Field>

                        <form.Field
                            name="district"
                            validators={{
                                onChange: ({ value }) => {
                                    const result =
                                        checkoutBillingFormSchema.shape.district.safeParse(
                                            value,
                                        );
                                    if (!result.success) {
                                        return result.error.issues[0].message;
                                    }
                                },
                            }}
                        >
                            {(field) => {
                                const error = getError(field);
                                return (
                                    <div
                                        className="space-y-1.5"
                                        data-error={error ? true : undefined}
                                    >
                                        <Label
                                            htmlFor="checkout-district"
                                            className={cn(
                                                error && "text-destructive",
                                            )}
                                        >
                                            District{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={field.state.value}
                                            disabled={isPickup}
                                            onValueChange={(value) => {
                                                field.handleChange(value);
                                                form.setFieldValue("area", "");
                                            }}
                                        >
                                            <SelectTrigger
                                                id="checkout-district"
                                                className={cn(
                                                    error &&
                                                        "border-destructive focus-visible:ring-destructive/20",
                                                )}
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        selectedDivision
                                                            ? "Select District"
                                                            : "Select division first"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableDistricts.map(
                                                    (district) => (
                                                        <SelectItem
                                                            key={district.value}
                                                            value={
                                                                district.value
                                                            }
                                                        >
                                                            {district.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FieldError error={error} />
                                    </div>
                                );
                            }}
                        </form.Field>

                        <form.Field
                            name="area"
                            validators={{
                                onChange: ({ value }) => {
                                    const result =
                                        checkoutBillingFormSchema.shape.area.safeParse(
                                            value,
                                        );
                                    if (!result.success) {
                                        return result.error.issues[0].message;
                                    }
                                },
                            }}
                        >
                            {(field) => {
                                const error = getError(field);
                                return (
                                    <div
                                        className="space-y-1.5"
                                        data-error={error ? true : undefined}
                                    >
                                        <Label
                                            htmlFor="checkout-area"
                                            className={cn(
                                                error && "text-destructive",
                                            )}
                                        >
                                            {selectedDistrict === "dhaka"
                                                ? "Area / Thana"
                                                : "Upazila"}
                                            <span className="text-destructive">
                                                {" "}
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            disabled={
                                                isPickup || !selectedDistrict
                                            }
                                        >
                                            <SelectTrigger
                                                id="checkout-area"
                                                className={cn(
                                                    error &&
                                                        "border-destructive focus-visible:ring-destructive/20",
                                                )}
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        selectedDistrict
                                                            ? "Select Area"
                                                            : "Select district first"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableAreas.map((area) => (
                                                    <SelectItem
                                                        key={area.value}
                                                        value={area.value}
                                                    >
                                                        {area.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError error={error} />
                                    </div>
                                );
                            }}
                        </form.Field>
                    </div>
                    {/* Address */}
                    <form.Field
                        name="address"
                        validators={{
                            onChange: ({ value }) => {
                                const result =
                                    checkoutBillingFormSchema.shape.address.safeParse(
                                        value,
                                    );
                                if (!result.success) {
                                    return result.error.issues[0].message;
                                }
                            },
                        }}
                    >
                        {(field) => {
                            const error = getError(field);
                            return (
                                <div
                                    className="space-y-1.5"
                                    data-error={error ? true : undefined}
                                >
                                    <Label
                                        htmlFor="checkout-address"
                                        className={cn(
                                            error && "text-destructive",
                                        )}
                                    >
                                        Address{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="checkout-address"
                                        placeholder="House, Road, Village"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        disabled={isPickup}
                                        className={cn(
                                            error &&
                                                "border-destructive focus-visible:ring-destructive/20",
                                        )}
                                    />
                                    <FieldError error={error} />
                                </div>
                            );
                        }}
                    </form.Field>
                </>
            )}
            {/* Email */}
            <form.Field
                name="email"
                validators={{
                    onChange: ({ value }) => {
                        const result =
                            checkoutBillingFormSchema.shape.email.safeParse(
                                value,
                            );
                        if (!result.success) {
                            return result.error.issues[0].message;
                        }
                    },
                }}
            >
                {(field) => {
                    const error = getError(field);
                    return (
                        <div
                            className="space-y-1.5"
                            data-error={error ? true : undefined}
                        >
                            <Label
                                htmlFor="checkout-email"
                                className={cn(error && "text-destructive")}
                            >
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
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                className={cn(
                                    error &&
                                        "border-destructive focus-visible:ring-destructive/20",
                                )}
                            />
                            <FieldError error={error} />
                        </div>
                    );
                }}
            </form.Field>

            {/* Order Note */}
            <form.Field
                name="orderNote"
                validators={{
                    onChange: ({ value }) => {
                        const result =
                            checkoutBillingFormSchema.shape.orderNote.safeParse(
                                value,
                            );
                        if (!result.success) {
                            return result.error.issues[0].message;
                        }
                    },
                }}
            >
                {(field) => {
                    const error = getError(field);
                    return (
                        <div
                            className="space-y-1.5"
                            data-error={error ? true : undefined}
                        >
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="checkout-note"
                                    className={cn(error && "text-destructive")}
                                >
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
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                rows={3}
                                className={cn(
                                    "resize-none",
                                    error &&
                                        "border-destructive focus-visible:ring-destructive/20",
                                )}
                            />
                            <FieldError error={error} />
                        </div>
                    );
                }}
            </form.Field>
        </div>
    );
}
