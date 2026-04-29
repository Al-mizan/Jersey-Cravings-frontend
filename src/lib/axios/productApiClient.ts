import { httpClient } from "./httpClient";
import type {
    IBulkCategoryTogglePayload,
    IBulkProductActionPayload,
    ICategory,
    ICategoryListResponse,
    ICreateCategoryPayload,
    ICreateProductPayload,
    ICreateProductMediaPayload,
    ICreateVariantPayload,
    IProduct,
    IProductListResponse,
    IProductMedia,
    IProductMediaListResponse,
    IReorderProductMediaPayload,
    IUpdateCategoryPayload,
    IUpdateProductMediaPayload,
    IUpdateProductPayload,
    IUpdateProductStatusPayload,
    IUpdateVariantPayload,
    IVariantListResponse,
    IProductVariant,
} from "@/types/product.types";
import type { IApiResponse } from "@/types/auth.types";

class ProductApiClient {
    // Category Endpoints
    async getAllCategories(
        searchTerm?: string,
        page: number = 1,
        limit: number = 50,
        isActive?: boolean,
        isDeleted?: boolean,
        sortBy?: string,
        sortOrder?: "asc" | "desc",
    ): Promise<ICategoryListResponse> {
        const params = new URLSearchParams();
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (isActive !== undefined) params.append("isActive", String(isActive));
        if (isDeleted !== undefined)
            params.append("isDeleted", String(isDeleted));
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);

        const { data } = await httpClient.get<
            IApiResponse<ICategoryListResponse>
        >(`/categories?${params.toString()}`);
        return data.data as ICategoryListResponse;
    }

    async getCategoryById(id: string): Promise<ICategory> {
        const { data } = await httpClient.get<IApiResponse<ICategory>>(
            `/categories/${id}`,
        );
        return data.data as ICategory;
    }

    async createCategory(payload: ICreateCategoryPayload): Promise<ICategory> {
        const { data } = await httpClient.post<IApiResponse<ICategory>>(
            "/categories",
            payload,
        );
        return data.data as ICategory;
    }

    async updateCategory(
        id: string,
        payload: IUpdateCategoryPayload,
    ): Promise<ICategory> {
        const { data } = await httpClient.patch<IApiResponse<ICategory>>(
            `/categories/${id}`,
            payload,
        );
        return data.data as ICategory;
    }

    async deleteCategory(id: string): Promise<void> {
        await httpClient.delete(`/categories/${id}`);
    }

    async restoreCategory(id: string): Promise<ICategory> {
        const { data } = await httpClient.patch<IApiResponse<ICategory>>(
            `/categories/${id}/restore`,
            {},
        );
        return data.data as ICategory;
    }

    // Product Endpoints
    async getAllProducts(
        searchTerm?: string,
        status?: string,
        categoryId?: string,
        page: number = 1,
        limit: number = 10,
        isDeleted?: boolean,
        sortBy?: string,
        sortOrder?: "asc" | "desc",
    ): Promise<IProductListResponse> {
        const params = new URLSearchParams();
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (status) params.append("status", status);
        if (categoryId) params.append("categoryId", categoryId);
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (isDeleted !== undefined)
            params.append("isDeleted", String(isDeleted));
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);

        const { data } = await httpClient.get<
            IApiResponse<IProductListResponse>
        >(`/products?${params.toString()}`);
        return data.data as IProductListResponse;
    }

    async getProductById(id: string): Promise<IProduct> {
        const { data } = await httpClient.get<IApiResponse<IProduct>>(
            `/products/${id}`,
        );
        return data.data as IProduct;
    }

    async createProduct(payload: ICreateProductPayload): Promise<IProduct> {
        const { data } = await httpClient.post<IApiResponse<IProduct>>(
            "/products",
            payload,
        );
        return data.data as IProduct;
    }

    async updateProduct(
        id: string,
        payload: IUpdateProductPayload,
    ): Promise<IProduct> {
        const { data } = await httpClient.patch<IApiResponse<IProduct>>(
            `/products/${id}`,
            payload,
        );
        return data.data as IProduct;
    }

    async updateProductStatus(
        id: string,
        payload: IUpdateProductStatusPayload,
    ): Promise<IProduct> {
        const { data } = await httpClient.patch<IApiResponse<IProduct>>(
            `/products/${id}/status`,
            payload,
        );
        return data.data as IProduct;
    }

    async deleteProduct(id: string): Promise<void> {
        await httpClient.delete(`/products/${id}`);
    }

    async restoreProduct(id: string): Promise<IProduct> {
        const { data } = await httpClient.patch<IApiResponse<IProduct>>(
            `/products/${id}/restore`,
            {},
        );
        return data.data as IProduct;
    }

    async bulkPublishProducts(
        payload: IBulkProductActionPayload,
    ): Promise<void> {
        await httpClient.post(`/bulk-actions/products/publish`, payload);
    }

    async bulkArchiveProducts(
        payload: IBulkProductActionPayload,
    ): Promise<void> {
        await httpClient.post(`/bulk-actions/products/archive`, payload);
    }

    async bulkToggleCategories(
        payload: IBulkCategoryTogglePayload,
    ): Promise<void> {
        await httpClient.post(`/bulk-actions/categories/toggle`, payload);
    }

    // Variant Endpoints
    async getProductVariants(
        productId: string,
        isActive?: boolean,
        page: number = 1,
        limit: number = 20,
        sortBy?: string,
        sortOrder?: "asc" | "desc",
    ): Promise<IVariantListResponse> {
        const params = new URLSearchParams();
        if (isActive !== undefined) params.append("isActive", String(isActive));
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);

        const { data } = await httpClient.get<
            IApiResponse<IVariantListResponse>
        >(`/products/${productId}/variants?${params.toString()}`);
        return data.data as IVariantListResponse;
    }

    async getVariantById(
        productId: string,
        variantId: string,
    ): Promise<IProductVariant> {
        const { data } = await httpClient.get<IApiResponse<IProductVariant>>(
            `/products/${productId}/variants/${variantId}`,
        );
        return data.data as IProductVariant;
    }

    async createVariant(
        productId: string,
        payload: ICreateVariantPayload,
    ): Promise<IProductVariant> {
        const { data } = await httpClient.post<IApiResponse<IProductVariant>>(
            `/products/${productId}/variants`,
            payload,
        );
        return data.data as IProductVariant;
    }

    async updateVariant(
        productId: string,
        variantId: string,
        payload: IUpdateVariantPayload,
    ): Promise<IProductVariant> {
        const { data } = await httpClient.patch<IApiResponse<IProductVariant>>(
            `/products/${productId}/variants/${variantId}`,
            payload,
        );
        return data.data as IProductVariant;
    }

    async deleteVariant(productId: string, variantId: string): Promise<void> {
        await httpClient.delete(`/products/${productId}/variants/${variantId}`);
    }

    // Media Endpoints
    async getProductMedia(
        productId: string,
    ): Promise<IProductMediaListResponse> {
        const { data } = await httpClient.get<
            IApiResponse<IProductMediaListResponse>
        >(`/products/${productId}/media`);
        return data.data as IProductMediaListResponse;
    }

    async getProductMediaById(
        productId: string,
        mediaId: string,
    ): Promise<IProductMedia> {
        const { data } = await httpClient.get<IApiResponse<IProductMedia>>(
            `/products/${productId}/media/${mediaId}`,
        );
        return data.data as IProductMedia;
    }

    async createProductMedia(
        productId: string,
        formData: FormData,
    ): Promise<IProductMedia> {
        const { data } = await httpClient.post<IApiResponse<IProductMedia>>(
            `/products/${productId}/media`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
        return data.data as IProductMedia;
    }

    async updateProductMedia(
        productId: string,
        mediaId: string,
        formData: FormData,
    ): Promise<IProductMedia> {
        const { data } = await httpClient.patch<IApiResponse<IProductMedia>>(
            `/products/${productId}/media/${mediaId}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
        return data.data as IProductMedia;
    }

    async reorderProductMedia(
        productId: string,
        payload: IReorderProductMediaPayload,
    ): Promise<IProductMediaListResponse> {
        const { data } = await httpClient.post<
            IApiResponse<IProductMediaListResponse>
        >(`/products/${productId}/media/reorder`, payload);
        return data.data as IProductMediaListResponse;
    }

    async deleteProductMedia(
        productId: string,
        mediaId: string,
    ): Promise<void> {
        await httpClient.delete(`/products/${productId}/media/${mediaId}`);
    }
}

export const productApiClient = new ProductApiClient();
