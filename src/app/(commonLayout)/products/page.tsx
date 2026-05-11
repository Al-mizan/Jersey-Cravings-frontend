"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/services/product.service";
import { useMemo } from "react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: ["products", "all"],
        queryFn: ({ pageParam = 1 }) =>
            getAllProducts(
                undefined,
                "ACTIVE",
                undefined,
                pageParam,
                12,
                false,
                "createdAt",
                "desc",
            ),
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    const products = useMemo(() => {
        if (!data) return [];
        return data.pages.flatMap((page) => page?.data ?? []);
    }, [data]);

    if (isLoading) {
        return (
            <section className="py-16 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-8 w-52 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <Skeleton className="w-full aspect-[3/4] rounded-xl" />
                                <div className="space-y-2 px-1">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-5 w-1/3 mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (isError || products.length === 0) {
        return null;
    }

    return (
        <section className="py-10 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-8">
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
                        All Products
                    </h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {hasNextPage && (
                    <div className="mt-12 flex justify-center">
                        <Button
                            variant="outline"
                            size="lg"
                            className="px-8 font-semibold"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Load More"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
