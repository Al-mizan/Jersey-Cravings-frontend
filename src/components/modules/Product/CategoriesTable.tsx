"use client";

import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Edit2, RotateCcw, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import type { ICategory } from "@/types/product.types";

interface CategoriesTableProps {
    categories: ICategory[] | null;
    isLoading?: boolean;
    selectedIds?: string[];
    onToggleSelect?: (id: string) => void;
    onToggleSelectAll?: (checked: boolean) => void;
    isAllSelected?: boolean;
    onEdit?: (category: ICategory) => void;
    onDelete?: (category: ICategory) => void;
    onRestore?: (category: ICategory) => void;
    onToggleActive?: (category: ICategory, isActive: boolean) => void;
}

const CategoriesTable = ({
    categories,
    isLoading,
    selectedIds = [],
    onToggleSelect,
    onToggleSelectAll,
    isAllSelected,
    onEdit,
    onDelete,
    onRestore,
    onToggleActive,
}: CategoriesTableProps) => {
    const selectionEnabled = Boolean(onToggleSelect && onToggleSelectAll);
    const columns = useMemo<ColumnDef<ICategory>[]>(
        () => [
            ...(selectionEnabled
                ? [
                      {
                          id: "select",
                          header: () => (
                              <Checkbox
                                  checked={Boolean(isAllSelected)}
                                  onCheckedChange={(value) =>
                                      onToggleSelectAll?.(Boolean(value))
                                  }
                                  aria-label="Select all categories"
                              />
                          ),
                          cell: ({ row }) => (
                              <Checkbox
                                  checked={selectedIds.includes(
                                      row.original.id,
                                  )}
                                  onCheckedChange={() =>
                                      onToggleSelect?.(row.original.id)
                                  }
                                  aria-label={`Select ${row.original.name}`}
                              />
                          ),
                      } as ColumnDef<ICategory>,
                  ]
                : []),
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            },
            {
                accessorKey: "slug",
                header: "Slug",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.slug}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Status",
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.original.isActive ? "default" : "secondary"
                        }
                    >
                        {row.original.isActive ? "Active" : "Inactive"}
                    </Badge>
                ),
            },
            {
                id: "updatedAt",
                header: "Updated",
                cell: ({ row }) =>
                    new Date(row.original.updatedAt).toLocaleDateString(),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const category = row.original;

                    return (
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit?.(category)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            {!category.isDeleted && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        onToggleActive?.(
                                            category,
                                            !category.isActive,
                                        )
                                    }
                                >
                                    {category.isActive ? "Disable" : "Enable"}
                                </Button>
                            )}
                            {category.isDeleted ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRestore?.(category)}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => onDelete?.(category)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [
            selectionEnabled,
            isAllSelected,
            onToggleSelectAll,
            selectedIds,
            onToggleSelect,
            onEdit,
            onDelete,
            onRestore,
            onToggleActive,
        ],
    );

    if (isLoading) {
        return (
            <div className="rounded-md border p-6 text-sm text-muted-foreground">
                Loading categories...
            </div>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No categories found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <DataTable
            data={categories}
            columns={columns}
            isLoading={false}
            emptyMessage="No categories found."
        />
    );
};

export default CategoriesTable;
