import { AlertCircle, ShoppingBag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Empty state when no products are found
 */
export function ProductNotFound({
    searchTerm,
    categoryName,
    onReset,
}: {
    searchTerm?: string;
    categoryName?: string;
    onReset?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
                {searchTerm
                    ? `No results for "${searchTerm}"`
                    : categoryName
                      ? `No products in "${categoryName}"`
                      : "No products available at the moment"}
            </p>
            <div className="flex gap-2">
                {onReset && (
                    <Button variant="outline" onClick={onReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Filters
                    </Button>
                )}
                <Button asChild>
                    <Link href="/products">Browse All</Link>
                </Button>
            </div>
        </div>
    );
}

/**
 * Error state when product loading fails
 */
export function ProductError({
    error,
    onRetry,
}: {
    error?: Error | null;
    onRetry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
                Failed to load products
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
                {error?.message || "Something went wrong. Please try again."}
            </p>
            <div className="flex gap-2">
                {onRetry && (
                    <Button onClick={onRetry}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                )}
                <Button variant="outline" asChild>
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        </div>
    );
}

/**
 * Error state for product details page
 */
export function ProductDetailsError({ onRetry }: { onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Product not found</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
                The product you're looking for doesn't exist or has been
                removed.
            </p>
            <div className="flex gap-2">
                {onRetry && (
                    <Button onClick={onRetry}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                )}
                <Button variant="outline" asChild>
                    <Link href="/products">Back to Products</Link>
                </Button>
            </div>
        </div>
    );
}
