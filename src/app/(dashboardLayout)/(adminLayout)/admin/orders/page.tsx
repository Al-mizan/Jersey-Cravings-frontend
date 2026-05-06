import { createServerQueryClient } from "@/lib/queryClient";
import { getAllOrders } from "@/services/order.services";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { adminOrderKeys } from "@/hooks/queries/adminQueryKeys";
import AdminOrdersPageClient from "./AdminOrdersPageClient";

export default async function AdminOrdersPage() {
    const queryClient = createServerQueryClient();

    await queryClient.prefetchQuery({
        queryKey: adminOrderKeys.list({
            searchTerm: "",
            status: undefined,
            paymentStatus: undefined,
            page: 1,
            limit: 10,
        }),
        queryFn: () =>
            getAllOrders(undefined, undefined, undefined, undefined, 1, 10),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminOrdersPageClient />
        </HydrationBoundary>
    );
}
