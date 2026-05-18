// Commerce Types (Cart, Coupon, Fulfillment, Gift Add-on)

export type DiscountType = "PERCENT" | "FLAT";

export type PickupLocationStatus = "ACTIVE" | "INACTIVE";

export interface ICartItem {
    id: string;
    qty: number;
    createdAt: string;
    updatedAt: string;
    variantId: string;
    customPlayerName?: string;
    customJerseyNumber?: string;
    customizationCharge: number;
    variant?: {
        id: string;
        sku: string;
        size: string;
        fit: string;
        sleeveType: string;
        priceAmount: number;
        product?: {
            id: string;
            title: string;
            slug: string;
            teamName: string;
            thumbNail?: string | null;
            media?: {
                secureUrl: string;
            }[];
        };
    };
}

export interface ICart {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    items: ICartItem[];
}

export interface ICoupon {
    id: string;
    code: string;
    discountType: DiscountType;
    value: number;
    maxDiscountAmount?: number | null;
    minOrderAmount?: number | null;
    usageLimit?: number | null;
    usedCount: number;
    startsAt?: string | null;
    endsAt?: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IPickupLocation {
    id: string;
    name: string;
    slug: string;
    addressLine: string;
    city: string;
    district: string;
    postalCode?: string | null;
    phone: string;
    openingHours?: string | null;
    status: PickupLocationStatus;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IOrderGiftAddon {
    id: string;
    category: "FRIEND" | "PARTNER" | "FAMILY";
    cardChargeAmount: number;
    customMessage?: string | null;
    customMessageCharge: number;
    totalChargeAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ICouponListResponse extends IPaginatedResponse<ICoupon> {}
export interface IPickupLocationListResponse extends IPaginatedResponse<IPickupLocation> {}

// Request Payloads
export interface IAddToCartPayload {
    variantId: string;
    qty: number;
}

export interface IUpdateCartItemPayload {
    qty: number;
}

export interface IValidateCouponPayload {
    code: string;
    orderAmount: number;
}

export interface ICreateCouponPayload {
    code: string;
    discountType: DiscountType;
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit: number;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
}

export interface IUpdateCouponPayload {
    value?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
}

export interface ICreatePickupLocationPayload {
    name: string;
    addressLine: string;
    city: string;
    district: string;
    postalCode?: string;
    phone: string;
    openingHours?: string;
    status?: PickupLocationStatus;
    isDefault?: boolean;
}

export interface IUpdatePickupLocationPayload {
    name?: string;
    addressLine?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    phone?: string;
    openingHours?: string;
    status?: PickupLocationStatus;
    isDefault?: boolean;
}

export interface IUpsertGiftAddonPayload {
    isGiftWrap?: boolean;
    giftMessage?: string;
}

export type BillingValues = {
    name: string;
    phone: string;
    address: string;
    email?: string;
    orderNote?: string;
    shippingMethod: string;
    division: string;
    district: string;
    area: string;
};
