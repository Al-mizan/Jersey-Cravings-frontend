import { adminApiClient } from "@/lib/axios/adminApiClient";
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

// Dashboard Services
export async function getDashboardSummary(): Promise<IDashboardSummary  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getDashboardSummary(),
        null,
        "Failed to fetch dashboard summary:",
    );
}

export async function getCatalogStats(): Promise<ICatalogStats  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getCatalogStats(),
        null,
        "Failed to fetch catalog stats:",
    );
}

export async function getOrderStats(): Promise<IOrderStats  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getOrderStats(),
        null,
        "Failed to fetch order stats:",
    );
}

export async function getCustomerStats(): Promise<ICustomerStats  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getCustomerStats(),
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
): Promise<IAdminListResponse  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getAllAdmins(searchTerm, page, limit, isDeleted),
        null,
        "Failed to fetch admins:",
    );
}

export async function getAdminById(id: string): Promise<IAdmin  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getAdminById(id),
        null,
        "Failed to fetch admin:",
    );
}

// Audit Log Services
export async function getAuditLogs(
    searchTerm?: string,
    page: number = 1,
    limit: number = 10,
): Promise<IAuditLogListResponse  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getAuditLogs(searchTerm, page, limit),
        null,
        "Failed to fetch audit logs:",
    );
}

export async function getMyActivity(
    page: number = 1,
    limit: number = 10,
): Promise<IActivityFeedResponse  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getMyActivity(page, limit),
        null,
        "Failed to fetch my activity:",
    );
}

export async function getActivityTimeline(
    page: number = 1,
    limit: number = 10,
): Promise<IActivityFeedResponse  | null | undefined> {
    return safeServiceCall(
        () => adminApiClient.getActivityTimeline(page, limit),
        null,
        "Failed to fetch activity timeline:",
    );
}

export async function getEntityAuditLogs(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 10,
): Promise<IAuditLogListResponse  | null | undefined> {
    return safeServiceCall(
        () =>
            adminApiClient.getEntityAuditLogs(
                entityType,
                entityId,
                page,
                limit,
            ),
        null,
        "Failed to fetch entity audit logs:",
    );
}
