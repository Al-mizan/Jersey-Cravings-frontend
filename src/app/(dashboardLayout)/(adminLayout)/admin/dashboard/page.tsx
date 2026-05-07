import { createServerQueryClient } from "@/lib/api";
import {
    getActivityTimeline,
    getCatalogStats,
    getCustomerStats,
    getDashboardSummary,
    getOrderStats,
} from "@/services/admin.services";
import { adminDashboardKeys } from "@/hooks/queries/adminQueryKeys";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AdminDashboardClient from "./AdminDashboardClient";

const ACTIVITY_PAGE = 1;
const ACTIVITY_LIMIT = 10;

export default async function AdminDashboardPage() {
    const queryClient = createServerQueryClient();

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

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminDashboardClient />
        </HydrationBoundary>
    );
}
