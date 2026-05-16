export interface ProductVariant {
    size?: string;
    type?: string;
}

export interface PendingProduct {
    id: string;
    slug: string;
    title: string;
    thumbnail: string;
    variant: ProductVariant;
    media?: {
        secureUrl: string;
    }[];
}

export interface Review {
    id: string;
    product: {
        id: string;
        slug: string;
        title: string;
        thumbnail: string;
        media?: {
            secureUrl: string;
        }[];
    };
    rating: number;
    comment?: string;
    media: string[];
    createdAt: string;
}

export interface CreateReviewData {
    productId: string;
    rating: number;
    comment?: string;
    mediaFiles?: File[];
}

export interface UpdateReviewData {
    rating?: number;
    comment?: string;
    mediaFiles?: File[];
}
