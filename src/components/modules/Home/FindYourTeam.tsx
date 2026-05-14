"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories, type ICategory } from "@/services/category.service";
import { getStorefrontSettings } from "@/services/setting.service";
import { getTeamsByCategory } from "@/services/product.service";
import { useRef, useState } from "react";
import { ArrowRight, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { teamNameToSlug } from "@/lib/slug-utils";

export default function FindYourTeam() {
    // 1. Fetch settings
    const { data: settings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ["storefront-settings"],
        queryFn: () => getStorefrontSettings(),
    });

    const categoryId = settings?.findYourTeamCategoryId;

    // 2. Fetch all categories to get the slug for the selected category
    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ["categories", "homepage"],
        queryFn: () => getCategories(),
        staleTime: 120_000,
    });

    const selectedCategory = categories.find((c: ICategory) => c.id === categoryId);

    // 3. Fetch teams for the selected category
    const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
        queryKey: ["teams", categoryId],
        queryFn: () => getTeamsByCategory(categoryId!),
        enabled: !!categoryId,
    });

    const teams = teamsData || [];
    const isLoading = isLoadingSettings || isLoadingCategories || isLoadingTeams;

    const scrollRef = useRef<HTMLDivElement>(null);
    const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
    };

    if (isLoading) {
        return (
            <section className="py-10 px-4">
                <div className="container mx-auto">
                    <div className="h-8 w-36 bg-muted rounded animate-pulse mb-6" />
                    <div className="flex gap-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-36 h-36 bg-muted rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 px-4 bg-background" id="find-your-team">
            <div className="container mx-auto">
                {/* Header */}
                <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-6">
                    Find Your Team
                </h2>

                {/* Empty States */}
                {!categoryId && (
                    <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
                        <Settings className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm font-medium">No category selected — configure in admin settings</p>
                    </div>
                )}

                {categoryId && teams.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
                        <p className="text-muted-foreground text-sm font-medium">No teams found in this category</p>
                    </div>
                )}

                {/* Scrollable Row */}
                {categoryId && teams.length > 0 && (
                    <div className="relative group/section">
                        <div
                            ref={scrollRef}
                            className="flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory scroll-smooth"
                            style={{ scrollbarWidth: "none" }}
                        >
                            {teams.map((team: any) => (
                                <Link
                                    key={team.teamName}
                                    href={`/collections/${selectedCategory?.slug}/${teamNameToSlug(team.teamName)}`}
                                    className={`relative flex-shrink-0 w-35 md:w-60 h-35 md:h-60 aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${hoveredSlug === team.teamName
                                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
                                        : "ring-1 ring-border/40"
                                        }`}
                                    onMouseEnter={() =>
                                        setHoveredSlug(team.teamName)
                                    }
                                    onMouseLeave={() => setHoveredSlug(null)}
                                >
                                    {team.thumbNail ? (
                                        <Image
                                            src={team.thumbNail}
                                            alt={team.teamName}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 160px, 192px"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                            <span className="text-4xl opacity-20 font-black">{team.teamName.charAt(0)}</span>
                                        </div>
                                    )}
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/10 to-transparent" />
                                    {/* Team name & count */}
                                    <div className="absolute bottom-3 left-3 flex flex-col bg-white/10 p-2 rounded-lg backdrop-blur-lg">
                                        <span className="text-white font-semibold text-sm drop-shadow-lg leading-tight">
                                            {team.teamName}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
