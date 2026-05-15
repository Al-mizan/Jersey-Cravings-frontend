"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, safeServiceMutation, unwrapData } from "@/services/service-utils";
import {
    ICatalogStats,
    ICustomerStats,
    IDashboardSummary,
    IOrderStats,
    IAdminListResponse,
    IAdmin,
    IAuditLogListResponse,
    IActivityFeedResponse,
    ICreateAdminPayload,
    IChangeUserStatusPayload,
    IChangeUserRolePayload,
} from "@/types/admin.types";

const ADMIN_ENDPOINTS = {
    dashboardSummary: "/dashboard/summary",
    catalogStats: "/dashboard/catalog",
    orderStats: "/dashboard/orders",
    customerStats: "/dashboard/customers",
    admins: "/admins",
    auditLogs: "/audit-logs",
    myActivity: "/audit-logs/my-activity",
    activityTimeline: "/audit-logs/timeline",
    contacts: "/contact",
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
            unwrapData<ICatalogStats>(
                httpClient.get(ADMIN_ENDPOINTS.catalogStats),
            ),
        null,
        "Failed to fetch catalog stats:",
    );
}

export async function getOrderStats(): Promise<IOrderStats | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<IOrderStats>(httpClient.get(ADMIN_ENDPOINTS.orderStats)),
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
        () =>
            unwrapData<IAdmin>(
                httpClient.get(`${ADMIN_ENDPOINTS.admins}/${id}`),
            ),
        null,
        "Failed to fetch admin:",
    );
}

export async function createAdmin(
    payload: ICreateAdminPayload,
): Promise<IAdmin> {
    return safeServiceMutation(
        () => unwrapData<IAdmin>(httpClient.post(ADMIN_ENDPOINTS.admins, payload)),
        "Failed to create admin:",
    );
}

export async function updateAdminById(
    id: string,
    data: FormData,
): Promise<IAdmin> {
    return safeServiceMutation(
        () =>
            unwrapData<IAdmin>(
                httpClient.patch(`${ADMIN_ENDPOINTS.admins}/${id}`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                }),
            ),
        "Failed to update admin:",
    );
}

export async function deleteAdmin(id: string): Promise<void> {
    return safeServiceMutation(
        () =>
            unwrapData<void>(
                httpClient.delete(`${ADMIN_ENDPOINTS.admins}/${id}`),
            ),
        "Failed to delete admin:",
    );
}

export async function changeUserStatus(
    payload: IChangeUserStatusPayload,
): Promise<{ message: string }> {
    return safeServiceMutation(
        () =>
            unwrapData<{ message: string }>(
                httpClient.patch(`${ADMIN_ENDPOINTS.admins}/user/status`, payload),
            ),
        "Failed to change user status:",
    );
}

export async function changeUserRole(
    payload: IChangeUserRolePayload,
): Promise<{ message: string }> {
    return safeServiceMutation(
        () =>
            unwrapData<{ message: string }>(
                httpClient.patch(`${ADMIN_ENDPOINTS.admins}/user/role`, payload),
            ),
        "Failed to change user role:",
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

// Contact Services
export async function getAllContacts(): Promise<any[] | null | undefined> {
    return safeServiceCall(
        () => unwrapData<any[]>(httpClient.get(ADMIN_ENDPOINTS.contacts)),
        null,
        "Failed to fetch contacts:",
    );
}

export async function getContactById(
    id: string,
): Promise<any | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<any>(
                httpClient.get(`${ADMIN_ENDPOINTS.contacts}/${id}`),
            ),
        null,
        "Failed to fetch contact:",
    );
}

export async function updateContactStatus(
    id: string,
    data: { status: string; isRead?: boolean },
): Promise<any> {
    return unwrapData<any>(
        httpClient.patch(`${ADMIN_ENDPOINTS.contacts}/${id}/status`, data),
    );
}

export async function deleteContact(id: string): Promise<any> {
    return unwrapData<any>(
        httpClient.delete(`${ADMIN_ENDPOINTS.contacts}/${id}`),
    );
}
