"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Minus, Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/table/DataTable";
import type { ICart } from "@/types/commerce.types";

interface CartTableProps {
    cart: ICart | null;
    isLoading?: boolean;
    onIncrease: (itemId: string, currentQty: number) => void;
    onDecrease: (itemId: string, currentQty: number) => void;
    onRemove: (itemId: string) => void;
}

const buildColumns = (
    onIncrease: (itemId: string, currentQty: number) => void,
    onDecrease: (itemId: string, currentQty: number) => void,
    onRemove: (itemId: string) => void,
): ColumnDef<ICart["items"][number]>[] => [
    {
        id: "product",
        header: "Product",
        cell: ({ row }) => row.original.variant?.product?.title || "Product",
    },
    {
        id: "variant",
        header: "Variant",
        cell: ({ row }) => row.original.variant?.sku || row.original.variantId,
    },
    {
        id: "qty",
        header: "Qty",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={row.original.qty <= 1}
                    onClick={() =>
                        onDecrease(row.original.id, row.original.qty)
                    }
                >
                    <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium">{row.original.qty}</span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        onIncrease(row.original.id, row.original.qty)
                    }
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
        ),
    },
    {
        id: "price",
        header: "Price",
        cell: ({ row }) => `৳${row.original.variant?.priceAmount || 0}`,
    },
    {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onRemove(row.original.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        ),
    },
];

const CartTable = ({
    cart,
    isLoading,
    onIncrease,
    onDecrease,
    onRemove,
}: CartTableProps) => {
    if (!cart || cart.items.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Your cart is empty.</AlertDescription>
            </Alert>
        );
    }

    return (
        <DataTable
            data={cart.items}
            columns={buildColumns(onIncrease, onDecrease, onRemove)}
            isLoading={isLoading}
            emptyMessage="Your cart is empty."
        />
    );
};

export default CartTable;
