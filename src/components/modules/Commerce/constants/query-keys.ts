export const commerceQueryKeys = {
    all: ["commerce"] as const,
    myCart: () => [...commerceQueryKeys.all, "my-cart"] as const,
    activePickupLocations: () =>
        [...commerceQueryKeys.all, "active-pickup-locations"] as const,
    coupons: {
        all: () => [...commerceQueryKeys.all, "coupons"] as const,
        list: (params: {
            searchTerm?: string;
            isActive?: boolean;
            isDeleted?: boolean;
            page: number;
            limit: number;
        }) => [...commerceQueryKeys.coupons.all(), "list", params] as const,
    },
    pickupLocations: {
        all: () => [...commerceQueryKeys.all, "pickup-locations"] as const,
        list: (params: { page: number; limit: number }) =>
            [
                ...commerceQueryKeys.pickupLocations.all(),
                "list",
                params,
            ] as const,
    },
};
