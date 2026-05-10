"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, safeServiceMutation } from "@/services/service-utils";
import { ApiResponse } from "@/types/api.types";

const unwrapData = async <TData>(
    request: Promise<ApiResponse<TData>>,
): Promise<TData> => {
    const response = await request;
    return response.data;
};

export interface IStorefrontSetting {
    key: string;
    value: string;
}

export async function getStorefrontSettings(): Promise<Record<string, string> | null> {
    return safeServiceCall(
        () => unwrapData<Record<string, string>>(httpClient.get("/settings")),
        null,
        "Failed to fetch storefront settings:",
    );
}

export async function updateStorefrontSettings(
    payload: IStorefrontSetting[],
): Promise<Record<string, string>> {
    return safeServiceMutation(
        () => unwrapData<Record<string, string>>(httpClient.patch("/settings", { settings: payload })),
        "Failed to update storefront settings:",
    );
}
