export interface ProductVariant {
    size?: string;
    type?: string;
    fit?: string;
    sleeveType?: string;
}

export interface ReviewProductMedia {
    secureUrl: string;
}

export interface ReviewProduct {
    id: string;
    slug: string;
    title: string;
    thumbNail?: string | null;
    thumbnail?: string | null;
    media?: ReviewProductMedia[];
}

export interface PendingReviewItem {
    orderId: string;
    orderNumber: string;
    orderDate: string;
    product: ReviewProduct;
    price: number;
    variant: ProductVariant;
    customPlayerName?: string | null;
    customJerseyNumber?: string | null;
}

export interface Review {
    id: string;
    product: ReviewProduct;
    rating: number;
    comment?: string;
    reviewMedias: ReviewProductMedia[];
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
