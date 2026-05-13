"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, unwrapData } from "@/services/service-utils";
import { ICart } from "@/types/commerce.types";

export type CartSummary = {
    itemCount: number;
    subtotalAmount: number;
};

export type CartResponse = ICart & {
    summary?: CartSummary;
};

const CART_ENDPOINTS = {
    myCart: "/carts/my",
};

export async function fetchMyCart(): Promise<CartResponse | null | undefined> {
    return safeServiceCall(
        () => unwrapData<CartResponse>(httpClient.get(CART_ENDPOINTS.myCart)),
        null,
        "Failed to fetch cart:",
    );
}