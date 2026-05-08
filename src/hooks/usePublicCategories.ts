// import { useQuery } from "@tanstack/react-query";
// import { getAllCategories } from "@/services/product.service";
// import { publicCategoryKeys } from "./queries/publicProductKeys";
// import type { ICategoryListResponse } from "@/types/product.types";

// const emptyCategoriesResponse: ICategoryListResponse = {
//     data: [],
//     total: 0,
//     page: 1,
//     limit: 100,
//     totalPages: 0,
// };

// interface UsePublicCategoriesOptions {
//     searchTerm?: string;
//     page?: number;
//     limit?: number;
//     enabled?: boolean;
// }

// /**
//  * Hook for fetching public product categories
//  * Only active categories are fetched for the storefront
//  */
// export function usePublicCategories(options: UsePublicCategoriesOptions = {}) {
//     const { searchTerm, page = 1, limit = 100, enabled = true } = options;

//     return useQuery({
//         queryKey: publicCategoryKeys.list({ searchTerm, page, limit }),
//         queryFn: async () => {
//             const response = await getAllCategories(
//                 searchTerm,
//                 page,
//                 limit,
//                 true, // Only active categories
//                 false, // Not deleted
//             );
//             return response ?? emptyCategoriesResponse;
//         },
//         staleTime: 10 * 60 * 1000, // 10 minutes
//         gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
//         enabled,
//     });
// }
