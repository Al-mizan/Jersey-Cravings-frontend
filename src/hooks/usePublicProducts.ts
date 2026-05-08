// import { useQuery } from "@tanstack/react-query";
// import { getAllProducts } from "@/services/product.service";
// import { publicProductKeys } from "./queries/publicProductKeys";
// import type { IProductListResponse } from "@/types/product.types";

// const emptyProductsResponse: IProductListResponse = {
//     data: [],
//     total: 0,
//     page: 1,
//     limit: 20,
//     totalPages: 0,
// };

// interface UsePublicProductsOptions {
//     searchTerm?: string;
//     categoryId?: string;
//     page?: number;
//     limit?: number;
//     sortBy?: string;
//     sortOrder?: "asc" | "desc";
//     enabled?: boolean;
// }

// /**
//  * Hook for fetching public products
//  * Only active products are fetched for the storefront
//  * Supports filtering by category and search
//  */
// export function usePublicProducts(options: UsePublicProductsOptions = {}) {
//     const {
//         searchTerm,
//         categoryId,
//         page = 1,
//         limit = 20,
//         sortBy = "createdAt",
//         sortOrder = "desc",
//         enabled = true,
//     } = options;

//     return useQuery({
//         queryKey: publicProductKeys.list({
//             searchTerm,
//             categoryId,
//             page,
//             limit,
//             sortBy,
//             sortOrder,
//         }),
//         queryFn: async () => {
//             const response = await getAllProducts(
//                 searchTerm || undefined,
//                 "ACTIVE", // Only active products for storefront
//                 categoryId || undefined,
//                 page,
//                 limit,
//                 false, // Not deleted
//                 sortBy,
//                 sortOrder,
//             );
//             return response ?? { ...emptyProductsResponse, page };
//         },
//         staleTime: 5 * 60 * 1000, // 5 minutes
//         gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
//         enabled,
//     });
// }
