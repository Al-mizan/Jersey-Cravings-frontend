"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveBanners } from "@/services/banner.service";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import Image from "next/image";
import { IBanner } from "@/types/banner.types";


export default function HeroBanner() {
    const {
        data: banners = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["banners", "active"],
        queryFn: () => getActiveBanners(),
        staleTime: 60_000,
        retry: 1,
        retryDelay: 1000,
    });

    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const total = banners.length;

    const goTo = useCallback(
        (index: number) => {
            if (total === 0) return;
            setCurrent(((index % total) + total) % total);
        },
        [total],
    );

    const next = useCallback(() => goTo(current + 1), [goTo, current]);
    const prev = useCallback(() => goTo(current - 1), [goTo, current]);

    // Auto-play every 2 seconds, pause on hover
    useEffect(() => {
        if (total <= 1 || isHovered) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(next, 2000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [total, isHovered, next]);

    /* ─── Loading skeleton ───────────────────────────────────── */
    if (isLoading) {
        return (
            <section className="pt-6 pb-2 px-4 md:px-10">
                <div className="container mx-auto">
                    <div className="flex items-center gap-3">
                        {/* Left arrow placeholder */}
                        <div className="hidden md:flex shrink-0 size-10 rounded-full bg-muted animate-pulse" />
                        {/* Banner skeleton */}
                        <div
                            className="flex-1 rounded-2xl bg-muted animate-pulse"
                            style={{ aspectRatio: "1920/640" }}
                        />
                        {/* Right arrow placeholder */}
                        <div className="hidden md:flex shrink-0 size-10 rounded-full bg-muted animate-pulse" />
                    </div>
                    {/* Dots placeholder */}
                    <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="size-2.5 rounded-full bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    /* ─── Error / Empty fallback ─────────────────────────────── */
    if (isError || total === 0) {
        return (
            <section className="pt-6 pb-2 px-4 md:px-10">
                <div className="container mx-auto">
                    <div className="h-[240px] md:h-[360px] rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
                        <div className="text-center space-y-3 px-4">
                            <ImageOff className="size-10 text-zinc-600 mx-auto" />
                            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase">
                                Jersey Cravings
                            </h2>
                            <p className="text-zinc-400 text-sm max-w-md mx-auto">
                                Premium jerseys for passionate fans — find your
                                team below
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    /* ─── Slider ─────────────────────────────────────────────── */
    return (
        <section
            className="pt-6 pb-2 px-4 md:px-10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Hero banner slider"
        >
            <div className="container mx-auto">
                {/* [ ‹ ] [ ── banner ── ] [ › ] */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Left Arrow — outside the image */}
                    {total > 1 && (
                        <button
                            onClick={prev}
                            className="hidden md:flex shrink-0 items-center justify-center size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                    )}

                    {/* Banner Image Container */}
                    <div
                        className="relative flex-1 rounded-2xl overflow-hidden bg-zinc-950"
                        style={{ aspectRatio: "1920/800" }}
                    >
                        {banners.map((banner: IBanner, index: number) => (
                            <div
                                key={banner.id}
                                className="absolute inset-0 transition-all duration-700 ease-in-out"
                                style={{
                                    opacity: index === current ? 1 : 0,
                                    transform: `scale(${index === current ? 1 : 1.04})`,
                                    zIndex: index === current ? 10 : 0,
                                }}
                            >
                                <Image
                                    src={banner.imageUrl}
                                    alt={`Banner ${index + 1}`}
                                    fill
                                    className="object-cover object-center"
                                    sizes="(max-width: 768px) 100vw, 85vw"
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </div>
                        ))}

                        {/* Mobile-only navigation arrows (inside image) */}
                        {total > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center size-8 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10 transition-all duration-200 hover:bg-black/60 cursor-pointer"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                                <button
                                    onClick={next}
                                    className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center size-8 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10 transition-all duration-200 hover:bg-black/60 cursor-pointer"
                                    aria-label="Next slide"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right Arrow — outside the image */}
                    {total > 1 && (
                        <button
                            onClick={next}
                            className="hidden md:flex shrink-0 items-center justify-center size-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    )}
                </div>

                {/* Dot Indicators — centered below the banner */}
                {total > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {banners.map((_: IBanner, index: number) => (
                            <button
                                key={index}
                                onClick={() => goTo(index)}
                                className={`rounded-full transition-all duration-300 cursor-pointer ${
                                    index === current
                                        ? "w-7 h-2.5 bg-primary"
                                        : "size-2.5 bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
