import { httpClient } from "./httpClient";
import type {
    IAdmin,
    IAdminListResponse,
    IAuditLog,
    IAuditLogListResponse,
    IActivityFeedResponse,
    ICatalogStats,
    ICustomerStats,
    IDashboardSummary,
    IOrderStats,
    ICreateAdminPayload,
    IUpdateAdminPayload,
    IChangeUserStatusPayload,
    IChangeUserRolePayload,
} from "@/types/admin.types";
import type { IApiResponse } from "@/types/auth.types";

class AdminApiClient {
    // Dashboard Endpoints
    async getDashboardSummary(): Promise<IDashboardSummary> {
        const { data } =
            await httpClient.get<IApiResponse<IDashboardSummary>>(
                "/dashboard/summary",
            );
        return data.data;
    }

    async getCatalogStats(): Promise<ICatalogStats> {
        const { data } =
            await httpClient.get<IApiResponse<ICatalogStats>>(
                "/dashboard/catalog",
            );
        return data.data;
    }

    async getOrderStats(): Promise<IOrderStats> {
        const { data } =
            await httpClient.get<IApiResponse<IOrderStats>>(
                "/dashboard/orders",
            );
        return data.data;
    }

    async getCustomerStats(): Promise<ICustomerStats> {
        const { data } = await httpClient.get<IApiResponse<ICustomerStats>>(
            "/dashboard/customers",
        );
        return data.data;
    }

    // Admin Management Endpoints
    async getAllAdmins(
        searchTerm?: string,
        page: number = 1,
        limit: number = 10,
        isDeleted?: boolean,
    ): Promise<IAdminListResponse> {
        const params = new URLSearchParams();
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (isDeleted !== undefined)
            params.append("isDeleted", String(isDeleted));

        const { data } = await httpClient.get<IApiResponse<IAdminListResponse>>(
            `/admins?${params.toString()}`,
        );
        return data.data;
    }

    async getAdminById(id: string): Promise<IAdmin> {
        const { data } = await httpClient.get<IApiResponse<IAdmin>>(
            `/admins/${id}`,
        );
        return data.data;
    }

    async createAdmin(payload: ICreateAdminPayload): Promise<IAdmin> {
        const { data } = await httpClient.post<IApiResponse<IAdmin>>(
            "/admins",
            payload,
        );
        return data.data;
    }

    async updateAdmin(
        id: string,
        payload: IUpdateAdminPayload,
    ): Promise<IAdmin> {
        const { data } = await httpClient.patch<IApiResponse<IAdmin>>(
            `/admins/${id}`,
            payload,
        );
        return data.data;
    }

    async deleteAdmin(id: string): Promise<void> {
        await httpClient.delete(`/admins/${id}`);
    }

    // User Management Endpoints
    async changeUserStatus(
        payload: IChangeUserStatusPayload,
    ): Promise<{ message: string }> {
        const { data } = await httpClient.patch<
            IApiResponse<{ message: string }>
        >("/admins/user/status", payload);
        return data.data;
    }

    async changeUserRole(payload: IChangeUserRolePayload): Promise<void> {
        await httpClient.patch("/admins/user/role", payload);
    }

    // Audit Log Endpoints
    async getAuditLogs(
        searchTerm?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<IAuditLogListResponse> {
        const params = new URLSearchParams();
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const { data } = await httpClient.get<
            IApiResponse<IAuditLogListResponse>
        >(`/audit-logs?${params.toString()}`);
        return data.data;
    }

    async getAuditLogById(id: string): Promise<IAuditLog> {
        const { data } = await httpClient.get<IApiResponse<IAuditLog>>(
            `/audit-logs/${id}`,
        );
        return data.data;
    }

    async getMyActivity(
        page: number = 1,
        limit: number = 10,
    ): Promise<IActivityFeedResponse> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const { data } = await httpClient.get<
            IApiResponse<IActivityFeedResponse>
        >(`/audit-logs/my-activity?${params.toString()}`);
        return data.data;
    }

    async getActivityTimeline(
        page: number = 1,
        limit: number = 10,
    ): Promise<IActivityFeedResponse> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const { data } = await httpClient.get<
            IApiResponse<IActivityFeedResponse>
        >(`/audit-logs/timeline?${params.toString()}`);
        return data.data;
    }

    async getEntityAuditLogs(
        entityType: string,
        entityId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<IAuditLogListResponse> {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const { data } = await httpClient.get<
            IApiResponse<IAuditLogListResponse>
        >(`/audit-logs/${entityType}/${entityId}?${params.toString()}`);
        return data.data;
    }
}

export const adminApiClient = new AdminApiClient();
