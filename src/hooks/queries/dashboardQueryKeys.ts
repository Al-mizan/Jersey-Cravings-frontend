export const dashboardQueryKeys = {
    all: ["dashboard"] as const,
    adminData: () => [...dashboardQueryKeys.all, "admin-data"] as const,
};
