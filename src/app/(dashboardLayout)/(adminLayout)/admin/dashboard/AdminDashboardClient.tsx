"use client";

import KPICard from "@/components/modules/Dashboard/KPICard";
import {
    CatalogStatsCard,
    CustomerStatsCard,
    OrderStatsCard,
} from "@/components/modules/Dashboard/StatsCard";
import ActivityFeed from "@/components/modules/Dashboard/ActivityFeed";
import {
    getActivityTimeline,
    getCatalogStats,
    getCustomerStats,
    getDashboardSummary,
    getOrderStats,
} from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
} from "lucide-react";
import { adminDashboardKeys } from "@/hooks/queries/adminQueryKeys";
import {
    ADMIN_PAGINATION_DEFAULTS,
    ADMIN_STALE_TIMES,
    ADMIN_QUERY_DEFAULTS,
} from "@/config/adminPageDefaults";

export default function AdminDashboardClient() {
    const { data: summary } = useQuery({
        queryKey: adminDashboardKeys.summary(),
        queryFn: getDashboardSummary,
        staleTime: ADMIN_STALE_TIMES.dashboard,
    });

    const { data: catalogStats } = useQuery({
        queryKey: adminDashboardKeys.catalogStats(),
        queryFn: getCatalogStats,
        staleTime: ADMIN_STALE_TIMES.dashboard,
    });

    const { data: orderStats } = useQuery({
        queryKey: adminDashboardKeys.orderStats(),
        queryFn: getOrderStats,
        staleTime: ADMIN_STALE_TIMES.dashboard,
    });

    const { data: customerStats } = useQuery({
        queryKey: adminDashboardKeys.customerStats(),
        queryFn: getCustomerStats,
        staleTime: ADMIN_STALE_TIMES.dashboard,
    });

    const { data: activityFeed } = useQuery({
        queryKey: adminDashboardKeys.activityTimeline({
            page: ADMIN_PAGINATION_DEFAULTS.page,
            limit: ADMIN_PAGINATION_DEFAULTS.limit,
        }),
        queryFn: () =>
            getActivityTimeline(
                ADMIN_PAGINATION_DEFAULTS.page,
                ADMIN_PAGINATION_DEFAULTS.limit,
            ),
        staleTime: ADMIN_STALE_TIMES.dashboard,
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back! Here&apos;s an overview of your store
                    performance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Revenue"
                    value={summary?.totalRevenue.toLocaleString() || "—"}
                    prefix="৳"
                    trend={summary?.revenueGrowth}
                    description="vs last month"
                    icon={<TrendingUp className="h-4 w-4" />}
                />
                <KPICard
                    title="Total Orders"
                    value={summary?.totalOrders || "—"}
                    trend={summary?.orderGrowth}
                    description="vs last month"
                    icon={<ShoppingCart className="h-4 w-4" />}
                />
                <KPICard
                    title="Total Customers"
                    value={summary?.totalCustomers || "—"}
                    trend={summary?.customerGrowth}
                    description="vs last month"
                    icon={<Users className="h-4 w-4" />}
                />
                <KPICard
                    title="Active Products"
                    value={summary?.activeProducts || "—"}
                    icon={<Package className="h-4 w-4" />}
                    description="Ready for sale"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CatalogStatsCard stats={catalogStats} />
                <OrderStatsCard stats={orderStats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityFeed
                        activities={activityFeed?.data || null}
                        maxItems={8}
                    />
                </div>
                <CustomerStatsCard stats={customerStats} />
            </div>
        </div>
    );
}
