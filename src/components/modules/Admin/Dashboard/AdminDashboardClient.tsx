"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import OrderBarChart from "@/components/shared/OrderBarChart";
import OrderPieChart from "@/components/shared/OrderPieChart";
import StatsCard from "@/components/shared/StatsCard";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
    IActivityFeedResponse,
    ICatalogStats,
    ICustomerStats,
    IDashboardSummary,
    IOrderStats,
} from "@/types/admin.types";
import type { BarChartData, PieChartData } from "@/types/dashboard.types";
import {
    Activity,
    ArrowUpRight,
    BadgeDollarSign,
    Boxes,
    Clock3,
    Package,
    ShoppingCart,
    Sparkles,
    Users,
    WandSparkles,
} from "lucide-react";
import KPICard from "./KPICard";

interface AdminDashboardClientProps {
    summary?: IDashboardSummary | null;
    catalogStats?: ICatalogStats | null;
    orderStats?: IOrderStats | null;
    customerStats?: ICustomerStats | null;
    activityTimeline?: IActivityFeedResponse | null;
}

type Tone = "amber" | "emerald" | "sky" | "rose" | "slate";

const formatNumber = (value?: number | null) =>
    new Intl.NumberFormat("en-US").format(value ?? 0);

const formatCurrency = (value?: number | null) =>
    `৳${new Intl.NumberFormat("en-US").format(value ?? 0)}`;

const formatStatus = (value: string) =>
    value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());

const getInitials = (value: string) =>
    value
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "?";

const getToneClasses = (tone: Tone) => {
    switch (tone) {
        case "emerald":
            return "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20";
        case "sky":
            return "bg-sky-500/10 text-sky-600 ring-sky-500/20";
        case "rose":
            return "bg-rose-500/10 text-rose-600 ring-rose-500/20";
        case "amber":
            return "bg-amber-500/10 text-amber-700 ring-amber-500/20";
        default:
            return "bg-slate-500/10 text-slate-700 ring-slate-500/20";
    }
};

const getBarTone = (tone: Tone) => {
    switch (tone) {
        case "emerald":
            return "bg-emerald-500";
        case "sky":
            return "bg-sky-500";
        case "rose":
            return "bg-rose-500";
        case "amber":
            return "bg-amber-500";
        default:
            return "bg-slate-500";
    }
};

const getProgressValue = (value: number, total: number) =>
    total > 0 ? Math.max(4, Math.round((value / total) * 100)) : 0;

function SectionStat({
    label,
    value,
    tone = "slate",
}: {
    label: string;
    value: number;
    tone?: Tone;
}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {label}
            </div>
            <div className="mt-1 flex items-end justify-between gap-3">
                <div className="text-2xl font-semibold tracking-tight">
                    {formatNumber(value)}
                </div>
                <span
                    className={cn(
                        "rounded-full px-2 py-1 text-[10px] font-medium ring-1",
                        getToneClasses(tone),
                    )}
                >
                    Live
                </span>
            </div>
        </div>
    );
}

function StatusBarRow({
    label,
    value,
    total,
    tone,
}: {
    label: string;
    value: number;
    total: number;
    tone: Tone;
}) {
    const percent = getProgressValue(value, total);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">
                    {formatNumber(value)}
                    {total > 0 ? ` • ${percent}%` : ""}
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className={cn("h-full rounded-full", getBarTone(tone))}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

function ActivityChip({ action, count }: { action: string; count: number }) {
    const tone: Tone = action.includes("DELETE")
        ? "rose"
        : action.includes("UPDATE") || action.includes("EDIT")
          ? "sky"
          : action.includes("CREATE") || action.includes("ADD")
            ? "emerald"
            : "amber";

    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
            <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {action}
                </div>
                <div className="mt-1 text-sm font-medium text-foreground/90">
                    Most common action
                </div>
            </div>
            <Badge
                variant="outline"
                className={cn("rounded-full", getToneClasses(tone))}
            >
                {formatNumber(count)}
            </Badge>
        </div>
    );
}

export default function AdminDashboardClient({
    summary,
    catalogStats,
    orderStats,
    customerStats,
    activityTimeline,
}: AdminDashboardClientProps) {
    const dashboardCatalog = summary?.catalogStats;
    const dashboardOrders = summary?.orderStats;
    const dashboardCustomers = summary?.customerStats;
    const dashboardAudit = summary?.auditStats;

    const totalRevenue = orderStats?.totalRevenue ?? 0;

    const catalogStatusRows = dashboardCatalog
        ? [
              {
                  label: "Active products",
                  value: dashboardCatalog.activeProducts,
                  tone: "emerald" as const,
              },
              {
                  label: "Draft products",
                  value: dashboardCatalog.draftProducts,
                  tone: "amber" as const,
              },
              {
                  label: "Archived products",
                  value: dashboardCatalog.archivedProducts,
                  tone: "slate" as const,
              },
          ]
        : (catalogStats?.productsByStatus ?? []).map((item) => ({
              label: formatStatus(item.status),
              value: item.count,
              tone: item.status.includes("ACTIVE")
                  ? ("emerald" as const)
                  : item.status.includes("DRAFT")
                    ? ("amber" as const)
                    : ("slate" as const),
          }));

    const orderStatusRows = dashboardOrders
        ? [
              {
                  label: "Pending payment",
                  value: dashboardOrders.pendingPayment,
                  tone: "amber" as const,
              },
              {
                  label: "Paid",
                  value: dashboardOrders.paid,
                  tone: "emerald" as const,
              },
              {
                  label: "Processing",
                  value: dashboardOrders.processing,
                  tone: "sky" as const,
              },
              {
                  label: "Shipped",
                  value: dashboardOrders.shipped,
                  tone: "slate" as const,
              },
              {
                  label: "Delivered",
                  value: dashboardOrders.delivered,
                  tone: "emerald" as const,
              },
          ]
        : (orderStats?.ordersByStatus ?? []).map((item) => ({
              label: formatStatus(item.status),
              value: item.count,
              tone: item.status.includes("PENDING")
                  ? ("amber" as const)
                  : item.status.includes("PAID") ||
                      item.status.includes("DELIVERED")
                    ? ("emerald" as const)
                    : item.status.includes("PROCESS")
                      ? ("sky" as const)
                      : ("slate" as const),
          }));

    const catalogBreakdownTotal =
        catalogStatusRows.reduce((sum, item) => sum + item.value, 0) ||
        catalogStats?.products ||
        dashboardCatalog?.totalProducts ||
        0;

    const orderBreakdownTotal =
        orderStatusRows.reduce((sum, item) => sum + item.value, 0) ||
        dashboardOrders?.totalOrders ||
        orderStats?.totalOrders ||
        0;

    const recentSignups = customerStats?.recentSignups ?? [];
    const recentActivities = activityTimeline?.data ?? [];
    const recentAuditActions = dashboardAudit?.recentActions ?? [];
    const overviewStats = [
        {
            title: "Categories",
            value: formatNumber(
                dashboardCatalog?.totalCategories ?? catalogStats?.categories ?? 0,
            ),
            iconName: "Boxes",
            description: "Catalog groups currently available",
        },
        {
            title: "Variants",
            value: formatNumber(catalogStats?.variants ?? 0),
            iconName: "ListOrdered",
            description: "Product options ready for checkout",
        },
        {
            title: "Audit Events",
            value: formatNumber(dashboardAudit?.totalActions ?? 0),
            iconName: "Activity",
            description: "Admin actions tracked in the system",
        },
        {
            title: "Recent Signups",
            value: formatNumber(recentSignups.length),
            iconName: "UserPlus",
            description: "New customers in latest payload",
        },
    ];

    const summaryCards = [
        {
            title: "Revenue",
            value: formatCurrency(totalRevenue),
            description: "Delivered orders only",
            icon: <BadgeDollarSign className="size-5" />,
            trend:
                orderBreakdownTotal > 0
                    ? Number(
                          (
                              ((dashboardOrders?.delivered ?? 0) /
                                  orderBreakdownTotal) *
                              100
                          ).toFixed(1),
                      )
                    : undefined,
            trendDescription: "delivered share",
            tone: "amber" as const,
        },
        {
            title: "Orders",
            value: formatNumber(
                dashboardOrders?.totalOrders ?? orderStats?.totalOrders,
            ),
            description: "Live order volume",
            icon: <ShoppingCart className="size-5" />,
            trend:
                orderBreakdownTotal > 0
                    ? Number(
                          (
                              ((dashboardOrders?.pendingPayment ?? 0) /
                                  orderBreakdownTotal) *
                              100
                          ).toFixed(1),
                      )
                    : undefined,
            trendDescription: "pending payments",
            tone: "sky" as const,
        },
        {
            title: "Customers",
            value: formatNumber(
                dashboardCustomers?.totalCustomers ??
                    customerStats?.totalCustomers,
            ),
            description: "Active storefront audience",
            icon: <Users className="size-5" />,
            trend:
                (dashboardCustomers?.blockedCustomers ??
                    customerStats?.blockedCustomers ??
                    0) > 0
                    ? -Number(
                          (
                              ((dashboardCustomers?.blockedCustomers ??
                                  customerStats?.blockedCustomers ??
                                  0) /
                                  Math.max(
                                      dashboardCustomers?.totalCustomers ??
                                          customerStats?.totalCustomers ??
                                          0,
                                      1,
                                  )) *
                              100
                          ).toFixed(1),
                      )
                    : undefined,
            trendDescription: "blocked users",
            tone: "emerald" as const,
        },
        {
            title: "Products",
            value: formatNumber(
                dashboardCatalog?.activeProducts ??
                    catalogStats?.activeProducts ??
                    0,
            ),
            description: "Ready for sale",
            icon: <Package className="size-5" />,
            trend:
                catalogBreakdownTotal > 0
                    ? Number(
                          (
                              ((dashboardCatalog?.activeProducts ?? 0) /
                                  catalogBreakdownTotal) *
                              100
                          ).toFixed(1),
                      )
                    : undefined,
            trendDescription: "active stock mix",
            tone: "rose" as const,
        },
    ];
    const orderPieData: PieChartData[] = orderStatusRows.map((item) => ({
        status: item.label.toUpperCase().replace(/\s+/g, "_"),
        count: item.value,
    }));
    const catalogBarData: BarChartData[] = catalogStatusRows.map((item) => ({
        month: item.label,
        count: item.value,
    }));

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(20,18,16,0.98)_0%,rgba(55,40,29,0.98)_48%,rgba(124,45,18,0.96)_100%)] px-6 py-8 text-white shadow-[0_24px_80px_-24px_rgba(120,53,15,0.45)] md:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.16),transparent_28%)]" />
                <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] xl:items-end">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-medium text-amber-100 backdrop-blur">
                            <Sparkles className="size-3.5" />
                            Live admin overview
                        </div>
                        <div className="space-y-3">
                            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                                Jersey Cravings command center.
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-white/75 md:text-base">
                                Track the storefront at a glance with revenue,
                                catalog, order, customer, and audit signals in a
                                single high-signal dashboard.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-white/75">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
                                <Clock3 className="size-3.5" />
                                SSR hydrated snapshot
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
                                <Activity className="size-3.5" />
                                Audit trail:{" "}
                                {formatNumber(
                                    dashboardAudit?.totalActions,
                                )}{" "}
                                actions
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-4 backdrop-blur-xl md:grid-cols-2 xl:grid-cols-1">
                        <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                            <div>
                                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                                    Revenue
                                </div>
                                <div className="mt-1 text-2xl font-semibold">
                                    {formatCurrency(totalRevenue)}
                                </div>
                            </div>
                            <ArrowUpRight className="size-5 text-amber-200" />
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                            <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                                Catalog
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                <span>Products</span>
                                <span className="font-semibold">
                                    {formatNumber(
                                        dashboardCatalog?.totalProducts ??
                                            catalogStats?.products,
                                    )}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                <span>Variants</span>
                                <span className="font-semibold">
                                    {formatNumber(catalogStats?.variants)}
                                </span>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                            <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                                Customers
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                <span>Active</span>
                                <span className="font-semibold">
                                    {formatNumber(
                                        dashboardCustomers?.activeCustomers ??
                                            customerStats?.activeCustomers,
                                    )}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                <span>Blocked</span>
                                <span className="font-semibold text-white/80">
                                    {formatNumber(
                                        dashboardCustomers?.blockedCustomers ??
                                            customerStats?.blockedCustomers,
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                            <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                                Activity
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                <span>Top action</span>
                                <span className="font-semibold">
                                    {recentAuditActions[0]
                                        ? formatStatus(
                                              recentAuditActions[0].action,
                                          )
                                        : "None"}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                <span>Events</span>
                                <span className="font-semibold">
                                    {formatNumber(recentAuditActions.length)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                    <KPICard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        trend={card.trend}
                        description={
                            card.trend ? card.trendDescription : card.description
                        }
                    />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {overviewStats.map((stat) => (
                    <StatsCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        iconName={stat.iconName}
                        description={stat.description}
                    />
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-7">
                    <OrderBarChart data={catalogBarData} />
                </div>
                <div className="xl:col-span-5">
                    <OrderPieChart
                        data={orderPieData}
                        title="Order distribution"
                        description="Current order statuses by volume"
                    />
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-12">
                <Card className="xl:col-span-7">
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle>Catalog health</CardTitle>
                                <CardDescription>
                                    Product and category distribution across the
                                    store.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1"
                            >
                                <Boxes className="mr-1.5 size-3.5" />
                                {formatNumber(
                                    dashboardCatalog?.totalCategories ??
                                        catalogStats?.categories,
                                )}{" "}
                                categories
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <SectionStat
                                label="Categories"
                                value={
                                    dashboardCatalog?.totalCategories ??
                                    catalogStats?.categories ??
                                    0
                                }
                                tone="amber"
                            />
                            <SectionStat
                                label="Products"
                                value={
                                    dashboardCatalog?.totalProducts ??
                                    catalogStats?.products ??
                                    0
                                }
                                tone="sky"
                            />
                            <SectionStat
                                label="Variants"
                                value={catalogStats?.variants ?? 0}
                                tone="emerald"
                            />
                            <SectionStat
                                label="Active categories"
                                value={dashboardCatalog?.activeCategories ?? 0}
                                tone="rose"
                            />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">
                                        Product status mix
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        A quick read on how inventory is
                                        currently shaped.
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                >
                                    Total {formatNumber(catalogBreakdownTotal)}
                                </Badge>
                            </div>

                            {catalogStatusRows.length > 0 ? (
                                <div className="space-y-4">
                                    {catalogStatusRows.map((item) => (
                                        <StatusBarRow
                                            key={item.label}
                                            label={item.label}
                                            value={item.value}
                                            total={catalogBreakdownTotal}
                                            tone={item.tone}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
                                    No catalog status data yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-5">
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle>Order pulse</CardTitle>
                                <CardDescription>
                                    Revenue and fulfillment flow across the
                                    order lifecycle.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1"
                            >
                                <BadgeDollarSign className="mr-1.5 size-3.5" />
                                {formatCurrency(totalRevenue)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <SectionStat
                                label="Total orders"
                                value={
                                    dashboardOrders?.totalOrders ??
                                    orderStats?.totalOrders ??
                                    0
                                }
                                tone="amber"
                            />
                            <SectionStat
                                label="Delivered"
                                value={dashboardOrders?.delivered ?? 0}
                                tone="emerald"
                            />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">
                                        Order status mix
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Status distribution from pending payment
                                        to delivered.
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                >
                                    Total {formatNumber(orderBreakdownTotal)}
                                </Badge>
                            </div>

                            {orderStatusRows.length > 0 ? (
                                <div className="space-y-4">
                                    {orderStatusRows.map((item) => (
                                        <StatusBarRow
                                            key={item.label}
                                            label={item.label}
                                            value={item.value}
                                            total={orderBreakdownTotal}
                                            tone={item.tone}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
                                    No order status data yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-12">
                <Card className="xl:col-span-7">
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle>Customer pulse</CardTitle>
                                <CardDescription>
                                    Active users, blocked accounts, and the
                                    latest signups.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1"
                            >
                                <Users className="mr-1.5 size-3.5" />
                                {formatNumber(
                                    dashboardCustomers?.totalCustomers ??
                                        customerStats?.totalCustomers,
                                )}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-3 md:grid-cols-3">
                            <SectionStat
                                label="Active customers"
                                value={
                                    dashboardCustomers?.activeCustomers ??
                                    customerStats?.activeCustomers ??
                                    0
                                }
                                tone="emerald"
                            />
                            <SectionStat
                                label="Blocked customers"
                                value={
                                    dashboardCustomers?.blockedCustomers ??
                                    customerStats?.blockedCustomers ??
                                    0
                                }
                                tone="rose"
                            />
                            <SectionStat
                                label="Deleted customers"
                                value={
                                    dashboardCustomers?.deletedCustomers ?? 0
                                }
                                tone="slate"
                            />
                        </div>

                        <Separator />

                        <div>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">
                                        Recent signups
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        The freshest customer accounts in the
                                        system.
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                >
                                    {formatNumber(recentSignups.length)} users
                                </Badge>
                            </div>

                            {recentSignups.length > 0 ? (
                                <ScrollArea className="h-70 pr-4">
                                    <div className="space-y-3">
                                        {recentSignups.map((customer) => (
                                            <div
                                                key={customer.id}
                                                className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:bg-muted/40"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <Avatar className="size-10">
                                                        <AvatarFallback className="bg-amber-500/10 text-amber-700">
                                                            {getInitials(
                                                                customer.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">
                                                            {customer.name}
                                                        </div>
                                                        <div className="truncate text-sm text-muted-foreground">
                                                            {customer.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock3 className="size-3.5" />
                                                    {new Date(
                                                        customer.createdAt,
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
                                    No customer signups yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-5">
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle>Audit activity</CardTitle>
                                <CardDescription>
                                    The most common actions and the latest
                                    timeline snapshot.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="rounded-full px-3 py-1"
                            >
                                <WandSparkles className="mr-1.5 size-3.5" />
                                {formatNumber(
                                    dashboardAudit?.totalActions,
                                )}{" "}
                                actions
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-3">
                            {recentAuditActions.length > 0 ? (
                                recentAuditActions
                                    .slice(0, 4)
                                    .map((item) => (
                                        <ActivityChip
                                            key={item.action}
                                            action={item.action}
                                            count={item.count}
                                        />
                                    ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
                                    No audit activity yet.
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">
                                        Recent timeline
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Latest system events pulled from the
                                        activity feed.
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                >
                                    {formatNumber(recentActivities.length)}{" "}
                                    events
                                </Badge>
                            </div>

                            {recentActivities.length > 0 ? (
                                <ScrollArea className="h-70 pr-4">
                                    <div className="space-y-3">
                                        {recentActivities.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-4"
                                            >
                                                <Avatar className="size-9">
                                                    <AvatarFallback className="bg-slate-500/10 text-slate-700">
                                                        {getInitials(
                                                            item.adminName,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-medium">
                                                            {item.adminName}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full"
                                                        >
                                                            {formatStatus(
                                                                item.action,
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            item.timestamp,
                                                        ).toLocaleString(
                                                            undefined,
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
                                    No activity timeline available.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
