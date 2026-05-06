/**
 * Query key factory for public product browsing
 * Keeps public product queries separate from admin queries
 */

export const publicProductKeys = {
    all: ["public", "products"] as const,
    lists: () => [...publicProductKeys.all, "list"] as const,
    list: (filters: {
        searchTerm?: string;
        categoryId?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) =>
        [
            ...publicProductKeys.lists(),
            {
                searchTerm: filters.searchTerm,
                categoryId: filters.categoryId,
                page: filters.page,
                limit: filters.limit,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            },
        ] as const,
    details: () => [...publicProductKeys.all, "detail"] as const,
    detail: (id: string) => [...publicProductKeys.details(), id] as const,
} as const;

export const publicCategoryKeys = {
    all: ["public", "categories"] as const,
    lists: () => [...publicCategoryKeys.all, "list"] as const,
    list: (filters?: { searchTerm?: string; page?: number; limit?: number }) =>
        [
            ...publicCategoryKeys.lists(),
            {
                searchTerm: filters?.searchTerm,
                page: filters?.page,
                limit: filters?.limit,
            },
        ] as const,
    details: () => [...publicCategoryKeys.all, "detail"] as const,
    detail: (id: string) => [...publicCategoryKeys.details(), id] as const,
} as const;
