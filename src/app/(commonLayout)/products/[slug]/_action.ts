import { ApiResponse, PaginationMeta } from "@/types/api.types";
import { IReview } from "@/types/customer.types";
import { IProduct } from "@/types/product.types";
import axios from "axios";

type ReviewsResponse = {
    data: IReview[];
    meta?: PaginationMeta;
};

export const fetchProductBySlug = async (slug: string): Promise<IProduct | null> => {
    const response = await axios.get<ApiResponse<IProduct>>(
        `/api/proxy/products/${slug}`,
    );
    return response.data.data;
};

export const fetchProductReviews = async (productId: string): Promise<ReviewsResponse> => {
    const response = await axios.get<ApiResponse<IReview[]>>(
        "/api/proxy/customers/reviews",
        {
            params: {
                productId,
                isApproved: true,
                limit: 50,
                sortBy: "createdAt",
                sortOrder: "desc",
            },
        },
    );

    return {
        data: response.data.data ?? [],
        meta: response.data.meta,
    };
};