export const customerQueryKeys = {
    all: ["customers"] as const,
    myProfile: () => [...customerQueryKeys.all, "my-profile"] as const,
    customerList: (searchKey: string) =>
        [...customerQueryKeys.all, "list", searchKey] as const,
    customerById: (customerId: string) =>
        [...customerQueryKeys.all, "detail", customerId] as const,
    myAddresses: (searchKey: string) =>
        [...customerQueryKeys.all, "my-addresses", searchKey] as const,
    customerAddresses: (customerId: string) =>
        [...customerQueryKeys.all, "customer-addresses", customerId] as const,
    myLoyaltySummary: () =>
        [...customerQueryKeys.all, "my-loyalty-summary"] as const,
    myPointTransactions: (searchKey: string) =>
        [...customerQueryKeys.all, "my-point-transactions", searchKey] as const,
    activeLoyaltySetting: () =>
        [...customerQueryKeys.all, "active-loyalty-setting"] as const,
    customerLoyalty: (customerId: string) =>
        [...customerQueryKeys.all, "customer-loyalty", customerId] as const,
    myReferralCode: () =>
        [...customerQueryKeys.all, "my-referral-code"] as const,
    myReferralEvents: (searchKey: string) =>
        [...customerQueryKeys.all, "my-referral-events", searchKey] as const,
    adminReferralEvents: (searchKey: string) =>
        [...customerQueryKeys.all, "admin-referral-events", searchKey] as const,
    publicReviews: (searchKey: string) =>
        [...customerQueryKeys.all, "public-reviews", searchKey] as const,
    myReviews: (searchKey: string) =>
        [...customerQueryKeys.all, "my-reviews", searchKey] as const,
};
