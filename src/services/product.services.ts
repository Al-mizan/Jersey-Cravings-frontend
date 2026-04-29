import { productApiClient } from "@/lib/axios/productApiClient";
import type {
    ICategory,
    ICategoryListResponse,
    IProduct,
    IProductListResponse,
    IProductMediaListResponse,
    IVariantListResponse,
} from "@/types/product.types";

// Categories
export async function getAllCategories(
    searchTerm?: string,
    page: number = 1,
    limit: number = 50,
    isActive?: boolean,
    isDeleted?: boolean,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
): Promise<ICategoryListResponse | null> {
    try {
        return await productApiClient.getAllCategories(
            searchTerm,
            page,
            limit,
            isActive,
            isDeleted,
            sortBy,
            sortOrder,
        );
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return null;
    }
}

export async function getCategoryById(id: string): Promise<ICategory | null> {
    try {
        return await productApiClient.getCategoryById(id);
    } catch (error) {
        console.error("Failed to fetch category:", error);
        return null;
    }
}

// Products
export async function getAllProducts(
    searchTerm?: string,
    status?: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 10,
    isDeleted?: boolean,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
): Promise<IProductListResponse | null> {
    try {
        return await productApiClient.getAllProducts(
            searchTerm,
            status,
            categoryId,
            page,
            limit,
            isDeleted,
            sortBy,
            sortOrder,
        );
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return null;
    }
}

export async function getProductById(id: string): Promise<IProduct | null> {
    try {
        return await productApiClient.getProductById(id);
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
}

// Variants
export async function getProductVariants(
    productId: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 20,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
): Promise<IVariantListResponse | null> {
    try {
        return await productApiClient.getProductVariants(
            productId,
            isActive,
            page,
            limit,
            sortBy,
            sortOrder,
        );
    } catch (error) {
        console.error("Failed to fetch variants:", error);
        return null;
    }
}

// Media
export async function getProductMedia(
    productId: string,
): Promise<IProductMediaListResponse | null> {
    try {
        return await productApiClient.getProductMedia(productId);
    } catch (error) {
        console.error("Failed to fetch product media:", error);
        return null;
    }
}
