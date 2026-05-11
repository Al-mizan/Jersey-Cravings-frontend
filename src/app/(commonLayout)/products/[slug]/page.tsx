"use client";

// ─── FONT NOTE ────────────────────────────────────────────────────────────────
// Add to your app/layout.tsx:
//   import { Barlow_Condensed, Barlow } from "next/font/google"
//   const barlowCondensed = Barlow_Condensed({ subsets:["latin"], weight:["700","800","900"], variable:"--font-bc" })
//   const barlow = Barlow({ subsets:["latin"], weight:["400","500","600"], variable:"--font-b" })
//   <body className={`${barlowCondensed.variable} ${barlow.variable}`}>
// Then in tailwind.config.ts extend fontFamily:
//   "bc": ["var(--font-bc)", "sans-serif"],
//   "b":  ["var(--font-b)",  "sans-serif"],
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    BadgeCheck,
    ChevronRight,
    Loader2,
    PlayCircle,
    ShieldCheck,
    ShoppingCart,
    Truck,
    Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useAuth } from "@/hooks/useAuth";
import { addToCartZodSchema } from "@/zod/commerce.validation";
import type { ApiResponse } from "@/types/api.types";
import type { ICart, ICartItem } from "@/types/commerce.types";
import type { IProductMedia, IProductVariant } from "@/types/product.types";
import { cn } from "@/lib/utils";
import { fetchProductBySlug, fetchProductReviews } from "./_action";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
    renderStars,
    ReviewsSection,
} from "@/components/modules/Product/ReviewsSection";

interface ProductDetailsPageProps {
    params: Promise<{ slug: string }>;
}

const sizeChartRows = [
    { size: "S", chest: 36, length: 26 },
    { size: "M", chest: 38, length: 27 },
    { size: "L", chest: 40, length: 28 },
    { size: "XL", chest: 42, length: 29 },
    { size: "XXL", chest: 44, length: 30 },
];

const sizeOrder = ["S", "M", "L", "XL", "XXL"] as const;
const cartQueryKey = ["cart", "my"] as const;

type CartSummary = { itemCount: number; subtotalAmount: number };
type CartResponse = ICart & { summary?: CartSummary };
type SizeOption = { size: string; variant: IProductVariant; inStock: boolean };

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;
const formatLabel = (value?: string | null) =>
    value ? value.charAt(0) + value.slice(1).toLowerCase() : "";

const getInitialVariant = (variants: IProductVariant[]) =>
    variants.find((v) => v.isActive && v.stockQty > 0) ?? variants[0];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProductDetailsPage({
    params,
}: ProductDetailsPageProps) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        null,
    );
    const [quantity, setQuantity] = useState(1);
    const [isMainMediaLoading, setIsMainMediaLoading] = useState(true);

    // ── Queries ──────────────────────────────────────────────────────────────
    const {
        data: product,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["public", "product", slug],
        queryFn: () => fetchProductBySlug(slug),
        enabled: Boolean(slug),
    });

    const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
        queryKey: ["public", "reviews", product?.id],
        queryFn: () => fetchProductReviews(product?.id ?? ""),
        enabled: Boolean(product?.id),
    });

    // ── Derived state ────────────────────────────────────────────────────────
    const variants = product?.variants ?? [];
    const mediaList = product?.media ?? [];
    const selectedVariant = useMemo(
        () => variants.find((v) => v.id === selectedVariantId) ?? null,
        [variants, selectedVariantId],
    );

    const sizeOptions = useMemo<SizeOption[]>(() => {
        const options: SizeOption[] = [];
        sizeOrder.forEach((size) => {
            const matching = variants.filter(
                (v) => v.size === size && v.isActive,
            );
            if (!matching.length) return;
            const inStock = matching.some((v) => v.stockQty > 0);
            const pick = matching.find((v) => v.stockQty > 0) ?? matching[0];
            options.push({ size, variant: pick, inStock });
        });
        return options;
    }, [variants]);

    // ── Cart cache helper ────────────────────────────────────────────────────
    const updateCartCache = useCallback(
        (cartItem: ICartItem, payload: { variantId: string; qty: number }) => {
            if (!selectedVariant || !product) return;
            const now = new Date().toISOString();
            const nextCartItem: ICartItem = {
                ...cartItem,
                variantId: cartItem.variantId || payload.variantId,
                qty: cartItem.qty ?? payload.qty,
                createdAt: cartItem.createdAt ?? now,
                updatedAt: cartItem.updatedAt ?? now,
                variant: {
                    id: selectedVariant.id,
                    sku: selectedVariant.sku,
                    size: selectedVariant.size,
                    fit: selectedVariant.fit,
                    sleeveType: selectedVariant.sleeveType,
                    priceAmount: selectedVariant.priceAmount,
                    product: {
                        id: product.id,
                        title: product.title,
                        slug: product.slug,
                        teamName: product.teamName,
                        thumbNail:
                            product.thumbNail ||
                            product.media?.[0]?.secureUrl ||
                            null,
                    },
                },
            };
            queryClient.setQueryData<CartResponse | null>(
                cartQueryKey,
                (current) => {
                    const baseCart: CartResponse = current ?? {
                        id: "local-cart",
                        createdAt: now,
                        updatedAt: now,
                        userId: "me",
                        items: [],
                    };
                    const existingIndex = baseCart.items.findIndex(
                        (i) => i.variantId === nextCartItem.variantId,
                    );
                    const nextItems = [...baseCart.items];
                    if (existingIndex >= 0) {
                        const existing = nextItems[existingIndex];
                        nextItems[existingIndex] = {
                            ...existing,
                            id: nextCartItem.id,
                            qty: nextCartItem.qty,
                            variant: existing.variant || nextCartItem.variant,
                        };
                    } else {
                        nextItems.unshift(nextCartItem);
                    }
                    return { ...baseCart, items: nextItems };
                },
            );
            if (typeof window !== "undefined")
                window.dispatchEvent(new CustomEvent("cart:added"));
        },
        [product, queryClient, selectedVariant],
    );

    // ── Mutations ────────────────────────────────────────────────────────────
    const addToCartMutation = useMutation({
        mutationFn: async (payload: { variantId: string; qty: number }) => {
            const validated = addToCartZodSchema.parse(payload);
            const response = await axios.post<ApiResponse<ICartItem>>(
                "/api/proxy/carts/my/items",
                validated,
            );
            return { cartItem: response.data.data, payload: validated };
        },
        onSuccess: ({ cartItem, payload }) => {
            toast.success("Added to cart");
            updateCartCache(cartItem, payload);
        },
        onError: () => toast.error("Unable to add to cart right now"),
    });

    const buyNowMutation = useMutation({
        mutationFn: async (payload: { variantId: string; qty: number }) => {
            const validated = addToCartZodSchema.parse(payload);
            const response = await axios.post<ApiResponse<ICartItem>>(
                "/api/proxy/carts/my/items",
                validated,
            );
            return { cartItem: response.data.data, payload: validated };
        },
        onSuccess: ({ cartItem, payload }) => {
            updateCartCache(cartItem, payload);
            router.push("/checkout");
        },
        onError: () => toast.error("Unable to add to cart right now"),
    });

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleScrollToReviews = useCallback(() => {
        document
            .getElementById("reviews")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    const handleSizeChange = (size: string) => {
        // size === "" মানে same টায় আবার click — unselect
        if (!size) {
            setSelectedVariantId(null);
            setQuantity(1);
            return;
        }
        const option = sizeOptions.find((item) => item.size === size);
        if (!option) return;
        setSelectedVariantId(option.variant.id);
        setQuantity(1);
    };

    const ensureAuthenticated = () => {
        if (authLoading) {
            toast("Checking sign-in status…");
            return false;
        }
        if (isAuthenticated) return true;
        toast.error("Please sign in to continue");
        router.push(`/login?redirect=/products/${slug}`);
        return false;
    };

    const handleAddToCart = async () => {
        if (!selectedVariant || isOutOfStock) return;
        if (!ensureAuthenticated()) return;
        try {
            await addToCartMutation.mutateAsync({
                variantId: selectedVariant.id,
                qty: Math.min(quantity, maxQty),
            });
        } catch {
            return;
        }
    };

    const handleBuyNow = async () => {
        if (!selectedVariant || isOutOfStock) return;
        if (!ensureAuthenticated()) return;
        try {
            await buyNowMutation.mutateAsync({
                variantId: selectedVariant.id,
                qty: Math.min(quantity, maxQty),
            });
        } catch {
            return;
        }
    };

    // ── Effects ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!product?.variants?.length) return;
        setSelectedVariantId(null);
        setQuantity(1);
    }, [product?.id]);

    useEffect(() => {
        setActiveMediaIndex(0);
        setIsMainMediaLoading(true);
    }, [product?.id]);
    useEffect(() => {
        setIsMainMediaLoading(true);
    }, [activeMediaIndex]);

    // ── Computed ──────────────────────────────────────────────────────────────
    const activeMedia: IProductMedia | undefined = mediaList[activeMediaIndex];
    // variant না থাকলে যেকোনো একটা active variant থেকে price নাও
    const fallbackVariant = variants.find((v) => v.isActive) ?? variants[0];
    const priceAmount = (selectedVariant ?? fallbackVariant)?.priceAmount ?? 0;
    const compareAtAmount =
        (selectedVariant ?? fallbackVariant)?.compareAtAmount ?? 0;
    const hasDiscount = compareAtAmount > priceAmount;
    const discountPercent = hasDiscount
        ? Math.round(((compareAtAmount - priceAmount) / compareAtAmount) * 100)
        : 0;
    const reviewCount = Math.max(
        product?.reviewCount ?? 0,
        reviewsResponse?.data.length ?? 0,
    );
    const averageRating = product?.totalRating ?? 0;
    const isOutOfStock = !selectedVariant || selectedVariant.stockQty <= 0;
    const maxQty = selectedVariant?.stockQty ?? 1;

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid gap-12 lg:grid-cols-2">
                        <div className="space-y-4">
                            <Skeleton className="aspect-[4/5] rounded-3xl" />
                            <div className="flex gap-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="aspect-square w-20 rounded-2xl"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-14 w-4/5" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-16 w-40" />
                            <Skeleton className="h-36 w-full rounded-2xl" />
                            <Skeleton className="h-28 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product || error) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
                    <div className="space-y-4 text-center">
                        <p className="text-4xl font-black uppercase tracking-tight text-foreground">
                            Product Not Found
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Unable to load this product right now.
                        </p>
                        <Button
                            onClick={() => router.refresh()}
                            className="rounded-full px-8 font-bold uppercase tracking-widest"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-10">
                {/* ── Breadcrumb ─────────────────────────────────────────── */}
                <nav className="mb-8 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    <span className="hover:text-foreground cursor-pointer transition-colors">
                        Products
                    </span>
                    <ChevronRight className="size-3" />
                    <span className="truncate text-foreground">
                        {product.title}
                    </span>
                </nav>

                <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                    {/* ════════════════════════════════════════════════════════
                        LEFT — Media Gallery
                    ════════════════════════════════════════════════════════ */}
                    <div className="space-y-3">
                        {/* Main image */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted/40">
                            {isMainMediaLoading && (
                                <Skeleton className="absolute inset-0 rounded-3xl" />
                            )}
                            {activeMedia ? (
                                activeMedia.resourceType === "video" ? (
                                    <video
                                        key={activeMedia.id}
                                        className={cn(
                                            "h-full w-full object-cover transition-opacity duration-500",
                                            isMainMediaLoading
                                                ? "opacity-0"
                                                : "opacity-100",
                                        )}
                                        controls
                                        preload="metadata"
                                        onLoadedData={() =>
                                            setIsMainMediaLoading(false)
                                        }
                                    >
                                        <source
                                            src={activeMedia.secureUrl}
                                            type="video/mp4"
                                        />
                                    </video>
                                ) : (
                                    <Image
                                        key={activeMedia.id}
                                        src={activeMedia.secureUrl}
                                        alt={
                                            activeMedia.altText || product.title
                                        }
                                        fill
                                        priority
                                        className={cn(
                                            "object-cover transition-all duration-500 group-hover:scale-[1.02]",
                                            isMainMediaLoading
                                                ? "opacity-0"
                                                : "opacity-100",
                                        )}
                                        onLoadingComplete={() =>
                                            setIsMainMediaLoading(false)
                                        }
                                    />
                                )
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    No media available
                                </div>
                            )}

                            {/* Floating badge */}
                            {hasDiscount && (
                                <div className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-background shadow-lg">
                                    Save {discountPercent}%
                                </div>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        <div className="flex gap-2.5">
                            {mediaList.slice(0, 5).map((media, index) => (
                                <button
                                    key={media.id}
                                    type="button"
                                    onClick={() => setActiveMediaIndex(index)}
                                    className={cn(
                                        "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200",
                                        activeMediaIndex === index
                                            ? "border-foreground shadow-md"
                                            : "border-transparent opacity-60 hover:opacity-100",
                                    )}
                                >
                                    {media.resourceType === "video" ? (
                                        <div className="flex h-full w-full items-center justify-center bg-muted/60">
                                            <PlayCircle className="size-5 text-foreground" />
                                        </div>
                                    ) : (
                                        <Image
                                            src={media.secureUrl}
                                            alt={media.altText || product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════════════════
                        RIGHT — Product Info
                    ════════════════════════════════════════════════════════ */}
                    <div className="flex flex-col gap-8">
                        {/* ── Header block ──────────────────────────────── */}
                        <div className="space-y-4">
                            {/* Team + badges row */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-block rounded-full border border-foreground/20 bg-foreground/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-foreground">
                                    {product.teamName}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-orange-500">
                                    🔥 Best Seller
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl font-black leading-[1.0] tracking-tighter text-foreground md:text-5xl lg:text-[3.2rem]">
                                {product.title}
                            </h1>

                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                                Premium player version jersey built for comfort,
                                performance, and street-ready football culture.
                            </p>

                            {/* Reviews pill */}
                            <button
                                type="button"
                                onClick={handleScrollToReviews}
                                className="group inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-sm transition-all duration-200 hover:border-foreground/30 hover:bg-muted/70"
                            >
                                <span className="font-bold text-foreground">
                                    {averageRating.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-0.5">
                                    {renderStars(averageRating)}
                                </span>
                                <span className="text-muted-foreground">
                                    {reviewCount} reviews
                                </span>
                                <span className="text-xs font-semibold text-foreground/60 transition-colors group-hover:text-foreground">
                                    View →
                                </span>
                            </button>
                        </div>

                        {/* ── Price block ───────────────────────────────── */}
                        <div className="space-y-3 rounded-3xl border border-border/60 bg-muted/20 p-5">
                            <div className="flex flex-wrap items-end gap-3">
                                <span className="text-[2.8rem] font-black leading-none tracking-tight text-foreground">
                                    {formatCurrency(priceAmount)}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="mb-1 text-xl font-medium text-muted-foreground line-through">
                                            {formatCurrency(compareAtAmount)}
                                        </span>
                                        <span className="mb-1 inline-block rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
                                            Save {discountPercent}%
                                        </span>
                                    </>
                                )}
                            </div>

                            {hasDiscount ? (
                                <p className="text-sm font-medium text-emerald-500">
                                    You save{" "}
                                    {formatCurrency(
                                        compareAtAmount - priceAmount,
                                    )}{" "}
                                    on this jersey today.
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Premium quality football jersey with
                                    official player-fit design.
                                </p>
                            )}

                            {/* Quick trust strip */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <BadgeCheck className="size-3.5 text-emerald-500" />{" "}
                                    Authentic Import
                                </span>
                                <span className="flex items-center gap-1">
                                    <Truck className="size-3.5 text-sky-500" />{" "}
                                    1–3 Day Delivery
                                </span>
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="size-3.5 text-violet-500" />{" "}
                                    Secure Checkout
                                </span>
                            </div>
                        </div>

                        {/* ── Feature cards ─────────────────────────────── */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="group flex items-center gap-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/10">
                                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                                    <BadgeCheck className="size-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                                        Premium Import
                                    </p>
                                    <p className="mt-0.5 text-xs font-semibold leading-tight text-foreground">
                                        Player Version Jersey
                                    </p>
                                </div>
                            </div>

                            <div className="group flex items-center gap-3.5 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 transition-all duration-200 hover:border-orange-500/40 hover:bg-orange-500/10">
                                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30">
                                    <Zap className="size-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                                        Fast Dispatch
                                    </p>
                                    <p className="mt-0.5 text-xs font-semibold leading-tight text-foreground">
                                        Delivery in 1–3 Days
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        {/* ── Size selector ─────────────────────────────── */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-[0.1em] text-foreground">
                                        {selectedVariant
                                            ? `Size — ${selectedVariant.size}`
                                            : "Select Size"}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Required before checkout
                                    </p>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 rounded-full border-border/60 px-3.5 text-xs font-semibold tracking-wide"
                                        >
                                            📏 Size Chart
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-lg font-black uppercase tracking-tight">
                                                Jersey Size Chart
                                            </DialogTitle>
                                        </DialogHeader>
                                        <SizeChartTable />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <ToggleGroup
                                type="single"
                                value={selectedVariant?.size || ""}
                                onValueChange={handleSizeChange}
                                className="flex flex-wrap gap-2"
                            >
                                {sizeOptions.map((option) => (
                                    <ToggleGroupItem
                                        key={option.size}
                                        value={option.size}
                                        disabled={!option.inStock}
                                        className={cn(
                                            "h-9 min-w-[28px] rounded-2xl border border-border/70 bg-background px-3.5 text-sm font-black uppercase tracking-wide transition-all duration-200",
                                            "hover:border-foreground hover:bg-foreground hover:text-background",
                                            "data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:shadow-md",
                                            !option.inStock &&
                                                "cursor-not-allowed opacity-30 line-through",
                                        )}
                                    >
                                        {option.size}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>

                            {!selectedVariant && (
                                <p className="animate-jump inline-flex items-center gap-1 text-md font-semibold text-red-500">
                                    ↑ Please select a size to continue
                                </p>
                            )}

                            {selectedVariant && (
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full px-3 py-1 text-[11px] font-semibold"
                                    >
                                        Fit: {formatLabel(selectedVariant.fit)}
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full px-3 py-1 text-[11px] font-semibold"
                                    >
                                        Sleeve:{" "}
                                        {formatLabel(
                                            selectedVariant.sleeveType,
                                        )}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <Separator className="bg-border/50" />

                        {/* ── Quantity + CTA ────────────────────────────── */}
                        <div className="space-y-4">
                            {/* Quantity row */}
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
                                    Qty
                                </span>

                                <div className="flex items-center gap-1 rounded-2xl border border-border/70 bg-muted/30 p-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-xl text-base font-bold"
                                        onClick={() =>
                                            setQuantity((p) =>
                                                Math.max(1, p - 1),
                                            )
                                        }
                                        disabled={isOutOfStock || quantity <= 1}
                                    >
                                        −
                                    </Button>
                                    <div className="w-10 text-center text-base font-black">
                                        {quantity}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-xl text-base font-bold"
                                        onClick={() =>
                                            setQuantity((p) =>
                                                Math.min(maxQty, p + 1),
                                            )
                                        }
                                        disabled={
                                            isOutOfStock || quantity >= maxQty
                                        }
                                    >
                                        +
                                    </Button>
                                </div>

                                <span className="text-xs text-muted-foreground">
                                    {isOutOfStock
                                        ? "Out of stock"
                                        : `${maxQty} available`}
                                </span>

                                {!isOutOfStock && quantity >= 1 && (
                                    <span className="ml-auto text-sm font-black text-foreground">
                                        {formatCurrency(priceAmount * quantity)}
                                    </span>
                                )}
                            </div>

                            {/* CTA buttons */}
                            <div className="flex flex-col gap-2.5">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={
                                        isOutOfStock ||
                                        !selectedVariant ||
                                        addToCartMutation.isPending
                                    }
                                    className="h-12 w-full rounded-2xl bg-foreground text-sm font-black uppercase tracking-widest text-background shadow-md transition-all duration-200 hover:bg-foreground/85 hover:shadow-lg active:scale-[0.98] disabled:opacity-40"
                                >
                                    {addToCartMutation.isPending ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <ShoppingCart className="mr-2 size-4" />
                                    )}
                                    Add to Cart
                                </Button>

                                <Button
                                    onClick={handleBuyNow}
                                    disabled={
                                        isOutOfStock ||
                                        !selectedVariant ||
                                        buyNowMutation.isPending
                                    }
                                    className="h-12 w-full rounded-2xl bg-emerald-500 text-sm font-black uppercase tracking-widest text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-600 hover:shadow-lg active:scale-[0.98] disabled:opacity-40"
                                >
                                    {buyNowMutation.isPending ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Zap className="mr-2 size-4" />
                                    )}
                                    Buy Now
                                </Button>
                            </div>
                        </div>

                        {/* ── Accordion ─────────────────────────────────── */}
                        <Accordion type="single" collapsible className="w-full">
                            {[
                                {
                                    value: "details",
                                    trigger: "Product Details",
                                    content: (
                                        <div className="space-y-3">
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {product.description ||
                                                    "No description."}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full text-xs"
                                                >
                                                    Jersey:{" "}
                                                    {formatLabel(
                                                        product.jerseyType,
                                                    )}
                                                </Badge>
                                                {product.tournamentTag && (
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full text-xs"
                                                    >
                                                        {product.tournamentTag}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    value: "size-chart",
                                    trigger: "Size Chart",
                                    content: <SizeChartTable />,
                                },
                                {
                                    value: "why-us",
                                    trigger: "Why Buy From Us",
                                    content: (
                                        <div className="grid grid-cols-2 gap-3">
                                            <InfoRow
                                                icon={
                                                    <BadgeCheck className="size-4" />
                                                }
                                                title="Authentic Import"
                                                text="Official-grade jerseys & materials"
                                            />
                                            <InfoRow
                                                icon={
                                                    <ShieldCheck className="size-4" />
                                                }
                                                title="Secure Payment"
                                                text="SSLCommerz verified checkout"
                                            />
                                            <InfoRow
                                                icon={
                                                    <Truck className="size-4" />
                                                }
                                                title="Fast Delivery"
                                                text="Nationwide delivery in 1–3 days"
                                            />
                                            <InfoRow
                                                icon={
                                                    <PlayCircle className="size-4" />
                                                }
                                                title="Easy Returns"
                                                text="7-day exchange policy"
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    value: "delivery",
                                    trigger: "Expected Delivery",
                                    content: (
                                        <div className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                Orders placed today typically
                                                arrive within 2–4 business days.
                                            </p>
                                            <div className="space-y-3">
                                                <DeliveryStep
                                                    title="Order Confirmed"
                                                    description="Payment verified and packed"
                                                />
                                                <DeliveryStep
                                                    title="Dispatched"
                                                    description="Handed to courier within 24h"
                                                />
                                                <DeliveryStep
                                                    title="Delivered"
                                                    description="Trackable until doorstep"
                                                />
                                            </div>
                                        </div>
                                    ),
                                },
                            ].map((item) => (
                                <AccordionItem
                                    key={item.value}
                                    value={item.value}
                                    className="border-b border-border/50 last:border-0"
                                >
                                    <AccordionTrigger className="py-4 text-sm font-bold uppercase tracking-[0.1em] hover:no-underline">
                                        {item.trigger}
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5 pt-1">
                                        {item.content}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    {/* ════════════════════════════════════════════════════════
                        REVIEWS — full width below left column on large screens
                    ════════════════════════════════════════════════════════ */}
                    <div className="mt-8 lg:col-start-1 lg:row-start-2 lg:mt-0">
                        <ReviewsSection
                            averageRating={averageRating}
                            reviewCount={reviewCount}
                            reviews={reviewsResponse?.data ?? []}
                            isLoading={reviewsLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SizeChartTable() {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/60">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/40">
                        <TableHead className="text-xs font-black uppercase tracking-[0.15em]">
                            Size
                        </TableHead>
                        <TableHead className="text-xs font-black uppercase tracking-[0.15em]">
                            Chest (in)
                        </TableHead>
                        <TableHead className="text-xs font-black uppercase tracking-[0.15em]">
                            Length (in)
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sizeChartRows.map((row) => (
                        <TableRow
                            key={row.size}
                            className="transition-colors hover:bg-muted/30"
                        >
                            <TableCell className="py-3 font-black">
                                {row.size}
                            </TableCell>
                            <TableCell className="py-3 text-muted-foreground">
                                {row.chest}
                            </TableCell>
                            <TableCell className="py-3 text-muted-foreground">
                                {row.length}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function InfoRow({
    icon,
    title,
    text,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3.5">
            <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-xl bg-foreground/8 text-foreground">
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wide text-foreground">
                    {title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {text}
                </p>
            </div>
        </div>
    );
}

function DeliveryStep({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1.5 flex flex-col items-center">
                <span className="size-2.5 rounded-full bg-foreground" />
                <span className="mt-1 h-7 w-px bg-border/70" />
            </div>
            <div className="pb-2">
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}
