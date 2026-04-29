"use client";

import React, { useState } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { createProductZodSchema } from "@/zod/product.validation";
import { productApiClient } from "@/lib/axios/productApiClient";
import { getAllCategories } from "@/services/product.services";
import type {
    ICategory,
    ICategoryListResponse,
    ICreateProductPayload,
    IProduct,
    IUpdateProductPayload,
} from "@/types/product.types";

interface ProductFormProps {
    initialProduct?: IProduct;
    mode: "create" | "edit";
    onSuccess?: (product: IProduct) => void;
}

const emptyCategoriesResponse: ICategoryListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 0,
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

const ProductForm = ({ initialProduct, mode, onSuccess }: ProductFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const { data: categoriesData } = useQuery({
        queryKey: ["categories", "all"],
        queryFn: async () => {
            const response = await getAllCategories(undefined, 1, 100, true, false);
            return response ?? emptyCategoriesResponse;
        },
        staleTime: 60000,
    });

    const categories = categoriesData?.data || [];

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (
            payload: ICreateProductPayload | IUpdateProductPayload,
        ) => {
            if (mode === "edit" && initialProduct) {
                return await productApiClient.updateProduct(
                    initialProduct.id,
                    payload,
                );
            }
            return await productApiClient.createProduct(
                payload as ICreateProductPayload,
            );
        },
    });

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
            setServerError(null);
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
                const message =
                    error instanceof Error
                        ? error.message
                        : "An error occurred";
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
                name="title"
                validators={{ onChange: createProductZodSchema.shape.title }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Product Title"
                        placeholder="Argentina 2026 Home Jersey"
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
                validators={{ onChange: createProductZodSchema.shape.slug }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Slug"
                        placeholder="argentina-2026-home-jersey"
                        onValueChange={() => setSlugManuallyEdited(true)}
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
                            onValueChange={(value) => field.handleChange(value)}
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
