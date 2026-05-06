import { productApiClient } from "@/lib/axios/productApiClient";
import { safeServiceCall, safeServiceMutation } from "@/services/service-utils";
import type {
    ICategory,
    ICategoryListResponse,
    IProduct,
    IProductListResponse,
    IProductMediaListResponse,
    IVariantListResponse,
    ICreateProductPayload,
    IUpdateProductPayload,
    IUpdateProductStatusPayload,
    ICreateCategoryPayload,
    IUpdateCategoryPayload,
    IBulkCategoryTogglePayload,
    ICreateVariantPayload,
    IUpdateVariantPayload,
    ICreateProductMediaPayload,
    IUpdateProductMediaPayload,
    IReorderProductMediaPayload,
    IBulkProductActionPayload,
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
    return safeServiceCall(
        () =>
            productApiClient.getAllCategories(
                searchTerm,
                page,
                limit,
                isActive,
                isDeleted,
                sortBy,
                sortOrder,
            ),
        null,
        "Failed to fetch categories:",
    );
}

export async function getCategoryById(id: string): Promise<ICategory | null> {
    return safeServiceCall(
        () => productApiClient.getCategoryById(id),
        null,
        "Failed to fetch category:",
    );
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
    return safeServiceCall(
        () =>
            productApiClient.getAllProducts(
                searchTerm,
                status,
                categoryId,
                page,
                limit,
                isDeleted,
                sortBy,
                sortOrder,
            ),
        null,
        "Failed to fetch products:",
    );
}

export async function getProductById(id: string): Promise<IProduct | null> {
    return safeServiceCall(
        () => productApiClient.getProductById(id),
        null,
        "Failed to fetch product:",
    );
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
    return safeServiceCall(
        () =>
            productApiClient.getProductVariants(
                productId,
                isActive,
                page,
                limit,
                sortBy,
                sortOrder,
            ),
        null,
        "Failed to fetch variants:",
    );
}

// Media
export async function getProductMedia(
    productId: string,
): Promise<IProductMediaListResponse | null> {
    return safeServiceCall(
        () => productApiClient.getProductMedia(productId),
        null,
        "Failed to fetch product media:",
    );
}

// Product mutations
export async function createProduct(
    payload: ICreateProductPayload,
): Promise<IProduct> {
    return safeServiceMutation(
        () => productApiClient.createProduct(payload),
        "Failed to create product:",
    );
}

export async function updateProduct(
    productId: string,
    payload: IUpdateProductPayload,
): Promise<IProduct> {
    return safeServiceMutation(
        () => productApiClient.updateProduct(productId, payload),
        "Failed to update product:",
    );
}

export async function deleteProduct(productId: string): Promise<void> {
    return safeServiceMutation(
        () => productApiClient.deleteProduct(productId),
        "Failed to delete product:",
    );
}

export async function updateProductStatus(
    productId: string,
    payload: IUpdateProductStatusPayload,
): Promise<IProduct> {
    return safeServiceMutation(
        () => productApiClient.updateProductStatus(productId, payload),
        "Failed to update product status:",
    );
}

export async function restoreProduct(productId: string): Promise<IProduct> {
    return safeServiceMutation(
        () => productApiClient.restoreProduct(productId),
        "Failed to restore product:",
    );
}

export async function bulkPublishProducts(
    payload: IBulkProductActionPayload,
): Promise<void> {
    return safeServiceMutation(
        () => productApiClient.bulkPublishProducts(payload),
        "Failed to bulk publish products:",
    );
}

export async function bulkArchiveProducts(
    payload: IBulkProductActionPayload,
): Promise<void> {
    return safeServiceMutation(
        () => productApiClient.bulkArchiveProducts(payload),
        "Failed to bulk archive products:",
    );
}

// Category mutations
export async function createCategory(
    payload: ICreateCategoryPayload,
): Promise<ICategory> {
    return safeServiceMutation(
        () => productApiClient.createCategory(payload),
        "Failed to create category:",
    );
}

export async function updateCategory(
    categoryId: string,
    payload: IUpdateCategoryPayload,
): Promise<ICategory> {
    return safeServiceMutation(
        () => productApiClient.updateCategory(categoryId, payload),
        "Failed to update category:",
    );
}

export async function deleteCategory(categoryId: string): Promise<void> {
    return safeServiceMutation(
        () => productApiClient.deleteCategory(categoryId),
        "Failed to delete category:",
    );
}

export async function restoreCategory(categoryId: string): Promise<ICategory> {
    return safeServiceMutation(
        () => productApiClient.restoreCategory(categoryId),
        "Failed to restore category:",
    );
}

export async function bulkToggleCategories(
    payload: IBulkCategoryTogglePayload,
): Promise<void> {
    return safeServiceMutation(
        () => productApiClient.bulkToggleCategories(payload),
        "Failed to bulk toggle categories:",
    );
}

// Variant mutations
export async function createVariant(
    productId: string,
    payload: ICreateVariantPayload,
): Promise<any> {
    return safeServiceMutation(
        () => productApiClient.createVariant(productId, payload),
        "Failed to create variant:",
    );
}

export async function updateVariant(
    productId: string,
    variantId: string,
    payload: IUpdateVariantPayload,
): Promise<any> {
    return safeServiceMutation(
        () => productApiClient.updateVariant(productId, variantId, payload),
        "Failed to update variant:",
    );
}

export async function deleteVariant(
    productId: string,
    variantId: string,
): Promise<void> {
    return safeServiceMutation(
        () => productApiClient.deleteVariant(productId, variantId),
        "Failed to delete variant:",
    );
}

// Media mutations
export async function createProductMedia(
    productId: string,
    payload: FormData,
): Promise<any> {
    return safeServiceMutation(
        () => productApiClient.createProductMedia(productId, payload),
        "Failed to create product media:",
    );
}

export async function updateProductMedia(
    productId: string,
    mediaId: string,
    payload: FormData,
): Promise<any> {
    return safeServiceMutation(
        () => productApiClient.updateProductMedia(productId, mediaId, payload),
        "Failed to update product media:",
    );
}

export async function deleteProductMedia(
    productId: string,
    mediaId: string,
): Promise<void> {
    return safeServiceMutation(
        () => productApiClient.deleteProductMedia(productId, mediaId),
        "Failed to delete product media:",
    );
}

export async function reorderProductMedia(
    productId: string,
    payload: IReorderProductMediaPayload,
): Promise<IProductMediaListResponse> {
    return safeServiceMutation(
        () => productApiClient.reorderProductMedia(productId, payload),
        "Failed to reorder product media:",
    );
}
