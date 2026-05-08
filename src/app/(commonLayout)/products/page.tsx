// "use client";

// import React, { useState, useCallback } from "react";
// import { Separator } from "@/components/ui/separator";
// import { usePublicProducts } from "@/hooks/usePublicProducts";
// import { usePublicCategories } from "@/hooks/usePublicCategories";
// import { ProductSearch } from "@/components/modules/PublicProduct/ProductSearch";
// import { CategoryFilter } from "@/components/modules/PublicProduct/CategoryFilter";
// import { ProductGrid } from "@/components/modules/PublicProduct/ProductGrid";
// import { ProductGridSkeleton } from "@/components/modules/PublicProduct/ProductSkeleton";
// import {
//     ProductNotFound,
//     ProductError,
// } from "@/components/modules/PublicProduct/EmptyAndErrorStates";

// export default function ProductsPage() {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
//     const [page, setPage] = useState(1);

//     const {
//         data: productsData,
//         isLoading: productsLoading,
//         error: productsError,
//         refetch: refetchProducts,
//     } = usePublicProducts({
//         searchTerm,
//         categoryId,
//         page,
//         limit: 20,
//     });

//     const {
//         data: categoriesData,
//         isLoading: categoriesLoading,
//         error: categoriesError,
//     } = usePublicCategories({
//         limit: 100,
//     });

//     const products = productsData?.data || [];
//     const totalPages = productsData?.totalPages || 1;
//     const selectedCategoryName = categoriesData?.data.find(
//         (c) => c.id === categoryId,
//     )?.name;

//     const handleSearch = useCallback((term: string) => {
//         setSearchTerm(term);
//         setPage(1);
//     }, []);

//     const handleCategoryChange = useCallback((newCategoryId?: string) => {
//         setCategoryId(newCategoryId);
//         setPage(1);
//     }, []);

//     const handlePageChange = useCallback((newPage: number) => {
//         setPage(newPage);
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     }, []);

//     return (
//         <div>
//             Products Page
//         </div>
//     );
//     // return (
//     //     <div className="min-h-screen bg-background">
//     //         <div className="container mx-auto px-4 py-8">
//     //             {/* Header */}
//     //             <div className="mb-8">
//     //                 <h1 className="text-4xl font-bold mb-2">
//     //                     Jersey Collection
//     //                 </h1>
//     //                 <p className="text-muted-foreground">
//     //                     Browse our exclusive collection of professional jerseys
//     //                 </p>
//     //             </div>

//     //             <Separator className="mb-8" />

//     //             {/* Filters Section */}
//     //             <div className="mb-8 flex flex-col sm:flex-row gap-4">
//     //                 <ProductSearch
//     //                     value={searchTerm}
//     //                     onSearch={handleSearch}
//     //                     isLoading={productsLoading}
//     //                 />
//     //                 <CategoryFilter
//     //                     categories={categoriesData?.data || []}
//     //                     selectedCategoryId={categoryId}
//     //                     onCategoryChange={handleCategoryChange}
//     //                     isLoading={categoriesLoading || productsLoading}
//     //                 />
//     //             </div>

//     //             {/* Results Info */}
//     //             {!productsLoading && products.length > 0 && (
//     //                 <div className="mb-4 text-sm text-muted-foreground">
//     //                     {searchTerm && (
//     //                         <p>
//     //                             Search results for "{searchTerm}"
//     //                             {selectedCategoryName &&
//     //                                 ` in ${selectedCategoryName}`}
//     //                             {` (${productsData?.total || 0} results)`}
//     //                         </p>
//     //                     )}
//     //                     {!searchTerm && selectedCategoryName && (
//     //                         <p>
//     //                             {selectedCategoryName}
//     //                             {` (${productsData?.total || 0} products)`}
//     //                         </p>
//     //                     )}
//     //                     {!searchTerm && !selectedCategoryName && (
//     //                         <p>All products ({productsData?.total || 0})</p>
//     //                     )}
//     //                 </div>
//     //             )}

//     //             {/* Content */}
//     //             {productsLoading ? (
//     //                 <ProductGridSkeleton />
//     //             ) : productsError ? (
//     //                 <ProductError
//     //                     error={productsError}
//     //                     onRetry={() => refetchProducts()}
//     //                 />
//     //             ) : products.length > 0 ? (
//     //                 <ProductGrid
//     //                     products={products}
//     //                     currentPage={page}
//     //                     totalPages={totalPages}
//     //                     onPageChange={handlePageChange}
//     //                 />
//     //             ) : (
//     //                 <ProductNotFound
//     //                     searchTerm={searchTerm}
//     //                     categoryName={selectedCategoryName}
//     //                     onReset={() => {
//     //                         setSearchTerm("");
//     //                         setCategoryId(undefined);
//     //                         setPage(1);
//     //                     }}
//     //                 />
//     //             )}
//     //         </div>
//     //     </div>
//     // );
// }

export default function ProductsPage() {
    return (
        <div>
            Products Page
        </div>
    )
}
