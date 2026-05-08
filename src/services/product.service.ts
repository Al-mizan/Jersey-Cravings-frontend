import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, safeServiceMutation } from "@/services/service-utils";
import { ApiResponse } from "@/types/api.types";
import type {
    ICategory,
    ICategoryListResponse,
    ICreateCategoryPayload,
    ICreateProductPayload,
    ICreateVariantPayload,
    IProduct,
    IProductListResponse,
    IProductMediaListResponse,
    IProductVariant,
    IUpdateProductStatusPayload,
    IVariantListResponse,
} from "@/types/product.types";

const PRODUCT_ENDPOINTS = {
    categories: "/categories",
    products: "/products",
};

const unwrapData = async <TData>(
    request: Promise<ApiResponse<TData>>,
): Promise<TData> => {
    const response = await request;
    return response.data;
};

type ListParams = {
    searchTerm?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

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
        async () => {
            const response = await httpClient.get<ICategory[]>(
                PRODUCT_ENDPOINTS.categories,
                {
                    params: {
                        searchTerm,
                        page,
                        limit,
                        isActive,
                        isDeleted,
                        sortBy,
                        sortOrder,
                    },
                },
            );
            return {
                data: response.data,
                page: response.meta?.page ?? page,
                limit: response.meta?.limit ?? limit,
                total: response.meta?.total ?? response.data.length,
                totalPages: response.meta?.totalPages ?? 1,
            };
        },
        null,
        "Failed to fetch categories:",
    );
}

export async function createCategory(
    payload: ICreateCategoryPayload,
): Promise<ICategory> {
    return safeServiceMutation(
        () =>
            unwrapData<ICategory>(
                httpClient.post(PRODUCT_ENDPOINTS.categories, payload),
            ),
        "Failed to create category:",
    );
}

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
        async () => {
            const response = await httpClient.get<IProduct[]>(
                PRODUCT_ENDPOINTS.products,
                {
                    params: {
                        searchTerm,
                        status,
                        categoryId,
                        page,
                        limit,
                        isDeleted,
                        sortBy,
                        sortOrder,
                    },
                },
            );
            return {
                data: response.data,
                page: response.meta?.page ?? page,
                limit: response.meta?.limit ?? limit,
                total: response.meta?.total ?? response.data.length,
                totalPages: response.meta?.totalPages ?? 1,
            };
        },
        null,
        "Failed to fetch products:",
    );
}

export async function getProductById(id: string): Promise<IProduct | null> {
    return safeServiceCall(
        () => unwrapData<IProduct>(httpClient.get(`${PRODUCT_ENDPOINTS.products}/${id}`)),
        null,
        "Failed to fetch product:",
    );
}

export async function createProduct(payload: ICreateProductPayload): Promise<IProduct> {
    return safeServiceMutation(
        () => unwrapData<IProduct>(httpClient.post(PRODUCT_ENDPOINTS.products, payload)),
        "Failed to create product:",
    );
}

export async function deleteProduct(productId: string): Promise<void> {
    return safeServiceMutation(
        async () => {
            await httpClient.delete(`${PRODUCT_ENDPOINTS.products}/${productId}`);
        },
        "Failed to delete product:",
    );
}

export async function updateProductStatus(
    productId: string,
    payload: IUpdateProductStatusPayload,
): Promise<IProduct> {
    return safeServiceMutation(
        () =>
            unwrapData<IProduct>(
                httpClient.patch(`${PRODUCT_ENDPOINTS.products}/${productId}/status`, payload),
            ),
        "Failed to update product status:",
    );
}

export async function getProductVariants(
    productId: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 20,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
): Promise<IVariantListResponse | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<IProductVariant[]>(
                `${PRODUCT_ENDPOINTS.products}/${productId}/variants`,
                {
                    params: {
                        isActive,
                        page,
                        limit,
                        sortBy,
                        sortOrder,
                    } satisfies ListParams & { isActive?: boolean },
                },
            );
            return {
                data: response.data,
                page: response.meta?.page ?? page,
                limit: response.meta?.limit ?? limit,
                total: response.meta?.total ?? response.data.length,
                totalPages: response.meta?.totalPages ?? 1,
            };
        },
        null,
        "Failed to fetch product variants:",
    );
}

export async function createVariant(
    productId: string,
    payload: ICreateVariantPayload,
): Promise<IProductVariant> {
    return safeServiceMutation(
        () =>
            unwrapData<IProductVariant>(
                httpClient.post(`${PRODUCT_ENDPOINTS.products}/${productId}/variants`, payload),
            ),
        "Failed to create product variant:",
    );
}

export async function deleteVariant(
    productId: string,
    variantId: string,
): Promise<void> {
    return safeServiceMutation(
        async () => {
            await httpClient.delete(
                `${PRODUCT_ENDPOINTS.products}/${productId}/variants/${variantId}`,
            );
        },
        "Failed to delete product variant:",
    );
}

export async function getProductMedia(
    productId: string,
    page: number = 1,
    limit: number = 20,
): Promise<IProductMediaListResponse | null> {
    return safeServiceCall(
        async () => {
            const response = await httpClient.get<IProduct["media"]>(
                `${PRODUCT_ENDPOINTS.products}/${productId}/media`,
                {
                    params: { page, limit },
                },
            );
            return {
                data: response.data ?? [],
                page: response.meta?.page ?? page,
                limit: response.meta?.limit ?? limit,
                total: response.meta?.total ?? response.data?.length ?? 0,
                totalPages: response.meta?.totalPages ?? 1,
            };
        },
        null,
        "Failed to fetch product media:",
    );
}

export async function createProductMedia(
    productId: string,
    payload: FormData,
): Promise<IProductMediaListResponse["data"]> {
    return safeServiceMutation(
        () =>
            unwrapData<IProductMediaListResponse["data"]>(
                httpClient.post(`${PRODUCT_ENDPOINTS.products}/${productId}/media`, payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                }),
            ),
        "Failed to create product media:",
    );
}
