import AdminCustomersPageClient from "@/components/modules/Admin/Customer/AdminCustomersPageClient";
import { adminCustomerKeys } from "@/hooks/queries/adminQueryKeys";
import { getAllCustomers } from "@/services/customer.service";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

const INITIAL_PAGE = 1;
const INITIAL_LIMIT = 10;

export default async function AdminCustomersPage() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: adminCustomerKeys.list({
            searchTerm: undefined,
            page: INITIAL_PAGE,
            limit: INITIAL_LIMIT,
            isDeleted: false,
            sortBy: "createdAt",
            sortOrder: "desc",
        }),
        queryFn: () =>
            getAllCustomers(
                undefined,
                INITIAL_PAGE,
                INITIAL_LIMIT,
                false,
                "createdAt",
                "desc",
            ),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminCustomersPageClient />
        </HydrationBoundary>
    );
}
