import { PaginationMeta } from "./api.types";
import { UserRole, UserStatus } from "./auth.types";

export type SortOrder = "asc" | "desc";

export type PointTransactionType =
    | "ORDER_EARNED"
    | "REFERRAL_EARNED"
    | "REDEEMED"
    | "ADJUSTED";

export type ReferralRewardStatus = "PENDING" | "REWARDED" | "REJECTED";

export type OrderStatus =
    | "PENDING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED";

export interface IUserLite {
    id: string;
    identifier: string;
    role: UserRole;
    status: UserStatus;
    createdAt?: string;
    accounts?: Array<{ providerId: string }>;
}

export interface ICustomer {
    id: string;
    name: string;
    identifier: string;
    profilePhoto: string | null;
    contactNumber: string | null;
    address: string | null;
    pointsBalance: number;
    lifetimePointsEarned: number;
    lifetimePointsRedeemed: number;
    totalPurchasedQty: number;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface ICustomerProfile extends ICustomer {
    user: IUserLite;
}

export interface ICustomerListItem extends ICustomer {
    user: IUserLite;
}

export interface IAddress {
    id: string;
    recipientName: string;
    phone: string;
    address: string;
    area: string;
    district: string;
    division: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface ILoyaltySetting {
    id: string;
    name: string;
    earnRateBps: number;
    minPurchasedQtyToRedeem: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IPointTransaction {
    id: string;
    type: PointTransactionType;
    points: number;
    balanceAfter: number;
    note: string | null;
    expiresAt: string | null;
    createdAt: string;
    customerId: string;
    orderId: string | null;
}

export interface IMyLoyaltySummary {
    customerId: string;
    pointsBalance: number;
    lifetimePointsEarned: number;
    lifetimePointsRedeemed: number;
    totalPurchasedQty: number;
    activeSetting: ILoyaltySetting | null;
}

export interface ICustomerLoyaltyDetails extends ICustomer {
    pointTransactions: IPointTransaction[];
}

export interface IReferralCode {
    id: string;
    code: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    ownerCustomerId: string;
}

export interface IReferralEventReferredCustomer {
    id: string;
    name: string;
    identifier: string;
}

export interface IReferralEventOrder {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: OrderStatus;
}

export interface IReferralEvent {
    id: string;
    orderAmount: number;
    rewardRateBps: number;
    rewardPoints: number;
    status: ReferralRewardStatus;
    rewardedAt: string | null;
    createdAt: string;
    updatedAt: string;
    referralCodeId: string;
    referredCustomerId: string | null;
    referredOrderId: string;
    referredCustomer?: IReferralEventReferredCustomer | null;
    referredOrder?: IReferralEventOrder;
    referralCode?: IReferralCode;
}

export interface IReviewMedia {
    id: string;
    publicId: string;
    secureUrl: string;
    resourceType: string;
    createdAt: string;
    updatedAt: string;
    reviewId: string;
}

export interface IReviewProduct {
    id: string;
    title: string;
    slug: string;
}

export interface IReviewCustomer {
    id: string;
    name: string;
    profilePhoto: string | null;
}

export interface IReview {
    id: string;
    rating: number;
    comment: string | null;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    productId: string;
    userId: string;
    customerId: string | null;
    reviewMedias: IReviewMedia[];
    product?: IReviewProduct;
    customer?: IReviewCustomer;
}

export interface IReviewMediaInput {
    publicId: string;
    secureUrl: string;
    resourceType: string;
}

export interface ICustomerStatusChangeResult {
    customer: ICustomer;
    user: {
        id: string;
        identifier: string;
        role: UserRole;
        status: UserStatus;
        isDeleted: boolean;
        deletedAt: string | null;
        createdAt: string;
        updatedAt: string;
        name: string;
        identifierVerified: boolean;
        image: string | null;
    };
}

export interface IDeleteSuccessResponse {
    success: boolean;
}

export interface IPaginatedData<T> {
    data: T[];
    meta: PaginationMeta;
}

/** Admin list response shape from `getAllCustomers` (mirrors catalog list services). */
export interface ICustomerAdminListResponse {
    data: ICustomerProfile[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ICustomerQueryParams {
    searchTerm?: string;
    isDeleted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface IAddressQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
    isDefault?: boolean;
}

export interface IPointTransactionQueryParams {
    type?: PointTransactionType;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface IReferralEventQueryParams {
    status?: ReferralRewardStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface IReviewQueryParams {
    productId?: string;
    isApproved?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface IUpdateMyProfilePayload {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
}

export interface IChangeCustomerStatusPayload {
    customerId: string;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
}

export interface ICreateAddressPayload {
    recipientName: string;
    phone: string;
    address: string;
    area: string;
    district: string;
    division: string;
    isDefault?: boolean;
}

export interface IUpdateAddressPayload {
    recipientName?: string;
    phone?: string;
    address?: string;
    area?: string;
    district?: string;
    division?: string;
    isDefault?: boolean;
}

export interface IUpdateLoyaltySettingPayload {
    earnRateBps?: number;
    minPurchasedQtyToRedeem?: number;
    isActive?: boolean;
}

export interface IOverrideReferralStatusPayload {
    referralEventId: string;
    status: ReferralRewardStatus;
}

export interface ICreateReviewPayload {
    productId: string;
    rating: number;
    comment?: string;
    medias?: IReviewMediaInput[];
}

export interface IUpdateReviewPayload {
    rating?: number;
    comment?: string;
    medias?: IReviewMediaInput[];
}

export interface IModerateReviewPayload {
    isApproved: boolean;
}
