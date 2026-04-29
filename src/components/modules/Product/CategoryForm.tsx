"use client";

import React, { useState } from "react";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
    createCategoryZodSchema,
    updateCategoryZodSchema,
} from "@/zod/product.validation";
import { productApiClient } from "@/lib/axios/productApiClient";
import type {
    ICategory,
    ICreateCategoryPayload,
    IUpdateCategoryPayload,
} from "@/types/product.types";

interface CategoryFormProps {
    mode: "create" | "edit";
    initialCategory?: ICategory;
    onSuccess: (category: ICategory) => void;
    onCancel?: () => void;
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

const CategoryForm = ({
    mode,
    initialCategory,
    onSuccess,
    onCancel,
}: CategoryFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const isEdit = mode === "edit" && Boolean(initialCategory);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (
            payload: ICreateCategoryPayload | IUpdateCategoryPayload,
        ) => {
            if (isEdit && initialCategory) {
                return await productApiClient.updateCategory(
                    initialCategory.id,
                    payload as IUpdateCategoryPayload,
                );
            }
            return await productApiClient.createCategory(
                payload as ICreateCategoryPayload,
            );
        },
    });

    const form = useForm({
        defaultValues: {
            name: initialCategory?.name || "",
            slug: initialCategory?.slug || "",
            isActive: initialCategory?.isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                const payload: ICreateCategoryPayload | IUpdateCategoryPayload =
                    isEdit
                        ? {
                              name: value.name,
                              slug: value.slug || slugify(value.name),
                              isActive: value.isActive,
                          }
                        : {
                              name: value.name,
                              slug: value.slug || slugify(value.name),
                          };

                const category = await mutateAsync(payload);
                onSuccess(category);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to save category";
                setServerError(message);
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
                validators={{ onChange: createCategoryZodSchema.shape.name }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Category Name"
                        placeholder="National Teams"
                        onValueChange={(value) => {
                            if (!slugManuallyEdited) {
                                form.setFieldValue("slug", slugify(value));
                            }
                        }}
                    />
                )}
            </form.Field>

            <form.Field
                name="slug"
                validators={{ onChange: createCategoryZodSchema.shape.slug }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Slug"
                        placeholder="national-teams"
                        onValueChange={() => setSlugManuallyEdited(true)}
                    />
                )}
            </form.Field>

            {isEdit && (
                <form.Field
                    name="isActive"
                    validators={{
                        onChange: updateCategoryZodSchema.shape.isActive,
                    }}
                >
                    {(field) => (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">
                                    Active Status
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Disable to hide this category
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
                            {isEdit ? "Update Category" : "Create Category"}
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

export default CategoryForm;
