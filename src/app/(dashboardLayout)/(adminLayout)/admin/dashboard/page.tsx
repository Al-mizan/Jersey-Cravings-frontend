import AdminDashboardClient from "@/components/modules/Admin/Dashboard/AdminDashboardClient";
import { adminDashboardKeys } from "@/hooks/queries/adminQueryKeys";
import {
    getActivityTimeline,
    getCatalogStats,
    getCustomerStats,
    getDashboardSummary,
    getOrderStats,
} from "@/services/admin.service";
import type {
    IActivityFeedResponse,
    ICatalogStats,
    ICustomerStats,
    IDashboardSummary,
    IOrderStats,
} from "@/types/admin.types";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

const ACTIVITY_PAGE = 1;
const ACTIVITY_LIMIT = 10;

export default async function AdminDashboardPage() {
    const queryClient = new QueryClient();

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: adminDashboardKeys.summary(),
            queryFn: getDashboardSummary,
        }),
        queryClient.prefetchQuery({
            queryKey: adminDashboardKeys.catalogStats(),
            queryFn: getCatalogStats,
        }),
        queryClient.prefetchQuery({
            queryKey: adminDashboardKeys.orderStats(),
            queryFn: getOrderStats,
        }),
        queryClient.prefetchQuery({
            queryKey: adminDashboardKeys.customerStats(),
            queryFn: getCustomerStats,
        }),
        queryClient.prefetchQuery({
            queryKey: adminDashboardKeys.activityTimeline({
                page: ACTIVITY_PAGE,
                limit: ACTIVITY_LIMIT,
            }),
            queryFn: () => getActivityTimeline(ACTIVITY_PAGE, ACTIVITY_LIMIT),
        }),
    ]);

    const summary = queryClient.getQueryData<IDashboardSummary>(
        adminDashboardKeys.summary(),
    );
    const catalogStats = queryClient.getQueryData<ICatalogStats>(
        adminDashboardKeys.catalogStats(),
    );
    const orderStats = queryClient.getQueryData<IOrderStats>(
        adminDashboardKeys.orderStats(),
    );
    const customerStats = queryClient.getQueryData<ICustomerStats>(
        adminDashboardKeys.customerStats(),
    );
    const activityTimeline = queryClient.getQueryData<IActivityFeedResponse>(
        adminDashboardKeys.activityTimeline({
            page: ACTIVITY_PAGE,
            limit: ACTIVITY_LIMIT,
        }),
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminDashboardClient
                summary={summary}
                catalogStats={catalogStats}
                orderStats={orderStats}
                customerStats={customerStats}
                activityTimeline={activityTimeline}
            />
        </HydrationBoundary>
    );
}
