import { adminApiClient } from "@/lib/axios/adminApiClient";
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
export async function getDashboardSummary(): Promise<IDashboardSummary | null> {
    try {
        return await adminApiClient.getDashboardSummary();
    } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        return null;
    }
}

export async function getCatalogStats(): Promise<ICatalogStats | null> {
    try {
        return await adminApiClient.getCatalogStats();
    } catch (error) {
        console.error("Failed to fetch catalog stats:", error);
        return null;
    }
}

export async function getOrderStats(): Promise<IOrderStats | null> {
    try {
        return await adminApiClient.getOrderStats();
    } catch (error) {
        console.error("Failed to fetch order stats:", error);
        return null;
    }
}

export async function getCustomerStats(): Promise<ICustomerStats | null> {
    try {
        return await adminApiClient.getCustomerStats();
    } catch (error) {
        console.error("Failed to fetch customer stats:", error);
        return null;
    }
}

// Admin Management Services
export async function getAllAdmins(
    searchTerm?: string,
    page: number = 1,
    limit: number = 10,
    isDeleted?: boolean,
): Promise<IAdminListResponse | null> {
    try {
        return await adminApiClient.getAllAdmins(
            searchTerm,
            page,
            limit,
            isDeleted,
        );
    } catch (error) {
        console.error("Failed to fetch admins:", error);
        return null;
    }
}

export async function getAdminById(id: string): Promise<IAdmin | null> {
    try {
        return await adminApiClient.getAdminById(id);
    } catch (error) {
        console.error("Failed to fetch admin:", error);
        return null;
    }
}

// Audit Log Services
export async function getAuditLogs(
    searchTerm?: string,
    page: number = 1,
    limit: number = 10,
): Promise<IAuditLogListResponse | null> {
    try {
        return await adminApiClient.getAuditLogs(searchTerm, page, limit);
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        return null;
    }
}

export async function getMyActivity(
    page: number = 1,
    limit: number = 10,
): Promise<IActivityFeedResponse | null> {
    try {
        return await adminApiClient.getMyActivity(page, limit);
    } catch (error) {
        console.error("Failed to fetch my activity:", error);
        return null;
    }
}

export async function getActivityTimeline(
    page: number = 1,
    limit: number = 10,
): Promise<IActivityFeedResponse | null> {
    try {
        return await adminApiClient.getActivityTimeline(page, limit);
    } catch (error) {
        console.error("Failed to fetch activity timeline:", error);
        return null;
    }
}

export async function getEntityAuditLogs(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 10,
): Promise<IAuditLogListResponse | null> {
    try {
        return await adminApiClient.getEntityAuditLogs(
            entityType,
            entityId,
            page,
            limit,
        );
    } catch (error) {
        console.error("Failed to fetch entity audit logs:", error);
        return null;
    }
}
