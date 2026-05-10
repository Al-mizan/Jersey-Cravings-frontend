"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import imageCompression from "browser-image-compression";
import { createCategoryZodSchema, createProductZodSchema, createVariantZodSchema } from "@/zod/product.validation";
import {
    createCategory,
    createProduct,
    createProductMedia,
    createVariant,
    deleteVariant,
    getAllCategories,
} from "@/services/product.service";
import { adminCategoryKeys, adminProductKeys } from "@/hooks/queries/adminQueryKeys";
import type {
    ICreateVariantPayload,
    IProduct,
    IProductMedia,
    IProductVariant,
} from "@/types/product.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Plus, Trash2, UploadCloud, ImageIcon, Loader2 } from "lucide-react";

const jerseyTypeOptions = ["HOME", "AWAY", "THIRD", "GK", "SPECIAL"] as const;
const sizeOptions = ["S", "M", "L", "XL", "XXL"] as const;
const fitOptions = ["PLAYER", "FAN"] as const;
const sleeveOptions = ["SHORT", "LONG"] as const;
type ProductFormValues = {
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    title: string;
    slug: string;
    description: string;
    teamName: string;
    tournamentTag: string;
    jerseyType: (typeof jerseyTypeOptions)[number];
};

type VariantFormValues = {
    sku: string;
    size: (typeof sizeOptions)[number];
    fit: (typeof fitOptions)[number];
    sleeveType: (typeof sleeveOptions)[number];
    stockQty: string;
    priceAmount: string;
    compareAtAmount: string;
    costAmount: string;
};

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export default function CreateProductPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [product, setProduct] = useState<IProduct | null>(null);
    const [newCategoryMode, setNewCategoryMode] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [createdVariants, setCreatedVariants] = useState<IProductVariant[]>([]);
    const [createdMedia, setCreatedMedia] = useState<IProductMedia[]>([]);
    
    // Thumbnail state
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const categoriesQuery = useQuery({
        queryKey: adminCategoryKeys.options(),
        queryFn: () => getAllCategories(undefined, 1, 100, true, false),
    });

    const createCategoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: adminCategoryKeys.options() }),
    });

    const createProductMutation = useMutation({
        mutationFn: createProduct,
    });

    const createVariantMutation = useMutation({
        mutationFn: ({ productId, payload }: { productId: string; payload: ICreateVariantPayload }) =>
            createVariant(productId, payload),
        onSuccess: (variant) => {
            setCreatedVariants((prev) => [variant, ...prev]);
            toast.success("Variant added");
        },
    });
    const deleteVariantMutation = useMutation({
        mutationFn: ({
            productId,
            variantId,
        }: {
            productId: string;
            variantId: string;
        }) => deleteVariant(productId, variantId),
        onSuccess: (_, variables) => {
            setCreatedVariants((prev) =>
                prev.filter((variant) => variant.id !== variables.variantId),
            );
            toast.success("Variant deleted");
        },
        onError: () => {
            toast.error("Failed to delete variant");
        },
    });

    const uploadMediaMutation = useMutation({
        mutationFn: async (productId: string) => {
            if (files.length === 0) return;
            const formData = new FormData();
            files.forEach((file) => formData.append("productPhotos", file));
            return createProductMedia(productId, formData);
        },
        onSuccess: (uploadedMedia) => {
            setFiles([]);
            if (uploadedMedia?.length) {
                setCreatedMedia((prev) => [...uploadedMedia, ...prev]);
            }
        },
    });

    const productForm = useForm({
        defaultValues: {
            categoryId: "",
            categoryName: "",
            categorySlug: "",
            title: "",
            slug: "",
            description: "",
            teamName: "",
            tournamentTag: "",
            jerseyType: "HOME",
        } as ProductFormValues,
        onSubmit: async ({ value }) => {
            try {
                let categoryId = value.categoryId;
                if (newCategoryMode) {
                    const categoryPayload = createCategoryZodSchema.parse({
                        name: value.categoryName,
                        slug: value.categorySlug || slugify(value.categoryName),
                    });
                    const category = await createCategoryMutation.mutateAsync(categoryPayload);
                    categoryId = category.id;
                }

                const parsed = createProductZodSchema.parse({
                    title: value.title,
                    slug: value.slug || slugify(value.title),
                    description: value.description || undefined,
                    teamName: value.teamName,
                    tournamentTag: value.tournamentTag || undefined,
                    jerseyType: value.jerseyType,
                    categoryId,
                });

                const formData = new FormData();
                formData.append("data", JSON.stringify(parsed));
                if (thumbnailFile) {
                    formData.append("productThumbnail", thumbnailFile);
                }

                const created = await createProductMutation.mutateAsync(formData as any);
                setProduct(created);
                setCreatedVariants([]);
                setCreatedMedia([]);
                queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
                toast.success("Product created in DRAFT");
                setStep(2);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    toast.error(error.issues[0]?.message ?? "Invalid form data");
                    return;
                }
                toast.error("Failed to create product");
            }
        },
    });

    const variantForm = useForm({
        defaultValues: {
            sku: "",
            size: "M",
            fit: "PLAYER",
            sleeveType: "SHORT",
            stockQty: "0",
            priceAmount: "0",
            compareAtAmount: "",
            costAmount: "",
        } as VariantFormValues,
        onSubmit: async ({ value, formApi }) => {
            if (!product?.id) {
                toast.error("Create product first");
                return;
            }
            try {
                const payload = createVariantZodSchema.parse({
                    ...value,
                    stockQty: Number(value.stockQty),
                    priceAmount: Number(value.priceAmount),
                    compareAtAmount: value.compareAtAmount
                        ? Number(value.compareAtAmount)
                        : undefined,
                    costAmount: value.costAmount ? Number(value.costAmount) : undefined,
                });
                await createVariantMutation.mutateAsync({ productId: product.id, payload });
                formApi.reset();
            } catch (error) {
                if (error instanceof z.ZodError) {
                    toast.error(error.issues[0]?.message ?? "Invalid variant data");
                    return;
                }
                toast.error("Failed to create variant");
            }
        },
    });

    const totalVariants = createdVariants.length;
    const totalMedia = createdMedia.length;

    const stepIndicator = useMemo(
        () => [
            { id: 1, label: "Product Info" },
            { id: 2, label: "Variants + Media" },
            { id: 3, label: "Publish Draft" },
        ],
        [],
    );

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    Product Management
                </p>
                <h1 className="text-4xl font-semibold tracking-tight">Create New Jersey</h1>
            </div>

            <div className="flex flex-wrap gap-3">
                {stepIndicator.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium ${
                                step >= item.id
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted text-muted-foreground"
                            }`}
                        >
                            {step > item.id ? <Check className="h-4 w-4" /> : item.id}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                    </div>
                ))}
            </div>

            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Product Info</CardTitle>
                        <CardDescription>Set category and core product details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="space-y-6"
                            onSubmit={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                productForm.handleSubmit();
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <Label>Category Source</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setNewCategoryMode((prev) => !prev)}
                                >
                                    {newCategoryMode
                                        ? "Select Existing Category"
                                        : "Create New Category"}
                                </Button>
                            </div>

                            {newCategoryMode ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <productForm.Field name="categoryName">
                                        {(field) => (
                                            <div className="space-y-2">
                                                <Label>Category Name</Label>
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(event) => {
                                                        const nextName = event.target.value;
                                                        field.handleChange(nextName);
                                                        productForm.setFieldValue(
                                                            "categorySlug",
                                                            slugify(nextName),
                                                        );
                                                    }}
                                                    placeholder="European Club"
                                                />
                                            </div>
                                        )}
                                    </productForm.Field>
                                    <productForm.Field name="categorySlug">
                                        {(field) => (
                                            <div className="space-y-2">
                                                <Label>Category Slug</Label>
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(event) =>
                                                        field.handleChange(event.target.value)
                                                    }
                                                    placeholder="european-club"
                                                />
                                            </div>
                                        )}
                                    </productForm.Field>
                                </div>
                            ) : (
                                <productForm.Field name="categoryId">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={field.state.value || undefined}
                                                onValueChange={(next) => field.handleChange(next)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(categoriesQuery.data?.data ?? []).map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={category.id}
                                                                value={category.id}
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </productForm.Field>
                            )}

                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-shrink-0">
                                    <Label className="block mb-2">Thumbnail</Label>
                                    <label className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors overflow-hidden group">
                                        {thumbnailPreview ? (
                                            <>
                                                <Image
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                                    {isCompressing ? (
                                                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                                                    ) : (
                                                        <span className="text-white text-xs font-medium">Replace</span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center text-primary/60">
                                                {isCompressing ? (
                                                    <Loader2 className="mx-auto h-6 w-6 mb-1 animate-spin" />
                                                ) : (
                                                    <ImageIcon className="mx-auto h-6 w-6 mb-1" />
                                                )}
                                                <span className="text-[10px] uppercase font-semibold tracking-wider">
                                                    {isCompressing ? "Processing" : "Upload"}
                                                </span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            disabled={isCompressing}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.size > 2 * 1024 * 1024) {
                                                    toast.error("File must be under 2MB");
                                                    return;
                                                }
                                                setIsCompressing(true);
                                                try {
                                                    const compressed = await imageCompression(file, {
                                                        maxSizeMB: 0.5,
                                                        maxWidthOrHeight: 800,
                                                        useWebWorker: true,
                                                    });
                                                    setThumbnailFile(compressed);
                                                    setThumbnailPreview(URL.createObjectURL(compressed));
                                                } catch (error) {
                                                    toast.error("Failed to compress image");
                                                } finally {
                                                    setIsCompressing(false);
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="text-[10px] text-muted-foreground mt-2 text-center max-w-[8rem]">
                                        Square, max 2MB (JPG, PNG, WEBP)
                                    </p>
                                </div>

                                <div className="flex-grow grid gap-4 md:grid-cols-2">
                                    <productForm.Field name="title">
                                        {(field) => (
                                            <div className="space-y-2">
                                                <Label>Product Title</Label>
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(event) => {
                                                        const nextTitle = event.target.value;
                                                        field.handleChange(nextTitle);
                                                        productForm.setFieldValue(
                                                            "slug",
                                                            slugify(nextTitle),
                                                        );
                                                    }}
                                                    placeholder="Barcelona Home Jersey 2026"
                                                />
                                            </div>
                                        )}
                                    </productForm.Field>
                                    <productForm.Field name="slug">
                                        {(field) => (
                                            <div className="space-y-2">
                                                <Label>Product Slug</Label>
                                                <Input
                                                    value={field.state.value}
                                                    onChange={(event) =>
                                                        field.handleChange(event.target.value)
                                                    }
                                                    placeholder="barcelona-home-jersey-2026"
                                                />
                                            </div>
                                        )}
                                    </productForm.Field>
                                </div>
                            </div>

                            <productForm.Field name="description">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
                                            }
                                            rows={4}
                                            placeholder="Official Barcelona home jersey"
                                        />
                                    </div>
                                )}
                            </productForm.Field>

                            <div className="grid gap-4 md:grid-cols-3">
                                <productForm.Field name="teamName">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <Label>Team Name</Label>
                                            <Input
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                                placeholder="FC Barcelona"
                                            />
                                        </div>
                                    )}
                                </productForm.Field>
                                <productForm.Field name="tournamentTag">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <Label>Tournament</Label>
                                            <Input
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                                placeholder="La Liga"
                                            />
                                        </div>
                                    )}
                                </productForm.Field>
                                <productForm.Field name="jerseyType">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <Label>Jersey Type</Label>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(value) =>
                                                    field.handleChange(
                                                        value as (typeof jerseyTypeOptions)[number],
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {jerseyTypeOptions.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </productForm.Field>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={
                                        createProductMutation.isPending ||
                                        createCategoryMutation.isPending
                                    }
                                >
                                    Continue
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {step === 2 && product && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Variants</CardTitle>
                            <CardDescription>
                                Add sizes and pricing for {product.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form
                                className="grid gap-3 md:grid-cols-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    variantForm.handleSubmit();
                                }}
                            >
                                <variantForm.Field name="sku">
                                    {(field) => (
                                        <div className="space-y-1 md:col-span-2">
                                            <Label>SKU</Label>
                                            <Input
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                                placeholder="BAR-HOME-M-PLAYER"
                                            />
                                        </div>
                                    )}
                                </variantForm.Field>
                                <variantForm.Field name="size">
                                    {(field) => (
                                        <div className="space-y-1">
                                            <Label>Size</Label>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(value) =>
                                                    field.handleChange(
                                                        value as (typeof sizeOptions)[number],
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sizeOptions.map((size) => (
                                                        <SelectItem key={size} value={size}>
                                                            {size}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </variantForm.Field>
                                <variantForm.Field name="fit">
                                    {(field) => (
                                        <div className="space-y-1">
                                            <Label>Fit</Label>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(value) =>
                                                    field.handleChange(
                                                        value as (typeof fitOptions)[number],
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fitOptions.map((fit) => (
                                                        <SelectItem key={fit} value={fit}>
                                                            {fit}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </variantForm.Field>
                                <variantForm.Field name="sleeveType">
                                    {(field) => (
                                        <div className="space-y-1">
                                            <Label>Sleeve</Label>
                                            <Select
                                                value={field.state.value}
                                                onValueChange={(value) =>
                                                    field.handleChange(
                                                        value as (typeof sleeveOptions)[number],
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sleeveOptions.map((sleeve) => (
                                                        <SelectItem key={sleeve} value={sleeve}>
                                                            {sleeve}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </variantForm.Field>
                                <variantForm.Field name="stockQty">
                                    {(field) => (
                                        <div className="space-y-1">
                                            <Label>Stock Qty</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                            />
                                        </div>
                                    )}
                                </variantForm.Field>
                                <variantForm.Field name="priceAmount">
                                    {(field) => (
                                        <div className="space-y-1">
                                            <Label>Price</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                            />
                                        </div>
                                    )}
                                </variantForm.Field>
                                <variantForm.Field name="compareAtAmount">
                                    {(field) => (
                                        <div className="space-y-1">
                                            <Label>Compare At</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                            />
                                        </div>
                                    )}
                                </variantForm.Field>
                                <variantForm.Field name="costAmount">
                                    {(field) => (
                                        <div className="space-y-1">
                                            <Label>Cost</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={field.state.value}
                                                onChange={(event) =>
                                                    field.handleChange(event.target.value)
                                                }
                                            />
                                        </div>
                                    )}
                                </variantForm.Field>
                                <div className="flex items-end">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={createVariantMutation.isPending}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Variant
                                    </Button>
                                </div>
                            </form>

                            <Separator />

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Newly Added Variants</h3>
                                <div className="flex flex-wrap gap-2">
                                    {createdVariants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1"
                                        >
                                            <Badge variant="outline">
                                                {variant.sku} • {variant.size} • {variant.fit} •{" "}
                                                {variant.sleeveType} • Stock {variant.stockQty}
                                            </Badge>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() =>
                                                    deleteVariantMutation.mutate({
                                                        productId: product.id,
                                                        variantId: variant.id,
                                                    })
                                                }
                                                disabled={deleteVariantMutation.isPending}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Media Uploader</CardTitle>
                            <CardDescription>
                                Upload product photos while managing variants.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                                <UploadCloud className="mb-3 h-8 w-8 text-primary" />
                                <span className="text-sm font-medium">Drop images or choose files</span>
                                <span className="text-xs text-muted-foreground">
                                    Upload multiple images (PNG, JPG, WEBP)
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(event) =>
                                        setFiles(Array.from(event.target.files ?? []))
                                    }
                                />
                            </label>
                            <div className="space-y-2">
                                {files.map((file) => (
                                    <div
                                        key={`${file.name}-${file.size}`}
                                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                    >
                                        <span className="truncate">{file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setFiles((prev) =>
                                                    prev.filter((item) => item !== file),
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                onClick={() => uploadMediaMutation.mutate(product.id)}
                                disabled={files.length === 0 || uploadMediaMutation.isPending}
                            >
                                Upload Images
                            </Button>

                            {createdMedia.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold">Uploaded Media</h3>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                            {createdMedia.map((media) => {
                                                const isVideo =
                                                    media.resourceType?.startsWith("video") ??
                                                    /\.(mp4|webm|ogg|mov)$/i.test(media.secureUrl);

                                                return (
                                                    <div
                                                        key={media.id}
                                                        className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                                    >
                                                        {isVideo ? (
                                                            <video
                                                                src={media.secureUrl}
                                                                className="h-full w-full object-cover"
                                                                muted
                                                                playsInline
                                                                preload="metadata"
                                                            />
                                                        ) : (
                                                            <Image
                                                                src={media.secureUrl}
                                                                alt={media.altText ?? "Uploaded product media"}
                                                                fill
                                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                                className="object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(1)}>
                            Back
                        </Button>
                        <Button onClick={() => setStep(3)}>Continue</Button>
                    </div>
                </div>
            )}

            {step === 3 && product && (
                <Card className="mx-auto max-w-2xl text-center">
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                            <Check className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-3xl">Product Created</CardTitle>
                        <CardDescription>
                            {product.title} has been saved as DRAFT with{" "}
                            <strong>{totalVariants}</strong> variants and{" "}
                            <strong>{totalMedia}</strong> media item(s).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center gap-3">
                        <Button variant="outline" onClick={() => setStep(2)}>
                            Back
                        </Button>
                        <Button onClick={() => router.push("/admin/products")}>
                            Go to Product List
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
