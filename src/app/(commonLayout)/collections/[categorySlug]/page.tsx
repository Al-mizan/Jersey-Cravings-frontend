"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug } from "@/services/category.service";
import { getTeamsByCategory } from "@/services/product.service";
import { teamNameToSlug } from "@/lib/slug-utils";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { ChevronRight, Users, Shirt } from "lucide-react";
import type { ITeamSummary } from "@/types/product.types";

interface Props {
    params: Promise<{ categorySlug: string }>;
}

export default function TeamsPage({ params }: Props) {
    const { categorySlug } = use(params);

    const categoryQuery = useQuery({
        queryKey: ["category", "slug", categorySlug],
        queryFn: () => getCategoryBySlug(categorySlug),
        staleTime: 120_000,
    });

    const category = categoryQuery.data;

    const teamsQuery = useQuery({
        queryKey: ["teams", "category", category?.id],
        queryFn: () => getTeamsByCategory(category!.id),
        enabled: Boolean(category?.id),
        staleTime: 60_000,
    });

    const teams = teamsQuery.data ?? [];

    // --- Loading ---
    if (categoryQuery.isLoading || teamsQuery.isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb skeleton */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                        <ChevronRight className="size-4 text-muted-foreground" />
                        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                    </div>
                    {/* Title skeleton */}
                    <div className="h-10 w-64 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-5 w-48 bg-muted rounded animate-pulse mb-8" />
                    {/* Grid skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[3/4] bg-muted rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- Category Not Found ---
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

    // --- Empty State ---
    if (teams.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <Breadcrumb categoryName={category.name} />
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase mb-2">
                        {category.name}
                    </h1>
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Users className="size-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
                        <p className="text-muted-foreground max-w-md">
                            There are no active teams in this collection yet. Check back soon!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <Breadcrumb categoryName={category.name} />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase mb-2">
                        {category.name}
                    </h1>
                    <p className="text-muted-foreground">
                        {teams.length} team{teams.length !== 1 ? "s" : ""} available
                    </p>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {teams.map((team) => (
                        <TeamCard
                            key={team.teamName}
                            team={team}
                            categorySlug={categorySlug}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ---------- Subcomponents ---------- */

function Breadcrumb({ categoryName }: { categoryName: string }) {
    return (
        <nav className="flex items-center gap-1.5 text-sm mb-6" aria-label="Breadcrumb">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
            </Link>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium truncate">{categoryName}</span>
        </nav>
    );
}

function TeamCard({
    team,
    categorySlug,
}: {
    team: ITeamSummary;
    categorySlug: string;
}) {
    // If only 1 product, link directly to product detail
    const href =
        team.productCount === 1 && team.singleProductId
            ? `/products/${team.singleProductId}`
            : `/collections/${categorySlug}/${teamNameToSlug(team.teamName)}`;

    return (
        <Link
            href={href}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden ring-1 ring-border/40 hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background transition-all duration-300 hover:scale-[1.02]"
        >
            {/* Image / Fallback */}
            {team.thumbNail ? (
                <Image
                    src={team.thumbNail}
                    alt={team.teamName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                    <span className="text-5xl font-black text-primary/20">
                        {team.teamName.charAt(0)}
                    </span>
                </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                <h3 className="text-white font-bold text-base md:text-lg leading-tight drop-shadow-lg">
                    {team.teamName}
                </h3>
                <p className="text-white/70 text-xs font-medium">
                    {team.productCount} jersey{team.productCount !== 1 ? "s" : ""}
                </p>
            </div>
        </Link>
    );
}
