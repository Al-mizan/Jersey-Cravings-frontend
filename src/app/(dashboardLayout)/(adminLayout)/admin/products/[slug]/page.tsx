"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import {
    ArrowLeft,
    Calendar,
    Layers,
    ShoppingBag,
    Trash2,
    Trophy,
    UploadCloud,
    ImageIcon,
    Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    adminCategoryKeys,
    adminProductKeys,
} from "@/hooks/queries/adminQueryKeys";
import {
    createProductMedia,
    deleteProductMedia,
    getAllCategories,
    getProductById,
    updateProduct,
    updateProductStatus,
    updateVariant,
} from "@/services/product.service";
import {
    IProduct,
    IUpdateProductPayload,
    IUpdateProductStatusPayload,
    JerseyType,
    ProductStatus,
} from "@/types/product.types";
import { updateProductZodSchema } from "@/zod/product.validation";

const jerseyTypeOptions: JerseyType[] = [
    "HOME",
    "AWAY",
    "THIRD",
    "GK",
    "SPECIAL",
];

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    DRAFT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    ARCHIVED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}`}
        >
            {status}
        </span>
    );
}

type EditFormState = {
    title: string;
    slug: string;
    description: string;
    teamName: string;
    tournamentTag: string;
    jerseyType: JerseyType;
    categoryId: string;
};

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];
const ALLOWED_STATUS_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
    DRAFT: ["ACTIVE", "ARCHIVED"],
    ACTIVE: ["ARCHIVED"],
    ARCHIVED: ["ACTIVE"],
};

export default function ProductDetailsPage() {
    const params = useParams<{ slug: string }>();
    const productSlug = params?.slug;
    const queryClient = useQueryClient();
    const [files, setFiles] = useState<File[]>([]);
    const [nextStatus, setNextStatus] = useState<ProductStatus>("DRAFT");
    const [variantDrafts, setVariantDrafts] = useState<
        Record<
            string,
            {
                stockQty: string;
                priceAmount: string;
                compareAtAmount: string;
                costAmount: string;
            }
        >
    >({});
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        null,
    );
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );
    const [isCompressing, setIsCompressing] = useState(false);
    const [form, setForm] = useState<EditFormState>({
        title: "",
        slug: "",
        description: "",
        teamName: "",
        tournamentTag: "",
        jerseyType: "HOME",
        categoryId: "",
    });

    const productQuery = useQuery({
        queryKey: ["admin", "products", "details", productSlug],
        queryFn: () => getProductById(productSlug!),
        enabled: Boolean(productSlug),
    });

    const categoriesQuery = useQuery({
        queryKey: adminCategoryKeys.options(),
        queryFn: () => getAllCategories(undefined, 1, 100, true, false),
    });

    useEffect(() => {
        const product = productQuery.data;
        if (!product) return;
        setForm({
            title: product.title ?? "",
            slug: product.slug ?? "",
            description: product.description ?? "",
            teamName: product.teamName ?? "",
            tournamentTag: product.tournamentTag ?? "",
            jerseyType: product.jerseyType ?? "HOME",
            categoryId: product.categoryId ?? "",
        });
        setNextStatus(product.status);
        setVariantDrafts(
            Object.fromEntries(
                (product.variants ?? []).map((variant) => [
                    variant.id,
                    {
                        stockQty: String(variant.stockQty ?? 0),
                        priceAmount: String(variant.priceAmount ?? 0),
                        compareAtAmount:
                            typeof variant.compareAtAmount === "number"
                                ? String(variant.compareAtAmount)
                                : "",
                        costAmount:
                            typeof variant.costAmount === "number"
                                ? String(variant.costAmount)
                                : "",
                    },
                ]),
            ),
        );
    }, [productQuery.data]);

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
            updateProduct(id, payload),
        onSuccess: () => {
            toast.success("Product updated");
            queryClient.invalidateQueries({
                queryKey: ["admin", "products", "details", productSlug],
            });
            queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update product";
            toast.error(message);
        },
    });

    const uploadMediaMutation = useMutation({
        mutationFn: async ({
            id,
            selectedFiles,
        }: {
            id: string;
            selectedFiles: File[];
        }) => {
            const formData = new FormData();
            selectedFiles.forEach((file) =>
                formData.append("productPhotos", file),
            );
            await createProductMedia(id, formData);
        },
        onSuccess: () => {
            setFiles([]);
            toast.success("Media uploaded");
            queryClient.invalidateQueries({
                queryKey: ["admin", "products", "details", productSlug],
            });
        },
        onError: () => toast.error("Failed to upload media"),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({
            productId,
            payload,
        }: {
            productId: string;
            payload: IUpdateProductStatusPayload;
        }) => updateProductStatus(productId, payload),
        onSuccess: () => {
            toast.success("Product status updated");
            queryClient.invalidateQueries({
                queryKey: ["admin", "products", "details", productSlug],
            });
            queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
        },
        onError: (error: Error) => {
            toast.error(error?.message || "Failed to update product status");
        },
    });

    const updateVariantMutation = useMutation({
        mutationFn: ({
            id,
            variantId,
            payload,
        }: {
            id: string;
            variantId: string;
            payload: {
                stockQty?: number;
                priceAmount?: number;
                compareAtAmount?: number;
                costAmount?: number;
            };
        }) => updateVariant(id, variantId, payload),
        onSuccess: () => {
            toast.success("Variant updated");
            queryClient.invalidateQueries({
                queryKey: ["admin", "products", "details", productSlug],
            });
            queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
        },
        onError: () => toast.error("Failed to update variant"),
    });

    const deleteMediaMutation = useMutation({
        mutationFn: ({ id, mediaId }: { id: string; mediaId: string }) =>
            deleteProductMedia(id, mediaId),
        onSuccess: () => {
            toast.success("Media deleted");
            queryClient.invalidateQueries({
                queryKey: ["admin", "products", "details", productSlug],
            });
        },
        onError: () => toast.error("Failed to delete media"),
    });

    const product = productQuery.data as IProduct | null;
    const productId = product?.id;
    const variants = product?.variants ?? [];
    const media = useMemo(() => product?.media ?? [], [product]);
    const allowedNextStatuses = useMemo(
        () =>
            product
                ? [
                      product.status,
                      ...(ALLOWED_STATUS_TRANSITIONS[product.status] ?? []),
                  ]
                : PRODUCT_STATUSES,
        [product],
    );

    if (productQuery.isLoading) {
        return (
            <div className="py-10 text-sm text-muted-foreground">
                Loading product...
            </div>
        );
    }

    if (!productSlug || !product) {
        return (
            <div className="space-y-4 py-10">
                <p className="text-sm text-muted-foreground">
                    Product not found.
                </p>
                <Button asChild variant="outline">
                    <Link href="/admin/products">Back to products</Link>
                </Button>
            </div>
        );
    }

    const onSubmitUpdate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        console.log("submit fired");
        try {
            const payload = {
                title: form.title || undefined,
                slug: form.slug || undefined,
                description: form.description || undefined,
                teamName: form.teamName || undefined,
                tournamentTag: form.tournamentTag || undefined,
                jerseyType: form.jerseyType,
                categoryId: form.categoryId || undefined,
                thumbNail:
                    !thumbnailFile && product.thumbNail
                        ? product.thumbNail
                        : undefined,
            };

            const parsed = updateProductZodSchema.parse(payload);

            const formData = new FormData();
            formData.append("data", JSON.stringify(parsed));
            if (thumbnailFile) {
                formData.append("productThumbnail", thumbnailFile);
            }

            console.log("Sending payload to mutation:", parsed);
            if (!productId) {
                toast.error("Missing product id");
                return;
            }
            await updateMutation.mutateAsync({
                id: productId,
                payload: formData,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.log("Zod validation errors:", error.issues);
                toast.error(error.issues[0]?.message ?? "Invalid product data");
                return;
            }
            console.error("Mutation error:", error);
            // Error is already toasted by the mutation's onError callback
        }
    };

    const onSubmitStatus = async () => {
        if (!productId || nextStatus === product.status) return;
        try {
            await updateStatusMutation.mutateAsync({
                productId,
                payload: { status: nextStatus },
            });
        } catch {
            // handled in mutation callbacks
        }
    };

    const onSubmitVariantUpdate = async (variantId: string) => {
        const draft = variantDrafts[variantId];
        if (!draft) return;
        if (!productId) {
            toast.error("Missing product id");
            return;
        }

        await updateVariantMutation.mutateAsync({
            id: productId,
            variantId,
            payload: {
                stockQty: Number(draft.stockQty),
                priceAmount: Number(draft.priceAmount),
                compareAtAmount: draft.compareAtAmount
                    ? Number(draft.compareAtAmount)
                    : undefined,
                costAmount: draft.costAmount
                    ? Number(draft.costAmount)
                    : undefined,
            },
        });
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full shrink-0"
                    >
                        <Link
                            href="/admin/products"
                            aria-label="Back to products"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-semibold tracking-tight leading-none">
                                {product.title}
                            </h1>
                            <StatusBadge status={product.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {product.teamName}
                            {product.jerseyType
                                ? ` · ${product.jerseyType}`
                                : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Edit Product
                            </CardTitle>
                            <CardDescription>
                                Update core product fields and category.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form
                                onSubmit={onSubmitUpdate}
                                className="space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                    <div className="flex-shrink-0">
                                        <Label className="block mb-2">
                                            Thumbnail
                                        </Label>
                                        <label className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors overflow-hidden group">
                                            {thumbnailPreview ||
                                            product.thumbNail ? (
                                                <>
                                                    <Image
                                                        src={
                                                            thumbnailPreview ||
                                                            product.thumbNail ||
                                                            ""
                                                        }
                                                        alt="Thumbnail preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                                        {isCompressing ? (
                                                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                                                        ) : (
                                                            <span className="text-white text-xs font-medium">
                                                                Replace
                                                            </span>
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
                                                        {isCompressing
                                                            ? "Processing"
                                                            : "Upload"}
                                                    </span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                disabled={isCompressing}
                                                onChange={async (e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (!file) return;
                                                    if (
                                                        file.size >
                                                        2 * 1024 * 1024
                                                    ) {
                                                        toast.error(
                                                            "File must be under 2MB",
                                                        );
                                                        return;
                                                    }
                                                    setIsCompressing(true);
                                                    try {
                                                        const compressed =
                                                            await imageCompression(
                                                                file,
                                                                {
                                                                    maxSizeMB: 0.5,
                                                                    maxWidthOrHeight: 800,
                                                                    useWebWorker: true,
                                                                },
                                                            );
                                                        setThumbnailFile(
                                                            compressed,
                                                        );
                                                        setThumbnailPreview(
                                                            URL.createObjectURL(
                                                                compressed,
                                                            ),
                                                        );
                                                    } catch (error) {
                                                        toast.error(
                                                            "Failed to compress image",
                                                        );
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
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input
                                                value={form.title}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        title: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Slug</Label>
                                            <Input
                                                value={form.slug}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        slug: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Team Name</Label>
                                        <Input
                                            value={form.teamName}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    teamName: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tournament</Label>
                                        <Input
                                            value={form.tournamentTag}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tournamentTag:
                                                        e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Jersey Type</Label>
                                        <Select
                                            value={form.jerseyType}
                                            onValueChange={(value) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    jerseyType:
                                                        value as JerseyType,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {jerseyTypeOptions.map(
                                                    (type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {type}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select
                                            value={form.categoryId}
                                            onValueChange={(value) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    categoryId: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(
                                                    categoriesQuery.data
                                                        ?.data ?? []
                                                ).map((category) => (
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
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={nextStatus}
                                                onValueChange={(value) =>
                                                    setNextStatus(
                                                        value as ProductStatus,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allowedNextStatuses.map(
                                                        (status) => (
                                                            <SelectItem
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {status}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={onSubmitStatus}
                                                disabled={
                                                    updateStatusMutation.isPending ||
                                                    nextStatus ===
                                                        product.status
                                                }
                                            >
                                                Update
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={updateMutation.isPending}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UploadCloud className="h-4 w-4" />
                                Product Media
                            </CardTitle>
                            <CardDescription>
                                Upload new media and remove existing files.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                                <UploadCloud className="mb-3 h-8 w-8 text-primary" />
                                <span className="text-sm font-medium">
                                    Drop images or choose files
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    PNG, JPG, WEBP up to 5MB
                                </span>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    onChange={(event) =>
                                        setFiles(
                                            Array.from(
                                                event.target.files ?? [],
                                            ),
                                        )
                                    }
                                />
                            </label>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file) => (
                                        <div
                                            key={`${file.name}-${file.size}`}
                                            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                        >
                                            <span className="truncate">
                                                {file.name}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setFiles((prev) =>
                                                        prev.filter(
                                                            (item) =>
                                                                item !== file,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button
                                type="button"
                                onClick={() =>
                                    productId &&
                                    uploadMediaMutation.mutate({
                                        id: productId,
                                        selectedFiles: files,
                                    })
                                }
                                disabled={
                                    files.length === 0 ||
                                    uploadMediaMutation.isPending
                                }
                            >
                                Upload Selected Media
                            </Button>

                            <Separator />

                            {media.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                    {media.map((item) => {
                                        const isVideo =
                                            item.resourceType?.startsWith(
                                                "video",
                                            ) ??
                                            /\.(mp4|webm|ogg|mov)$/i.test(
                                                item.secureUrl,
                                            );

                                        return (
                                            <div
                                                key={item.id}
                                                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                                            >
                                                {isVideo ? (
                                                    <video
                                                        src={item.secureUrl}
                                                        className="h-full w-full object-cover"
                                                        muted
                                                        playsInline
                                                        preload="metadata"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={item.secureUrl}
                                                        alt={
                                                            item.altText ??
                                                            "Product media"
                                                        }
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}

                                                <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="destructive"
                                                        className="h-7 w-7"
                                                        onClick={() =>
                                                            productId &&
                                                            deleteMediaMutation.mutate(
                                                                {
                                                                    id: productId,
                                                                    mediaId:
                                                                        item.id,
                                                                },
                                                            )
                                                        }
                                                        disabled={
                                                            deleteMediaMutation.isPending
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No media uploaded yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Product Variants
                            </CardTitle>
                            <CardDescription>
                                Select a size to edit its details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {variants.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No variants found.
                                </p>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Select Size</Label>
                                        <Select
                                            value={selectedVariantId || ""}
                                            onValueChange={setSelectedVariantId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a size to edit..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {variants.map((v) => (
                                                    <SelectItem
                                                        key={v.id}
                                                        value={v.id}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">
                                                                {v.size}
                                                            </span>
                                                            <Badge
                                                                variant={
                                                                    v.isActive
                                                                        ? "outline"
                                                                        : "secondary"
                                                                }
                                                                className="text-[10px] py-0 h-4"
                                                            >
                                                                {v.isActive
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedVariantId ? (
                                        (() => {
                                            const variant = variants.find(
                                                (v) =>
                                                    v.id === selectedVariantId,
                                            );
                                            const draft =
                                                variantDrafts[
                                                    selectedVariantId
                                                ];
                                            if (!variant || !draft) return null;

                                            return (
                                                <div className="rounded-lg border p-4 space-y-4 bg-muted/10">
                                                    <div className="grid gap-4 md:grid-cols-3 pb-4 border-b">
                                                        <div>
                                                            <p className="text-[11px] uppercase text-muted-foreground">
                                                                SKU
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {variant.sku}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] uppercase text-muted-foreground">
                                                                Fit
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {variant.fit}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] uppercase text-muted-foreground">
                                                                Sleeve
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    variant.sleeveType
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                        <div className="space-y-1.5">
                                                            <Label>Stock</Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={
                                                                    draft.stockQty
                                                                }
                                                                onChange={(e) =>
                                                                    setVariantDrafts(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [variant.id]:
                                                                                {
                                                                                    ...prev[
                                                                                        variant
                                                                                            .id
                                                                                    ],
                                                                                    stockQty:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label>Price</Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={
                                                                    draft.priceAmount
                                                                }
                                                                onChange={(e) =>
                                                                    setVariantDrafts(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [variant.id]:
                                                                                {
                                                                                    ...prev[
                                                                                        variant
                                                                                            .id
                                                                                    ],
                                                                                    priceAmount:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label>
                                                                Compare At
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={
                                                                    draft.compareAtAmount
                                                                }
                                                                onChange={(e) =>
                                                                    setVariantDrafts(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [variant.id]:
                                                                                {
                                                                                    ...prev[
                                                                                        variant
                                                                                            .id
                                                                                    ],
                                                                                    compareAtAmount:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label>Cost</Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={
                                                                    draft.costAmount
                                                                }
                                                                onChange={(e) =>
                                                                    setVariantDrafts(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [variant.id]:
                                                                                {
                                                                                    ...prev[
                                                                                        variant
                                                                                            .id
                                                                                    ],
                                                                                    costAmount:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end pt-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() =>
                                                                onSubmitVariantUpdate(
                                                                    variant.id,
                                                                )
                                                            }
                                                            disabled={
                                                                updateVariantMutation.isPending
                                                            }
                                                        >
                                                            Save Variant
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                            Select a size above to edit its
                                            details
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Category
                                </span>
                                <span className="font-medium">
                                    {product.category?.name ?? "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Jersey Type
                                </span>
                                <Badge variant="outline">
                                    {product.jerseyType}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Variants
                                </span>
                                <span className="inline-flex items-center gap-1 font-medium">
                                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                    {variants.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Media
                                </span>
                                <span className="font-medium">
                                    {media.length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Timestamps
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Created
                                </span>
                                <span className="font-medium">
                                    {new Date(
                                        product.createdAt,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Updated
                                </span>
                                <span className="font-medium">
                                    {new Date(
                                        product.updatedAt,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
