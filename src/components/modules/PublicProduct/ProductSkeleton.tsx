import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/**
 * Loading skeleton for product card
 */
export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="aspect-square bg-muted">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </Card>
    );
}

/**
 * Loading skeleton for product grid
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Loading skeleton for product details page
 */
export function ProductDetailsSkeleton() {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded" />
                    ))}
                </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-10" />
                        ))}
                    </div>
                </div>

                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
}
