import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";
import type { IProduct } from "@/types/product.types";

interface ProductCardProps {
    product: IProduct;
}

/**
 * Product card component for grid display
 * Shows product image, title, price, and quick view/add to cart actions
 */
export function ProductCard({ product }: ProductCardProps) {
    const primaryImage = product.media?.[0];
    const firstVariant = product.variants?.[0];
    const price = firstVariant?.priceAmount || 0;
    const compareAtPrice = firstVariant?.compareAtAmount;
    const hasDiscount = compareAtPrice && compareAtPrice > price;

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image Container */}
            <Link
                href={`/products/${product.id}`}
                className="block relative aspect-square bg-muted overflow-hidden group"
            >
                {primaryImage ? (
                    <Image
                        src={primaryImage.secureUrl}
                        alt={primaryImage.altText || product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <span>No Image</span>
                    </div>
                )}
                {hasDiscount && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                        Sale
                    </Badge>
                )}
            </Link>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Category */}
                {product.category && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.category.name}
                    </p>
                )}

                {/* Title */}
                <Link
                    href={`/products/${product.id}`}
                    className="block hover:underline"
                >
                    <h3 className="font-semibold text-sm line-clamp-2">
                        {product.title}
                    </h3>
                </Link>

                {/* Team & Type */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.teamName}</span>
                    <span className="capitalize">{product.jerseyType}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg">
                        ${price.toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                            ${compareAtPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Variants Count */}
                {product.variants && product.variants.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {product.variants.length} sizes available
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        <Link href={`/products/${product.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </Button>
                    <Button size="sm" className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Cart
                    </Button>
                </div>
            </div>
        </Card>
    );
}
