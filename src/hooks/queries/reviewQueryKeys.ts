export const reviewKeys = {
    all: ["my-section", "reviews"] as const,
    pending: () => [...reviewKeys.all, "pending"] as const,
    reviewed: () => [...reviewKeys.all, "reviewed"] as const,
} as const;
