export interface ListQueryParams {
    searchTerm?: string;
    page: number;
    limit: number;
}

export interface AdminProductListQueryParams extends ListQueryParams {
    status?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface AdminOrdersListQueryParams extends ListQueryParams {
    status?: string;
    paymentStatus?: string;
    needsManualReview?: boolean;
    userId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface AdminCustomerListQueryParams extends ListQueryParams {
    isDeleted?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export const adminDashboardKeys = {
    all: ["admin", "dashboard"] as const,
    summary: () => [...adminDashboardKeys.all, "summary"] as const,
    catalogStats: () => [...adminDashboardKeys.all, "catalog-stats"] as const,
    orderStats: () => [...adminDashboardKeys.all, "order-stats"] as const,
    customerStats: () => [...adminDashboardKeys.all, "customer-stats"] as const,
    activityTimeline: (params: ListQueryParams) =>
        [...adminDashboardKeys.all, "activity-timeline", params] as const,
};

export const adminProductKeys = {
    all: ["admin", "products"] as const,
    list: (params: AdminProductListQueryParams) =>
        [...adminProductKeys.all, "list", params] as const,
    categoryFilters: () =>
        [...adminProductKeys.all, "category-filters"] as const,
};

export const adminCategoryKeys = {
    all: ["admin", "categories"] as const,
    list: (params: ListQueryParams) =>
        [...adminCategoryKeys.all, "list", params] as const,
    options: () => [...adminCategoryKeys.all, "options"] as const,
};

export const adminOrderKeys = {
    all: ["admin", "orders"] as const,
    list: (params: AdminOrdersListQueryParams) =>
        [...adminOrderKeys.all, "list", params] as const,
};

export const adminCustomerKeys = {
    all: ["admin", "customers"] as const,
    list: (params: AdminCustomerListQueryParams) =>
        [...adminCustomerKeys.all, "list", params] as const,
    detail: (customerId: string) =>
        [...adminCustomerKeys.all, "detail", customerId] as const,
};

export const adminUserKeys = {
    all: ["admin", "users"] as const,
    admins: {
        all: ["admin", "users", "admins"] as const,
        list: (params: ListQueryParams) =>
            [...adminUserKeys.admins.all, "list", params] as const,
    },
};

export const adminProfileKeys = {
    all: ["admin", "profile"] as const,
    detail: (adminId: string) =>
        [...adminProfileKeys.all, adminId] as const,
};
