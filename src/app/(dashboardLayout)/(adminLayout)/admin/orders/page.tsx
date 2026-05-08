// import { createServerQueryClient } from "@/lib/api";
// import { getAllOrders } from "@/services/order.service";
// import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
// import { adminOrderKeys } from "@/hooks/queries/adminQueryKeys";
// import AdminOrdersPageClient from "./AdminOrdersPageClient";

// export default async function AdminOrdersPage() {
//     const queryClient = createServerQueryClient();

//     await queryClient.prefetchQuery({
//         queryKey: adminOrderKeys.list({
//             searchTerm: "",
//             status: undefined,
//             paymentStatus: undefined,
//             page: 1,
//             limit: 10,
//         }),
//         queryFn: () =>
//             getAllOrders(undefined, undefined, undefined, undefined, 1, 10),
//     });

//     return (
//         <HydrationBoundary state={dehydrate(queryClient)}>
//             <AdminOrdersPageClient />
//         </HydrationBoundary>
//     );
// }

export default function AdminOrdersPage() {
    return <div>Admin Orders Page</div>;
}
