import { createServerQueryClient } from "@/lib/queryClient";
import { getAllAdmins } from "@/services/admin.services";
import type { IAdminListResponse } from "@/types/admin.types";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { adminUserKeys } from "@/hooks/queries/adminQueryKeys";
import AdminsPageClient from "./AdminsPageClient";

const emptyAdminsResponse: IAdminListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

export default async function AdminsPage() {
    const queryClient = createServerQueryClient();

    await queryClient.prefetchQuery({
        queryKey: adminUserKeys.admins.list({
            searchTerm: "",
            page: 1,
            limit: 10,
        }),
        queryFn: async () => {
            const response = await getAllAdmins(undefined, 1, 10, false);
            return response ?? emptyAdminsResponse;
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminsPageClient />
        </HydrationBoundary>
    );
}
