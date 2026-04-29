"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Edit2, RotateCcw, Trash2 } from "lucide-react";
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

    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {selectionEnabled && <TableHead className="w-10" />}
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                {selectionEnabled && (
                                    <TableCell>
                                        <Skeleton className="h-4 w-4" />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Skeleton className="h-4 w-28" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-24" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {selectionEnabled && (
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={Boolean(isAllSelected)}
                                    onCheckedChange={(value) =>
                                        onToggleSelectAll?.(Boolean(value))
                                    }
                                    aria-label="Select all categories"
                                />
                            </TableHead>
                        )}
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => {
                        const isSelected = selectedIds.includes(category.id);
                        return (
                            <TableRow key={category.id}>
                                {selectionEnabled && (
                                    <TableCell>
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() =>
                                                onToggleSelect?.(category.id)
                                            }
                                            aria-label={`Select ${category.name}`}
                                        />
                                    </TableCell>
                                )}
                                <TableCell className="font-medium">
                                    {category.name}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {category.slug}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            category.isActive
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {category.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(
                                        category.updatedAt,
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
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
                                                {category.isActive
                                                    ? "Disable"
                                                    : "Enable"}
                                            </Button>
                                        )}
                                        {category.isDeleted ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    onRestore?.(category)
                                                }
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    onDelete?.(category)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default CategoriesTable;
