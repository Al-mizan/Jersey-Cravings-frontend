"use client";

import React from "react";
import Link from "next/link";
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
import { AlertCircle, Edit2, Eye, Image, Layers, Trash2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { IProduct, ProductStatus } from "@/types/product.types";

interface ProductTableProps {
    products: IProduct[] | null;
    isLoading?: boolean;
    baseRoute?: string;
    onDelete?: (product: IProduct) => void;
    selectedIds?: string[];
    onToggleSelect?: (id: string) => void;
    onToggleSelectAll?: (checked: boolean) => void;
    isAllSelected?: boolean;
    onStatusChange?: (product: IProduct, status: ProductStatus) => void;
}

const getStatusVariant = (
    status: string,
): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "ACTIVE") return "default";
    if (status === "ARCHIVED") return "destructive";
    return "secondary";
};

const ProductTable = ({
    products,
    isLoading,
    baseRoute = "/admin/products",
    onDelete,
    selectedIds = [],
    onToggleSelect,
    onToggleSelectAll,
    isAllSelected,
    onStatusChange,
}: ProductTableProps) => {
    const selectionEnabled = Boolean(onToggleSelect && onToggleSelectAll);

    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {selectionEnabled && <TableHead className="w-10" />}
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Variants</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-40">Actions</TableHead>
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
                                    <Skeleton className="h-4 w-32" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-12" />
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

    if (!products || products.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No products found.</AlertDescription>
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
                                    aria-label="Select all products"
                                />
                            </TableHead>
                        )}
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Variants</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-40">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            {selectionEnabled && (
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.includes(
                                            product.id,
                                        )}
                                        onCheckedChange={() =>
                                            onToggleSelect?.(product.id)
                                        }
                                        aria-label={`Select ${product.title}`}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="font-medium">
                                <div className="space-y-1">
                                    <p>{product.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {product.teamName}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm">
                                {product.category?.name || "—"}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                    <Badge
                                        variant={getStatusVariant(
                                            product.status,
                                        )}
                                    >
                                        {product.status}
                                    </Badge>
                                    {onStatusChange && (
                                        <Select
                                            value={product.status}
                                            onValueChange={(value) =>
                                                onStatusChange(
                                                    product,
                                                    value as ProductStatus,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-8 w-28 text-xs">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DRAFT">
                                                    Draft
                                                </SelectItem>
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
                            </TableCell>
                            <TableCell className="text-sm">
                                {product.variants?.length ?? 0}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(
                                    product.createdAt,
                                ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link
                                            href={`${baseRoute}/${product.id}`}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link
                                            href={`${baseRoute}/${product.id}/edit`}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link
                                            href={`${baseRoute}/${product.id}/variants`}
                                        >
                                            <Layers className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link
                                            href={`${baseRoute}/${product.id}/media`}
                                        >
                                            <Image className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => onDelete?.(product)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ProductTable;
