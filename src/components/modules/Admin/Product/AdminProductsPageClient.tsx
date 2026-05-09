"use client";

import ProductInfoCell from "@/components/shared/cell/ProductInfoCell";
import DateCell from "@/components/shared/cell/DateCell";
import DataTable from "@/components/shared/table/DataTable";
import type {
    DataTableFilterConfig,
    DataTableFilterValues,
} from "@/components/shared/table/DataTableFilters";
import { Button } from "@/components/ui/button";
import { adminCategoryKeys, adminProductKeys } from "@/hooks/queries/adminQueryKeys";
import { cn } from "@/lib/utils";
import { deleteProduct, getAllCategories, getAllProducts } from "@/services/product.service";
import type { IProduct } from "@/types/product.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";

const DEFAULT_LIMIT = 10;
const STATUS_CLASS: Record<string, string> = {
    ACTIVE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    DRAFT: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    ARCHIVED: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500",
};

export default function AdminProductsPageClient() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_LIMIT,
    });
    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<DataTableFilterValues>({});

    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;
    const sortBy = sortingState[0]?.id || "createdAt";
    const sortOrder = sortingState[0]?.desc ? "desc" : "asc";
    const status =
        typeof filters.status === "string" && filters.status.length > 0
            ? filters.status
            : undefined;
    const categoryId =
        typeof filters.categoryId === "string" && filters.categoryId.length > 0
            ? filters.categoryId
            : undefined;

    const productsQuery = useQuery({
        queryKey: adminProductKeys.list({
            searchTerm,
            status,
            categoryId,
            page,
            limit,
            sortBy,
            sortOrder,
        }),
        queryFn: () =>
            getAllProducts(
                searchTerm || undefined,
                status,
                categoryId,
                page,
                limit,
                false,
                sortBy,
                sortOrder,
            ),
    });

    const categoriesQuery = useQuery({
        queryKey: adminCategoryKeys.options(),
        queryFn: () => getAllCategories(undefined, 1, 100, true, false),
    });

    const deleteMutation = useMutation({
        mutationFn: (productId: string) => deleteProduct(productId),
        onSuccess: () => {
            toast.success("Product deleted successfully");
            queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
        },
        onError: () => toast.error("Failed to delete product"),
    });

    const deleteMutationRef = useRef(deleteMutation);
    useEffect(() => {
        deleteMutationRef.current = deleteMutation;
    }, [deleteMutation]);

    const categoryOptions = (categoriesQuery.data?.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
    }));

    const filterConfigs = useMemo<DataTableFilterConfig[]>(
        () => [
            {
                id: "status",
                label: "Status",
                type: "single-select",
                options: [
                    { label: "Draft", value: "DRAFT" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "Archived", value: "ARCHIVED" },
                ],
            },
            {
                id: "categoryId",
                label: "Category",
                type: "single-select",
                options: categoryOptions,
            },
        ],
        [categoryOptions],
    );

    const columns = useMemo<ColumnDef<IProduct>[]>(
        () => [
            {
                id: "sl",
                header: "SL",
                enableSorting: false,
                cell: ({ row, table }) => {
                    const { pageIndex, pageSize } = table.getState().pagination;
                    return (
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {pageIndex * pageSize + row.index + 1}
                        </span>
                    );
                },
            },
            {
                accessorKey: "title",
                header: "Product",
                enableSorting: false,
                cell: ({ row }) => (
                    <ProductInfoCell
                        title={row.original.title}
                        slug={row.original.slug}
                        teamName={row.original.teamName}
                    />
                ),
            },
            {
                accessorKey: "category",
                header: "Category",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.category?.name ?? "N/A"}</span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                            STATUS_CLASS[row.original.status] ??
                            "border-border bg-muted text-muted-foreground",
                        )}
                    >
                        {row.original.status}
                    </span>
                ),
            },
            {
                id: "sku",
                header: "SKU",
                enableSorting: false,
                cell: ({ row }) => {
                    const sku = row.original.variants?.[0]?.sku;
                    return <span className="text-sm font-mono">{sku ?? "—"}</span>;
                },
            },
            {
                id: "stock",
                header: "Stock",
                enableSorting: false,
                cell: ({ row }) => {
                    const totalStock =
                        row.original.variants?.reduce(
                            (sum, variant) => sum + (variant.stockQty ?? 0),
                            0,
                        ) ?? 0;
                    return (
                        <span
                            className={cn(
                                "text-sm font-medium",
                                totalStock > 0 ? "text-emerald-600" : "text-destructive",
                            )}
                        >
                            {totalStock}
                        </span>
                    );
                },
            },
            {
                id: "price",
                header: "Price",
                enableSorting: false,
                cell: ({ row }) => {
                    const prices = (row.original.variants ?? [])
                        .map((variant) => variant.priceAmount)
                        .filter((price): price is number => typeof price === "number");

                    if (prices.length === 0) {
                        return <span className="text-sm text-muted-foreground">—</span>;
                    }

                    const minPrice = Math.min(...prices);
                    return <span className="text-sm font-semibold">${minPrice.toFixed(2)}</span>;
                },
            },
            {
                accessorKey: "jerseyType",
                header: "Jersey Type",
                enableSorting: false,
                cell: ({ row }) => (
                    <span
                        className={cn(
                            "rounded-md border px-2 py-1 text-xs font-medium",
                            "border-primary/20 bg-primary/5 text-primary",
                        )}
                    >
                        {row.original.jerseyType}
                    </span>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                enableSorting: true,
                cell: ({ row }) => <DateCell date={row.original.createdAt} />,
            },
        ],
        [],
    );

    const tableActions = useMemo(
        () => ({
            // Single "View / Edit" → opens the product detail page
            onViewEdit: (product: IProduct) =>
                router.push(`/admin/products/${product.id}`),
            onDelete: async (product: IProduct) => {
                toast.custom((t) => (
                    <div className="w-[360px] rounded-xl border bg-card p-4 shadow-lg">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">Delete product?</p>
                            <p className="text-xs text-muted-foreground">
                                This will permanently remove{" "}
                                <span className="font-medium text-foreground">{product.title}</span>.
                            </p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toast.dismiss(t)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                    toast.dismiss(t);
                                    await deleteMutationRef.current.mutateAsync(product.id);
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ),
                    {
                        position: "top-center",
                        duration: Infinity,
                    }
                );
            },
        }),
        [router],
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage jersey catalog items, variants, and media.
                    </p>
                </div>
                <Button asChild className="rounded-lg">
                    <Link href="/admin/products/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Product
                    </Link>
                </Button>
            </div>

            <DataTable<IProduct>
                data={productsQuery.data?.data ?? []}
                columns={columns}
                isLoading={productsQuery.isLoading || deleteMutation.isPending}
                emptyMessage="No products found."
                meta={
                    productsQuery.data
                        ? {
                            page: productsQuery.data.page,
                            limit: productsQuery.data.limit,
                            total: productsQuery.data.total,
                            totalPages: productsQuery.data.totalPages,
                        }
                        : undefined
                }
                search={{
                    initialValue: searchTerm,
                    placeholder: "Search by title, team, or slug…",
                    debounceMs: 500,
                    onDebouncedChange: (value) => {
                        setSearchTerm(value);
                        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                    },
                }}
                filters={{
                    configs: filterConfigs,
                    values: filters,
                    onFilterChange: (filterId, value) => {
                        setFilters((prev) => ({ ...prev, [filterId]: value }));
                        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                    },
                    onClearAll: () => {
                        setFilters({});
                        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
                    },
                }}
                sorting={{
                    state: sortingState,
                    onSortingChange: setSortingState,
                }}
                pagination={{
                    state: paginationState,
                    onPaginationChange: setPaginationState,
                }}
                actions={tableActions}
            />
        </div>
    );
}
