"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ICategory } from "@/types/product.types";

interface CategoryFilterProps {
    categories: ICategory[];
    selectedCategoryId?: string;
    onCategoryChange: (categoryId?: string) => void;
    isLoading?: boolean;
}

/**
 * Category filter dropdown for product listing
 */
export function CategoryFilter({
    categories,
    selectedCategoryId,
    onCategoryChange,
    isLoading,
}: CategoryFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <Select
                value={selectedCategoryId || ""}
                onValueChange={(value) => onCategoryChange(value || undefined)}
                disabled={isLoading}
            >
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedCategoryId && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCategoryChange(undefined)}
                    disabled={isLoading}
                >
                    <X className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}
