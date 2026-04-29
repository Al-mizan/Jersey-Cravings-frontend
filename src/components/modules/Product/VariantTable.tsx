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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Edit2, Trash2 } from "lucide-react";
import type { IProductVariant } from "@/types/product.types";

interface VariantTableProps {
    variants: IProductVariant[] | null;
    isLoading?: boolean;
    onEdit?: (variant: IProductVariant) => void;
    onDelete?: (variant: IProductVariant) => void;
}

const VariantTable = ({
    variants,
    isLoading,
    onEdit,
    onDelete,
}: VariantTableProps) => {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Fit</TableHead>
                            <TableHead>Sleeve</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-10" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-12" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-12" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-10" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-20" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (!variants || variants.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No variants found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Fit</TableHead>
                        <TableHead>Sleeve</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {variants.map((variant) => (
                        <TableRow key={variant.id}>
                            <TableCell className="font-medium">
                                {variant.sku}
                            </TableCell>
                            <TableCell>{variant.size}</TableCell>
                            <TableCell>{variant.fit}</TableCell>
                            <TableCell>{variant.sleeveType}</TableCell>
                            <TableCell>BDT {variant.priceAmount}</TableCell>
                            <TableCell>{variant.stockQty}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        variant.isActive
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {variant.isActive ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit?.(variant)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => onDelete?.(variant)}
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

export default VariantTable;
