/**
 * Default pagination and caching settings for admin list pages
 * Centralizes repeated values to reduce drift and improve maintainability
 */

export const ADMIN_PAGINATION_DEFAULTS = {
    // Default starting page (1-based)
    page: 1,

    // Default items per page
    limit: 10,
} as const;

// Stale times in milliseconds
export const ADMIN_STALE_TIMES = {
    // List pages (products, orders)
    list: 30000,

    // Admin-specific list pages (admins, users)
    adminList: 60000,

    // Dashboard widgets and stats
    dashboard: 60000,

    // Category filters and other reference data
    categoryFilters: 60000,
} as const;

// Common query defaults
export const ADMIN_QUERY_DEFAULTS = {
    // Keep previous data while fetching updates
    keepPreviousData: true,
} as const;
