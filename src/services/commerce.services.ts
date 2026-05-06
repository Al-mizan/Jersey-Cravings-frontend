import { commerceApiClient } from "@/lib/axios/commerceApiClient";
import { safeServiceCall, safeServiceMutation } from "@/services/service-utils";
import type { IUpdateCartItemPayload } from "@/types/commerce.types";
import type {
    ICart,
    ICouponListResponse,
    ICoupon,
    IPickupLocationListResponse,
    IPickupLocation,
    IOrderGiftAddon,
    ICreateCouponPayload,
    IUpdateCouponPayload,
    ICreatePickupLocationPayload,
    IUpdatePickupLocationPayload,
} from "@/types/commerce.types";

// Cart
export async function getMyCart(): Promise<ICart | null> {
    return safeServiceCall(
        () => commerceApiClient.getMyCart(),
        null,
        "Failed to fetch cart:",
    );
}

export async function getCustomerCart(userId: string): Promise<ICart | null> {
    return safeServiceCall(
        () => commerceApiClient.getCustomerCart(userId),
        null,
        "Failed to fetch customer cart:",
    );
}

export async function updateMyCartItem(
    cartItemId: string,
    payload: IUpdateCartItemPayload,
): Promise<ICart> {
    return safeServiceMutation(
        () => commerceApiClient.updateCartItem(cartItemId, payload),
        "Failed to update cart item:",
    );
}

export async function removeMyCartItem(cartItemId: string): Promise<ICart> {
    return safeServiceMutation(
        () => commerceApiClient.removeCartItem(cartItemId),
        "Failed to remove cart item:",
    );
}

export async function clearMyCart(): Promise<ICart> {
    return safeServiceMutation(
        () => commerceApiClient.clearMyCart(),
        "Failed to clear cart:",
    );
}

// Coupons
export async function getPublicCoupons(): Promise<ICoupon[]> {
    return safeServiceCall(
        () => commerceApiClient.getPublicCoupons(),
        [],
        "Failed to fetch public coupons:",
    );
}

export async function getAllCoupons(
    searchTerm?: string,
    isActive?: boolean,
    isDeleted?: boolean,
    page: number = 1,
    limit: number = 10,
): Promise<ICouponListResponse | null> {
    return safeServiceCall(
        () =>
            commerceApiClient.getAllCoupons(
                searchTerm,
                isActive,
                isDeleted,
                page,
                limit,
            ),
        null,
        "Failed to fetch coupons:",
    );
}

export async function getCouponById(couponId: string): Promise<ICoupon | null> {
    return safeServiceCall(
        () => commerceApiClient.getCouponById(couponId),
        null,
        "Failed to fetch coupon:",
    );
}

// Coupon mutations
export async function createCoupon(
    payload: ICreateCouponPayload,
): Promise<ICoupon> {
    return safeServiceMutation(
        () => commerceApiClient.createCoupon(payload),
        "Failed to create coupon:",
    );
}

export async function updateCoupon(
    couponId: string,
    payload: IUpdateCouponPayload,
): Promise<ICoupon> {
    return safeServiceMutation(
        () => commerceApiClient.updateCoupon(couponId, payload),
        "Failed to update coupon:",
    );
}

export async function deleteCoupon(couponId: string): Promise<void> {
    return safeServiceMutation(async () => {
        await commerceApiClient.deleteCoupon(couponId);
    }, "Failed to delete coupon:");
}

// Fulfillment
export async function getActivePickupLocations(): Promise<IPickupLocation[]> {
    return safeServiceCall(
        () => commerceApiClient.getActivePickupLocations(),
        [],
        "Failed to fetch pickup locations:",
    );
}

export async function getPickupLocations(
    page: number = 1,
    limit: number = 10,
): Promise<IPickupLocationListResponse | null> {
    return safeServiceCall(
        () => commerceApiClient.getPickupLocations(page, limit),
        null,
        "Failed to fetch pickup locations:",
    );
}

// Pickup location mutations
export async function createPickupLocation(
    payload: ICreatePickupLocationPayload,
): Promise<IPickupLocation> {
    return safeServiceMutation(
        () => commerceApiClient.createPickupLocation(payload),
        "Failed to create pickup location:",
    );
}

export async function updatePickupLocation(
    locationId: string,
    payload: IUpdatePickupLocationPayload,
): Promise<IPickupLocation> {
    return safeServiceMutation(
        () => commerceApiClient.updatePickupLocation(locationId, payload),
        "Failed to update pickup location:",
    );
}

export async function deletePickupLocation(locationId: string): Promise<void> {
    return safeServiceMutation(async () => {
        await commerceApiClient.deletePickupLocation(locationId);
    }, "Failed to delete pickup location:");
}

// Gift Add-on
export async function getMyGiftAddon(
    orderId: string,
): Promise<IOrderGiftAddon | null> {
    return safeServiceCall(
        () => commerceApiClient.getMyGiftAddon(orderId),
        null,
        "Failed to fetch gift add-on:",
    );
}

export async function getOrderGiftAddon(
    orderId: string,
): Promise<IOrderGiftAddon | null> {
    return safeServiceCall(
        () => commerceApiClient.getOrderGiftAddon(orderId),
        null,
        "Failed to fetch gift add-on:",
    );
}
