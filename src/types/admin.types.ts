// Admin & Governance Types

// Dashboard KPIs
export interface IDashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    activeProducts: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
}

export interface ICatalogStats {
    totalProducts: number;
    totalCategories: number;
    publishedProducts: number;
    draftProducts: number;
    archivedProducts: number;
    lowStockProducts: number;
}

export interface IOrderStats {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    todayOrders: number;
}

export interface ICustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    blockedCustomers: number;
    newCustomersThisMonth: number;
    loyaltyMembers: number;
    averageLifetimeValue: number;
}

// Admin Model
export interface IAdmin {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        email: string;
        role: "ADMIN" | "SUPER_ADMIN";
        status: "ACTIVE" | "BLOCKED" | "DELETED";
    };
}

export interface ICreateAdminPayload {
    password: string;
    role: "ADMIN" | "SUPER_ADMIN";
    admin: {
        name: string;
        email: string;
        contactNumber?: string;
        profilePhoto?: string;
    };
}

export interface IUpdateAdminPayload {
    name?: string;
    contactNumber?: string;
    profilePhoto?: string;
}

export interface IChangeUserStatusPayload {
    userId: string;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
}

export interface IChangeUserRolePayload {
    userId: string;
    role: "ADMIN" | "SUPER_ADMIN";
}

// Audit Log Model
export interface IAuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    admin?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface IActivityFeedItem {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    adminName: string;
    adminEmail: string;
    timestamp: string;
    description: string;
}

// API Response Types
export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IAdminListResponse extends IPaginatedResponse<IAdmin> {}
export interface IAuditLogListResponse extends IPaginatedResponse<IAuditLog> {}
export interface IActivityFeedResponse extends IPaginatedResponse<IActivityFeedItem> {}
