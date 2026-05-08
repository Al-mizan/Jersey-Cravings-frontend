// import { createServerQueryClient } from "@/lib/api";
// import { getAllCategories, getAllProducts } from "@/services/product.service";
// import type {
//     ICategoryListResponse,
//     IProductListResponse,
// } from "@/types/product.types";
// import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
// import {
//     adminCategoryKeys,
//     adminProductKeys,
// } from "@/hooks/queries/adminQueryKeys";
// import AdminProductsPageClient from "./AdminProductsPageClient";

// const emptyProductsResponse: IProductListResponse = {
//     data: [],
//     total: 0,
//     page: 1,
//     limit: 10,
//     totalPages: 0,
// };

// const emptyCategoriesResponse: ICategoryListResponse = {
//     data: [],
//     total: 0,
//     page: 1,
//     limit: 100,
//     totalPages: 0,
// };

// export default async function ProductsPage() {
//     const queryClient = createServerQueryClient();

//     await Promise.all([
//         queryClient.prefetchQuery({
//             queryKey: adminCategoryKeys.options(),
//             queryFn: async () => {
//                 const response = await getAllCategories(
//                     undefined,
//                     1,
//                     100,
//                     true,
//                     false,
//                 );
//                 return response ?? emptyCategoriesResponse;
//             },
//         }),
//         queryClient.prefetchQuery({
//             queryKey: adminProductKeys.list({
//                 searchTerm: "",
//                 status: undefined,
//                 categoryId: undefined,
//                 page: 1,
//                 limit: 10,
//                 sortBy: "createdAt",
//                 sortOrder: "asc",
//             }),
//             queryFn: async () => {
//                 const response = await getAllProducts(
//                     undefined,
//                     undefined,
//                     undefined,
//                     1,
//                     10,
//                     false,
//                     "createdAt",
//                     "asc",
//                 );
//                 return response ?? emptyProductsResponse;
//             },
//         }),
//     ]);

//     return (
//         <HydrationBoundary state={dehydrate(queryClient)}>
//             <AdminProductsPageClient />
//         </HydrationBoundary>
//     );
// }

export default function AdminProductsPage() {
    return <div>Admin Products Page</div>;
}
