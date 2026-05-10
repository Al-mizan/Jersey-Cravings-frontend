// Product & Catalog Types

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type JerseyType = "HOME" | "AWAY" | "THIRD" | "GK" | "SPECIAL";
export type VariantSize = "S" | "M" | "L" | "XL" | "XXL";
export type VariantFit = "PLAYER" | "FAN";
export type SleeveType = "SHORT" | "LONG";

export interface ICategory {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IProductMedia {
    id: string;
    publicId: string;
    secureUrl: string;
    resourceType: string;
    altText?: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface IProductVariant {
    id: string;
    sku: string;
    size: VariantSize;
    fit: VariantFit;
    sleeveType: SleeveType;
    priceAmount: number;
    compareAtAmount?: number;
    costAmount?: number;
    stockQty: number;
    reservedQty: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IProduct {
    id: string;
    title: string;
    slug: string;
    description?: string;
    teamName: string;
    tournamentTag?: string;
    jerseyType: JerseyType;
    status: ProductStatus;
    totalRating?: number;
    reviewCount?: number;
    isDeleted: boolean;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    categoryId: string;
    category?: ICategory;
    media?: IProductMedia[];
    variants?: IProductVariant[];
    thumbNail?: string | null;
}

export interface ITeamSummary {
    teamName: string;
    thumbNail: string | null;
    productCount: number;
    singleProductId?: string;
}

// Request Payloads
export interface ICreateProductPayload {
    title: string;
    slug: string;
    description?: string;
    teamName: string;
    tournamentTag?: string;
    jerseyType: JerseyType;
    categoryId: string;
    thumbNail?: string;
}

export interface IUpdateProductPayload {
    title?: string;
    slug?: string;
    description?: string;
    teamName?: string;
    tournamentTag?: string;
    jerseyType?: JerseyType;
    categoryId?: string;
    thumbNail?: string;
}

export interface IUpdateProductStatusPayload {
    status: ProductStatus;
}

export interface ICreateCategoryPayload {
    name: string;
    slug: string;
}

export interface IUpdateCategoryPayload {
    name?: string;
    slug?: string;
    isActive?: boolean;
}

export interface IBulkProductActionPayload {
    productIds: string[];
}

export interface IBulkCategoryTogglePayload {
    categoryIds: string[];
    isActive: boolean;
}

export interface ICreateVariantPayload {
    sku: string;
    size: VariantSize;
    fit: VariantFit;
    sleeveType: SleeveType;
    priceAmount: number;
    compareAtAmount?: number;
    costAmount?: number;
    stockQty: number;
}

export interface IUpdateVariantPayload {
    priceAmount?: number;
    compareAtAmount?: number;
    costAmount?: number;
    stockQty?: number;
    isActive?: boolean;
}

export interface ICreateProductMediaPayload {
    altText?: string;
}

export interface IUpdateProductMediaPayload {
    altText?: string;
}

export interface IProductMediaOrderItem {
    id: string;
    sortOrder: number;
}

export interface IReorderProductMediaPayload {
    mediaOrder: IProductMediaOrderItem[];
}

// API Response Types
export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IProductListResponse extends IPaginatedResponse<IProduct> {}
export interface ICategoryListResponse extends IPaginatedResponse<ICategory> {}
export interface IVariantListResponse extends IPaginatedResponse<IProductVariant> {}
export interface IProductMediaListResponse extends IPaginatedResponse<IProductMedia> {}
