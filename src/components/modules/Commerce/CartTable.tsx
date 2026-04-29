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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Minus, Plus, Trash2 } from "lucide-react";
import type { ICart } from "@/types/commerce.types";

interface CartTableProps {
    cart: ICart | null;
    isLoading?: boolean;
    onIncrease: (itemId: string, currentQty: number) => void;
    onDecrease: (itemId: string, currentQty: number) => void;
    onRemove: (itemId: string) => void;
}

const CartTable = ({
    cart,
    isLoading,
    onIncrease,
    onDecrease,
    onRemove,
}: CartTableProps) => {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="w-20">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <TableRow key={i}>
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
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-10" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Your cart is empty.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cart.items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                {item.variant?.product?.title || "Product"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {item.variant?.sku || item.variantId}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            onDecrease(item.id, item.qty)
                                        }
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-medium">
                                        {item.qty}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            onIncrease(item.id, item.qty)
                                        }
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>
                                ৳{item.variant?.priceAmount || 0}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => onRemove(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default CartTable;
