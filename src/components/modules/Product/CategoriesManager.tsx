"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import CategoriesTable from "@/components/modules/Product/CategoriesTable";
import CategoryForm from "@/components/modules/Product/CategoryForm";
import { getAllCategories } from "@/services/product.services";
import { productApiClient } from "@/lib/axios/productApiClient";
import { Plus } from "lucide-react";
import type { ICategory, ICategoryListResponse } from "@/types/product.types";

const emptyCategoriesResponse: ICategoryListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

const CategoriesManager = () => {
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<ICategory | null>(
        null,
    );

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["categories", "manage", page],
        queryFn: async () => {
            const response = await getAllCategories(
                undefined,
                page,
                10,
                undefined,
                undefined,
                "updatedAt",
                "desc",
            );
            return response ?? { ...emptyCategoriesResponse, page };
        },
        staleTime: 30000,
    });

    const categories = data?.data || [];
    const isAllSelected = useMemo(
        () => categories.length > 0 && selectedIds.length === categories.length,
        [categories.length, selectedIds.length],
    );

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
        setSelectedIds(categories.map((category) => category.id));
    };

    const handleEdit = (category: ICategory) => {
        setActiveCategory(category);
        setEditOpen(true);
    };

    const handleDelete = async (category: ICategory) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${category.name}?`,
        );
        if (!confirmed) return;
        await productApiClient.deleteCategory(category.id);
        refetch();
    };

    const handleRestore = async (category: ICategory) => {
        await productApiClient.restoreCategory(category.id);
        refetch();
    };

    const handleToggleActive = async (
        category: ICategory,
        isActive: boolean,
    ) => {
        await productApiClient.updateCategory(category.id, { isActive });
        refetch();
    };

    const handleBulkToggle = async (isActive: boolean) => {
        if (selectedIds.length === 0) return;
        await productApiClient.bulkToggleCategories({
            categoryIds: selectedIds,
            isActive,
        });
        setSelectedIds([]);
        refetch();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">Categories</h2>
                    <p className="text-sm text-muted-foreground">
                        Create, edit, and organize product categories.
                    </p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Category</DialogTitle>
                        </DialogHeader>
                        <CategoryForm
                            mode="create"
                            onSuccess={() => {
                                setCreateOpen(false);
                                refetch();
                            }}
                            onCancel={() => setCreateOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => handleBulkToggle(true)}
                    disabled={selectedIds.length === 0}
                >
                    Bulk Enable
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleBulkToggle(false)}
                    disabled={selectedIds.length === 0}
                >
                    Bulk Disable
                </Button>
                <p className="text-sm text-muted-foreground">
                    {selectedIds.length} selected
                </p>
            </div>

            <CategoriesTable
                categories={categories}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                isAllSelected={isAllSelected}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onToggleActive={handleToggleActive}
            />

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

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    {activeCategory && (
                        <CategoryForm
                            mode="edit"
                            initialCategory={activeCategory}
                            onSuccess={() => {
                                setEditOpen(false);
                                setActiveCategory(null);
                                refetch();
                            }}
                            onCancel={() => {
                                setEditOpen(false);
                                setActiveCategory(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoriesManager;
