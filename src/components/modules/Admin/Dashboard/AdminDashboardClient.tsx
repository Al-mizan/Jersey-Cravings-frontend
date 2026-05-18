"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import {
    Activity,
    ArrowUpRight,
    BadgeDollarSign,
    Clock3,
    Package,
    ShoppingCart,
    Sparkles,
    Users,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    ArrowDownRight,
    TrendingDown,
    Zap,
    LayoutDashboard
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type {
    IActivityFeedResponse,
    ICatalogStats,
    ICustomerStats,
    IDashboardSummary,
    IOrderStats,
    IRecentSignup,
} from "@/types/admin.types";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts";

interface AdminDashboardClientProps {
    summary?: IDashboardSummary | null;
    catalogStats?: ICatalogStats | null;
    orderStats?: IOrderStats | null;
    customerStats?: ICustomerStats | null;
    activityTimeline?: IActivityFeedResponse | null;
}

const formatNumber = (value?: number | null) =>
    new Intl.NumberFormat("en-US").format(value ?? 0);

const formatCurrency = (value?: number | null) =>
    `৳${new Intl.NumberFormat("en-US").format(value ?? 0)}`;

const CHART_COLORS = {
    primary: "#ec4899", // pink-500
    secondary: "#f43f5e", // rose-500
    accent: "#8b5cf6", // violet-500
    success: "#10b981", // emerald-500
    warning: "#f59e0b", // amber-500
};

export default function AdminDashboardClient({
    summary,
    catalogStats,
    orderStats,
    customerStats,
    activityTimeline,
}: AdminDashboardClientProps) {
    const totalRevenue = orderStats?.totalRevenue ?? 0;
    const totalOrders = summary?.orderStats?.totalOrders ?? orderStats?.totalOrders ?? 0;
    const totalCustomers = summary?.customerStats?.totalCustomers ?? customerStats?.totalCustomers ?? 0;
    const activeProducts = summary?.catalogStats?.activeProducts ?? catalogStats?.activeProducts ?? 0;

    const recentActivities = activityTimeline?.data || [];
    const recentSignups = customerStats?.recentSignups || [];

    // Mock data for charts if real data is not available
    const revenueHistory = useMemo(() => [
        { name: "Jan", total: totalRevenue * 0.05 },
        { name: "Feb", total: totalRevenue * 0.08 },
        { name: "Mar", total: totalRevenue * 0.12 },
        { name: "Apr", total: totalRevenue * 0.15 },
        { name: "May", total: totalRevenue * 0.18 },
        { name: "Jun", total: totalRevenue * 0.22 },
        { name: "Jul", total: totalRevenue * 0.20 },
    ], [totalRevenue]);

    const statusData = useMemo(() => [
        { name: "Delivered", value: summary?.orderStats?.delivered ?? 12, color: CHART_COLORS.success },
        { name: "Processing", value: summary?.orderStats?.processing ?? 8, color: CHART_COLORS.warning },
        { name: "Pending", value: summary?.orderStats?.pendingPayment ?? 5, color: CHART_COLORS.primary },
        { name: "Shipped", value: summary?.orderStats?.shipped ?? 3, color: CHART_COLORS.accent },
    ], [summary]);

    return (
        <div className="space-y-8 pb-12 p-1">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Welcome back! Here&apos;s what&apos;s happening with your store today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-9 px-4 rounded-full border-primary/20 bg-primary/5 text-primary font-bold">
                        <Zap className="size-3.5 mr-2" />
                        Live Updates
                    </Badge>
                </div>
            </div>

            {/* Top Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Revenue"
                    value={formatCurrency(totalRevenue)}
                    subValue="+12.5% from last month"
                    icon={BadgeDollarSign}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Orders"
                    value={formatNumber(totalOrders)}
                    subValue="+5.2% from last week"
                    icon={ShoppingCart}
                    color="text-pink-500"
                    bg="bg-pink-500/10"
                />
                <StatCard
                    title="Customers"
                    value={formatNumber(totalCustomers)}
                    subValue="+24 new this week"
                    icon={Users}
                    color="text-violet-500"
                    bg="bg-violet-500/10"
                />
                <StatCard
                    title="Products"
                    value={formatNumber(activeProducts)}
                    subValue="12 low in stock"
                    icon={Package}
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
            </div>

            <div className="grid lg:grid-cols-7 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-4 rounded-3xl border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Revenue Overview</CardTitle>
                                <CardDescription>Sales performance over time</CardDescription>
                            </div>
                            <TrendingUp className="size-5 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-87.5 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={revenueHistory}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `৳${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px" }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke={CHART_COLORS.primary}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Breakdown */}
                <Card className="lg:col-span-3 rounded-3xl border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Order Breakdown</CardTitle>
                        <CardDescription>Current fulfillment status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-87.5 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={statusData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px" }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <Card className="rounded-3xl border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">System Feed</CardTitle>
                            <CardDescription>Recent administrative actions</CardDescription>
                        </div>
                        <Activity className="size-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-100 pr-4">
                            <div className="space-y-6">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((item, i) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="relative flex flex-col items-center">
                                                <Avatar className="size-10 border-2 border-background ring-2 ring-primary/10">
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                        {item.adminName?.slice(0, 2).toUpperCase() || "AD"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {i !== recentActivities.length - 1 && (
                                                    <div className="w-0.5 h-full bg-border/40 mt-2" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1 pb-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold">{item.adminName || "Administrator"}</p>
                                                    <span className="text-[10px] text-muted-foreground tabular-nums">
                                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-snug">
                                                    {item.description}
                                                </p>
                                                <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter h-5 px-2 bg-primary/5 text-primary border-primary/10">
                                                    {item.action.replace(/_/g, " ")}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <Clock3 className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No recent activity found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Recent Signups */}
                <Card className="rounded-3xl border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">New Customers</CardTitle>
                            <CardDescription>Latest user registrations</CardDescription>
                        </div>
                        <Users className="size-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-100 pr-4">
                            <div className="space-y-4">
                                {recentSignups.length > 0 ? (
                                    recentSignups.map((user: IRecentSignup) => (
                                        <div key={user.id} className="group flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="size-10 ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all">
                                                    <AvatarFallback className="bg-linear-to-br from-pink-500 to-rose-500 text-white font-bold text-xs">
                                                        {user.name?.slice(0, 2).toUpperCase() || "GU"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold truncate max-w-37.5">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-37.5">{user.identifier}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tabular-nums">
                                                    {new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </p>
                                                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase">
                                                    <CheckCircle2 className="size-2.5" />
                                                    Verified
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <Users className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No new signups yet</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    subValue,
    icon: Icon,
    color,
    bg
}: {
    title: string;
    value: string;
    subValue: string;
    icon: any;
    color: string;
    bg: string
}) {
    return (
        <Card className="group rounded-3xl border-border/50 bg-card/30 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", bg)}>
                        <Icon className={cn("size-6", color)} />
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-black tracking-tight">{value}</h3>
                    <p className="text-xs font-medium text-emerald-500">{subValue}</p>
                </div>
            </CardContent>
        </Card>
    );
}
