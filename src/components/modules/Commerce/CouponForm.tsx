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
import { createCouponZodSchema } from "@/zod/commerce.validation";
import { createCoupon } from "@/services/commerce.services";
import { useFormError } from "@/hooks/useFormError";
import type { ICoupon, ICreateCouponPayload } from "@/types/commerce.types";

interface CouponFormProps {
    onSuccess: (coupon: ICoupon) => void;
    onCancel?: () => void;
}

const CouponForm = ({ onSuccess, onCancel }: CouponFormProps) => {
    const { serverError, clearError, handleError } = useFormError();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: ICreateCouponPayload) => {
            return await createCoupon(payload);
        },
    });

    const form = useForm({
        defaultValues: {
            code: "",
            discountType: "PERCENT" as const,
            value: 10,
            minOrderAmount: 0,
            maxDiscountAmount: 0,
            startsAt: "",
            endsAt: "",
            isActive: true,
        },
        onSubmit: async ({ value }) => {
            clearError();
            try {
                const payload: ICreateCouponPayload = {
                    code: value.code,
                    discountType: value.discountType,
                    value: value.value,
                    minOrderAmount: value.minOrderAmount || undefined,
                    maxDiscountAmount: value.maxDiscountAmount || undefined,
                    startsAt: value.startsAt || undefined,
                    endsAt: value.endsAt || undefined,
                    isActive: value.isActive,
                };
                const coupon = await mutateAsync(payload);
                onSuccess(coupon);
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
                name="code"
                validators={{ onChange: createCouponZodSchema.shape.code }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Coupon Code"
                        placeholder="WC2026"
                    />
                )}
            </form.Field>

            <form.Field name="discountType">
                {(field) => (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Discount Type
                        </label>
                        <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PERCENT">Percent</SelectItem>
                                <SelectItem value="FLAT">Flat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </form.Field>

            <form.Field
                name="value"
                validators={{ onChange: createCouponZodSchema.shape.value }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Value"
                        type="number"
                        placeholder="10"
                    />
                )}
            </form.Field>

            <div className="grid grid-cols-2 gap-3">
                <form.Field name="minOrderAmount">
                    {(field) => (
                        <AppField
                            field={field}
                            label="Min Order"
                            type="number"
                            placeholder="5000"
                        />
                    )}
                </form.Field>
                <form.Field name="maxDiscountAmount">
                    {(field) => (
                        <AppField
                            field={field}
                            label="Max Discount"
                            type="number"
                            placeholder="1000"
                        />
                    )}
                </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <form.Field name="startsAt">
                    {(field) => (
                        <AppField
                            field={field}
                            label="Starts At"
                            type="text"
                            placeholder="2026-05-01T00:00:00.000Z"
                        />
                    )}
                </form.Field>
                <form.Field name="endsAt">
                    {(field) => (
                        <AppField
                            field={field}
                            label="Ends At"
                            type="text"
                            placeholder="2026-06-30T23:59:59.000Z"
                        />
                    )}
                </form.Field>
            </div>

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
                            Create Coupon
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

export default CouponForm;
