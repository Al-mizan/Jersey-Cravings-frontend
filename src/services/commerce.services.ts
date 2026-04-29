"use server";

import { commerceApiClient } from "@/lib/axios/commerceApiClient";
import type {
    ICart,
    ICouponListResponse,
    ICoupon,
    IPickupLocationListResponse,
    IPickupLocation,
    IOrderGiftAddon,
} from "@/types/commerce.types";

// Cart
export async function getMyCart(): Promise<ICart | null> {
    try {
        return await commerceApiClient.getMyCart();
    } catch (error) {
        console.error("Failed to fetch cart:", error);
        return null;
    }
}

export async function getCustomerCart(userId: string): Promise<ICart | null> {
    try {
        return await commerceApiClient.getCustomerCart(userId);
    } catch (error) {
        console.error("Failed to fetch customer cart:", error);
        return null;
    }
}

// Coupons
export async function getPublicCoupons(): Promise<ICoupon[]> {
    try {
        return await commerceApiClient.getPublicCoupons();
    } catch (error) {
        console.error("Failed to fetch public coupons:", error);
        return [];
    }
}

export async function getAllCoupons(
    searchTerm?: string,
    isActive?: boolean,
    isDeleted?: boolean,
    page: number = 1,
    limit: number = 10,
): Promise<ICouponListResponse | null> {
    try {
        return await commerceApiClient.getAllCoupons(
            searchTerm,
            isActive,
            isDeleted,
            page,
            limit,
        );
    } catch (error) {
        console.error("Failed to fetch coupons:", error);
        return null;
    }
}

export async function getCouponById(couponId: string): Promise<ICoupon | null> {
    try {
        return await commerceApiClient.getCouponById(couponId);
    } catch (error) {
        console.error("Failed to fetch coupon:", error);
        return null;
    }
}

// Fulfillment
export async function getActivePickupLocations(): Promise<IPickupLocation[]> {
    try {
        return await commerceApiClient.getActivePickupLocations();
    } catch (error) {
        console.error("Failed to fetch pickup locations:", error);
        return [];
    }
}

export async function getPickupLocations(
    page: number = 1,
    limit: number = 10,
): Promise<IPickupLocationListResponse | null> {
    try {
        return await commerceApiClient.getPickupLocations(page, limit);
    } catch (error) {
        console.error("Failed to fetch pickup locations:", error);
        return null;
    }
}

// Gift Add-on
export async function getMyGiftAddon(
    orderId: string,
): Promise<IOrderGiftAddon | null> {
    try {
        return await commerceApiClient.getMyGiftAddon(orderId);
    } catch (error) {
        console.error("Failed to fetch gift add-on:", error);
        return null;
    }
}

export async function getOrderGiftAddon(
    orderId: string,
): Promise<IOrderGiftAddon | null> {
    try {
        return await commerceApiClient.getOrderGiftAddon(orderId);
    } catch (error) {
        console.error("Failed to fetch gift add-on:", error);
        return null;
    }
}
