"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, safeServiceMutation, unwrapData } from "@/services/service-utils";
import {
    ICoupon,
    ICouponListResponse,
    ICreateCouponPayload,
    IUpdateCouponPayload,
} from "@/types/commerce.types";

const COUPON_ENDPOINTS = {
    coupons: "/coupons",
    publicCoupons: "/coupons/public",
    validateCoupon: "/coupons/validate",
};

// Admin Coupon Services

export async function getAllCoupons(
    searchTerm?: string,
    isActive?: boolean,
    isDeleted?: boolean,
    page: number = 1,
    limit: number = 10,
): Promise<ICouponListResponse | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<ICouponListResponse>(
                httpClient.get(COUPON_ENDPOINTS.coupons, {
                    params: {
                        searchTerm,
                        isActive,
                        isDeleted,
                        page,
                        limit,
                    },
                }),
            ),
        null,
        "Failed to fetch coupons:",
    );
}

export async function getCouponById(
    couponId: string,
): Promise<ICoupon | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<ICoupon>(
                httpClient.get(`${COUPON_ENDPOINTS.coupons}/${couponId}`),
            ),
        null,
        "Failed to fetch coupon:",
    );
}

export async function createCoupon(
    payload: ICreateCouponPayload,
): Promise<ICoupon> {
    return safeServiceMutation(
        () => unwrapData<ICoupon>(httpClient.post(COUPON_ENDPOINTS.coupons, payload)),
        "Failed to create coupon:",
    );
}

export async function updateCoupon(
    couponId: string,
    payload: IUpdateCouponPayload,
): Promise<ICoupon> {
    return safeServiceMutation(
        () =>
            unwrapData<ICoupon>(
                httpClient.patch(`${COUPON_ENDPOINTS.coupons}/${couponId}`, payload),
            ),
        "Failed to update coupon:",
    );
}

export async function deleteCoupon(couponId: string): Promise<void> {
    return safeServiceMutation(
        () =>
            unwrapData<void>(
                httpClient.delete(`${COUPON_ENDPOINTS.coupons}/${couponId}`),
            ),
        "Failed to delete coupon:",
    );
}

export async function restoreCoupon(couponId: string): Promise<ICoupon> {
    return safeServiceMutation(
        () =>
            unwrapData<ICoupon>(
                httpClient.patch(`${COUPON_ENDPOINTS.coupons}/${couponId}/restore`),
            ),
        "Failed to restore coupon:",
    );
}

// Customer Coupon Services

export async function getPublicCoupons(): Promise<ICoupon[] | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<ICoupon[]>(
                httpClient.get(COUPON_ENDPOINTS.publicCoupons),
            ),
        null,
        "Failed to fetch public coupons:",
    );
}

export async function validateCoupon(
    code: string,
    orderAmount: number,
): Promise<{ isValid: boolean; discount?: number; message?: string }> {
    return safeServiceCall(
        () =>
            unwrapData<{ isValid: boolean; discount?: number; message?: string }>(
                httpClient.post(COUPON_ENDPOINTS.validateCoupon, {
                    code,
                    orderAmount,
                }),
            ),
        { isValid: false, message: "Failed to validate coupon" },
        "Failed to validate coupon:",
    );
}
