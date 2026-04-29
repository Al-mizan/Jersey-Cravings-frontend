import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import KPICard from "@/components/modules/Dashboard/KPICard";
import {
    CatalogStatsCard,
    OrderStatsCard,
    CustomerStatsCard,
} from "@/components/modules/Dashboard/StatsCard";
import ActivityFeed from "@/components/modules/Dashboard/ActivityFeed";
import {
    getDashboardSummary,
    getCatalogStats,
    getOrderStats,
    getCustomerStats,
    getActivityTimeline,
} from "@/services/admin.services";
import {
    TrendingUp,
    ShoppingCart,
    Users,
    Package,
    Activity,
} from "lucide-react";

export default async function AdminDashboardPage() {
    // Fetch all data in parallel
    const [summary, catalogStats, orderStats, customerStats, activityFeed] =
        await Promise.all([
            getDashboardSummary(),
            getCatalogStats(),
            getOrderStats(),
            getCustomerStats(),
            getActivityTimeline(1, 10),
        ]);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back! Here's an overview of your store performance.
                </p>
            </div>

            {/* KPI Cards */}
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

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CatalogStatsCard stats={catalogStats} />
                <OrderStatsCard stats={orderStats} />
            </div>

            {/* Bottom Section */}
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
