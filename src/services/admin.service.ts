import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall } from "@/services/service-utils";
import {
    ICatalogStats,
    ICustomerStats,
    IDashboardSummary,
    IOrderStats,
    IAdminListResponse,
    IAdmin,
    IAuditLogListResponse,
    IActivityFeedResponse,
} from "@/types/admin.types";
import { ApiResponse } from "@/types/api.types";

const ADMIN_ENDPOINTS = {
    dashboardSummary: "/dashboard/summary",
    catalogStats: "/dashboard/catalog",
    orderStats: "/dashboard/orders",
    customerStats: "/dashboard/customers",
    admins: "/admins",
    auditLogs: "/audit-logs",
    myActivity: "/audit-logs/my-activity",
    activityTimeline: "/audit-logs/timeline",
};

const unwrapData = async <TData>(
    request: Promise<ApiResponse<TData>>,
): Promise<TData> => {
    const response = await request;
    return response.data;
};

// Dashboard Services
export async function getDashboardSummary(): Promise<
    IDashboardSummary | null | undefined
> {
    return safeServiceCall(
        () =>
            unwrapData<IDashboardSummary>(
                httpClient.get(ADMIN_ENDPOINTS.dashboardSummary),
            ),
        null,
        "Failed to fetch dashboard summary:",
    );
}

export async function getCatalogStats(): Promise<
    ICatalogStats | null | undefined
> {
    return safeServiceCall(
        () =>
            unwrapData<ICatalogStats>(httpClient.get(ADMIN_ENDPOINTS.catalogStats)),
        null,
        "Failed to fetch catalog stats:",
    );
}

export async function getOrderStats(): Promise<IOrderStats | null | undefined> {
    return safeServiceCall(
        () => unwrapData<IOrderStats>(httpClient.get(ADMIN_ENDPOINTS.orderStats)),
        null,
        "Failed to fetch order stats:",
    );
}

export async function getCustomerStats(): Promise<
    ICustomerStats | null | undefined
> {
    return safeServiceCall(
        () =>
            unwrapData<ICustomerStats>(
                httpClient.get(ADMIN_ENDPOINTS.customerStats),
            ),
        null,
        "Failed to fetch customer stats:",
    );
}

// Admin Management Services
export async function getAllAdmins(
    searchTerm?: string,
    page: number = 1,
    limit: number = 10,
    isDeleted?: boolean,
): Promise<IAdminListResponse | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<IAdminListResponse>(
                httpClient.get(ADMIN_ENDPOINTS.admins, {
                    params: {
                        searchTerm,
                        page,
                        limit,
                        isDeleted,
                    },
                }),
            ),
        null,
        "Failed to fetch admins:",
    );
}

export async function getAdminById(
    id: string,
): Promise<IAdmin | null | undefined> {
    return safeServiceCall(
        () => unwrapData<IAdmin>(httpClient.get(`${ADMIN_ENDPOINTS.admins}/${id}`)),
        null,
        "Failed to fetch admin:",
    );
}

// Audit Log Services
export async function getAuditLogs(
    searchTerm?: string,
    page: number = 1,
    limit: number = 10,
): Promise<IAuditLogListResponse | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<IAuditLogListResponse>(
                httpClient.get(ADMIN_ENDPOINTS.auditLogs, {
                    params: {
                        searchTerm,
                        page,
                        limit,
                    },
                }),
            ),
        null,
        "Failed to fetch audit logs:",
    );
}

export async function getMyActivity(
    page: number = 1,
    limit: number = 10,
): Promise<IActivityFeedResponse | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<IActivityFeedResponse>(
                httpClient.get(ADMIN_ENDPOINTS.myActivity, {
                    params: {
                        page,
                        limit,
                    },
                }),
            ),
        null,
        "Failed to fetch my activity:",
    );
}

export async function getActivityTimeline(
    page: number = 1,
    limit: number = 10,
): Promise<IActivityFeedResponse | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<IActivityFeedResponse>(
                httpClient.get(ADMIN_ENDPOINTS.activityTimeline, {
                    params: {
                        page,
                        limit,
                    },
                }),
            ),
        null,
        "Failed to fetch activity timeline:",
    );
}

export async function getEntityAuditLogs(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 10,
): Promise<IAuditLogListResponse | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<IAuditLogListResponse>(
                httpClient.get(
                    `${ADMIN_ENDPOINTS.auditLogs}/${entityType}/${entityId}`,
                    {
                        params: {
                            page,
                            limit,
                        },
                    },
                ),
            ),
        null,
        "Failed to fetch entity audit logs:",
    );
}
