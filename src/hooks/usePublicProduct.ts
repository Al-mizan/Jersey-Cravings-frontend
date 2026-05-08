// import { useQuery } from "@tanstack/react-query";
// import { getProductById } from "@/services/product.service";
// import { publicProductKeys } from "./queries/publicProductKeys";
// import type { IProduct } from "@/types/product.types";

// interface UsePublicProductOptions {
//     enabled?: boolean;
// }

// /**
//  * Hook for fetching a single product for public display
//  * Includes product details, variants, and media
//  */
// export function usePublicProduct(
//     id: string | undefined,
//     options: UsePublicProductOptions = {},
// ) {
//     const { enabled = true } = options;

//     return useQuery({
//         queryKey: publicProductKeys.detail(id || ""),
//         queryFn: async () => {
//             if (!id) return null;
//             return await getProductById(id);
//         },
//         staleTime: 5 * 60 * 1000, // 5 minutes
//         gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
//         enabled: enabled && !!id,
//     });
// }
