"use client";

import React from "react";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "@tanstack/react-form";
import {
    createCategoryZodSchema,
    updateCategoryZodSchema,
} from "@/zod/product.validation";
import { useFormError } from "@/hooks/useFormError";
import { slugify } from "@/lib/utils";
import type {
    ICategory,
    ICreateCategoryPayload,
    IUpdateCategoryPayload,
} from "@/types/product.types";
import { useCategoryFormMutation } from "./hooks/useCategoriesManagement";
import { useSlugFieldSync } from "./hooks/useSlugFieldSync";

interface CategoryFormProps {
    mode: "create" | "edit";
    initialCategory?: ICategory;
    onSuccess: (category: ICategory) => void;
    onCancel?: () => void;
}

const CategoryForm = ({
    mode,
    initialCategory,
    onSuccess,
    onCancel,
}: CategoryFormProps) => {
    const { serverError, clearError, handleError } = useFormError();
    const isEdit = mode === "edit" && Boolean(initialCategory);

    const form = useForm({
        defaultValues: {
            name: initialCategory?.name || "",
            slug: initialCategory?.slug || "",
            isActive: initialCategory?.isActive ?? true,
        },
        onSubmit: async ({ value }) => {
            clearError();
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
                handleError(error);
            }
        },
    });

    const { handleSourceValueChange, markSlugAsEdited } = useSlugFieldSync({
        onSlugChange: (value) => form.setFieldValue("slug", value),
    });

    const { mutateAsync, isPending } = useCategoryFormMutation(
        mode,
        initialCategory?.id,
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
                name="name"
                validators={{ onChange: createCategoryZodSchema.shape.name }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Category Name"
                        placeholder="National Teams"
                        onValueChange={handleSourceValueChange}
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
                        onValueChange={markSlugAsEdited}
                    />
                )}
            </form.Field>

            {isEdit && (
                <form.Field name="isActive">
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
