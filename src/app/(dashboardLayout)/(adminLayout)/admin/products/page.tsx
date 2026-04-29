"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import ProductTable from "@/components/modules/Product/ProductTable";
import { getAllProducts, getAllCategories } from "@/services/product.services";
import { productApiClient } from "@/lib/axios/productApiClient";
import { Plus } from "lucide-react";
import CategoriesManager from "@/components/modules/Product/CategoriesManager";
import type {
    ICategoryListResponse,
    IProduct,
    IProductListResponse,
    ProductStatus,
} from "@/types/product.types";

const emptyProductsResponse: IProductListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

const emptyCategoriesResponse: ICategoryListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 0,
};

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: categoriesData } = useQuery({
        queryKey: ["categories", "filters"],
        queryFn: async () => {
            const response = await getAllCategories(undefined, 1, 100, true, false);
            return response ?? emptyCategoriesResponse;
        },
        staleTime: 60000,
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["products", searchTerm, status, categoryId, page],
        queryFn: async () => {
            const response = await getAllProducts(
                searchTerm || undefined,
                status,
                categoryId,
                page,
                10,
                false,
                "createdAt",
                "desc",
            );
            return response ?? { ...emptyProductsResponse, page };
        },
        staleTime: 30000,
    });

    const products = data?.data || [];
    const isAllSelected = useMemo(
        () => products.length > 0 && selectedIds.length === products.length,
        [products.length, selectedIds.length],
    );

    const handleDelete = async (product: IProduct) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${product.title}?`,
        );
        if (!confirmed) return;
        await productApiClient.deleteProduct(product.id);
        refetch();
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const handleToggleSelectAll = (checked: boolean) => {
        if (!checked) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(products.map((product) => product.id));
    };

    const handleStatusChange = async (
        product: IProduct,
        nextStatus: ProductStatus,
    ) => {
        if (product.status === nextStatus) return;
        await productApiClient.updateProductStatus(product.id, {
            status: nextStatus,
        });
        refetch();
    };

    const handleBulkPublish = async () => {
        if (selectedIds.length === 0) return;
        await productApiClient.bulkPublishProducts({ productIds: selectedIds });
        setSelectedIds([]);
        refetch();
    };

    const handleBulkArchive = async () => {
        if (selectedIds.length === 0) return;
        await productApiClient.bulkArchiveProducts({ productIds: selectedIds });
        setSelectedIds([]);
        refetch();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Products
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all products, variants, and media assets.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/products/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Product
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                />
                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value === "ALL" ? undefined : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={categoryId}
                    onValueChange={(value) => {
                        setCategoryId(value === "ALL" ? undefined : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full md:w-56">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {(categoriesData?.data || []).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <Button
                    variant="outline"
                    onClick={handleBulkPublish}
                    disabled={selectedIds.length === 0}
                >
                    Bulk Publish
                </Button>
                <Button
                    variant="outline"
                    onClick={handleBulkArchive}
                    disabled={selectedIds.length === 0}
                >
                    Bulk Archive
                </Button>
                <p className="text-sm text-muted-foreground">
                    {selectedIds.length} selected
                </p>
            </div>

            <ProductTable
                products={products}
                isLoading={isLoading}
                onDelete={handleDelete}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                isAllSelected={isAllSelected}
                onStatusChange={handleStatusChange}
            />

            <CategoriesManager />

            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {data.totalPages}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setPage((p) => Math.min(data.totalPages, p + 1))
                        }
                        disabled={page === data.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
