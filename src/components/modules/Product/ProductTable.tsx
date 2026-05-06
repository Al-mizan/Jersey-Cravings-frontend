"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Eye, Edit2, Layers, Image, Trash2 } from "lucide-react";
import type { IProduct, ProductStatus } from "@/types/product.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type { PaginationMeta } from "@/types/api.types";

interface AdminProductsTableProps {
    products: IProduct[];
    meta?: PaginationMeta;
    isLoading?: boolean;
    baseRoute?: string;
    paginationState: PaginationState;
    sortingState: SortingState;
    onPaginationChange: (state: PaginationState) => void;
    onSortingChange: (state: SortingState) => void;
    onView?: (product: IProduct) => void;
    onEdit?: (product: IProduct) => void;
    onVariants?: (product: IProduct) => void;
    onMedia?: (product: IProduct) => void;
    onDelete?: (product: IProduct) => void;
    onStatusChange?: (product: IProduct, status: ProductStatus) => void;
}

const getStatusVariant = (
    status: string,
): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "ACTIVE") return "default";
    if (status === "ARCHIVED") return "destructive";
    return "secondary";
};

export default function ProductTable({
    products,
    meta,
    isLoading,
    baseRoute = "/admin/products",
    paginationState,
    sortingState,
    onPaginationChange,
    onSortingChange,
    onView,
    onEdit,
    onVariants,
    onMedia,
    onDelete,
    onStatusChange,
}: AdminProductsTableProps) {
    const columns = useMemo<ColumnDef<IProduct>[]>(() => {
        return [
            {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <p className="font-medium">{row.original.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.teamName}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "category.name",
                header: "Category",
                cell: ({ row }) => row.original.category?.name ?? "—",
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <div className="space-y-2">
                        <Badge variant={getStatusVariant(row.original.status)}>
                            {row.original.status}
                        </Badge>
                        {onStatusChange && (
                            <Select
                                value={row.original.status}
                                onValueChange={(value) =>
                                    onStatusChange(
                                        row.original,
                                        value as ProductStatus,
                                    )
                                }
                            >
                                <SelectTrigger className="h-8 w-28 text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="ACTIVE">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="ARCHIVED">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "variants",
                header: "Variants",
                cell: ({ row }) => String(row.original.variants?.length ?? 0),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) =>
                    new Date(row.original.createdAt).toLocaleDateString(),
            },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex gap-1">
                        <Button asChild variant="ghost" size="sm">
                            <Link
                                href={`${baseRoute}/${row.original.id}`}
                                onClick={() => onView?.(row.original)}
                            >
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                            <Link
                                href={`${baseRoute}/${row.original.id}/edit`}
                                onClick={() => onEdit?.(row.original)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                            <Link
                                href={`${baseRoute}/${row.original.id}/variants`}
                                onClick={() => onVariants?.(row.original)}
                            >
                                <Layers className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                            <Link
                                href={`${baseRoute}/${row.original.id}/media`}
                                onClick={() => onMedia?.(row.original)}
                            >
                                <Image className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete?.(row.original)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ];
    }, [
        baseRoute,
        onDelete,
        onEdit,
        onMedia,
        onStatusChange,
        onView,
        onVariants,
    ]);

    return (
        <DataTable
            data={products}
            columns={columns}
            isLoading={isLoading}
            meta={meta}
            pagination={{ state: paginationState, onPaginationChange }}
            sorting={{ state: sortingState, onSortingChange: onSortingChange }}
            emptyMessage="No products found."
        />
    );
}
