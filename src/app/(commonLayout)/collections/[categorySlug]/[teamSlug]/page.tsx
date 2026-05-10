"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getCategoryBySlug } from "@/services/category.service";
import { getProductsByTeam, getAllProducts } from "@/services/product.service";
import { slugToTeamName, teamNameToSlug } from "@/lib/slug-utils";
import Link from "next/link";
import { use, useState, useMemo } from "react";
import { ChevronRight, Shirt, PackageOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    params: Promise<{ categorySlug: string; teamSlug: string }>;
}

export default function TeamProductsPage({ params }: Props) {
    const { categorySlug, teamSlug } = use(params);
    const teamName = slugToTeamName(teamSlug);

    const [jerseyType, setJerseyType] = useState<string>("ALL");
    const [sortOption, setSortOption] = useState<string>("newest");

    const categoryQuery = useQuery({
        queryKey: ["category", "slug", categorySlug],
        queryFn: () => getCategoryBySlug(categorySlug),
        staleTime: 120_000,
    });

    const category = categoryQuery.data;

    // Parse sort options
    const { sortBy, sortOrder } = useMemo(() => {
        if (sortOption === "price_asc") return { sortBy: "priceAmount", sortOrder: "asc" as const };
        if (sortOption === "price_desc") return { sortBy: "priceAmount", sortOrder: "desc" as const };
        return { sortBy: "createdAt", sortOrder: "desc" as const }; // newest
    }, [sortOption]);

    const resolvedJerseyType = jerseyType === "ALL" ? undefined : jerseyType;

    const productsQuery = useInfiniteQuery({
        queryKey: [
            "products",
            "team",
            category?.id,
            teamName,
            resolvedJerseyType,
            sortBy,
            sortOrder,
        ],
        queryFn: ({ pageParam = 1 }) =>
            getProductsByTeam(
                category!.id,
                teamName,
                pageParam,
                20,
                resolvedJerseyType,
                sortBy,
                sortOrder
            ),
        getNextPageParam: (lastPage) => {
            if (lastPage && lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: Boolean(category?.id),
    });

    const products = useMemo(() => {
        if (!productsQuery.data) return [];
        return productsQuery.data.pages.flatMap((page) => page?.data ?? []);
    }, [productsQuery.data]);

    const totalProducts = productsQuery.data?.pages?.[0]?.total ?? 0;

    // --- Loading ---
    if (categoryQuery.isLoading || (productsQuery.isLoading && !products.length)) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb skeleton */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                        <ChevronRight className="size-4 text-muted-foreground" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <ChevronRight className="size-4 text-muted-foreground" />
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-56 bg-muted rounded animate-pulse mb-8" />
                    <div className="flex gap-4 mb-8">
                        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
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
            </div>
        );
    }

    // --- Not Found ---
    if (!category) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Shirt className="size-16 mx-auto text-muted-foreground/40" />
                    <h2 className="text-2xl font-bold">Collection Not Found</h2>
                    <p className="text-muted-foreground">
                        The collection &ldquo;{categorySlug}&rdquo; doesn&apos;t exist.
                    </p>
                    <Link
                        href="/"
                        className="inline-block mt-4 text-primary hover:underline font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <Breadcrumb
                    categorySlug={categorySlug}
                    categoryName={category.name}
                    teamName={teamName}
                />

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase mb-2">
                        {teamName}
                    </h1>
                    <p className="text-muted-foreground">
                        {totalProducts} jersey{totalProducts !== 1 ? "s" : ""} found
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-8 bg-muted/20 p-3 rounded-lg border border-border/50">
                    <Select value={jerseyType} onValueChange={setJerseyType}>
                        <SelectTrigger className="w-[160px] bg-background">
                            <SelectValue placeholder="Jersey Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="HOME">Home</SelectItem>
                            <SelectItem value="AWAY">Away</SelectItem>
                            <SelectItem value="THIRD">Third</SelectItem>
                            <SelectItem value="GK">Goalkeeper</SelectItem>
                            <SelectItem value="SPECIAL">Special</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-[160px] bg-background">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* --- Empty State --- */}
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/5 rounded-2xl border border-dashed border-border">
                        <PackageOpen className="size-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Jerseys Found</h3>
                        <p className="text-muted-foreground max-w-md">
                            There are no jerseys matching your current filters for {teamName}.
                        </p>
                        <Button 
                            variant="link" 
                            onClick={() => {
                                setJerseyType("ALL");
                                setSortOption("newest");
                            }}
                            className="mt-4"
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Product Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Load More */}
                        {productsQuery.hasNextPage && (
                            <div className="mt-12 flex justify-center">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="px-8 font-semibold"
                                    onClick={() => productsQuery.fetchNextPage()}
                                    disabled={productsQuery.isFetchingNextPage}
                                >
                                    {productsQuery.isFetchingNextPage ? (
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
                    </>
                )}
                
                {/* You May Also Like */}
                {category && (
                    <YouMayAlsoLike 
                        categoryId={category.id} 
                        categorySlug={categorySlug} 
                        currentTeamName={teamName} 
                    />
                )}
            </div>
        </div>
    );
}

/* ---------- Subcomponents ---------- */

function Breadcrumb({
    categorySlug,
    categoryName,
    teamName,
}: {
    categorySlug: string;
    categoryName: string;
    teamName: string;
}) {
    return (
        <nav
            className="flex items-center gap-1.5 text-sm mb-6 flex-wrap"
            aria-label="Breadcrumb"
        >
            <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
                Home
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <Link
                href={`/collections`}
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
                Collections
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <Link
                href={`/collections/${categorySlug}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
                {categoryName}
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium truncate">
                {teamName}
            </span>
        </nav>
    );
}

function YouMayAlsoLike({
    categoryId,
    categorySlug,
    currentTeamName,
}: {
    categoryId: string;
    categorySlug: string;
    currentTeamName: string;
}) {
    const { data, isLoading } = useQuery({
        queryKey: ["products", "youMayAlsoLike", categoryId, currentTeamName],
        queryFn: () =>
            getAllProducts(
                undefined,
                "ACTIVE",
                categoryId,
                1,
                20,
                false,
                "createdAt",
                "desc"
            ),
        staleTime: 120_000,
    });

    const products = useMemo(() => {
        if (!data?.data) return [];
        return data.data
            .filter(
                (p) => p.teamName.toLowerCase() !== currentTeamName.toLowerCase()
            )
            .slice(0, 8);
    }, [data, currentTeamName]);

    if (isLoading) {
        return (
            <div className="mt-16 pt-12 border-t border-border/40">
                <h3 className="text-xl md:text-2xl font-bold mb-6">You May Also Like</h3>
                <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-4 md:pb-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="min-w-[65vw] sm:min-w-[45vw] md:min-w-0 shrink-0 flex flex-col gap-3">
                            <Skeleton className="w-full aspect-[3/4] rounded-xl" />
                            <div className="space-y-2 px-1">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="mt-16 pt-12 border-t border-border/40">
            <h3 className="text-xl md:text-2xl font-bold mb-6">You May Also Like</h3>
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                {products.map((product) => (
                    <div key={product.id} className="min-w-[65vw] sm:min-w-[45vw] md:min-w-0 shrink-0 snap-start">
                        <ProductCard
                            product={product}
                            hrefOverride={`/collections/${categorySlug}/${teamNameToSlug(
                                product.teamName
                            )}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
