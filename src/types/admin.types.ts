// Admin & Governance Types

export interface IDashboardStatusCount {
    status: string;
    count: number;
}

export interface IRecentSignup {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface IRecentAction {
    action: string;
    count: number;
}

// Dashboard KPIs
export interface IDashboardSummary {
    catalogStats?: {
        totalCategories: number;
        activeCategories: number;
        totalProducts: number;
        activeProducts: number;
        draftProducts: number;
        archivedProducts: number;
    };
    orderStats?: {
        totalOrders: number;
        pendingPayment: number;
        paid: number;
        processing: number;
        shipped: number;
        delivered: number;
    };
    customerStats?: {
        totalCustomers: number;
        activeCustomers: number;
        blockedCustomers: number;
        deletedCustomers: number;
    };
    auditStats?: {
        totalActions: number;
        recentActions: IRecentAction[];
    };
}

export interface ICatalogStats {
    totalCategories?: number;
    activeCategories?: number;
    totalProducts?: number;
    activeProducts?: number;
    draftProducts?: number;
    archivedProducts?: number;
    categories?: number;
    products?: number;
    variants?: number;
    productsByStatus?: IDashboardStatusCount[];
}

export interface IOrderStats {
    totalOrders?: number;
    pendingPayment?: number;
    paid?: number;
    processing?: number;
    shipped?: number;
    delivered?: number;
    totalRevenue?: number;
    ordersByStatus?: IDashboardStatusCount[];
}

export interface ICustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    blockedCustomers: number;
    deletedCustomers?: number;
    recentSignups?: IRecentSignup[];
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
