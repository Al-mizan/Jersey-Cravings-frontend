"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
    ICatalogStats,
    IOrderStats,
    ICustomerStats,
} from "@/types/admin.types";

interface StatRowProps {
    label: string;
    value: string | number;
    subtext?: string;
}

const StatRow = ({ label, value, subtext }: StatRowProps) => (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
        <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            {subtext && (
                <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
        </div>
        <p className="text-sm font-semibold text-primary">{value}</p>
    </div>
);

// Catalog Stats Component
interface CatalogStatsProps {
    stats: ICatalogStats | null | undefined;
    isLoading?: boolean;
}

export const CatalogStatsCard = ({ stats, isLoading }: CatalogStatsProps) => {
    if (isLoading)
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Catalog Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8" />
                    ))}
                </CardContent>
            </Card>
        );

    if (!stats)
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Catalog Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Failed to load stats
                    </p>
                </CardContent>
            </Card>
        );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Catalog Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
                <StatRow label="Total Products" value={stats.totalProducts} />
                <StatRow
                    label="Total Categories"
                    value={stats.totalCategories}
                />
                <StatRow
                    label="Published Products"
                    value={stats.publishedProducts}
                />
                <StatRow label="Draft Products" value={stats.draftProducts} />
                <StatRow
                    label="Archived Products"
                    value={stats.archivedProducts}
                />
                <StatRow
                    label="Low Stock Products"
                    value={stats.lowStockProducts}
                    subtext="Less than 10 units"
                />
            </CardContent>
        </Card>
    );
};

// Order Stats Component
interface OrderStatsProps {
    stats: IOrderStats | null | undefined;
    isLoading?: boolean;
}

export const OrderStatsCard = ({ stats, isLoading }: OrderStatsProps) => {
    if (isLoading)
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Order Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8" />
                    ))}
                </CardContent>
            </Card>
        );

    if (!stats)
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Order Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Failed to load stats
                    </p>
                </CardContent>
            </Card>
        );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Order Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
                <StatRow label="Total Orders" value={stats.totalOrders} />
                <StatRow
                    label="Pending Orders"
                    value={stats.pendingOrders}
                    subtext="Awaiting fulfillment"
                />
                <StatRow
                    label="Completed Orders"
                    value={stats.completedOrders}
                />
                <StatRow
                    label="Cancelled Orders"
                    value={stats.cancelledOrders}
                />
                <StatRow
                    label="Total Revenue"
                    value={`৳${stats.totalRevenue.toLocaleString()}`}
                />
                <StatRow
                    label="Avg Order Value"
                    value={`৳${stats.averageOrderValue.toLocaleString()}`}
                />
            </CardContent>
        </Card>
    );
};

// Customer Stats Component
interface CustomerStatsProps {
    stats: ICustomerStats | null | undefined;
    isLoading?: boolean;
}

export const CustomerStatsCard = ({ stats, isLoading }: CustomerStatsProps) => {
    if (isLoading)
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Customer Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8" />
                    ))}
                </CardContent>
            </Card>
        );

    if (!stats)
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Customer Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Failed to load stats
                    </p>
                </CardContent>
            </Card>
        );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Customer Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
                <StatRow label="Total Customers" value={stats.totalCustomers} />
                <StatRow
                    label="Active Customers"
                    value={stats.activeCustomers}
                />
                <StatRow
                    label="Blocked Customers"
                    value={stats.blockedCustomers}
                />
                <StatRow
                    label="New Customers"
                    value={stats.newCustomersThisMonth}
                    subtext="This month"
                />
                <StatRow label="Loyalty Members" value={stats.loyaltyMembers} />
                <StatRow
                    label="Avg Lifetime Value"
                    value={`৳${stats.averageLifetimeValue.toLocaleString()}`}
                />
            </CardContent>
        </Card>
    );
};
