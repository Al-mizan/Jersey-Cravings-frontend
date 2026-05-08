// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import ProductTable from "@/components/modules/Product/ProductTable";
// import { Plus } from "lucide-react";
// import CategoriesManager from "@/components/modules/Product/CategoriesManager";
// import type { IProduct, ProductStatus } from "@/types/product.types";
// import type { PaginationState, SortingState } from "@tanstack/react-table";
// import { ADMIN_PAGINATION_DEFAULTS } from "@/config/adminPageDefaults";
// import {
//     useAdminProducts,
//     useBulkArchiveAdminProducts,
//     useBulkPublishAdminProducts,
//     useDeleteAdminProduct,
//     useUpdateAdminProductStatus,
// } from "@/components/modules/Product/hooks/useProductManagement";
// import { useCategoryOptions } from "@/components/modules/Product/hooks/useCategoriesManagement";

// export default function AdminProductsPageClient() {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [status, setStatus] = useState<string | undefined>(undefined);
//     const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
//     const [selectedIds, setSelectedIds] = useState<string[]>([]);

//     const [paginationState, setPaginationState] = useState<PaginationState>({
//         pageIndex: 0,
//         pageSize: ADMIN_PAGINATION_DEFAULTS.limit,
//     });
//     const [sortingState, setSortingState] = useState<SortingState>([]);

//     const page = paginationState.pageIndex + 1;
//     const limit = paginationState.pageSize;
//     const sortBy = sortingState[0]?.id || "createdAt";
//     const sortOrder = sortingState[0]?.desc ? "desc" : "asc";

//     const { data: categoriesData } = useCategoryOptions();
//     const { data, isLoading } = useAdminProducts({
//         searchTerm,
//         status,
//         categoryId,
//         page,
//         limit,
//         sortBy,
//         sortOrder,
//     });
//     const deleteProductMutation = useDeleteAdminProduct();
//     const updateProductStatusMutation = useUpdateAdminProductStatus();
//     const bulkPublishProductsMutation = useBulkPublishAdminProducts();
//     const bulkArchiveProductsMutation = useBulkArchiveAdminProducts();

//     const products = data?.data || [];

//     const handleDelete = async (product: IProduct) => {
//         const confirmed = window.confirm(
//             `Are you sure you want to delete ${product.title}?`,
//         );
//         if (!confirmed) return;
//         await deleteProductMutation.mutateAsync(product.id);
//     };

//     const handleStatusChange = async (
//         product: IProduct,
//         nextStatus: ProductStatus,
//     ) => {
//         if (product.status === nextStatus) return;
//         await updateProductStatusMutation.mutateAsync({
//             productId: product.id,
//             payload: { status: nextStatus },
//         });
//     };

//     const handleBulkPublish = async () => {
//         if (selectedIds.length === 0) return;
//         await bulkPublishProductsMutation.mutateAsync({
//             productIds: selectedIds,
//         });
//         setSelectedIds([]);
//     };

//     const handleBulkArchive = async () => {
//         if (selectedIds.length === 0) return;
//         await bulkArchiveProductsMutation.mutateAsync({
//             productIds: selectedIds,
//         });
//         setSelectedIds([]);
//     };

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold tracking-tight">
//                         Products
//                     </h1>
//                     <p className="text-muted-foreground mt-1">
//                         Manage all products, variants, and media assets.
//                     </p>
//                 </div>
//                 <Button asChild>
//                     <Link href="/admin/products/create">
//                         <Plus className="h-4 w-4 mr-2" />
//                         Create Product
//                     </Link>
//                 </Button>
//             </div>

//             <div className="flex flex-col md:flex-row gap-3">
//                 <input
//                     type="text"
//                     placeholder="Search products..."
//                     value={searchTerm}
//                     onChange={(e) => {
//                         setSearchTerm(e.target.value);
//                         setPaginationState((s) => ({ ...s, pageIndex: 0 }));
//                     }}
//                     className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
//                 />
//                 <Select
//                     value={status}
//                     onValueChange={(value) => {
//                         setStatus(value === "ALL" ? undefined : value);
//                         setPaginationState((s) => ({ ...s, pageIndex: 0 }));
//                     }}
//                 >
//                     <SelectTrigger className="w-full md:w-48">
//                         <SelectValue placeholder="Status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="ALL">All</SelectItem>
//                         <SelectItem value="DRAFT">Draft</SelectItem>
//                         <SelectItem value="ACTIVE">Active</SelectItem>
//                         <SelectItem value="ARCHIVED">Archived</SelectItem>
//                     </SelectContent>
//                 </Select>
//                 <Select
//                     value={categoryId}
//                     onValueChange={(value) => {
//                         setCategoryId(value === "ALL" ? undefined : value);
//                         setPaginationState((s) => ({ ...s, pageIndex: 0 }));
//                     }}
//                 >
//                     <SelectTrigger className="w-full md:w-56">
//                         <SelectValue placeholder="Category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="ALL">All Categories</SelectItem>
//                         {(categoriesData?.data || []).map((category) => (
//                             <SelectItem key={category.id} value={category.id}>
//                                 {category.name}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>
//             </div>

//             <div className="flex flex-col md:flex-row gap-3 md:items-center">
//                 <Button
//                     variant="outline"
//                     onClick={handleBulkPublish}
//                     disabled={selectedIds.length === 0}
//                 >
//                     Bulk Publish
//                 </Button>
//                 <Button
//                     variant="outline"
//                     onClick={handleBulkArchive}
//                     disabled={selectedIds.length === 0}
//                 >
//                     Bulk Archive
//                 </Button>
//                 <p className="text-sm text-muted-foreground">
//                     {selectedIds.length} selected
//                 </p>
//             </div>

//             <ProductTable
//                 products={products}
//                 isLoading={isLoading}
//                 meta={data}
//                 paginationState={paginationState}
//                 sortingState={sortingState}
//                 onPaginationChange={setPaginationState}
//                 onSortingChange={setSortingState}
//                 onDelete={handleDelete}
//                 onStatusChange={handleStatusChange}
//             />

//             <CategoriesManager />
//         </div>
//     );
// }
