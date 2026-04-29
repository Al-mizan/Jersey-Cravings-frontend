"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/modules/Product/ProductForm";

export default function CreateProductPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Create Product
                </h1>
                <p className="text-muted-foreground mt-1">
                    Add a new jersey to your catalog.
                </p>
            </div>
            <ProductForm
                mode="create"
                onSuccess={(product) =>
                    router.push(`/admin/products/${product.id}`)
                }
            />
        </div>
    );
}
