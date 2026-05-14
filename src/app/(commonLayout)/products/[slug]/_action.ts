import { ApiResponse, PaginationMeta } from "@/types/api.types";
import { IReview } from "@/types/customer.types";
import { IProduct } from "@/types/product.types";

type ReviewsResponse = {
    data: IReview[];
    meta?: PaginationMeta;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export const fetchProductBySlug = async (
    slug: string,
): Promise<IProduct | null> => {
    const response = await fetch(`${API_BASE_URL}/products/${slug}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    const result: ApiResponse<IProduct> = await response.json();
    return result.data;
};

export const fetchProductReviews = async (
    productId: string,
): Promise<ReviewsResponse> => {
    const params = new URLSearchParams({
        productId,
        isApproved: "true",
        limit: "50",
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    const response = await fetch(
        `${API_BASE_URL}/customers/reviews?${params}`,
        {
            cache: "no-store",
        },
    );

    if (!response.ok) {
        return { data: [], meta: undefined };
    }

    const result: ApiResponse<IReview[]> = await response.json();

    return {
        data: result.data ?? [],
        meta: result.meta,
    };
};
