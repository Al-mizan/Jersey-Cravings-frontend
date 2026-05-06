"use client";

import React, { useState } from "react";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
    createVariantZodSchema,
    updateVariantZodSchema,
} from "@/zod/product.validation";
import { createVariant, updateVariant } from "@/services/product.services";
import { useFormError } from "@/hooks/useFormError";
import type {
    ICreateVariantPayload,
    IProductVariant,
    IUpdateVariantPayload,
} from "@/types/product.types";

interface VariantFormProps {
    productId: string;
    initialVariant?: IProductVariant;
    onSuccess: () => void;
    onCancel: () => void;
}

const VariantForm = ({
    productId,
    initialVariant,
    onSuccess,
    onCancel,
}: VariantFormProps) => {
    const { serverError, clearError, handleError } = useFormError();
    const isEdit = Boolean(initialVariant);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (
            payload: ICreateVariantPayload | IUpdateVariantPayload,
        ) => {
            if (isEdit && initialVariant) {
                return await updateVariant(
                    productId,
                    initialVariant.id,
                    payload as IUpdateVariantPayload,
                );
            }
            return await createVariant(
                productId,
                payload as ICreateVariantPayload,
            );
        },
    });

    const form = useForm({
        defaultValues: {
            sku: initialVariant?.sku || "",
            size: initialVariant?.size || "M",
            fit: initialVariant?.fit || "FAN",
            sleeveType: initialVariant?.sleeveType || "SHORT",
            priceAmount: initialVariant?.priceAmount || 0,
            compareAtAmount: initialVariant?.compareAtAmount || 0,
            costAmount: initialVariant?.costAmount || 0,
            stockQty: initialVariant?.stockQty || 0,
            isActive: initialVariant?.isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            clearError();
            try {
                const payload: ICreateVariantPayload | IUpdateVariantPayload =
                    isEdit
                        ? {
                              priceAmount: value.priceAmount,
                              compareAtAmount:
                                  value.compareAtAmount || undefined,
                              costAmount: value.costAmount || undefined,
                              stockQty: value.stockQty,
                              isActive: value.isActive,
                          }
                        : {
                              sku: value.sku,
                              size: value.size,
                              fit: value.fit,
                              sleeveType: value.sleeveType,
                              priceAmount: value.priceAmount,
                              compareAtAmount:
                                  value.compareAtAmount || undefined,
                              costAmount: value.costAmount || undefined,
                              stockQty: value.stockQty,
                          };

                await mutateAsync(payload);
                onSuccess();
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
                name="sku"
                validators={{ onChange: createVariantZodSchema.shape.sku }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="SKU"
                        placeholder="ARG-26-HOME-M-FAN-SS"
                        disabled={isEdit}
                    />
                )}
            </form.Field>

            <div className="grid grid-cols-3 gap-3">
                <form.Field
                    name="size"
                    validators={{ onChange: createVariantZodSchema.shape.size }}
                >
                    {(field) => (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Size</label>
                            <Select
                                value={field.state.value}
                                onValueChange={(value) =>
                                    field.handleChange(
                                        value as typeof field.state.value,
                                    )
                                }
                                disabled={isEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="S">S</SelectItem>
                                    <SelectItem value="M">M</SelectItem>
                                    <SelectItem value="L">L</SelectItem>
                                    <SelectItem value="XL">XL</SelectItem>
                                    <SelectItem value="XXL">XXL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </form.Field>

                <form.Field
                    name="fit"
                    validators={{ onChange: createVariantZodSchema.shape.fit }}
                >
                    {(field) => (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fit</label>
                            <Select
                                value={field.state.value}
                                onValueChange={(value) =>
                                    field.handleChange(
                                        value as typeof field.state.value,
                                    )
                                }
                                disabled={isEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Fit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FAN">Fan</SelectItem>
                                    <SelectItem value="PLAYER">
                                        Player
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </form.Field>

                <form.Field
                    name="sleeveType"
                    validators={{
                        onChange: createVariantZodSchema.shape.sleeveType,
                    }}
                >
                    {(field) => (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Sleeve
                            </label>
                            <Select
                                value={field.state.value}
                                onValueChange={(value) =>
                                    field.handleChange(
                                        value as typeof field.state.value,
                                    )
                                }
                                disabled={isEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sleeve" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SHORT">Short</SelectItem>
                                    <SelectItem value="LONG">Long</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <form.Field name="priceAmount">
                    {(field) => (
                        <AppField
                            field={field}
                            label="Price (BDT)"
                            type="number"
                            placeholder="4500"
                        />
                    )}
                </form.Field>

                <form.Field name="compareAtAmount">
                    {(field) => (
                        <AppField
                            field={field}
                            label="Compare At"
                            type="number"
                            placeholder="5000"
                        />
                    )}
                </form.Field>

                <form.Field name="costAmount">
                    {(field) => (
                        <AppField
                            field={field}
                            label="Cost"
                            type="number"
                            placeholder="3000"
                        />
                    )}
                </form.Field>

                <form.Field name="stockQty">
                    {(field) => (
                        <AppField
                            field={field}
                            label="Stock Quantity"
                            type="number"
                            placeholder="40"
                        />
                    )}
                </form.Field>
            </div>

            {isEdit && (
                <form.Field name="isActive">
                    {(field) => (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">Active</p>
                                <p className="text-xs text-muted-foreground">
                                    Disable to hide this variant
                                </p>
                            </div>
                            <Checkbox
                                checked={field.state.value}
                                onCheckedChange={(value) =>
                                    field.handleChange(Boolean(value))
                                }
                            />
                        </div>
                    )}
                </form.Field>
            )}

            <div className="flex gap-2 pt-2">
                <form.Subscribe
                    selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                >
                    {([canSubmit, isSubmitting]) => (
                        <AppSubmitButton
                            isPending={isSubmitting || isPending}
                            pendingLabel={
                                isEdit ? "Updating..." : "Creating..."
                            }
                            disabled={!canSubmit}
                        >
                            {isEdit ? "Update Variant" : "Create Variant"}
                        </AppSubmitButton>
                    )}
                </form.Subscribe>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default VariantForm;
