"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo, useCallback, useTransition } from "react";
import type { PaginationState } from "@tanstack/react-table";

export function useUrlPaginationState(defaultLimit = 10, paramName = "page") {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    // Read current page from URL query params, convert to 0-indexed pageIndex
    const pageIndex = useMemo(() => {
        const pageVal = Number(searchParams.get(paramName)) || 1;
        return Math.max(0, pageVal - 1);
    }, [searchParams, paramName]);

    // Construct react-table PaginationState
    const paginationState = useMemo<PaginationState>(() => ({
        pageIndex,
        pageSize: defaultLimit,
    }), [pageIndex, defaultLimit]);

    // Update URL query parameters on page index or limit change
    const setPaginationState = useCallback((updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
        const nextState = typeof updater === "function" ? updater(paginationState) : updater;
        const newPage = nextState.pageIndex + 1;

        const params = new URLSearchParams(searchParams.toString());
        if (newPage === 1) {
            params.delete(paramName);
        } else {
            params.set(paramName, String(newPage));
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    }, [searchParams, pathname, router, paginationState, paramName]);

    return {
        paginationState,
        setPaginationState,
        page: pageIndex + 1,
        limit: defaultLimit,
        isPending,
    };
}
