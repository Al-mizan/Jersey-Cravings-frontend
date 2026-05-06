"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePublicProduct } from "@/hooks/usePublicProduct";
import { usePublicProducts } from "@/hooks/usePublicProducts";
import { ProductDetailsSkeleton } from "@/components/modules/PublicProduct/ProductSkeleton";
import { ProductDetailsError } from "@/components/modules/PublicProduct/EmptyAndErrorStates";
import { ProductCard } from "@/components/modules/PublicProduct/ProductCard";
import {
    ShoppingCart,
    ChevronLeft,
    Check,
    Minus,
    Plus,
    AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { IProductVariant } from "@/types/product.types";

interface ProductDetailsPageProps {
    params: {
        id: string;
    };
}

export default function ProductDetailsPage({
    params,
}: ProductDetailsPageProps) {
    const productId = params.id;
    const [selectedVariant, setSelectedVariant] = useState<
        IProductVariant | undefined
    >(undefined);
    const [quantity, setQuantity] = useState(1);
    const [mainImageIndex, setMainImageIndex] = useState(0);

    const {
        data: product,
        isLoading: productLoading,
        error: productError,
        refetch: refetchProduct,
    } = usePublicProduct(productId);

    const { data: relatedProducts } = usePublicProducts({
        categoryId: product?.categoryId,
        limit: 4,
    });

    // Set initial variant
    React.useEffect(() => {
        if (product?.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product?.variants]);

    if (productLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <ProductDetailsSkeleton />
                </div>
            </div>
        );
    }

    if (productError || !product) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <ProductDetailsError onRetry={() => refetchProduct()} />
                </div>
            </div>
        );
    }

    const hasStock = selectedVariant && selectedVariant.stockQty > 0;
    const mediaList = product.media || [];
    const mainImage = mediaList[mainImageIndex];
    const compareAtPrice = selectedVariant?.compareAtAmount;
    const price = selectedVariant?.priceAmount || 0;
    const hasDiscount = compareAtPrice && compareAtPrice > price;
    const discountPercentage = hasDiscount
        ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-sm">
                    <Link
                        href="/products"
                        className="text-primary hover:underline"
                    >
                        Products
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">
                        {product.title}
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative bg-muted rounded-lg overflow-hidden aspect-square">
                            {mainImage ? (
                                <Image
                                    src={mainImage.secureUrl}
                                    alt={mainImage.altText || product.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                            {hasDiscount && (
                                <Badge className="absolute top-4 right-4 bg-red-500">
                                    -{discountPercentage}%
                                </Badge>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {mediaList.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {mediaList.map((media, idx) => (
                                    <button
                                        key={media.id}
                                        onClick={() => setMainImageIndex(idx)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                                            mainImageIndex === idx
                                                ? "border-primary"
                                                : "border-muted hover:border-muted-foreground"
                                        }`}
                                    >
                                        <Image
                                            src={media.secureUrl}
                                            alt={`${product.title} - Image ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        {/* Category & Title */}
                        <div>
                            {product.category && (
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                                    {product.category.name}
                                </p>
                            )}
                            <h1 className="text-4xl font-bold mb-2">
                                {product.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{product.teamName}</span>
                                <span className="capitalize">
                                    {product.jerseyType}
                                </span>
                                {product.tournamentTag && (
                                    <Badge variant="outline">
                                        {product.tournamentTag}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Price */}
                        <div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold">
                                    ${price.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        ${compareAtPrice?.toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="text-sm text-green-600 font-semibold">
                                    Save ${(compareAtPrice! - price).toFixed(2)}{" "}
                                    ({discountPercentage}%)
                                </p>
                            )}
                        </div>

                        <Separator />

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="font-semibold mb-2">
                                    Description
                                </h3>
                                <p className="text-muted-foreground">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Variant Selection */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-4">
                                {/* Size */}
                                <div>
                                    <label className="text-sm font-semibold mb-3 block">
                                        Size
                                    </label>
                                    <Select
                                        value={selectedVariant?.id || ""}
                                        onValueChange={(variantId) => {
                                            const variant =
                                                product.variants?.find(
                                                    (v) => v.id === variantId,
                                                );
                                            setSelectedVariant(variant);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {product.variants.map((variant) => (
                                                <SelectItem
                                                    key={variant.id}
                                                    value={variant.id}
                                                >
                                                    {variant.size} -{" "}
                                                    {variant.fit} -{" "}
                                                    {variant.sleeveType}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Stock Status */}
                                {selectedVariant && (
                                    <div className="text-sm">
                                        {hasStock ? (
                                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                                                <Check className="w-4 h-4" />
                                                In Stock (
                                                {selectedVariant.stockQty}{" "}
                                                available)
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-destructive font-semibold">
                                                <AlertCircle className="w-4 h-4" />
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <Separator />

                        {/* Quantity & Add to Cart */}
                        {selectedVariant && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border rounded-lg">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setQuantity(
                                                    Math.max(1, quantity - 1),
                                                )
                                            }
                                            disabled={!hasStock}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="px-6 py-2 text-center w-16">
                                            {quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setQuantity(
                                                    Math.min(
                                                        selectedVariant.stockQty,
                                                        quantity + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                !hasStock ||
                                                quantity >=
                                                    selectedVariant.stockQty
                                            }
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full"
                                    disabled={!hasStock}
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                </Button>

                                {!hasStock && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            This item is currently out of stock.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        <Separator />

                        {/* SKU & Details */}
                        {selectedVariant && (
                            <Card className="p-4 bg-muted/50">
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            SKU
                                        </dt>
                                        <dd className="font-mono text-xs">
                                            {selectedVariant.sku}
                                        </dd>
                                    </div>
                                </dl>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts &&
                    relatedProducts.data.length > 0 &&
                    relatedProducts.data.some((p) => p.id !== product.id) && (
                        <div className="mt-16">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold">
                                    Related Products
                                </h2>
                                <p className="text-muted-foreground">
                                    Similar items from {product.category?.name}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {relatedProducts.data
                                    .filter((p) => p.id !== product.id)
                                    .slice(0, 4)
                                    .map((related) => (
                                        <ProductCard
                                            key={related.id}
                                            product={related}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}
