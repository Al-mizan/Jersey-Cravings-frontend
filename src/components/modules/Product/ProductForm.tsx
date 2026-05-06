"use client";

import React from "react";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { createProductZodSchema } from "@/zod/product.validation";
import { useFormError } from "@/hooks/useFormError";
import { slugify } from "@/lib/utils";
import type {
    ICategory,
    ICreateProductPayload,
    IProduct,
    IUpdateProductPayload,
} from "@/types/product.types";
import { useCategoryOptions } from "./hooks/useCategoriesManagement";
import { useProductFormMutation } from "./hooks/useProductManagement";
import { useSlugFieldSync } from "./hooks/useSlugFieldSync";

interface ProductFormProps {
    initialProduct?: IProduct;
    mode: "create" | "edit";
    onSuccess?: (product: IProduct) => void;
}

const ProductForm = ({ initialProduct, mode, onSuccess }: ProductFormProps) => {
    const { serverError, clearError, handleError } = useFormError();
    const { data: categoriesData } = useCategoryOptions();

    const categories = categoriesData?.data || [];

    const form = useForm({
        defaultValues: {
            title: initialProduct?.title || "",
            slug: initialProduct?.slug || "",
            description: initialProduct?.description || "",
            teamName: initialProduct?.teamName || "",
            tournamentTag: initialProduct?.tournamentTag || "",
            jerseyType: initialProduct?.jerseyType || "HOME",
            categoryId: initialProduct?.categoryId || "",
        },
        onSubmit: async ({ value }) => {
            clearError();
            try {
                const payload: ICreateProductPayload | IUpdateProductPayload = {
                    title: value.title,
                    slug: value.slug || slugify(value.title),
                    description: value.description || undefined,
                    teamName: value.teamName,
                    tournamentTag: value.tournamentTag || undefined,
                    jerseyType: value.jerseyType,
                    categoryId: value.categoryId,
                };

                const product = await mutateAsync(payload);
                onSuccess?.(product);
            } catch (error) {
                handleError(error);
            }
        },
    });

    const { handleSourceValueChange, markSlugAsEdited } = useSlugFieldSync({
        onSlugChange: (value) => form.setFieldValue("slug", value),
    });

    const { mutateAsync, isPending } = useProductFormMutation(
        mode,
        initialProduct?.id,
    );

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
                name="title"
                validators={{ onChange: createProductZodSchema.shape.title }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Product Title"
                        placeholder="Argentina 2026 Home Jersey"
                        onValueChange={handleSourceValueChange}
                    />
                )}
            </form.Field>

            <form.Field
                name="slug"
                validators={{ onChange: createProductZodSchema.shape.slug }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Slug"
                        placeholder="argentina-2026-home-jersey"
                        onValueChange={markSlugAsEdited}
                    />
                )}
            </form.Field>

            <form.Field name="description">
                {(field) => (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Description
                        </label>
                        <Textarea
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Write a short description..."
                            rows={4}
                        />
                    </div>
                )}
            </form.Field>

            <form.Field
                name="teamName"
                validators={{ onChange: createProductZodSchema.shape.teamName }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Team Name"
                        placeholder="Argentina"
                    />
                )}
            </form.Field>

            <form.Field name="tournamentTag">
                {(field) => (
                    <AppField
                        field={field}
                        label="Tournament Tag"
                        placeholder="World Cup 2026"
                    />
                )}
            </form.Field>

            <form.Field
                name="jerseyType"
                validators={{
                    onChange: createProductZodSchema.shape.jerseyType,
                }}
            >
                {(field) => (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Jersey Type
                        </label>
                        <Select
                            value={field.state.value}
                            onValueChange={(value) =>
                                field.handleChange(
                                    value as typeof field.state.value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select jersey type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HOME">Home</SelectItem>
                                <SelectItem value="AWAY">Away</SelectItem>
                                <SelectItem value="THIRD">Third</SelectItem>
                                <SelectItem value="GK">Goalkeeper</SelectItem>
                                <SelectItem value="SPECIAL">Special</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </form.Field>

            <form.Field
                name="categoryId"
                validators={{
                    onChange: createProductZodSchema.shape.categoryId,
                }}
            >
                {(field) => (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category: ICategory) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </form.Field>

            <div className="flex gap-2 pt-4">
                <form.Subscribe
                    selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                >
                    {([canSubmit, isSubmitting]) => (
                        <AppSubmitButton
                            isPending={isSubmitting || isPending}
                            pendingLabel={
                                mode === "edit" ? "Updating..." : "Creating..."
                            }
                            disabled={!canSubmit}
                        >
                            {mode === "edit"
                                ? "Update Product"
                                : "Create Product"}
                        </AppSubmitButton>
                    )}
                </form.Subscribe>
                {mode === "edit" && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
};

export default ProductForm;
